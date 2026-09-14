#!/usr/bin/env python3
"""Genereer 4 nieuwe 'verlaten tempel' Suno-varianten en download ze naar
data/music/tracks/. Elke prompt is een andere facet van de verlaten-tempel sfeer
(beatless, fluit, floating) conform Louis' 'dreamy' voorkeur.
Gebruik: python3 scripts/generate-temple-variants.py
"""
import json, time, urllib.request, pathlib

ENV = pathlib.Path("/opt/data/bodhi-dashboard/.env").read_text()
KEY = [l.split("=", 1)[1].strip().strip('"').strip("'")
       for l in ENV.splitlines() if l.startswith("SUNO_API_KEY=")][0]

BASE = "https://api.sunoapi.org"
HEADERS = {
    "Authorization": f"Bearer {KEY}",
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
}
OUTDIR = pathlib.Path("/opt/data/bodhi-dashboard/data/music/tracks")

PROMPTS = [
    ("temple-dawn",
     "Abandoned ancient temple at dawn, empty echoing stone hall, first golden light through broken columns, breathy bamboo flute with long sustained notes, distant resonant singing bowls, slow evolving warm drone, deep natural reverb. Beatless, no drums, no percussion, no beat, no melody, no song structure, forgotten and timeless atmosphere, floating, serene."),
    ("temple-night",
     "Abandoned ancient temple in the deep of night, moonless sky, empty echoing stone chamber, distant resonant bowls, slow breathing warm drone, faint breathy flute far away, deep spacious reverb, long echo tails. Beatless, no drums, no percussion, no beat, no melody, continuous serene flow, floating, timeless, mysterious."),
    ("temple-mist",
     "Abandoned mountain temple shrouded in mist, empty stone hall, soft breathy bamboo flute with long sustained notes, distant singing bowls, slow evolving warm drone, gentle wind through broken temple doors, deep natural reverb. Beatless, no drums, no percussion, no beat, no melody, weightless floating, forgotten and serene."),
    ("temple-rain-hall",
     "Abandoned ancient temple with gentle rain on the stone roof, empty echoing hall, breathy bamboo flute, distant resonant bowls, slow warm drone, water dripping into stone pools, deep natural reverb. Beatless, no drums, no percussion, no beat, no melody, continuous serene flow, floating, timeless, cozy and intimate."),
]


def req(path, payload=None):
    data = json.dumps(payload).encode() if payload is not None else None
    r = urllib.request.Request(BASE + path, data=data, headers=HEADERS)
    with urllib.request.urlopen(r, timeout=60) as resp:
        return json.load(resp)


def download(url, dest):
    r = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
    })
    with urllib.request.urlopen(r, timeout=120) as resp, open(dest, "wb") as f:
        f.write(resp.read())


for slug, prompt in PROMPTS:
    print(f"== {slug}: generate ==", flush=True)
    r = req("/api/v1/generate", {
        "prompt": prompt, "customMode": False, "instrumental": True,
        "model": "V4", "callBackUrl": "https://www.lofibuddha.com/api/suno/callback",
    })
    task_id = r["data"]["taskId"]
    print(f"  taskId: {task_id}", flush=True)

    data = None
    for _ in range(60):  # ~10 min max
        time.sleep(10)
        info = req(f"/api/v1/generate/record-info?taskId={task_id}")
        d = info.get("data")
        st = d.get("status") if isinstance(d, dict) else None
        print(f"  status: {st}", flush=True)
        if st == "SUCCESS":
            data = d
            break
        if st in ("CREATE_TASK_FAILED", "FAILED", "ERROR"):
            print(f"  !! FAILED status {st}", flush=True)
            break
    if not data:
        print(f"  !! geen SUCCESS voor {slug}", flush=True)
        continue

    tracks = data.get("response", {}).get("sunoData", [])
    for i, t in enumerate(tracks):
        suffix = "" if i == 0 else "-2"
        url = t["audioUrl"]
        dest = OUTDIR / f"{slug}{suffix}.mp3"
        download(url, str(dest))
        print(f"  ✅ {dest.name} (dur {t.get('duration')}s)", flush=True)
    time.sleep(2)

print("KLAAR", flush=True)
