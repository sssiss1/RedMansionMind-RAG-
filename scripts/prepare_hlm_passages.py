#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
import sys
import urllib.request
from dataclasses import dataclass
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT = ROOT / "data" / "hongloumeng" / "passages.generated.jsonl"
DEFAULT_URL = "https://www.gutenberg.org/ebooks/24264.txt.utf-8"

CHINESE_NUMERAL = "零〇一二三四五六七八九十百兩两"
CHAPTER_RE = re.compile(
    rf"^\s*第(?P<num>[{CHINESE_NUMERAL}]+)回\s+(?P<title>.+?)\s*$",
    re.MULTILINE,
)

CHARACTER_ALIASES = {
    "贾宝玉": ["贾宝玉", "寶玉", "宝玉", "怡红公子","宝二爷","二哥哥","爱哥哥","宝哥哥"],
    "林黛玉": ["林黛玉", "黛玉", "颦儿", "顰兒", "潇湘妃子", "瀟湘妃子","林妹妹"],
    "薛宝钗": ["薛宝钗", "薛寶釵", "宝钗", "寶釵", "蘅芜君", "蘅蕪君","宝姐姐"],
    "王熙凤": ["王熙凤", "王熙鳳", "熙凤", "熙鳳", "凤姐", "鳳姐", "凤辣子", "鳳辣子"],
    "贾母": ["贾母", "賈母", "老太太", "老祖宗"],
    "贾政": ["贾政", "賈政"],
    "贾探春": ["贾探春", "賈探春", "探春","三姑娘","三小姐"],
    "妙玉": ["妙玉","妙玉姐姐"],
    "晴雯": ["晴雯","晴雯姐姐","晴雯妹妹"],
    "袭人": ["袭人", "襲人"],
    "刘姥姥": ["刘姥姥", "劉姥姥"],
    "甄士隐": ["甄士隐", "甄士隱"],
    "贾雨村": ["贾雨村", "賈雨村", "雨村"],
    "秦可卿": ["秦可卿", "可卿"],
    "史湘云": ["史湘云", "史湘雲", "湘云", "湘雲","云妹妹"],
    "香菱": ["香菱", "英莲", "英蓮"],
}

THEME_KEYWORDS = {
    "情": ["情", "痴", "相思", "风月", "風月"],
    "礼": ["礼", "禮", "规矩", "規矩", "孝", "伦常", "倫常"],
    "空": ["空", "色空", "悟空", "白茫茫"],
    "幻": ["幻", "太虚", "太虛", "梦", "夢"],
    "命": ["命", "判词", "判詞", "薄命", "造化"],
    "无常": ["无常", "無常", "盛衰", "飘零", "飄零", "白茫茫"],
    "因果": ["因果", "报应", "報應", "孽", "业", "業"],
    "功名": ["功名", "仕途", "经济", "經濟", "科举", "科舉"],
    "家族秩序": ["贾府", "賈府", "荣国府", "榮國府", "宁国府", "寧國府", "族", "家法"],
    "真/假": ["真", "假", "甄", "贾", "賈"],
    "女性命运": ["姑娘", "小姐", "丫鬟", "女儿", "女兒", "薄命"],
    "生命意识": ["花", "葬", "泪", "淚", "死", "病", "残", "殘"],
    "反礼教": ["混账话", "混帳話", "仕途经济", "仕途經濟", "不肖", "叛"],
    "盛衰": ["盛", "衰", "败", "敗", "繁华", "繁華"],
    "欲望": ["欲", "贪", "貪", "妒", "淫"],
    "权力": ["权", "權", "管家", "抄检", "抄檢", "责罚", "責罰"],
    "治理": ["理家", "管家", "兴利", "興利", "除弊", "账", "賬"],
}


@dataclass
class Chapter:
    number: int
    title: str
    text: str


def main() -> None:
    parser = argparse.ArgumentParser(description="Prepare Hongloumeng passages for RedMansionMind.")
    source = parser.add_mutually_exclusive_group(required=True)
    source.add_argument("--input", type=Path, help="Local raw Hongloumeng txt file.")
    source.add_argument("--url", nargs="?", const=DEFAULT_URL, help="Download raw txt from URL. Defaults to Project Gutenberg.")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--min-chars", type=int, default=180)
    parser.add_argument("--max-chars", type=int, default=480)
    parser.add_argument("--limit-chapters", type=int, default=0, help="Only export first N chapters. 0 means all.")
    args = parser.parse_args()

    raw = read_source(args.input, args.url)
    clean = clean_text(raw)
    chapters = split_chapters(clean)
    if args.limit_chapters:
        chapters = chapters[: args.limit_chapters]

    if not chapters:
        raise SystemExit("No chapters found. Check whether chapter headings look like: 第一回 甄士隐...")

    passages = []
    for chapter in chapters:
        chunks = split_passages(chapter.text, args.min_chars, args.max_chars)
        for index, chunk in enumerate(chunks, start=1):
            passages.append(
                {
                    "id": f"hlm_ch{chapter.number:03d}_p{index:03d}",
                    "chapter": chapter.number,
                    "title": chapter.title,
                    "text": chunk,
                    "characters": detect_characters(chunk),
                    "themes": detect_themes(chunk),
                    "source": "Project Gutenberg ebook 24264 or user-provided public-domain text",
                    "notes": "",
                }
            )

    args.output.parent.mkdir(parents=True, exist_ok=True)
    with args.output.open("w", encoding="utf-8") as f:
        for passage in passages:
            f.write(json.dumps(passage, ensure_ascii=False) + "\n")

    print(f"Wrote {len(passages)} passages from {len(chapters)} chapters to {args.output}")


def read_source(input_path: Path | None, url: str | None) -> str:
    if input_path:
        return input_path.read_text(encoding="utf-8")
    assert url
    with urllib.request.urlopen(url, timeout=30) as response:
        return response.read().decode("utf-8", errors="replace")


def clean_text(raw: str) -> str:
    text = raw.replace("\ufeff", "").replace("\r\n", "\n").replace("\r", "\n")
    text = strip_gutenberg_boilerplate(text)
    text = re.sub(r"(?m)^\s*-{5,}\s*$", "", text)
    text = re.sub(r"[ \t\u3000]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def strip_gutenberg_boilerplate(text: str) -> str:
    start_patterns = [
        r"\*\*\* START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK.*?\*\*\*",
        r"\*\*\* START OF THE PROJECT GUTENBERG EBOOK.*?\*\*\*",
    ]
    end_patterns = [
        r"\*\*\* END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK.*",
        r"\*\*\* END OF THE PROJECT GUTENBERG EBOOK.*",
    ]
    for pattern in start_patterns:
        match = re.search(pattern, text, flags=re.IGNORECASE | re.DOTALL)
        if match:
            text = text[match.end() :]
            break
    for pattern in end_patterns:
        match = re.search(pattern, text, flags=re.IGNORECASE | re.DOTALL)
        if match:
            text = text[: match.start()]
            break
    return text


def split_chapters(text: str) -> list[Chapter]:
    matches = list(CHAPTER_RE.finditer(text))
    chapters = []
    for index, match in enumerate(matches):
        start = match.end()
        end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        number = chinese_to_int(match.group("num"))
        title = normalize_space(match.group("title"))
        body = unwrap_body(text[start:end].strip())
        if body:
            chapters.append(Chapter(number=number, title=title, text=body))
    return chapters


def split_passages(text: str, min_chars: int, max_chars: int) -> list[str]:
    paragraphs = [normalize_space(p) for p in re.split(r"\n+", text) if normalize_space(p)]
    passages = []
    buffer = ""
    for paragraph in paragraphs:
        if len(paragraph) > max_chars:
            for sentence_group in split_long_paragraph(paragraph, max_chars):
                buffer = append_or_flush(buffer, sentence_group, passages, min_chars, max_chars)
        else:
            buffer = append_or_flush(buffer, paragraph, passages, min_chars, max_chars)

    if buffer:
        if passages and len(buffer) < min_chars:
            passages[-1] = normalize_space(passages[-1] + buffer)
        else:
            passages.append(buffer)
    return passages


def split_long_paragraph(paragraph: str, max_chars: int) -> list[str]:
    sentences = sentence_units(paragraph)
    chunks = []
    current = ""
    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence:
            continue
        if len(sentence) > max_chars:
            if current:
                chunks.append(current)
                current = ""
            chunks.append(sentence)
            continue
        if current and len(current) + len(sentence) > max_chars:
            chunks.append(current)
            current = sentence
        else:
            current += sentence
    if current:
        chunks.append(current)
    return chunks


def sentence_units(paragraph: str) -> list[str]:
    units = re.findall(r".+?[。！？；．](?:[”\"』」])?", paragraph)
    consumed = sum(len(unit) for unit in units)
    if consumed < len(paragraph):
        units.append(paragraph[consumed:])
    return units


def append_or_flush(buffer: str, text: str, passages: list[str], min_chars: int, max_chars: int) -> str:
    candidate = normalize_space(buffer + text)
    if not buffer:
        return text
    if len(candidate) <= max_chars:
        return candidate
    passages.append(buffer)
    return text


def detect_characters(text: str) -> list[str]:
    found = []
    for canonical, aliases in CHARACTER_ALIASES.items():
        if any(alias in text for alias in aliases):
            found.append(canonical)
    return found


def detect_themes(text: str) -> list[str]:
    found = []
    for theme, keywords in THEME_KEYWORDS.items():
        if any(keyword in text for keyword in keywords):
            found.append(theme)
    return found[:8]


def normalize_space(text: str) -> str:
    return re.sub(r"\s+", "", text)


def unwrap_body(text: str) -> str:
    text = re.sub(r"\n{2,}", "\n\n", text)
    return re.sub(r"(?<!\n)\n(?!\n)", "", text)


def chinese_to_int(value: str) -> int:
    value = value.replace("兩", "二").replace("两", "二").replace("〇", "零")
    digits = {"零": 0, "一": 1, "二": 2, "三": 3, "四": 4, "五": 5, "六": 6, "七": 7, "八": 8, "九": 9}
    if value == "十":
        return 10
    if "百" in value:
        left, _, right = value.partition("百")
        base = digits.get(left, 1) * 100
        return base + (chinese_to_int(right) if right else 0)
    if "十" in value:
        left, _, right = value.partition("十")
        tens = digits.get(left, 1) * 10 if left else 10
        return tens + (digits.get(right, 0) if right else 0)
    total = 0
    for char in value:
        total = total * 10 + digits.get(char, 0)
    return total


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        sys.exit(130)
