#!/usr/bin/env python3
"""
Schrijf ID3-tags naar alle muziektracks in data/music/tracks/.
- artist  = "lofibuddha.com"
- album   = "Lo-Fi Buddha"
- title   = display-titel uit packages/shared/src/music.ts (fallback: nette slug-titel)

Gebruikt `ffmpeg -c copy` zodat de audio verliesloos blijft (alleen metadata).
"""
import os, re, subprocess, sys

ROOT = "/opt/data/bodhi-dashboard"
TRACKS_DIR = os.path.join(ROOT, "data", "music", "tracks")
MUSIC_TS = os.path.join(ROOT, "packages", "shared", "src", "music.ts")

ARTIST = "lofibuddha.com"
ALBUM = "Lo-Fi Buddha"

# --- id -> title uit music.ts parsen ---
title_map = {}
src = open(MUSIC_TS, encoding="utf-8").read()
for m in re.finditer(r'id:\s*"([^"]+)"[\s\S]*?title:\s*"([^"]+)"', src):
    title_map[m.group(1)] = m.group(2)

SMALL = {"a", "an", "the", "and", "of", "in", "on", "at", "to", "for", "is", "with", "by"}

def slug_to_title(slug: str) -> str:
    base = slug
    suffix = ""
    if base.endswith("-2"):
        base = base[:-2]
        suffix = " II"
    words = base.split("-")
    out = []
    for i, w in enumerate(words):
        if w.lower() in SMALL and i != 0:
            out.append(w.lower())
        else:
            out.append(w.capitalize())
    return " ".join(out) + suffix

def tag_file(path: str):
    slug = os.path.splitext(os.path.basename(path))[0]
    title = title_map.get(slug) or slug_to_title(slug)
    tmp = path + ".tmp.mp3"
    cmd = [
        "ffmpeg", "-y", "-v", "error",
        "-i", path,
        "-c", "copy",
        "-id3v2_version", "3",
        "-metadata", f"artist={ARTIST}",
        "-metadata", f"album={ALBUM}",
        "-metadata", f"title={title}",
        tmp,
    ]
    subprocess.run(cmd, check=True)
    os.replace(tmp, path)
    return slug, title

files = sorted(f for f in os.listdir(TRACKS_DIR) if f.endswith(".mp3"))
if not files:
    print("Geen mp3's gevonden in", TRACKS_DIR)
    sys.exit(1)

print(f"Tagging {len(files)} tracks (artist={ARTIST}, album={ALBUM})…\n")
for f in files:
    slug, title = tag_file(os.path.join(TRACKS_DIR, f))
    print(f"  ✓ {slug:30s} → \"{title}\"")

print(f"\n✅ Klaar. {len(files)} tracks getagd.")
