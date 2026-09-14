#!/usr/bin/env python3
"""
Converteer alle PNG covers in data/music/covers/ naar webp:
- full  (1024x1024) -> public/images/music-covers/<slug>.webp
- thumb (360x360)   -> public/images/music-covers/thumbs/<slug>.webp

Gebruikt ffmpeg (libwebp). Skip als de webp al bestaat.
"""
import os, subprocess, sys

ROOT = "/opt/data/bodhi-dashboard"
SRC = os.path.join(ROOT, "data", "music", "covers")
FULL = os.path.join(ROOT, "public", "images", "music-covers")
THUMB = os.path.join(FULL, "thumbs")
os.makedirs(FULL, exist_ok=True)
os.makedirs(THUMB, exist_ok=True)

def convert(src, dst, size, quality):
    if os.path.exists(dst):
        return False
    subprocess.run([
        "ffmpeg", "-y", "-v", "error",
        "-i", src,
        "-vf", f"scale={size}:{size}:force_original_aspect_ratio=increase,crop={size}:{size}",
        "-c:v", "libwebp", "-quality", str(quality),
        dst,
    ], check=True)
    return True

pngs = sorted(f for f in os.listdir(SRC) if f.endswith(".png"))
if not pngs:
    print("Geen PNG covers gevonden in", SRC)
    sys.exit(1)

made = 0
for png in pngs:
    slug = png[:-4]
    src = os.path.join(SRC, png)
    full = os.path.join(FULL, f"{slug}.webp")
    thumb = os.path.join(THUMB, f"{slug}.webp")
    a = convert(src, full, 1024, 82)
    b = convert(src, thumb, 360, 80)
    if a or b:
        made += 1
        print(f"  ✓ {slug}")
    else:
        print(f"  = {slug} (bestond al)")

print(f"KLAAR ({made} nieuw geconverteerd)")
