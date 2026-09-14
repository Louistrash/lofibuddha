#!/usr/bin/env python3
"""
Genereer cover-art voor alle muziektracks die nog GEEN cover hebben.
Stijl: donker nachtelijk (#0a0a0c), gouden gloed, subtiele mandala-motieven,
sereen/meditatief — passend bij de LofiBuddha 'Zen Apple'-branding.
Output: data/music/covers/<slug>.png (1024x1024), skip bestaande.
"""
import os, json, time, base64, pathlib, urllib.request, sys

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
STYLE = ("dark night palette of deep charcoal, warm golden glow and soft gold accents, "
         "subtle mandala and lotus motifs, serene meditative mood, cinematic lighting, "
         "ultra detailed, atmospheric depth, 1:1 square aspect ratio, no text, no watermark, no people")

# slug -> (scene prompt, mood). 27 tracks zonder cover.
COVERS = [
    # Sacred / temple
    ("lofi-buddha-temple", "A quiet Buddhist temple at dusk, a single resonant brass bell, warm lo-fi glow, soft vinyl crackle, cozy candles, mellow golden light, peaceful and spiritual"),
    ("lofi-temple-10m", "A quiet Buddhist temple courtyard at night, warm lo-fi ambience, glowing lanterns, soft bell, cozy golden light, meditative"),
    ("lofi-temple-20m", "A still Buddhist temple interior in deep night, warm lo-fi ambience, candlelight, distant bell, serene golden glow"),
    ("lofi-temple-30m", "An expansive Buddhist temple hall under moonlight, warm lo-fi ambience, low golden light, drifting incense, profound stillness"),
    ("midnight-temple", "A deep midnight temple, dark stone chamber, a continuous low tanpura drone, distant glowing singing bowls, soft temple bells, moonless sky"),
    ("morning-temple", "A peaceful stone temple at sunrise, soft golden light, warm resonant singing bowls, distant birdsong, hopeful and serene"),
    ("temple-rain", "Rain falling on a wooden temple roof, warm low tanpura drone, distant singing bowl, water dripping, intimate and cozy"),
    ("monks-chant", "Wordless monk chant in a vast stone temple, deep vocal drones, huge natural reverb, distant singing bowls, ancient and holy"),
    ("ocean-temple", "A temple by the ocean, slow waves rolling onto a shore, warm tanpura drone, temple bells on the sea breeze, vast and open"),
    ("forgotten-temple", "An ancient Himalayan yoga temple hidden in mountains at sunrise, moss-covered stone, tanpura drone, distant bansuri flute, mist drifting through open doors"),
    # Deep / nostalgic / focus
    ("ocean-depth", "A deep underwater abyss, slow dark ambient, soft whale song drifting, deep blue water, weightless and vast"),
    ("rainy-kyoto", "A quiet rainy evening in Kyoto, rain on a wooden temple roof, a distant koto, warm low fire, nostalgic and intimate"),
    ("lo-fi-focus", "A cozy lo-fi study scene, soft warm desk lamp, gentle piano keys, vinyl texture, mellow pads, calm and focused"),
    # Dreamy / ambient
    ("moon-tide-drift", "Moonlight over a dark tide, soft airy pads, slow breathing textures, endless horizon, weightless floating"),
    ("weightless-drift", "Weightless floating through airy clouds, deep spacious reverb, no edges, no ground, soft warm drone"),
    ("stone-bowl-garden", "A zen stone garden at dusk, resonant singing bowls, soft water trickle, warm low drone, slow and grounding"),
    ("moonlit-bamboo-drift", "A moonlit bamboo grove, breathy bamboo flute, soft airy pads, gentle wind through leaves, floating serene"),
    ("moonlit-ruins", "Abandoned ancient temple ruins under moonlight, empty echoing stone hall, distant resonant bowls, forgotten and timeless"),
    ("cloud-drift", "Floating through soft clouds, slowly evolving warm drone, airy pads, deep spacious reverb, weightless"),
    ("cloud-drift-2", "Floating through softer, airier clouds, deep reverb, pale golden light through mist, gentle weightless drift"),
    ("celestial-drift", "An ethereal vast open night sky, soft airy pads, rising and falling textures like slow breathing, faint stars"),
    ("celestial-drift-2", "A deeper, calmer night sky, soft pads, deep reverb, distant nebula glow, profound quiet"),
    ("temple-flute", "An abandoned temple, breathy bamboo flute, distant singing bowls, slow warm drone, forgotten and timeless"),
    ("temple-flute-2", "An abandoned temple in deeper shadow, breathy bamboo flute, more echoing, distant bowls, forgotten"),
    ("moonlit-bamboo-drift-2", "A deeper, airier moonlit bamboo grove, breathy flute, soft wind, cool moonlight filtering through leaves"),
    ("moonlit-ruins-2", "Colder abandoned ruins under moonlight, long echoing stone hall, faint starlight, deeper shadows"),
    ("stone-bowl-garden-2", "A warmer zen stone garden at dusk, softer water, resonant bowl glowing softly, warm golden drone"),
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
done = 0
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
                done += 1
                break
        else:
            print(f"  !! geen image: {json.dumps(d)[:200]}", flush=True)
    except Exception as e:
        print(f"  !! fout {slug}: {e}", flush=True)
    time.sleep(2)

print(f"KLAAR ({done} nieuw)", flush=True)
