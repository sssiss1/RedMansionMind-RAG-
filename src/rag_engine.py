from __future__ import annotations

import json
import math
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any

try:
    from .llm_client import LLMCallError, LLMConfigError, chat_json, is_configured
except ImportError:
    from llm_client import LLMCallError, LLMConfigError, chat_json, is_configured


ROOT = Path(__file__).resolve().parents[1]
PASSAGE_PATH = ROOT / "data" / "hongloumeng" / "passages.jsonl"
CONCEPT_PATH = ROOT / "data" / "philosophy" / "concepts.jsonl"
CHARACTER_PATH = ROOT / "data" / "annotations" / "characters.json"
SCENE_PATH = ROOT / "data" / "annotations" / "scene_index.json"

PERSPECTIVE_TERMS = {
    "综合": [],
    "儒家": ["礼", "礼教", "家族", "父权", "孝", "功名", "仕途", "责任", "入世", "秩序"],
    "道家": ["自然", "无为", "有无", "真性情", "逍遥", "自由", "反功利", "本真"],
    "佛教": ["空", "色", "无常", "因果", "报应", "执着", "梦", "幻", "悟", "解脱"],
}

STOP_CHARS = set("的一是在不了和有为以与中人上也都而及其")
MIN_TOKEN_LEN = 2

KNOWN_CHAPTER_HINTS = {
    "葬花": 27,
    "黛玉葬花": 27,
    "抄检大观园": 74,
    "芙蓉女儿诔": 78,
    "好了歌": 1,
    "太虚幻境": 5,
    "仕途经济": 19,
}

TRADITIONAL_TO_SIMPLIFIED = str.maketrans(
    {
        "寶": "宝",
        "賈": "贾",
        "夢": "梦",
        "黛": "黛",
        "釵": "钗",
        "鳳": "凤",
        "虛": "虚",
        "靈": "灵",
        "風": "风",
        "塵": "尘",
        "隱": "隐",
        "甄": "甄",
        "複": "复",
        "復": "复",
        "舊": "旧",
        "職": "职",
        "拋": "抛",
        "進": "进",
        "國": "国",
        "榮": "荣",
        "寧": "宁",
        "雲": "云",
        "劉": "刘",
        "姥": "姥",
        "樓": "楼",
        "紅": "红",
        "異": "异",
        "體": "体",
        "萬": "万",
        "聽": "听",
        "禮": "礼",
        "詩": "诗",
        "書": "书",
        "無": "无",
        "塊": "块",
        "遠": "远",
        "說": "说",
        "後": "后",
        "榮": "荣",
        "華": "华",
        "貴": "贵",
        "師": "师",
        "發": "发",
        "攜": "携",
        "樂": "乐",
        "極": "极",
        "歸": "归",
        "強": "强",
        "寶": "宝",
        "實": "实",
        "鐫": "镌",
        "幾": "几",
        "歷": "历",
        "離": "离",
        "歡": "欢",
        "閨": "闺",
        "瑣": "琐",
        "詞": "词",
        "傳": "传",
        "愛": "爱",
        "貶": "贬",
        "勝": "胜",
        "種": "种",
        "壞": "坏",
        "舊": "旧",
        "願": "愿",
        "稱": "称",
        "檢": "检",
        "壽": "寿",
        "謀": "谋",
        "虛": "虚",
        "離": "离",
        "處": "处",
        "覺": "觉",
        "爾": "尔",
        "尋": "寻",
        "雖": "虽",
        "餘": "余",
        "與": "与",
        "為": "为",
        "這": "这",
        "個": "个",
        "來": "来",
        "時": "时",
        "里": "里",
        "裡": "里",
        "著": "着",
        "麼": "么",
        "幺": "么",
    }
)


def load_jsonl(path: Path) -> list[dict[str, Any]]:
    with path.open(encoding="utf-8") as f:
        return [json.loads(line) for line in f if line.strip()]


def tokenize(text: str) -> list[str]:
    text = normalize_for_search(text)
    words = re.findall(r"[A-Za-z0-9_]+", text.lower())
    chinese_runs = re.findall(r"[\u4e00-\u9fff]+", text)
    grams = []
    for run in chinese_runs:
        grams.extend(run[i : i + 2] for i in range(max(len(run) - 1, 0)))
        grams.extend(run[i : i + 3] for i in range(max(len(run) - 2, 0)))
    return [token for token in words + grams if len(token) >= MIN_TOKEN_LEN and token not in STOP_CHARS]


def normalize_for_search(text: str) -> str:
    return text.translate(TRADITIONAL_TO_SIMPLIFIED)


@dataclass
class ScoredItem:
    item: dict[str, Any]
    score: float
    matched_terms: list[str]


class RedMansionRAG:
    def __init__(self) -> None:
        self.passages = load_jsonl(PASSAGE_PATH)
        self.concepts = load_jsonl(CONCEPT_PATH)
        self.characters = json.loads(CHARACTER_PATH.read_text(encoding="utf-8"))
        self.scenes = json.loads(SCENE_PATH.read_text(encoding="utf-8")) if SCENE_PATH.exists() else []
        self._passage_index = self._build_index(self.passages, ["text", "title", "characters", "themes"])
        self._concept_index = self._build_index(self.concepts, ["name", "tradition", "definition", "keywords", "related_themes"])

    def answer(self, question: str, perspective: str = "综合", use_llm: bool = False) -> dict[str, Any]:
        perspective = perspective if perspective in PERSPECTIVE_TERMS else "综合"
        matched_scenes = self._matched_scenes(question)
        passage_query_terms = self._expanded_query(question, perspective, matched_scenes, include_perspective=True)
        concept_query_terms = self._expanded_query(question, perspective, matched_scenes, include_perspective=False)
        passages = self._rank(
            self.passages,
            passage_query_terms,
            ["text", "title", "characters", "themes"],
            index=self._passage_index,
            query_text=question,
            matched_scenes=matched_scenes,
        )[:4]
        concepts = self._rank(
            self.concepts,
            concept_query_terms,
            ["name", "tradition", "definition", "keywords", "related_themes"],
            index=self._concept_index,
            query_text=question,
            matched_scenes=matched_scenes,
            perspective=perspective,
        )[:3]
        characters = self._related_characters(passages)

        response = {
            "question": question,
            "perspective": perspective,
            "thesis": self._compose_thesis(question, perspective, passages, concepts),
            "evidence": [self._public_passage(item) for item in passages],
            "concepts": [self._public_concept(item) for item in concepts],
            "interpretation": self._compose_interpretation(perspective, passages, concepts),
            "related_characters": characters,
            "related_themes": self._related_themes(passages, concepts),
            "matched_scenes": [self._public_scene(scene) for scene in matched_scenes],
            "coverage_warning": self._coverage_warning(question),
            "disclaimer": "当前 MVP 使用本地样例语料和可解释检索生成答案；后续可接入 LLM 生成更自然的阐释，但仍应保留引用约束。",
            "llm_enabled": False,
            "llm_error": "",
        }

        if use_llm:
            response = self._apply_llm_answer(response)

        return response

    def explain(
        self,
        question: str,
        perspective: str = "综合",
        use_llm: bool = True,
        concept_id: str | None = None,
    ) -> dict[str, Any]:
        pinned = next((c for c in self.concepts if c.get("id") == concept_id), None) if concept_id else None
        if pinned:
            # Enrich the question so BM25 actually has tokens to work with
            # (e.g. user clicked "苦" but single-char tokens are dropped).
            enrichment = " ".join([
                pinned.get("name", ""),
                " ".join(pinned.get("keywords", []) or []),
                " ".join(pinned.get("related_themes", []) or []),
            ]).strip()
            effective_question = f"{question} {enrichment}".strip() if enrichment else question
        else:
            effective_question = question

        response = self.answer(effective_question, perspective, use_llm=False)
        # Keep the original user-facing question.
        response["question"] = question

        if pinned:
            pinned_public = {
                "id": pinned["id"],
                "tradition": pinned.get("tradition", ""),
                "name": pinned.get("name", ""),
                "definition": pinned.get("definition", ""),
                "keywords": pinned.get("keywords", []),
                "score": 999.0,
                "matched_terms": [pinned.get("name", "")],
            }
            existing = [c for c in response["concepts"] if c.get("id") != pinned["id"]]
            response["concepts"] = [pinned_public] + existing[:2]
            response["pinned_concept_id"] = pinned["id"]

        response["mode"] = "explain"
        response["explain_title"] = self._compose_explain_title(response)
        response["plain_explanation"] = self._compose_plain_explanation(response)
        response["red_mansion_examples"] = self._compose_red_mansion_examples(response)
        response["why_it_matters"] = self._compose_why_it_matters(response)
        response["next_questions"] = self._compose_next_questions(response)
        response["llm_enabled"] = False
        response["llm_error"] = ""

        if use_llm:
            response = self._apply_llm_explanation(response)

        return response

    def _expanded_query(
        self,
        question: str,
        perspective: str,
        matched_scenes: list[dict[str, Any]],
        include_perspective: bool,
    ) -> list[str]:
        terms = tokenize(question)
        if include_perspective:
            terms.extend(PERSPECTIVE_TERMS[perspective])
        for scene in matched_scenes:
            terms.extend(scene.get("aliases", []))
            terms.extend(scene.get("keywords", []))
        for name, profile in self.characters.items():
            if normalize_for_search(name) in normalize_for_search(question):
                terms.extend(profile["keywords"])
        return terms

    def _build_index(self, items: list[dict[str, Any]], fields: list[str]) -> dict[str, Any]:
        docs = [tokenize(self._field_text(item, fields)) for item in items]
        doc_counts = [{token: tokens.count(token) for token in set(tokens)} for tokens in docs]
        doc_freq: dict[str, int] = {}
        for tokens in docs:
            for token in set(tokens):
                doc_freq[token] = doc_freq.get(token, 0) + 1
        avg_len = sum(len(tokens) for tokens in docs) / max(len(docs), 1)
        return {"docs": docs, "doc_counts": doc_counts, "doc_freq": doc_freq, "avg_len": avg_len, "total": len(items)}

    def _rank(
        self,
        items: list[dict[str, Any]],
        query_terms: list[str],
        fields: list[str],
        index: dict[str, Any],
        query_text: str,
        matched_scenes: list[dict[str, Any]] | None = None,
        perspective: str | None = None,
    ) -> list[ScoredItem]:
        query_terms = [normalize_for_search(term) for term in query_terms if len(term) >= MIN_TOKEN_LEN]
        query_counts = {term: query_terms.count(term) for term in set(query_terms)}
        scored = []
        for doc_index, item in enumerate(items):
            haystack = normalize_for_search(self._field_text(item, fields))
            tokens = index["docs"][doc_index]
            token_counts = index["doc_counts"][doc_index]
            score = self._bm25_score(query_counts, token_counts, len(tokens), index)
            matched = []
            for term, count in query_counts.items():
                if term in token_counts:
                    matched.append(term)
                elif term in haystack:
                    score += 1.5 + math.log1p(count)
                    matched.append(term)
            score += self._phrase_boost(query_text, item)
            score += self._scene_boost(item, matched_scenes or [])
            score += self._concept_scene_boost(item, matched_scenes or [])
            if perspective and perspective != "综合":
                if item.get("tradition") == perspective:
                    score += 14.0
                else:
                    score -= 4.0
            if score > 0:
                scored.append(ScoredItem(item=item, score=round(score, 3), matched_terms=sorted(set(matched))[:8]))
        return sorted(scored, key=lambda x: x.score, reverse=True)

    def _bm25_score(
        self,
        query_counts: dict[str, int],
        token_counts: dict[str, int],
        doc_len: int,
        index: dict[str, Any],
    ) -> float:
        score = 0.0
        k1 = 1.5
        b = 0.75
        for term, query_count in query_counts.items():
            tf = token_counts.get(term, 0)
            if not tf:
                continue
            df = index["doc_freq"].get(term, 0)
            idf = math.log(1 + (index["total"] - df + 0.5) / (df + 0.5))
            denom = tf + k1 * (1 - b + b * doc_len / max(index["avg_len"], 1))
            score += idf * ((tf * (k1 + 1)) / denom) * (1 + math.log1p(query_count))
        return score

    def _phrase_boost(self, query_text: str, item: dict[str, Any]) -> float:
        query = normalize_for_search(query_text)
        haystack = normalize_for_search(self._field_text(item, ["text", "title", "characters", "themes", "keywords", "name"]))
        boost = 0.0
        for phrase in re.findall(r"[\u4e00-\u9fff]{2,}", query):
            if phrase in haystack:
                boost += min(len(phrase), 8) * 2.0
        return boost

    def _matched_scenes(self, question: str) -> list[dict[str, Any]]:
        normalized_question = normalize_for_search(question)
        matches = []
        for scene in self.scenes:
            aliases = scene.get("aliases", []) + [scene.get("name", "")]
            if any(normalize_for_search(alias) in normalized_question for alias in aliases if alias):
                matches.append(scene)
        return matches

    def _scene_boost(self, item: dict[str, Any], matched_scenes: list[dict[str, Any]]) -> float:
        if not matched_scenes or "chapter" not in item:
            return 0.0
        chapter = int(item.get("chapter", 0))
        boost = 0.0
        haystack = normalize_for_search(self._field_text(item, ["text", "title", "characters", "themes"]))
        for scene in matched_scenes:
            if chapter in scene.get("chapters", []):
                boost += 24.0
                for keyword in scene.get("keywords", []):
                    if normalize_for_search(keyword) in haystack:
                        boost += 2.0
                for alias in scene.get("aliases", []):
                    if normalize_for_search(alias) in haystack:
                        boost += 5.0
        return boost

    def _concept_scene_boost(self, item: dict[str, Any], matched_scenes: list[dict[str, Any]]) -> float:
        if not matched_scenes or "tradition" not in item:
            return 0.0
        concept_terms = {
            normalize_for_search(item.get("name", "")),
            *[normalize_for_search(term) for term in item.get("keywords", [])],
            *[normalize_for_search(term) for term in item.get("related_themes", [])],
        }
        boost = 0.0
        for scene in matched_scenes:
            for keyword in scene.get("keywords", []):
                normalized = normalize_for_search(keyword)
                if normalized == normalize_for_search(item.get("name", "")):
                    boost += 16.0
                elif normalized in concept_terms:
                    boost += 8.0
                elif any(normalized in term or term in normalized for term in concept_terms if term):
                    boost += 2.0
        return boost

    def _public_scene(self, scene: dict[str, Any]) -> dict[str, Any]:
        return {
            "id": scene.get("id", ""),
            "name": scene.get("name", ""),
            "chapters": scene.get("chapters", []),
            "keywords": scene.get("keywords", []),
        }

    def _field_text(self, item: dict[str, Any], fields: list[str]) -> str:
        parts = []
        for field in fields:
            value = item.get(field, "")
            if isinstance(value, list):
                parts.extend(str(v) for v in value)
            else:
                parts.append(str(value))
        return " ".join(parts)

    def _related_characters(self, passages: list[ScoredItem]) -> list[dict[str, Any]]:
        names = []
        for scored in passages:
            names.extend(scored.item.get("characters", []))

        seen = set()
        related = []
        for name in names:
            if name in seen or name not in self.characters:
                continue
            seen.add(name)
            related.append({"name": name, **self.characters[name]})
        return related[:4]

    def _related_themes(self, passages: list[ScoredItem], concepts: list[ScoredItem]) -> list[str]:
        themes = []
        for scored in passages:
            themes.extend(scored.item.get("themes", []))
        for scored in concepts:
            themes.extend(scored.item.get("related_themes", []))

        deduped = []
        for theme in themes:
            if theme not in deduped:
                deduped.append(theme)
        return deduped[:10]

    def _coverage_warning(self, question: str) -> str:
        normalized_question = normalize_for_search(question)
        loaded_chapters = {int(item.get("chapter", 0)) for item in self.passages}
        max_chapter = max(loaded_chapters) if loaded_chapters else 0
        for phrase, chapter in KNOWN_CHAPTER_HINTS.items():
            if normalize_for_search(phrase) in normalized_question and chapter not in loaded_chapters:
                return f"当前语料最高到第 {max_chapter} 回，问题可能需要第 {chapter} 回文本；请先扩充语料后再判断。"
        return ""

    def _compose_thesis(self, question: str, perspective: str, passages: list[ScoredItem], concepts: list[ScoredItem]) -> str:
        concept_names = "、".join(item.item["name"] for item in concepts[:2]) or "文本主题"
        passage_hint = passages[0].item["title"] if passages else "相关章节"
        if perspective == "综合":
            return f"这个问题可以从《红楼梦》的情节证据出发，结合{concept_names}来解释；关键线索集中在“{passage_hint}”等段落。"
        return f"从{perspective}视角看，问题的核心不只是人物行为，而是其与{concept_names}之间的张力；“{passage_hint}”提供了主要文本依据。"

    def _compose_interpretation(self, perspective: str, passages: list[ScoredItem], concepts: list[ScoredItem]) -> list[str]:
        if not passages:
            return ["暂未检索到足够文本证据，可以扩充语料或换一种问法。"]

        lead = passages[0].item
        concept_text = "、".join(f"{c.item['tradition']}的“{c.item['name']}”" for c in concepts)
        lines = [
            f"文本层面，{lead['title']}中的材料把问题放在{ '、'.join(lead.get('themes', [])[:3]) }等主题中，而不是孤立的人物性格判断。",
        ]
        if concept_text:
            lines.append(f"概念层面，检索到的{concept_text}提供了阐释框架：它们帮助区分原文事实、伦理评价和哲学化解释。")
        if perspective == "儒家":
            lines.append("儒家视角会特别关注礼法、家族责任和入世功名，因此人物的反抗或顺从都可以被看作对伦理秩序的回应。")
        elif perspective == "道家":
            lines.append("道家视角会更重视自然、本真与反功利倾向，因此人物对名物和规范的拒斥可被理解为保存真性情的努力。")
        elif perspective == "佛教":
            lines.append("佛教视角会强调梦幻、无常、因果与执着，因此繁华和情感都带有需要被觉察的非恒常性。")
        else:
            lines.append("综合视角适合同时观察礼法秩序、真性情和空幻无常之间的互相拉扯。")
        return lines

    def _apply_llm_answer(self, response: dict[str, Any]) -> dict[str, Any]:
        if not is_configured():
            response["llm_error"] = "未设置 OPENAI_API_KEY，当前显示本地模板回答。"
            return response

        payload = {
            "question": response["question"],
            "perspective": response["perspective"],
            "coverage_warning": response["coverage_warning"],
            "passages": [
                {
                    "id": item["id"],
                    "chapter": item["chapter"],
                    "title": item["title"],
                    "text": item["text"],
                    "themes": item["themes"],
                }
                for item in response["evidence"]
            ],
            "concepts": [
                {
                    "id": item["id"],
                    "tradition": item["tradition"],
                    "name": item["name"],
                    "definition": item["definition"],
                    "keywords": item["keywords"],
                }
                for item in response["concepts"]
            ],
        }
        try:
            llm_answer = chat_json(system_prompt=self._llm_system_prompt(), user_payload=payload)
        except (LLMConfigError, LLMCallError) as exc:
            response["llm_error"] = str(exc)
            return response

        response["thesis"] = str(llm_answer.get("thesis") or response["thesis"])
        interpretation = llm_answer.get("interpretation")
        if isinstance(interpretation, list):
            response["interpretation"] = [str(item) for item in interpretation if str(item).strip()]
        elif isinstance(interpretation, str):
            response["interpretation"] = [interpretation]
        response["llm_enabled"] = True
        response["llm_model"] = llm_answer.get("_llm_model", "")
        response["limits"] = str(llm_answer.get("limits", ""))
        response["citation_notes"] = llm_answer.get("citation_notes", [])
        response["disclaimer"] = "LLM 回答仅基于页面展示的检索证据和哲学概念生成；若证据不足，应以 coverage warning 和原文证据为准。"
        return response

    def _apply_llm_explanation(self, response: dict[str, Any]) -> dict[str, Any]:
        if not is_configured():
            response["llm_error"] = "未设置 OPENAI_API_KEY，当前显示本地科普模板。"
            return response

        payload = {
            "question": response["question"],
            "perspective": response["perspective"],
            "matched_scenes": response["matched_scenes"],
            "passages": [
                {
                    "id": item["id"],
                    "chapter": item["chapter"],
                    "title": item["title"],
                    "text": item["text"],
                    "themes": item["themes"],
                }
                for item in response["evidence"]
            ],
            "concepts": [
                {
                    "id": item["id"],
                    "tradition": item["tradition"],
                    "name": item["name"],
                    "definition": item["definition"],
                    "keywords": item["keywords"],
                }
                for item in response["concepts"]
            ],
        }
        try:
            llm_answer = chat_json(system_prompt=self._llm_explain_prompt(), user_payload=payload, temperature=0.35)
        except (LLMConfigError, LLMCallError) as exc:
            response["llm_error"] = str(exc)
            return response

        response["explain_title"] = str(llm_answer.get("title") or response["explain_title"])
        response["plain_explanation"] = self._as_list(llm_answer.get("plain_explanation")) or response["plain_explanation"]
        response["red_mansion_examples"] = self._as_list(llm_answer.get("red_mansion_examples")) or response["red_mansion_examples"]
        response["why_it_matters"] = str(llm_answer.get("why_it_matters") or response["why_it_matters"])
        response["next_questions"] = self._as_list(llm_answer.get("next_questions")) or response["next_questions"]
        response["citation_notes"] = self._as_list(llm_answer.get("citation_notes"))
        response["llm_enabled"] = True
        response["llm_model"] = llm_answer.get("_llm_model", "")
        response["disclaimer"] = "科普解释由 LLM 基于检索证据生成，重点是帮助入门理解；深入研究仍应回到原文和概念来源。"
        return response

    def _as_list(self, value: Any) -> list[str]:
        if isinstance(value, list):
            return [str(item) for item in value if str(item).strip()]
        if isinstance(value, str) and value.strip():
            return [value]
        return []

    def _llm_system_prompt(self) -> str:
        return """你是一个严谨的《红楼梦》与中国哲学研究助手。
只能根据用户提供的 passages 和 concepts 回答，不要编造未提供的原文、章节或学术来源。
如果证据不足，要明确说明限制。
请输出 JSON object，字段必须包括：
- thesis: 一句话核心观点
- interpretation: 字符串数组，3-5条，每条都要结合 passage id 或 concept id
- citation_notes: 数组，说明关键观点分别依据哪些 passage id / concept id
- limits: 说明哪些地方属于解释性判断，而非原文事实
回答语言使用简体中文。"""

    def _llm_explain_prompt(self) -> str:
        return """你是一位面向普通读者的《红楼梦》哲学科普讲解员，语气像一位温和而博学的朋友。
你的目标：不要先讲抽象定义，而是先读懂用户给你的 passages 大段材料，再说明概念如何从这些材料里长出来。

铁律：
- 只能基于用户提供的 passages 和 concepts。绝不编造原文、章节、人物事件或学术来源。
- 提到具体情节必须能从给定 passages 推出；如果证据不够直接，要用"可以这样理解"等措辞软化。
- 每条 plain_explanation 都必须对应至少一个 passage：先说这段里的人物处境/动作/关系，再说概念解释了什么。不能写成脱离文本的词典解释。
- red_mansion_examples 不要另找例子，只能围绕给定 passages 的大块内容，指出哪一块材料支撑哪一个解释。
- 不堆术语。每出现一个术语就立刻给一个 6-15 字的口语解释。
- 不要说"在《红楼梦》中"这种废话开头。直接给画面、给冲突、给情绪。
- 不抄 passage 原文超过 12 字；用自己的话复述场景。

写作风格：
- plain_explanation 每条 55-95 字，像在跟人聊天。结构是：这段材料在发生什么 -> 概念帮我们看清什么 -> 避免一个误解。
- red_mansion_examples 每条 60-110 字，先抛出一个具体画面（谁、在哪、做什么），再点出它如何体现这个概念；末尾标注 passage id 或 (第X回)。
- why_it_matters 100-160 字，回答"懂了这个概念，再读这些大段材料会多看见什么"，要带一点情感共鸣，不要空泛。
- next_questions 给 3 个真正能延伸思考的问题，不要"这个主题还在哪些章节出现"这种检索性问题；要的是"如果……会不会……"这种思辨问题。

请输出 JSON object，字段：
- title: 12-22 字的小标题，像一句邀请，不要套"浅析/试论"
- plain_explanation: 字符串数组，2-3 条
- red_mansion_examples: 字符串数组，2-3 条
- why_it_matters: 一段话（单字符串）
- next_questions: 字符串数组，3 条
- citation_notes: 字符串数组，简短说明每条结论主要依据哪几个 passage id / concept id
回答语言：简体中文。"""

    def _compose_explain_title(self, response: dict[str, Any]) -> str:
        if response["matched_scenes"]:
            return f"从{response['matched_scenes'][0]['name']}读懂一点中国哲学"
        if response["concepts"]:
            return f"用《红楼梦》读懂“{response['concepts'][0]['name']}”"
        return "用《红楼梦》入门中国哲学"

    def _compose_plain_explanation(self, response: dict[str, Any]) -> list[str]:
        lines = []
        passages = response["evidence"][:3]
        for index, concept in enumerate(response["concepts"][:3]):
            definition = concept["definition"].rstrip("。.")
            passage = passages[index % len(passages)] if passages else None
            if passage:
                scene = self._passage_scene_sentence(passage)
                lines.append(
                    f"{scene}「{concept['name']}」不是给这段文字贴标签，而是提醒我们看见：{definition}。"
                    "也就是说，概念要解释人物为什么这样进退、忍让或执着，不能离开这块材料空讲。"
                )
            else:
                lines.append(
                    f"先把「{concept['name']}」放慢看：{definition}。但当前材料不足，"
                    "所以更稳妥的读法是先回到人物处境、动作和关系，再判断它是否真的能解释这段文字。"
                )
        if not lines:
            lines.append("这个问题没有现成的术语对应，可以先从人物处境、情节变化和价值冲突切入，慢慢摸到背后的思考方式。")
        return lines

    def _compose_red_mansion_examples(self, response: dict[str, Any]) -> list[str]:
        examples = []
        for passage in response["evidence"][:3]:
            themes = "、".join(passage.get("themes", [])[:2])
            tag = f"（关键词：{themes}）" if themes else ""
            examples.append(
                f"{self._passage_scene_sentence(passage)}这不是另举一个例子，而是直接贴着 {passage['id']} "
                f"这块材料看：概念应当解释这里的行动、关系和压力怎么连在一起{tag}。"
            )
        if not examples:
            examples.append("当前检索到的片段较少，可以换一个更具体的人物或情节试试。")
        return examples

    def _passage_scene_sentence(self, passage: dict[str, Any]) -> str:
        chars = "、".join(passage.get("characters", [])[:2])
        who = chars if chars else "书中人物"
        text = (passage.get("text") or "").strip().replace("\n", "")
        snippet = text[:44] + "…" if len(text) > 44 else text
        return f"第{passage['chapter']}回里，{who}这一大段先给出的是“{snippet}”这样的处境。"

    def _compose_why_it_matters(self, response: dict[str, Any]) -> str:
        concept_names = "、".join(concept["name"] for concept in response["concepts"][:3])
        if concept_names:
            return (
                f"理解了「{concept_names}」之后再读《红楼梦》，"
                "你会发现作者并不是单纯在写一个家族的兴衰故事——他在用极细的笔触，"
                "把这些哲学命题铺陈成日常的吃饭、做诗、闹气、伤怀。下一次读到看似闲笔的段落，"
                "你也许会忽然意识到：原来这一处也在说同一件事。"
            )
        return (
            "把哲学概念放回小说情节里看，能帮助你从单纯的'谁喜欢谁、谁害了谁'，"
            "读出一层关于人生选择和价值冲突的余味。"
        )

    def _compose_next_questions(self, response: dict[str, Any]) -> list[str]:
        concepts = response["concepts"][:2]
        scene_name = response["matched_scenes"][0]["name"] if response["matched_scenes"] else None
        questions: list[str] = []
        if len(concepts) >= 2:
            questions.append(f"「{concepts[0]['name']}」和「{concepts[1]['name']}」在《红楼梦》里有冲突的时候吗？")
        elif concepts:
            questions.append(f"如果换一个角度看「{concepts[0]['name']}」，比如从黛玉而不是宝玉的眼睛，会读出什么不同？")
        else:
            questions.append("作者是站在哪一种哲学立场上写这一段的？还是其实他在并置几种声音？")
        if scene_name:
            questions.append(f"{scene_name}里，是哪个细节最先让你感到'背后好像有更大的意思'？")
        else:
            questions.append("书里有没有哪个看似闲笔的细节，回头看其实在偷偷推进这个主题？")
        questions.append("如果让今天的读者把这个概念套到自己生活里，最容易误解的是什么？")
        return questions

    def _public_passage(self, scored: ScoredItem) -> dict[str, Any]:
        item = scored.item
        return {
            "id": item["id"],
            "chapter": item["chapter"],
            "title": item["title"],
            "text": item["text"],
            "characters": item.get("characters", []),
            "themes": item.get("themes", []),
            "score": scored.score,
            "matched_terms": scored.matched_terms,
        }

    def _public_concept(self, scored: ScoredItem) -> dict[str, Any]:
        item = scored.item
        return {
            "id": item["id"],
            "tradition": item["tradition"],
            "name": item["name"],
            "definition": item["definition"],
            "keywords": item.get("keywords", []),
            "score": scored.score,
            "matched_terms": scored.matched_terms,
        }
