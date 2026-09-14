#!/usr/bin/env python3
"""
Bouw een duck-timeline voor een geleide stem-audio: detecteer de lange stiltes
(pauzes tussen de zinnen) via ffmpeg silencedetect en sla ze op als JSON.

De player gebruikt deze lijst om de achtergrondmuziek te dempen (ducken) zodra
de stem spreekt, en terug te brengen tijdens de pauzes.

Output: <audio>.duck.json  ->  { "pauses": [[start, end], ...] }  (seconden)
"""
import json, re, subprocess, sys, os

def build_duck_timeline(audio_path, out_path, noise="-32dB", min_silence=0.4, min_pause=2.5):
    r = subprocess.run(
        ["ffmpeg", "-i", audio_path, "-af",
         f"silencedetect=noise={noise}:d={min_silence}", "-f", "null", "-"],
        capture_output=True, text=True,
    )
    events = []
    for line in r.stderr.splitlines():
        m = re.search(r"silence_start:\s*([\d.]+)", line)
        if m:
            events.append(("start", float(m.group(1))))
        m = re.search(r"silence_end:\s*([\d.]+)", line)
        if m:
            events.append(("end", float(m.group(1))))

    # Koppel start/end events tot stilte-intervallen
    silences = []
    i = 0
    while i < len(events):
        if events[i][0] == "start" and i + 1 < len(events) and events[i + 1][0] == "end":
            silences.append((events[i][1], events[i + 1][1]))
            i += 2
        else:
            i += 1

    # Alleen lange stiltes (> min_pause) zijn pauzes waar de muziek terugkomt.
    pauses = [[round(s, 2), round(e, 2)] for s, e in silences if (e - s) > min_pause]

    data = {"pauses": pauses}
    with open(out_path, "w") as f:
        json.dump(data, f)
    return pauses

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Gebruik: python3 build-duck-timeline.py <audio.mp3>")
        sys.exit(1)
    audio = sys.argv[1]
    out = os.path.splitext(audio)[0] + ".duck.json"
    pauses = build_duck_timeline(audio, out)
    print(f"✅ {out} — {len(pauses)} pauzes: {pauses}")
