#!/usr/bin/env python3
"""Genereer cover-art voor de 8 verlaten-tempel tracks via Gemini image-gen.
Stijl: donker nachtelijk (#0a0a0c), gouden gloed + stof, subtiele mandala-motieven,
verlaten tempel-sfeer — passend bij de LofiBuddha 'Zen Apple'-branding.
Output: data/music/covers/<slug>.png (1024x1024).
"""
import os, json, time, base64, pathlib, urllib.request

ENV = pathlib.Path("/opt/data/bodhi-dashboard/.env").read_text()
def envkey(name):
    for l in ENV.splitlines():
        if l.startswith(f"{name}="):
            return l.split("=", 1)[1].strip().strip('"').strip("'")
    return ""

KEY = envkey("GEMINI_API_KEY") or envkey("GOOGLE_API_KEY")
OUTDIR = pathlib.Path("/opt/data/bodhi-dashboard/data/music/covers")
OUTDIR.mkdir(parents=True, exist_ok=True)

MODEL = "gemini-2.5-flash-image"
BASE = "https://generativelanguage.googleapis.com/v1beta"

# Gedeelde stijl-richting (donker + goud + mandala), per track een eigen scène.
STYLE = (
    "Dark meditative night atmosphere, deep near-black charcoal background "
    "with subtle warm golden glow and floating golden dust particles, "
    "soft sacred geometry and faint mandala ring motifs woven into the scene, "
    "ethereal cinematic mist, premium minimal composition, moody and serene, "
    "no text, no watermark, 1:1 square"
)

COVERS = [
    ("temple-dawn", "Ancient abandoned temple at dawn, first golden light breaking through broken stone columns, breathy bamboo flute atmosphere, empty echoing stone hall"),
    ("temple-dawn-2", "Ancient abandoned temple at dawn seen from a different angle, golden sunrise rays through crumbling archways, moss and vines on weathered stone"),
    ("temple-night", "Abandoned ancient temple in the deep of night, moonless sky, cold blue-black empty stone chamber, distant warm lantern glow"),
    ("temple-night-2", "Moonless night over an abandoned temple courtyard, faint starlight, long deep shadows across cracked stone, a single warm glowing bowl"),
    ("temple-mist", "Abandoned mountain temple shrouded in mist, breathy bamboo flute drifting through broken temple doors, soft wind, damp stone"),
    ("temple-mist-2", "Misty mountain temple at dusk, clouds flowing between ruined pillars, a lone singing bowl glowing softly, quiet and forgotten"),
    ("temple-rain-hall", "Abandoned ancient temple with gentle rain on the stone roof, water dripping into dark stone pools, cozy intimate warm lantern"),
    ("temple-rain-hall-2", "Rain inside an abandoned temple hall, puddles reflecting warm golden light, dripping stone, intimate and sheltering"),
]


def generate(prompt):
    body = json.dumps({
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseModalities": ["IMAGE", "TEXT"]},
    }).encode()
    r = urllib.request.Request(f"{BASE}/models/{MODEL}:generateContent?key={KEY}",
                               data=body, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(r, timeout=120) as resp:
        return json.load(resp)


for slug, scene in COVERS:
    dest = OUTDIR / f"{slug}.png"
    if dest.exists():
        print(f"  skip {slug} (bestaat al)", flush=True)
        continue
    prompt = f"{scene}. {STYLE}"
    print(f"== {slug} ==", flush=True)
    try:
        d = generate(prompt)
        for part in d["candidates"][0]["content"]["parts"]:
            if "inlineData" in part:
                raw = base64.b64decode(part["inlineData"]["data"])
                dest.write_bytes(raw)
                print(f"  ✅ {dest.name} ({len(raw)} bytes)", flush=True)
                break
        else:
            print(f"  !! geen image in response: {json.dumps(d)[:200]}", flush=True)
    except Exception as e:
        print(f"  !! fout {slug}: {e}", flush=True)
    time.sleep(2)

print("KLAAR", flush=True)
