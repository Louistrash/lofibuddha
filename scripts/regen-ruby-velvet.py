#!/usr/bin/env python3
"""Regenereer alleen de twee dark-ruby-red velvet covers."""
import json, time, base64, pathlib, urllib.request

ENV = pathlib.Path("/opt/data/bodhi-dashboard/.env").read_text()
def envkey(name):
    for l in ENV.splitlines():
        if l.startswith(f"{name}="):
            return l.split("=", 1)[1].strip().strip('"').strip("'")
    return ""

KEY = envkey("GEMINI_API_KEY") or envkey("GOOGLE_API_KEY")
OUTDIR = pathlib.Path("/opt/data/bodhi-dashboard/data/music/covers")
MODEL = "gemini-2.5-flash-image"
BASE = "https://generativelanguage.googleapis.com/v1beta"
STYLE = "1:1 square aspect, no text, no watermark, no people"

COVERS = [
    ("temple-red-velvet",
     "Inside an abandoned Buddhist temple hall, a weathered golden Buddha statue on a stone altar draped with an antique vintage dark ruby red velvet cloth, a deep rich dark ruby burgundy velvet, heavily aged and worn with deep soft folds, the ruby fabric sun-faded and coated with dust, threadbare and frayed in places, mottled with a strong patina of age, its dark ruby color softened and deepened to a muted timeworn burgundy, moss and vines on the stone walls, soft mist and a faint warm light through the broken roof, sacred majestic yet intimate atmosphere, cinematic photography, photorealistic, extremely detailed aged velvet fabric texture and weathered stone, muted palette with a deep dark ruby vintage accent, no people, no text"),
    ("temple-red-velvet-2",
     "An abandoned temple shrine with a large carved stone Buddha, an altar covered by an old worn dark ruby red velvet cloth hanging in soft aged folds to the floor, a dark rich ruby burgundy velvet heavily distressed and vintage, faded and patinated with dust and time, threadbare with frayed edges, its dark ruby color muted and deepened by age, thick moss creeping over the altar steps and columns, dappled golden light and mist, quiet sacred prestige, cinematic composition, ultra realistic, highly detailed vintage velvet and stone textures, dusty dark ruby red against mossy green and stone grey, no people, no text"),
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
            print(f"  !! geen image: {json.dumps(d)[:200]}", flush=True)
    except Exception as e:
        print(f"  !! fout {slug}: {e}", flush=True)
    time.sleep(2)

print("KLAAR", flush=True)
