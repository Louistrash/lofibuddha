#!/usr/bin/env python3
"""
Genereer voice-only versies van elke guide (geleide stem) voor de
"Add a guide" layering-flow: strip de chime-intro + introPause-stilte aan het
begin, zodat de stem direct begint i.p.v. na ~10-25s chime+stilte.

Waarom: de guide-audio (generate-meditation.mjs) begint met [chime ~10s] +
[introPause-stilte], bedoeld voor standalone gebruik. Bij "Add a guide" wordt
die stem over een soundtrack gelegd → de chime botst met de muziek (2 chimes)
en de introPause geeft een lange stille delay vóór de stem.

Aanpak: silencedetect vindt de eerste (intro-)stilte; het einde daarvan is waar
de stem begint. Strip alles daarvoor. Draai daarna build-duck-timeline op de
gestripte file zodat de duck-pauzes kloppen ten opzichte van de stem-start.

Output: <slug>-voice.mp3  +  <slug>-voice.duck.json  (zelfde dir).
"""
import json, re, subprocess, sys, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXP_TS = os.path.join(ROOT, "packages", "shared", "src", "experiences.ts")
CHIME = 10.03  # data/breathe/audio/chime.mp3 duration (s)
MARGIN = 0.20  # veilige marge vóór de eerste lettergreep (s)

def guide_slugs():
    """Extract alle guide-slugs uit experiences.ts (guide: "xxx", niet null)."""
    text = open(EXP_TS, encoding="utf-8").read()
    # match guide: "xxx" (alleen niet-null)
    return re.findall(r'guide:\s*"([^"]+)"', text)

def find_audio(slug):
    for d in ("data/focus/audio", "data/meditations/audio"):
        p = os.path.join(ROOT, d, f"{slug}.mp3")
        if os.path.exists(p):
            return p
    return None

def voice_onset(path):
    """Vind waar de stem begint = einde van de eerste (intro-)stilte."""
    r = subprocess.run(
        ["ffmpeg", "-i", path, "-af", "silencedetect=noise=-35dB:d=0.5",
         "-f", "null", "-"],
        capture_output=True, text=True,
    )
    events = []
    for line in r.stderr.splitlines():
        m = re.search(r"silence_start:\s*([\d.]+)", line)
        if m: events.append(("start", float(m.group(1))))
        m = re.search(r"silence_end:\s*([\d.]+)", line)
        if m: events.append(("end", float(m.group(1))))
    # eerste silence interval
    for i in range(len(events) - 1):
        if events[i][0] == "start" and events[i + 1][0] == "end":
            start, end = events[i][1], events[i + 1][1]
            # intro-stilte moet zinvol lang zijn (> 1.5s); anders is er geen intro
            if (end - start) > 1.5:
                return end
    return 0.0

def main():
    slugs = guide_slugs()
    print(f"Guides gevonden in experiences.ts: {len(slugs)}")
    done = skipped = failed = 0
    for slug in slugs:
        src = find_audio(slug)
        if not src:
            print(f"  ⚠️  {slug}: geen audio gevonden"); skipped += 1; continue
        onset = voice_onset(src)
        if onset <= 0.5:
            print(f"  →  {slug}: geen intro (stem start direct), skip"); skipped += 1; continue

        out = os.path.join(os.path.dirname(src), f"{slug}-voice.mp3")
        start = max(0.0, onset - MARGIN)
        subprocess.run(
            ["ffmpeg", "-y", "-v", "error", "-ss", f"{start:.3f}", "-i", src,
             "-c:a", "libmp3lame", "-b:a", "192k", out],
            check=True,
        )
        # duck-timeline voor de voice-only versie
        subprocess.run(
            ["python3", os.path.join(ROOT, "scripts", "build-duck-timeline.py"), out],
            capture_output=True,
        )
        print(f"  ✅  {slug}: strip {onset:.2f}s → {os.path.basename(out)}")
        done += 1

    print(f"\nKlaar: {done} voice-only, {skipped} overgeslagen, {failed} mislukt")

if __name__ == "__main__":
    main()
