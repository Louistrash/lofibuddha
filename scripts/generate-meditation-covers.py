#!/usr/bin/env python3
"""
Genereer cover-art voor de 5 lange geleide meditaties (Deep Journeys).
Stijl: donker nachtelijk (#0a0a0c), gouden gloed, subtiele mandala — passend bij
de LofiBuddha 'Zen Apple'-branding. Output: data/meditations/covers/<slug>.png.
"""
import os, json, time, base64, pathlib, urllib.request, sys

ENV = pathlib.Path("/opt/data/bodhi-dashboard/.env").read_text()
def envkey(name):
    for l in ENV.splitlines():
        if l.startswith(f"{name}="):
            return l.split("=", 1)[1].strip().strip('"').strip("'")
    return ""

KEY = envkey("GEMINI_API_KEY") or envkey("GOOGLE_API_KEY")
OUTDIR = pathlib.Path("/opt/data/bodhi-dashboard/data/meditations/covers")
OUTDIR.mkdir(parents=True, exist_ok=True)

MODEL = "gemini-2.5-flash-image"
BASE = "https://generativelanguage.googleapis.com/v1beta"
STYLE = ("dark night palette of deep charcoal, warm golden glow and soft gold accents, "
         "subtle mandala and lotus motifs, serene meditative mood, cinematic lighting, "
         "ultra detailed, atmospheric depth, 1:1 square aspect ratio, no text, no watermark, no people")

COVERS = [
    ("deep-sleep-journey",
     "A peaceful dark bedroom at night, soft moonlight spilling through a tall window, a bed with warm blankets, deep blue and warm gold tones, drifting incense, profoundly calm and dreamlike"),
    ("letting-go-deep",
     "Golden autumn leaves drifting down onto still, dark water, soft warm light, a feeling of release and letting go, serene and weightless"),
    ("body-scan-deep",
     "A soft warm golden glow washing over a peaceful resting body in the dark, deep relaxation, gentle light from within, serene and healing"),
    ("self-compassion-deep",
     "A gentle hand resting over a warm glowing heart in the darkness, soft golden radiance, tender compassion, nurturing and serene"),
    ("inner-stillness",
     "A perfectly still dark lake reflecting a star-filled night sky, profound silence, deep calm, the surface unbroken, meditative and vast"),
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
            print(f"  !! geen image: {json.dumps(d)[:200]}", flush=True)
    except Exception as e:
        print(f"  !! fout {slug}: {e}", flush=True)
    time.sleep(2)

print("KLAAR", flush=True)
