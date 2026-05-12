#!/usr/bin/env python3
"""
rebundle.py — inject web/src/* back into web/index.html

Usage: python3 scripts/rebundle.py
"""
import json, base64, gzip, re, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HTML_PATH = os.path.join(ROOT, "web", "index.html")
SRC_DIR   = os.path.join(ROOT, "web", "src")

# UUID → src filename mapping (libraries are excluded)
UUID_TO_SRC = {
    "409158a7-1c7f-49d7-ace2-11e7a792f18e": "components.jsx",
    "fbd3d1dc-0cca-4a33-b6e8-9e72f5fcbf2f": "page-quiz.jsx",
    "61d24b22-f22b-4f2b-8c2b-881f19aafe03": "data.js",
    "cf3d8677-53dd-4e35-a606-f24ed093fdd6": "page-scenes.jsx",
    "1731404f-8786-4f56-8490-b42717f95a95": "page-ask.jsx",
    "94dede7a-5c4e-45db-a3ae-cd00849ba485": "page-characters.jsx",
    "cb36d340-fe92-4251-a0fa-a725d4f8b6e1": "page-explain.jsx",
    "60462558-ea28-4007-8f1b-c3e0488109b7": "app.jsx",
    "2466b0f2-672d-4add-8248-edf1ee9368c3": "page-concepts.jsx",
    "5779a390-0279-4df0-bfca-60d2fb4eee06": "page-eval.jsx",
}

def encode(src_text: str) -> str:
    return base64.b64encode(gzip.compress(src_text.encode("utf-8"))).decode("ascii")

def main():
    with open(HTML_PATH, "r", encoding="utf-8") as f:
        html = f.read()

    m = re.search(r'(<script type="__bundler/manifest">)(.*?)(</script>)', html, re.DOTALL)
    if not m:
        sys.exit("ERROR: manifest block not found in web/index.html")

    manifest = json.loads(m.group(2))
    updated = []

    for uid, fname in UUID_TO_SRC.items():
        src_path = os.path.join(SRC_DIR, fname)
        if not os.path.exists(src_path):
            print(f"  SKIP  {fname}  (not found in web/src/)")
            continue
        with open(src_path, "r", encoding="utf-8") as f:
            text = f.read()
        asset = manifest[uid]
        asset["data"] = encode(text)
        asset["compressed"] = True
        updated.append(fname)
        print(f"  OK    {fname}")

    new_manifest = json.dumps(manifest, separators=(",", ":"))
    new_html = html[:m.start(2)] + new_manifest + html[m.end(2):]

    with open(HTML_PATH, "w", encoding="utf-8") as f:
        f.write(new_html)

    print(f"\nRebundled {len(updated)} files → web/index.html  ({len(new_html):,} bytes)")

if __name__ == "__main__":
    main()
