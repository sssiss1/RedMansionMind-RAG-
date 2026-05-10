# Preparing Hongloumeng Passages

The recommended workflow is:

1. Use a public-domain text source.
2. Convert the raw text into chapter-aware passages.
3. Add lightweight character and theme metadata.
4. Inspect samples manually before using the file in RAG.

## Public Sources

- Project Gutenberg ebook 24264: https://www.gutenberg.org/ebooks/24264
- Plain UTF-8 text: https://www.gutenberg.org/ebooks/24264.txt.utf-8
- Wikisource page: https://zh.wikisource.org/zh-hans/%E7%B4%85%E6%A8%93%E5%A4%A2

Project Gutenberg is easiest for scripting because it provides one UTF-8 text file.

## Generate Passages

Download and process the Project Gutenberg text:

```bash
python3 scripts/prepare_hlm_passages.py --url --limit-chapters 20 --output data/hongloumeng/passages.generated.jsonl
```

Or process a local raw text file:

```bash
python3 scripts/prepare_hlm_passages.py --input raw_data/hongloumeng.txt --output data/hongloumeng/passages.generated.jsonl
```

The script:

- strips Project Gutenberg boilerplate
- detects chapter headings such as `第一回 ...`
- chunks each chapter into passages of about 180-480 Chinese characters
- detects common character aliases
- tags simple philosophy/literary themes by keyword

## Inspect Output

```bash
python3 -m json.tool data/hongloumeng/passages.generated.jsonl
```

For JSONL, it is usually easier to inspect the first few lines:

```bash
head -n 5 data/hongloumeng/passages.generated.jsonl
```

## Use in the App

After checking the generated data, either replace the current sample file:

```bash
cp data/hongloumeng/passages.generated.jsonl data/hongloumeng/passages.jsonl
```

or update `src/rag_engine.py` to point to the generated file.

Keep the generated file in Git only if you are comfortable with the source license and attribution.
