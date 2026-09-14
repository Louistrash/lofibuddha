#!/usr/bin/env python3
"""Genereer 6 nieuwe 'lofi yogi temple meditation' tracks (relaxation & calming).
Verlaten-tempel sfeer, beatless/dreamy, fluit, bowls — conform Louis' voorkeur.
Gebruik: python3 scripts/generate-yogi-temple-tracks.py
"""
import os, json, time, urllib.request, pathlib

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
    ("yogi-temple-dawn",
     "Lofi yogi temple meditation at dawn, abandoned ancient stone temple overgrown with moss, breathy bamboo flute with long sustained notes, warm tanpura drone, distant resonant singing bowls, soft temple bells, gentle morning mist, golden light. Beatless, no drums, no percussion, no beat, no melody, no song structure, continuous serene flow, deeply relaxing and calming, floating, timeless."),
    ("yogi-temple-ember",
     "Lofi yogi temple meditation, a deep crimson red cloth draped in an ancient stone hall, breathy bamboo flute, low warm drone, distant singing bowls, slow evolving warm pads, deep spacious reverb, long echo tails, weightless floating. Beatless, no drums, no percussion, no beat, no melody, continuous serene flow, deeply calming and grounding."),
    ("yogi-temple-saffron",
     "Lofi yogi temple meditation with a sun-faded saffron cloth, abandoned stone temple, breathy bamboo flute, warm tanpura drone, resonant singing bowls, soft temple bells, gentle breeze through broken doors, slow and warm. Beatless, no drums, no percussion, no beat, no melody, no song structure, continuous serene flow, relaxing and calming, floating."),
    ("yogi-temple-mist",
     "Lofi yogi temple meditation in thick mist, abandoned mountain temple, breathy bamboo flute drifting through fog, warm low drone, distant bowls, soft wind, damp stone, long natural reverb. Beatless, no drums, no percussion, no beat, no melody, continuous serene flow, deeply relaxing and calming, weightless floating, timeless and serene."),
    ("yogi-temple-night",
     "Lofi yogi temple meditation at night, abandoned temple under a full moon, breathy bamboo flute, warm tanpura drone, distant resonant singing bowls, soft temple bells in the dark, huge stone chamber reverb. Beatless, no drums, no percussion, no beat, no melody, no song structure, continuous serene flow, deeply calming and restful, floating."),
    ("yogi-temple-checkered",
     "Lofi yogi temple meditation, a handwoven checkered cloth draped over an ancient stone altar, breathy bamboo flute, warm low drone, distant singing bowls, soft wooden percussion, gentle mist, deep spacious reverb, long echo tails. Beatless, no drums, no percussion, no beat, no melody, continuous serene flow, relaxing and calming, weightless floating, timeless."),
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
    if (OUTDIR / f"{slug}.mp3").exists() and not (__import__("sys").argv and "--force" in __import__("sys").argv):
        print(f"  skip {slug} (bestaat al)", flush=True)
        continue
    print(f"== {slug}: generate ==", flush=True)
    r = req("/api/v1/generate", {
        "prompt": prompt, "customMode": False, "instrumental": True,
        "model": "V4", "callBackUrl": "https://www.lofibuddha.com/api/suno/callback",
    })
    task_id = r["data"]["taskId"]
    print(f"  taskId: {task_id}", flush=True)

    data = None
    for _ in range(60):
        time.sleep(10)
        info = req(f"/api/v1/generate/record-info?taskId={task_id}")
        d = info.get("data")
        st = d.get("status") if isinstance(d, dict) else None
        print(f"  status: {st}", flush=True)
        if st == "SUCCESS":
            data = d
            break
        if st in ("CREATE_TASK_FAILED", "FAILED", "ERROR", "SENSITIVE_WORD_ERROR"):
            print(f"  !! FAILED {st}", flush=True)
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
