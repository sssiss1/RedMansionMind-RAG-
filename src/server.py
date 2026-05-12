from __future__ import annotations

import argparse
import json
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

from rag_engine import RedMansionRAG


ROOT = Path(__file__).resolve().parents[1]
WEB_ROOT = ROOT / "web"
ENGINE = RedMansionRAG()


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(WEB_ROOT), **kwargs)

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path == "/api/ask":
            params = parse_qs(parsed.query)
            question = params.get("question", [""])[0].strip()
            perspective = params.get("perspective", ["综合"])[0].strip()
            use_llm = params.get("llm", ["0"])[0] in {"1", "true", "yes"}
            if not question:
                self._json({"error": "question is required"}, status=400)
                return
            self._json(ENGINE.answer(question, perspective, use_llm=use_llm))
            return
        if parsed.path == "/api/explain":
            params = parse_qs(parsed.query)
            question = params.get("question", [""])[0].strip()
            perspective = params.get("perspective", ["综合"])[0].strip()
            use_llm = params.get("llm", ["1"])[0] in {"1", "true", "yes"}
            concept_id = params.get("concept_id", [""])[0].strip() or None
            if not question:
                self._json({"error": "question is required"}, status=400)
                return
            self._json(ENGINE.explain(question, perspective, use_llm=use_llm, concept_id=concept_id))
            return
        if parsed.path == "/api/health":
            self._json({"ok": True, "project": "RedMansionMind"})
            return
        super().do_GET()

    def _json(self, payload: dict, status: int = 200) -> None:
        data = json.dumps(payload, ensure_ascii=False, indent=2).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)


def main() -> None:
    parser = argparse.ArgumentParser(description="Run the RedMansionMind local server.")
    default_host = "0.0.0.0" if os.environ.get("PORT") else "127.0.0.1"
    default_port = int(os.environ.get("PORT", "8000"))
    parser.add_argument("--host", default=default_host)
    parser.add_argument("--port", type=int, default=default_port)
    args = parser.parse_args()

    try:
        server = ThreadingHTTPServer((args.host, args.port), Handler)
    except OSError as exc:
        if exc.errno in {48, 98}:
            print(f"Port {args.port} is already in use. Try: python3 src/server.py --port {args.port + 1}")
            return
        raise

    print(f"RedMansionMind running on {args.host}:{args.port}")
    server.serve_forever()


if __name__ == "__main__":
    main()
