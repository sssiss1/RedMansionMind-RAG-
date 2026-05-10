#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from src.rag_engine import RedMansionRAG


def main() -> None:
    parser = argparse.ArgumentParser(description="Evaluate RedMansionMind retrieval quality.")
    parser.add_argument("--questions", type=Path, default=ROOT / "eval" / "questions.jsonl")
    parser.add_argument("--output", type=Path, default=ROOT / "eval" / "results.json")
    parser.add_argument("--top-k", type=int, default=4)
    args = parser.parse_args()

    questions = load_jsonl(args.questions)
    engine = RedMansionRAG()
    rows = []
    for item in questions:
        answer = engine.answer(item["question"], item.get("perspective", "综合"), use_llm=False)
        evidence = answer["evidence"]
        concepts = answer["concepts"]
        expected_chapters = set(item.get("expected_chapters", []))
        expected_concepts = set(item.get("expected_concepts", []))
        top_chapters = [doc["chapter"] for doc in evidence[: args.top_k]]
        top_concepts = {doc["name"] for doc in concepts}
        top1_hit = bool(top_chapters and top_chapters[0] in expected_chapters)
        topk_hit = bool(expected_chapters.intersection(top_chapters))
        concept_hit = not expected_concepts or bool(expected_concepts.intersection(top_concepts))
        rows.append(
            {
                "id": item["id"],
                "question": item["question"],
                "perspective": item.get("perspective", "综合"),
                "expected_chapters": sorted(expected_chapters),
                "retrieved_chapters": top_chapters,
                "expected_concepts": sorted(expected_concepts),
                "retrieved_concepts": sorted(top_concepts),
                "top1_hit": top1_hit,
                "topk_hit": topk_hit,
                "concept_hit": concept_hit,
                "coverage_warning": answer.get("coverage_warning", ""),
                "top_evidence": [
                    {
                        "id": doc["id"],
                        "chapter": doc["chapter"],
                        "score": doc["score"],
                        "title": doc["title"],
                    }
                    for doc in evidence[: args.top_k]
                ],
            }
        )

    summary = summarize(rows)
    payload = {"summary": summary, "rows": rows}
    args.output.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print_summary(summary)
    print(f"Wrote detailed results to {args.output}")


def load_jsonl(path: Path) -> list[dict[str, Any]]:
    with path.open(encoding="utf-8") as f:
        return [json.loads(line) for line in f if line.strip()]


def summarize(rows: list[dict[str, Any]]) -> dict[str, Any]:
    total = len(rows)
    return {
        "total": total,
        "top1_chapter_accuracy": ratio(sum(row["top1_hit"] for row in rows), total),
        "top4_chapter_accuracy": ratio(sum(row["topk_hit"] for row in rows), total),
        "concept_recall": ratio(sum(row["concept_hit"] for row in rows), total),
        "misses": [
            {
                "id": row["id"],
                "question": row["question"],
                "expected_chapters": row["expected_chapters"],
                "retrieved_chapters": row["retrieved_chapters"],
                "expected_concepts": row["expected_concepts"],
                "retrieved_concepts": row["retrieved_concepts"],
            }
            for row in rows
            if not (row["topk_hit"] and row["concept_hit"])
        ],
    }


def ratio(numerator: int, denominator: int) -> float:
    if denominator == 0:
        return 0.0
    return round(numerator / denominator, 3)


def print_summary(summary: dict[str, Any]) -> None:
    print("Evaluation summary")
    print(f"- total: {summary['total']}")
    print(f"- top1 chapter accuracy: {summary['top1_chapter_accuracy']}")
    print(f"- top4 chapter accuracy: {summary['top4_chapter_accuracy']}")
    print(f"- concept recall: {summary['concept_recall']}")
    print(f"- misses: {len(summary['misses'])}")


if __name__ == "__main__":
    main()
