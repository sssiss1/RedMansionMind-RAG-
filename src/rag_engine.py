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

    def explain(self, question: str, perspective: str = "综合", use_llm: bool = True) -> dict[str, Any]:
        response = self.answer(question, perspective, use_llm=False)
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
        return """你是一个面向普通读者的《红楼梦》哲学科普讲解员。
用户可能不了解中国哲学。请用清楚、温和、少术语的语言解释。
只能根据用户提供的 passages 和 concepts 回答，不要编造未提供的原文、章节或学术来源。
要求：
1. 先把哲学概念讲成人话，避免堆术语。
2. 再用《红楼梦》检索片段做例子。
3. 每个例子尽量标注 passage id 或 concept id。
4. 如果存在多种理解，说明这是“读法之一”。
请输出 JSON object，字段必须包括：
- title: 适合普通读者的小标题
- plain_explanation: 字符串数组，2-4条，解释核心哲学概念
- red_mansion_examples: 字符串数组，2-4条，用《红楼梦》片段说明概念如何出现
- why_it_matters: 一段话，说明这个哲学视角为什么有助于读懂《红楼梦》
- next_questions: 字符串数组，给初学者继续探索的2-4个问题
- citation_notes: 字符串数组，说明主要依据哪些 passage id / concept id
回答语言使用简体中文。"""

    def _compose_explain_title(self, response: dict[str, Any]) -> str:
        if response["matched_scenes"]:
            return f"从{response['matched_scenes'][0]['name']}读懂一点中国哲学"
        if response["concepts"]:
            return f"用《红楼梦》读懂“{response['concepts'][0]['name']}”"
        return "用《红楼梦》入门中国哲学"

    def _compose_plain_explanation(self, response: dict[str, Any]) -> list[str]:
        lines = []
        for concept in response["concepts"][:3]:
            lines.append(f"{concept['name']}：可以先简单理解为，{concept['definition']}")
        if not lines:
            lines.append("这个问题可以先从人物处境、情节变化和价值冲突入手，不必一开始就掌握复杂术语。")
        return lines

    def _compose_red_mansion_examples(self, response: dict[str, Any]) -> list[str]:
        examples = []
        for passage in response["evidence"][:3]:
            themes = "、".join(passage.get("themes", [])[:3]) or "相关主题"
            examples.append(f"{passage['id']}（第{passage['chapter']}回）可作为例子：这段材料涉及{themes}，适合用来理解问题中的哲学意味。")
        return examples

    def _compose_why_it_matters(self, response: dict[str, Any]) -> str:
        concept_names = "、".join(concept["name"] for concept in response["concepts"][:3]) or "相关哲学概念"
        return f"这些概念能帮助读者把《红楼梦》从单纯情节推进，读成关于人生选择、情感执着、家族秩序和盛衰变化的思考。当前检索到的关键词包括：{concept_names}。"

    def _compose_next_questions(self, response: dict[str, Any]) -> list[str]:
        scene = response["matched_scenes"][0]["name"] if response["matched_scenes"] else "这个情节"
        return [
            f"{scene}里哪些地方是原文事实，哪些是后来的哲学解释？",
            "如果换成儒家、道家、佛教视角，结论会有什么不同？",
            "这个主题还在哪些章节反复出现？",
        ]

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
