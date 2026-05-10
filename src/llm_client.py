from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from typing import Any


DEFAULT_BASE_URL = "https://api.openai.com/v1"
DEFAULT_MODEL = "gpt-4o-mini"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class LLMConfigError(RuntimeError):
    pass


class LLMCallError(RuntimeError):
    pass


def load_dotenv() -> None:
    for filename in (".env",):
        path = os.path.join(ROOT, filename)
        if not os.path.exists(path):
            continue
        with open(path, encoding="utf-8") as f:
            for raw_line in f:
                line = raw_line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, value = line.split("=", 1)
                key = key.strip()
                value = value.strip().strip('"').strip("'")
                if key and key not in os.environ:
                    os.environ[key] = value


def is_configured() -> bool:
    load_dotenv()
    return bool(os.environ.get("OPENAI_API_KEY"))


def chat_json(
    *,
    system_prompt: str,
    user_payload: dict[str, Any],
    model: str | None = None,
    temperature: float = 0.2,
) -> dict[str, Any]:
    load_dotenv()
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise LLMConfigError("未设置 OPENAI_API_KEY，无法启用 LLM 生成。")

    base_url = os.environ.get("OPENAI_BASE_URL", DEFAULT_BASE_URL).rstrip("/")
    model_name = model or os.environ.get("OPENAI_MODEL", DEFAULT_MODEL)
    endpoint = f"{base_url}/chat/completions"
    payload = {
        "model": model_name,
        "temperature": temperature,
        "response_format": {"type": "json_object"},
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": json.dumps(user_payload, ensure_ascii=False)},
        ],
    }

    request = urllib.request.Request(
        endpoint,
        data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=60) as response:
            response_payload = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise LLMCallError(f"LLM API 请求失败：HTTP {exc.code} {detail}") from exc
    except urllib.error.URLError as exc:
        raise LLMCallError(f"LLM API 网络请求失败：{exc.reason}") from exc

    content = response_payload["choices"][0]["message"]["content"]
    try:
        parsed = json.loads(content)
    except json.JSONDecodeError as exc:
        raise LLMCallError(f"LLM 没有返回合法 JSON：{content[:300]}") from exc

    parsed["_llm_model"] = model_name
    return parsed
