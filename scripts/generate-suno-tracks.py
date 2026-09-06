#!/usr/bin/env python3
"""Genereer Suno-tracks (batch) en download ze naar data/music/tracks/.
Gebruik: python3 scripts/generate-suno-tracks.py
"""
import os, json, time, urllib.request, pathlib, sys

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
    ("celestial-drift",
     "Ethereal weightless drift, soft airy pads, gentle rising and falling textures like slow breathing, deep spacious reverb, vast open night sky, floating without ground. Beatless, no drums, no beat, no melody, no song structure, continuous serene flow."),
    ("temple-flute",
     "Abandoned ancient temple, empty echoing stone hall, breathy bamboo flute with long sustained notes, soft airy blowing, distant resonant singing bowls, slow evolving warm drone, deep natural reverb. Beatless, no drums, no percussion, no beat, forgotten and timeless atmosphere, floating, serene."),
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
