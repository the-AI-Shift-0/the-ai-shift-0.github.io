#!/usr/bin/env python3
"""
Prompt Builder local demo server with voice transcription and structured prompt building.
Flask + Azure OpenAI (Whisper + GPT-4o)
"""

import os
import json
import tempfile
from pathlib import Path
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
from openai import AzureOpenAI
from werkzeug.utils import safe_join

# Load .env
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

app = Flask(__name__)
CORS(app, origins=["http://localhost:5000", "http://127.0.0.1:5000"])

# Azure client
client = AzureOpenAI(
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2025-01-01-preview"),
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT")
)

DEMO_DIR = Path("/tmp/the-ai-shift-0.github.io/demos/prompt-builder")

SYSTEM_PROMPT = """You are an expert prompt engineer. Transform the user's rough goal description into a professional, structured AI prompt.

A great prompt always includes these 5 elements:
1. ROLE: "You are a [specific expert with relevant background]..." — assign a precise role, not just "assistant"
2. CONTEXT: Provide the background information the AI needs to understand the situation
3. TASK: Break the goal into numbered, specific steps — not vague instructions
4. OUTPUT FORMAT: Specify exactly what structure to return (tables, headers, sections, word limits)
5. CONSTRAINTS: What to avoid, tone requirements, scope limits, what NOT to include

Additional best practices to apply:
- If the task involves analysis, tell the AI to "think step by step before answering"
- If the task involves creating content, specify audience and tone
- For data tasks, specify the exact format of the input data
- For writing tasks, specify length and structure
- Always end with output format instructions

Return ONLY the structured prompt text — no explanations, no preamble, no "here is your prompt" header. Just the ready-to-use prompt."""


@app.route("/")
def index():
    """Serve index.html as the entry point."""
    return send_from_directory(DEMO_DIR, "index.html")


@app.route("/<path:filename>")
def serve_static(filename):
    """Serve static files from demo directory."""
    resolved = safe_join(DEMO_DIR, filename)
    if not resolved or not str(resolved).startswith(str(DEMO_DIR)):
        return jsonify({"error": "Access denied"}), 403
    return send_from_directory(DEMO_DIR, filename)


@app.route("/api/transcribe", methods=["POST"])
def transcribe():
    """Transcribe audio file using Azure Whisper."""
    try:
        if "audio" not in request.files:
            return jsonify({"error": "No audio file provided"}), 400

        audio_file = request.files["audio"]

        # Save to temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            audio_file.save(tmp.name)
            tmp_path = tmp.name

        try:
            # Call Whisper via Azure OpenAI
            with open(tmp_path, "rb") as f:
                transcript = client.audio.transcriptions.create(
                    model=os.getenv("AZURE_OPENAI_WHISPER_DEPLOYMENT", "whisper"),
                    file=f
                )

            return jsonify({"transcript": transcript.text})
        finally:
            os.unlink(tmp_path)

    except Exception as e:
        print(f"Transcription error: {e}")
        return jsonify({
            "error": "Transcription failed",
            "detail": str(e)
        }), 500


@app.route("/api/build-prompt", methods=["POST"])
def build_prompt():
    """Build structured prompt from user description using GPT-4o."""
    try:
        data = request.get_json()
        user_text = data.get("text", "").strip()

        if not user_text:
            return jsonify({"error": "No text provided"}), 400

        if len(user_text) > 5000:
            return jsonify({"error": "Input too long (max 5000 characters)"}), 400

        # Call GPT-4o
        response = client.chat.completions.create(
            model=os.getenv("AZURE_OPENAI_GPT4O_DEPLOYMENT", "gpt-4o-Apurv"),
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_text}
            ],
            temperature=0.7,
            max_tokens=1500
        )

        structured_prompt = response.choices[0].message.content.strip()

        # Extract a title from the first line or generate a generic one
        title = user_text.split("\n")[0][:60] or "Custom Prompt"

        return jsonify({
            "structured_prompt": structured_prompt,
            "title": title
        })

    except Exception as e:
        print(f"Prompt building error: {e}")
        return jsonify({
            "error": "Prompt building failed",
            "detail": str(e)
        }), 500


if __name__ == "__main__":
    print("Starting Prompt Builder server on http://localhost:5000")
    print(f"Serving demos from {DEMO_DIR}")
    print("\nNote: If port 5000 is in use (AirPlay), disable AirTunes in System Settings.")
    app.run(host="127.0.0.1", port=5000, debug=False)
