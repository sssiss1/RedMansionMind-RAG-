# RedMansionMind

**Citation-grounded philosophical RAG for _Dream of the Red Chamber_.**

RedMansionMind 是一个面向《红楼梦》哲学阐释的 LLM/RAG 项目。它将《红楼梦》前 80 回原文、儒释道哲学概念库、情节别名索引和 LLM 生成结合起来，用于回答类似下面的问题：

- 太虚幻境体现了什么佛教思想？
- 贾宝玉为什么厌恶仕途经济？
- 林黛玉葬花体现了什么生命观？
- 抄检大观园体现了什么礼法和权力问题？
- 芙蓉女儿诔体现了贾宝玉怎样的真情？

项目目标不是做一个泛泛的文学聊天机器人，而是构建一个 **citation-grounded interpretive RAG system**：回答必须基于检索到的原文 passage 和哲学概念，尽量减少无依据发挥。

## Highlights

- **Domain-specific RAG**: 面向《红楼梦》与中国哲学的专门检索与生成系统
- **Scene-aware retrieval**: 使用情节别名表将“黛玉葬花”“仕途经济”“抄检大观园”等自然语言问题映射到关键章节
- **Philosophy grounding**: 检索儒家、道家、佛教概念，辅助 LLM 进行哲学阐释
- **Citation-grounded generation**: LLM 只基于检索出的 passage 和 concept 生成结构化回答
- **Readable citation chips**: 将 `hlm_ch005_p005`、`buddhism_sunyata` 等内部 ID 展示为可读引用标签
- **Beginner-friendly explanation**: 提供“科普解释”模式，把哲学术语讲成普通读者也能理解的说明
- **Evaluation set**: 内置 30 题评测集，自动评估章节召回和概念召回
- **No dependency MVP**: 后端使用 Python 标准库即可运行；LLM 调用也是 OpenAI-compatible HTTP API

## Demo Screenshots

Screenshots can be added here:

```text
docs/assets/demo-taixu.png
docs/assets/demo-daiyu-burying-flowers.png
docs/assets/demo-raiding-daguanyuan.png
```

Suggested demo questions:

```text
太虚幻境体现了什么佛教思想？
林黛玉葬花体现了什么生命观？
抄检大观园体现了什么礼法和权力问题？
```

## Architecture

```text
User Question
     |
     v
Query Understanding
  - perspective: 综合 / 儒家 / 道家 / 佛教
  - scene alias matching
  - simplified/traditional normalization
     |
     v
Retrieval
  - BM25 over Hongloumeng passages
  - scene-based chapter boosting
  - philosophy concept retrieval
     |
     v
Evidence Pack
  - top passages
  - top philosophy concepts
  - matched scenes
     |
     v
LLM Generation
  - thesis
  - interpretation
  - citation notes
  - limits
     |
     v
Citation-grounded Answer
```

## Current Dataset

The current local corpus includes:

```text
《红楼梦》前 80 回
1322 passages
30 evaluation questions
22 scene index entries
35 philosophy concepts
```

Important data files:

```text
data/hongloumeng/passages.jsonl
data/philosophy/concepts.jsonl
data/annotations/characters.json
data/annotations/scene_index.json
eval/questions.jsonl
```

## Scene Index

The scene index is a lightweight query-understanding layer. It maps user-friendly literary expressions to chapters and retrieval keywords.

Example:

```json
{
  "id": "scene_burying_flowers",
  "name": "黛玉葬花",
  "chapters": [27],
  "aliases": ["黛玉葬花", "葬花", "葬花词", "埋香冢", "飞燕泣残红", "花谢花飞花满天"],
  "keywords": ["无常", "生命意识", "女性命运", "情"]
}
```

This allows questions like:

```text
林黛玉葬花体现了什么生命观？
```

to reliably retrieve chapter 27 passages even when the exact wording differs from the source text.

## Evaluation

Run the retrieval evaluation:

```bash
python3 eval/run_eval.py
```

Current result:

```text
total: 30
top1 chapter accuracy: 0.867
top4 chapter accuracy: 1.0
concept recall: 1.0
misses: 0
```

The evaluation checks:

- whether top-1 retrieved passage belongs to the expected chapter
- whether top-4 retrieved passages contain an expected chapter
- whether retrieved philosophy concepts match expected concepts
- whether missing corpus coverage is reported

## Run Locally

Start the server:

```bash
python3 src/server.py
```

Then open:

```text
http://localhost:8000
```

If port 8000 is already in use:

```bash
python3 src/server.py --port 8001
```

The app works without an LLM key, but the answer will be template-based. Enable LLM generation for better interpretation quality.

## Enable LLM Generation

Create a local `.env` file:

```bash
cp .env.example .env
```

Do not put real API keys in `.env.example`. The real `.env` file is ignored by Git.

For DeepSeek:

```dotenv
OPENAI_API_KEY=your_deepseek_api_key_here
OPENAI_BASE_URL=https://api.deepseek.com
OPENAI_MODEL=deepseek-v4-flash
```

If your account uses the older model alias:

```dotenv
OPENAI_MODEL=deepseek-chat
```

Then restart the server and turn on `启用 LLM 生成` in the web UI.

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

Beginner-friendly philosophy explanation:

```bash
curl --get \
  --data-urlencode 'question=太虚幻境体现了什么佛教思想？' \
  --data-urlencode 'perspective=佛教' \
  --data-urlencode 'llm=1' \
  http://127.0.0.1:8000/api/explain
```

## Data Preparation

Generate passages from Project Gutenberg text:

```bash
python3 scripts/prepare_hlm_passages.py --url --limit-chapters 80 --output data/hongloumeng/passages.generated.jsonl
cp data/hongloumeng/passages.generated.jsonl data/hongloumeng/passages.jsonl
```

The script:

- downloads the public-domain text
- strips Project Gutenberg boilerplate
- detects chapter headings
- removes soft line breaks
- chunks text into passage-level JSONL
- adds lightweight character and theme metadata

More details: `docs/prepare_hongloumeng_passages.md`.

## Project Structure

```text
data/
  hongloumeng/passages.jsonl
  philosophy/concepts.jsonl
  annotations/characters.json
  annotations/scene_index.json
docs/
  data_schema.md
  llm_integration.md
  mvp_plan.md
  prepare_hongloumeng_passages.md
  project_proposal.md
eval/
  questions.jsonl
  results.json
  run_eval.py
scripts/
  prepare_hlm_passages.py
src/
  llm_client.py
  rag_engine.py
  server.py
web/
  index.html
  styles.css
  app.js
```

## Implementation Notes

Retrieval currently combines:

- simplified/traditional Chinese normalization
- character n-gram tokenization
- BM25-style scoring
- exact phrase boost
- scene-based chapter boost
- perspective-aware query expansion

LLM generation uses an OpenAI-compatible `/chat/completions` endpoint and asks the model to return JSON:

```json
{
  "thesis": "一句话核心观点",
  "interpretation": ["结合 passage id 和 concept id 的分析"],
  "citation_notes": ["说明关键观点依据哪些证据"],
  "limits": "说明哪些地方属于解释性判断"
}
```

The beginner-friendly module uses `/api/explain` and asks the model to return:

```json
{
  "title": "适合普通读者的小标题",
  "plain_explanation": ["用少术语解释核心概念"],
  "red_mansion_examples": ["把概念放回《红楼梦》片段中说明"],
  "why_it_matters": "说明这个哲学视角为什么有助于读懂小说",
  "next_questions": ["适合继续探索的问题"],
  "citation_notes": ["主要依据哪些 passage id / concept id"]
}
```

## Resume Bullets

English:

```text
Built RedMansionMind, a citation-grounded RAG system for philosophical interpretation of Dream of the Red Chamber, combining chapter-level literary retrieval with Confucian, Daoist, and Buddhist concept grounding.

Implemented scene-aware retrieval with a literary alias index, improving top-4 chapter retrieval accuracy to 100% on a 30-question evaluation set.
```

中文：

```text
构建面向《红楼梦》的哲学阐释型 RAG 系统，融合原文 passage 检索、儒释道概念库、情节别名索引与 LLM 结构化生成。

设计 scene index 将“黛玉葬花”“仕途经济”“抄检大观园”等自然语言问题映射到关键章节，在 30 题评测集上 top-4 章节命中率达到 100%。
```

## Roadmap

- Expand philosophy concepts further with scholarship-backed definitions and examples
- Add scholarship-backed paper notes as a third retrieval source
- Add character philosophy profile pages
- Expand corpus from 80 chapters to 120 chapters
- Add LLM answer quality evaluation
- Build a small SFT dataset for future LoRA fine-tuning
