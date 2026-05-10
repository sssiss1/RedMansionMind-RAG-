# RedMansionMind

Citation-grounded philosophical RAG for *Dream of the Red Chamber*.

RedMansionMind is a portfolio-oriented LLM project that connects selected passages from 《红楼梦》 with Confucian, Daoist, and Buddhist concepts. The first MVP runs locally without external dependencies: it retrieves relevant literary passages and philosophy concepts, then produces a structured interpretive answer with citations.

## What It Does

- Philosophical QA over 《红楼梦》
- Perspective switching: 综合, 儒家, 道家, 佛教
- Citation cards for retrieved passages and concepts
- Character and theme hints for follow-up exploration
- A small but extensible JSONL knowledge base

## Run Locally

```bash
python3 src/server.py
```

Then open:

```text
http://localhost:8000
```

Try questions like:

- 贾宝玉为什么厌恶仕途经济？
- 太虚幻境体现了什么佛教思想？
- 薛宝钗更接近儒家伦理吗？
- 好了歌如何表现无常和空？

## Enable LLM Generation

The app works without an LLM key, but the answer will be template-based. To enable LLM generation, create a local `.env` file. Do not put real keys in `.env.example`.

```bash
cp .env.example .env
```

Then edit `.env`. For DeepSeek:

```dotenv
OPENAI_API_KEY=your_deepseek_api_key_here
OPENAI_BASE_URL=https://api.deepseek.com
OPENAI_MODEL=deepseek-v4-flash
```

Start the server:

```bash
python3 src/server.py
```

Then turn on `启用 LLM 生成` in the web UI.

## Project Structure

```text
data/
  hongloumeng/passages.jsonl
  philosophy/concepts.jsonl
  annotations/characters.json
docs/
  project_proposal.md
  data_schema.md
  mvp_plan.md
src/
  rag_engine.py
  server.py
web/
  index.html
  styles.css
  app.js
```

## Current Architecture

```text
User Question
     |
     v
Perspective-aware Query Expansion
     |
     v
Hybrid Lexical Retrieval
  - Hongloumeng passages
  - Philosophy concepts
     |
     v
Structured Answer Composer
     |
     v
Citation-grounded Response
```

## Next Technical Upgrades

- Replace lexical scoring with BM25 + embeddings
- Add OpenAI-compatible LLM answer generation
- Add citation faithfulness checks
- Expand the corpus to all 120 chapters
- Add chapter-level theme heatmap and character philosophy pages
