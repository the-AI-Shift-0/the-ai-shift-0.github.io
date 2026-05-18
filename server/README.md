# Prompt Builder Local Server

Run this server locally when filming the Prompt Builder demo.

## Setup
```bash
pip install flask openai python-dotenv
```

## Configure
Copy `.env.example` to `.env` and fill in your Azure credentials (Apurv will send these).

## Run
```bash
python3 prompt-builder-server.py
```

Then open: http://localhost:5000
