#!/usr/bin/env python3
"""Regenereer alleen de body-scan-deep cover met een abstracte prompt (geen lichaam)."""
import json, base64, pathlib, urllib.request

ENV = pathlib.Path("/opt/data/bodhi-dashboard/.env").read_text()
def envkey(name):
    for l in ENV.splitlines():
        if l.startswith(f"{name}="):
            return l.split("=", 1)[1].strip().strip('"').strip("'")
    return ""
KEY = envkey("GEMINI_API_KEY") or envkey("GOOGLE_API_KEY")

MODEL = "gemini-2.5-flash-image"
BASE = "https://generativelanguage.googleapis.com/v1beta"

PROMPT = ("A serene abstract meditation scene, soft warm golden light flowing like gentle ripples "
          "of water through deep darkness, healing warmth and deep relaxation, flowing organic "
          "curves and soft gradients, amber and gold glow fading into charcoal, tranquil and "
          "weightless, dark night palette, subtle mandala motif, cinematic lighting, ultra detailed, "
          "1:1 square aspect ratio, no text, no watermark, no body, no people, no figures")

body = json.dumps({
    "contents": [{"parts": [{"text": PROMPT}]}],
    "generationConfig": {"responseModalities": ["IMAGE", "TEXT"]},
}).encode()

r = urllib.request.Request(f"{BASE}/models/{MODEL}:generateContent?key={KEY}",
                           data=body, headers={"Content-Type": "application/json"})
with urllib.request.urlopen(r, timeout=120) as resp:
    d = json.load(resp)

dest = pathlib.Path("/opt/data/bodhi-dashboard/data/meditations/covers/body-scan-deep.png")
for part in d["candidates"][0]["content"]["parts"]:
    if "inlineData" in part:
        raw = base64.b64decode(part["inlineData"]["data"])
        dest.write_bytes(raw)
        print(f"✅ {dest.name} ({len(raw)} bytes)")
        break
else:
    print(f"!! geen image: {json.dumps(d)[:200]}")
