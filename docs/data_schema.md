# Data Schema

## `data/hongloumeng/passages.jsonl`

Each line is a passage from 《红楼梦》.

```json
{
  "id": "hlm_ch01_p001",
  "chapter": 1,
  "title": "甄士隐梦幻识通灵 贾雨村风尘怀闺秀",
  "text": "满纸荒唐言，一把辛酸泪。都云作者痴，谁解其中味？",
  "characters": ["作者"],
  "themes": ["真/假", "痴", "幻", "辛酸"]
}
```

## `data/philosophy/concepts.jsonl`

Each line is a Chinese philosophy concept.

```json
{
  "id": "buddhism_impermanence",
  "tradition": "佛教",
  "name": "无常",
  "definition": "世间诸法迁流变化，没有恒常不变的实体。",
  "keywords": ["无常", "盛衰", "梦", "幻", "空"],
  "related_themes": ["盛衰无常", "幻", "命"]
}
```

## `data/annotations/characters.json`

Character-level philosophical profile.

```json
{
  "贾宝玉": {
    "keywords": ["情", "反功名", "真性情"],
    "summary": "重情而反功利，常与家族礼法秩序发生冲突。"
  }
}
```

