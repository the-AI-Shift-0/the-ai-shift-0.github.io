# Prompt Builder Server Setup

When asked to "set up the prompt builder" or "run the server":

1. Install dependencies:
   pip install flask openai python-dotenv

2. Create a .env file in this directory with the credentials Apurv sent you. The file should look like:
   AZURE_OPENAI_API_KEY=<key from Apurv>
   AZURE_OPENAI_ENDPOINT=https://sai-mo2tz038-swedencentral.openai.azure.com/
   AZURE_OPENAI_WHISPER_DEPLOYMENT=whisper
   AZURE_OPENAI_GPT4O_DEPLOYMENT=gpt-4o-Apurv
   AZURE_OPENAI_API_VERSION=2025-01-01-preview

3. Start the server:
   python3 prompt-builder-server.py

4. Open: http://localhost:5000

The demo page on GitHub Pages will automatically use this local server for voice recording and AI responses.
