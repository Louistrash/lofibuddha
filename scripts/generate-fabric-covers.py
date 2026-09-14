#!/usr/bin/env python3
"""Genereer extra cover-art met herkenbare stoffen (velvet / saffraan / geruit)
in de verlaten tempel-sfeer. Output: data/music/covers/<slug>.png (1024x1024).
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

STYLE = "1:1 square aspect, no text, no watermark, no people"

COVERS = [
    ("temple-red-velvet",
     "Inside an abandoned Buddhist temple hall, a weathered golden Buddha statue on a stone altar draped with an antique vintage dark ruby red velvet cloth, a deep rich dark ruby burgundy velvet, heavily aged and worn with deep soft folds, the ruby fabric sun-faded and coated with dust, threadbare and frayed in places, mottled with a strong patina of age, its dark ruby color softened and deepened to a muted timeworn burgundy, moss and vines on the stone walls, soft mist and a faint warm light through the broken roof, sacred majestic yet intimate atmosphere, cinematic photography, photorealistic, extremely detailed aged velvet fabric texture and weathered stone, muted palette with a deep dark ruby vintage accent, no people, no text"),
    ("temple-red-velvet-2",
     "An abandoned temple shrine with a large carved stone Buddha, an altar covered by an old worn dark ruby red velvet cloth hanging in soft aged folds to the floor, a dark rich ruby burgundy velvet heavily distressed and vintage, faded and patinated with dust and time, threadbare with frayed edges, its dark ruby color muted and deepened by age, thick moss creeping over the altar steps and columns, dappled golden light and mist, quiet sacred prestige, cinematic composition, ultra realistic, highly detailed vintage velvet and stone textures, dusty dark ruby red against mossy green and stone grey, no people, no text"),
    ("temple-saffron",
     "An abandoned Buddhist temple interior with a worn vintage saffron-orange cloth draped over a weathered Buddha statue and stone altar, old faded monks' saffron fabric with soft natural folds, the orange sun-bleached and time-worn to a muted earthy ochre, gently frayed edges, moss and vines reclaiming the stone walls, soft mist and golden light through broken beams, serene majestic sacred atmosphere, cinematic photography, photorealistic, highly detailed vintage fabric and aged stone, muted warm ochre accent against faded greens, no people, no text"),
    ("temple-saffron-2",
     "A forgotten temple courtyard with a stone Buddha wrapped in an old faded saffron robe, the vintage orange cloth sun-bleached and worn but still warm, its color muted and patinated with age, thick moss over broken paving and stone lanterns, mist drifting low, monumental yet peaceful, cinematic wide composition, ultra realistic, highly detailed vintage saffron fabric texture and moss, muted ochre and deep green palette, no people, no text"),
    ("temple-checkered",
     "An abandoned temple hall with a weathered Buddha statue, a handwoven vintage checkered plaid cloth draped over the stone altar, an old faded gingham-style checkered fabric in soft washed-out muted earth tones, threadbare and sun-bleached, its pattern softened and aged, moss and vines over ancient columns, soft mist and faint golden light, intimate sacred atmosphere, cinematic photography, photorealistic, highly detailed vintage woven textile texture, subtle faded muted palette, no people, no text"),
    ("temple-checkered-2",
     "A quiet abandoned temple interior where an antique checkered patterned cloth hangs over a carved stone ledge beneath a golden Buddha, the plaid fabric in gentle time-faded muted tones with a soft worn grid pattern, faded and dust-covered, its vintage weave clearly aged, moss on the walls and fallen leaves on the floor, soft warm light through mist, serene majestic mood, cinematic composition, ultra realistic, highly detailed vintage woven checkered textile and aged stone, no people, no text"),
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


import sys
FORCE = "--force" in sys.argv

for slug, scene in COVERS:
    dest = OUTDIR / f"{slug}.png"
    if dest.exists() and not FORCE:
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
