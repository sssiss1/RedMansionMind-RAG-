# LLM Integration

RedMansionMind uses retrieval first, then optional LLM generation.

```text
Question
  -> BM25 retrieval over Hongloumeng passages
  -> concept retrieval over philosophy concepts
  -> LLM receives only retrieved evidence
  -> JSON answer with thesis, interpretation, citations, limits
```

## Configure

Create a local `.env` file. Do not put real API keys in `.env.example`.

```bash
cp .env.example .env
```

Then edit `.env`. For DeepSeek:

```dotenv
OPENAI_API_KEY=your_deepseek_api_key_here
OPENAI_BASE_URL=https://api.deepseek.com
OPENAI_MODEL=deepseek-v4-flash
```

Then start the server:

```bash
python3 src/server.py
```

Open the web UI and enable `启用 LLM 生成`.

## Shell Alternative

Instead of `.env`, you can export variables in the terminal. DeepSeek is OpenAI-compatible, so use the same environment variable names:

```bash
export OPENAI_API_KEY="your_deepseek_api_key_here"
export OPENAI_BASE_URL="https://api.deepseek.com"
export OPENAI_MODEL="deepseek-v4-flash"
python3 src/server.py
```

For higher-quality but slower answers, try:

```bash
export OPENAI_MODEL="deepseek-v4-pro"
```

If your DeepSeek account or docs still show the older aliases, this may also work:

```bash
export OPENAI_MODEL="deepseek-chat"
```

## API

Template-only answer:

```bash
curl --get \
  --data-urlencode 'question=太虚幻境体现了什么佛教思想？' \
  --data-urlencode 'perspective=佛教' \
  http://127.0.0.1:8000/api/ask
```

LLM answer:

```bash
curl --get \
  --data-urlencode 'question=太虚幻境体现了什么佛教思想？' \
  --data-urlencode 'perspective=佛教' \
  --data-urlencode 'llm=1' \
  http://127.0.0.1:8000/api/ask
```

## Expected JSON From The Model

The model is instructed to return:

```json
{
  "thesis": "一句话核心观点",
  "interpretation": ["结合 passage id 和 concept id 的分析"],
  "citation_notes": ["说明关键观点依据哪些证据"],
  "limits": "说明哪些地方属于解释性判断"
}
```

The app falls back to the local template if the API key is missing or the LLM call fails.
