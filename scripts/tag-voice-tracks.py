#!/usr/bin/env python3
"""
Schrijf ID3-tags naar alle voice-tracks (meditaties, focus, affirmations,
breathe, sounds). artist=lofibuddha.com, album per categorie, title uit de
bijbehorende source file (fallback: nette slug-titel).

Verliesloos via `ffmpeg -c copy`.
"""
import os, re, subprocess, sys

ROOT = "/opt/data/bodhi-dashboard"
SHARED = os.path.join(ROOT, "packages", "shared", "src")
ARTIST = "lofibuddha.com"

# Map -> (audio_dir, album)
CATEGORIES = [
    ("meditations",  os.path.join(ROOT, "data", "meditations", "audio"), "Guided Meditations"),
    ("focus",        os.path.join(ROOT, "data", "focus", "audio"),       "Focus"),
    ("affirmations", os.path.join(ROOT, "data", "affirmations", "audio"), "Affirmations"),
    ("breathe",      os.path.join(ROOT, "data", "breathe", "audio"),     "Breathing"),
    ("sounds",       os.path.join(ROOT, "data", "sounds", "audio"),      "Soundscapes"),
]

# --- id -> title map uit alle shared source files ---
title_map = {}
for fn in os.listdir(SHARED):
    if not fn.endswith(".ts"):
        continue
    src = open(os.path.join(SHARED, fn), encoding="utf-8").read()
    # Blokken van id/slug -> title/name (binnen ~800 chars)
    for m in re.finditer(r'(?:id|slug):\s*"([^"]+)"[\s\S]{0,800}?(?:title|name):\s*"([^"]+)"', src):
        title_map[m.group(1)] = m.group(2)

SMALL = {"a", "an", "the", "and", "of", "in", "on", "at", "to", "for", "is", "with", "by"}

def slug_to_title(slug: str) -> str:
    """Nette titel van een filename-slug. Behoudt numerieke suffix (-1, -01)."""
    parts = slug.split("-")
    words = []
    for i, p in enumerate(parts):
        if p.isdigit():
            words.append(p)  # behoud "1", "01", "478" etc.
        elif p.lower() in SMALL and i != 0:
            words.append(p.lower())
        else:
            words.append(p.capitalize())
    return " ".join(words)

def tag_file(path: str, album: str) -> tuple:
    slug = os.path.splitext(os.path.basename(path))[0]
    title = title_map.get(slug) or slug_to_title(slug)
    tmp = path + ".tmp.mp3"
    subprocess.run([
        "ffmpeg", "-y", "-v", "error",
        "-i", path, "-c", "copy", "-id3v2_version", "3",
        "-metadata", f"artist={ARTIST}",
        "-metadata", f"album={album}",
        "-metadata", f"title={title}",
        tmp,
    ], check=True)
    os.replace(tmp, path)
    return slug, title

total = 0
for cat, adir, album in CATEGORIES:
    if not os.path.isdir(adir):
        continue
    files = sorted(f for f in os.listdir(adir) if f.endswith(".mp3"))
    if not files:
        continue
    print(f"\n=== {cat} ({len(files)} bestanden) — album \"{album}\" ===")
    for f in files:
        slug, title = tag_file(os.path.join(adir, f), album)
        print(f"  ✓ {slug:28s} → \"{title}\"")
        total += 1

print(f"\n✅ Klaar. {total} voice-tracks getagd (artist={ARTIST}).")
