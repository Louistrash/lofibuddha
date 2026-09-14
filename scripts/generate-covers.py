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

# Gedeelde stijl-staart: cinematisch, fotorealistisch, verlaten maar sereen.
# (Louis' prompts zijn leidend; dit voegt alleen het vierkant formaat toe.)
STYLE = "1:1 square aspect, no text, no watermark, no people"

# 8 covers: Louis' 5 cinematische scènes + 3 passende variaties voor de "-2" takes.
COVERS = [
    ("temple-dawn",
     "An abandoned ancient Buddhist temple deep in a lush Asian forest, monumental weathered stone entrance, enormous Buddha statue partially covered in emerald green moss, ancient wooden architecture slowly reclaimed by nature, moss-covered roof tiles, vines cascading over pillars, soft morning mist drifting between the trees, subtle golden sunlight filtering through dense foliage, serene and majestic atmosphere, cinematic composition, atmospheric depth, ultra realistic, highly detailed textures, natural muted colors, tranquil spiritual mood, 35mm photography, volumetric light, no people, no text, no modern elements"),
    ("temple-night",
     "Inside a long-abandoned Buddhist temple hall, a magnificent ancient golden Buddha statue standing peacefully in the darkness, partially covered with delicate moss and patina, broken wooden beams and aged stone columns, vines entering through shattered windows, fallen leaves covering the floor, faint warm sunlight illuminating the Buddha through drifting mist, monumental architecture disappearing into shadow, sacred and contemplative atmosphere, cinematic lighting, photorealistic, extremely detailed aged materials, subtle gold and deep green tones, quiet mysterious beauty, no people, no text"),
    ("temple-mist",
     "A forgotten Buddhist temple courtyard completely reclaimed by nature, ancient stone Buddha seated peacefully beneath a massive banyan tree, thick moss covering the statues, steps and cracked stone lanterns, wild ferns growing between ancient paving stones, collapsed sections of the temple visible in the background, delicate mist floating above the ground, soft diffused afternoon light, majestic yet peaceful atmosphere, cinematic realism, rich organic textures, subtle desaturated green palette, atmospheric perspective, photorealistic, highly detailed, no people, no text"),
    ("temple-rain-hall",
     "A colossal abandoned Buddhist temple hidden deep inside an ancient tropical jungle, towering temple roofs emerging through enormous trees and mist, intricate stone carvings covered with layers of velvety moss, giant roots wrapping around ancient walls and staircases, small Buddha statues disappearing beneath vegetation, dramatic shafts of sunlight breaking through the canopy, mysterious but deeply peaceful atmosphere, sense of forgotten civilization and timeless spirituality, cinematic wide-angle photography, ultra realistic, highly detailed, volumetric lighting, 8K detail, no people, no text"),
    ("temple-dawn-2",
     "An immense abandoned Buddhist temple standing silently in a misty mountain valley at sunset, ancient stone stairway completely covered in moss leading toward monumental temple gates, weathered Buddha statues along the path, overgrown vegetation and flowering vines reclaiming the architecture, distant mountains disappearing into atmospheric haze, warm low sunlight touching the ancient roof edges while the courtyard remains cool and shadowed, breathtaking majestic serenity, timeless spiritual atmosphere, cinematic epic composition, ultra realistic photography, atmospheric depth, subtle film grain, highly detailed, no people, no text, no modern objects"),
    ("temple-night-2",
     "A moonlit abandoned Buddhist temple at night, weathered stone entrance and moss-covered Buddha statue under a full moon, soft blue moonlight spilling through broken wooden beams, glowing mist drifting over ancient stone lanterns, deep shadows and quiet stillness, sacred and contemplative, cinematic night photography, photorealistic, ultra realistic, highly detailed aged textures, serene mysterious beauty, no people, no text"),
    ("temple-mist-2",
     "A misty abandoned Buddhist temple courtyard at dawn seen from a wider angle, ancient stone Buddhas and broken pillars wrapped in thick moss and climbing vines, soft golden fog glowing between the trees, dewdrops on ferns and moss, tranquil monumental serenity, cinematic wide composition, photorealistic, ultra realistic, highly detailed, muted natural palette, spiritual atmosphere, no people, no text"),
    ("temple-rain-hall-2",
     "An abandoned Buddhist temple interior in the rain, weathered golden Buddha statue and moss-covered stone columns, rainwater trickling down vines and pooling on the ancient floor, soft mist and a faint warm glow filtering through the broken roof, intimate yet majestic, quiet sacred atmosphere, cinematic photography, photorealistic, extremely detailed aged materials, subtle gold and deep green tones, no people, no text"),
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
