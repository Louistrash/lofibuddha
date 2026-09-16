#!/bin/bash
# Genereer Google Play store-assets: telefoon-screenshots (1080x2340) + feature graphic (1024x500).
set -e
OUT="/tmp/store-assets"
mkdir -p "$OUT"
CHROME="chromium --headless --disable-gpu --no-sandbox --hide-scrollbars"
PHONE_ARGS="--force-device-scale-factor=2.77 --window-size=390,844"

# Telefoon-screenshots (9:16, ~1080x2340)
declare -A ROUTES=(
  [home]="https://lofibuddha.com/"
  [explore]="https://lofibuddha.com/explore"
  [library]="https://lofibuddha.com/library"
  [soundtrack]="https://lofibuddha.com/music/midnight-temple"
  [sleep]="https://lofibuddha.com/category/sleep"
)

for name in home explore library soundtrack sleep; do
  url="${ROUTES[$name]}"
  echo "📱 screenshot: $name ($url)"
  $CHROME $PHONE_ARGS --virtual-time-budget=9000 --screenshot="$OUT/screenshot-$name.png" "$url" 2>/dev/null
  # exact 1080x2340 bijsnijden/centreren indien afwijkend
  python3 - "$OUT/screenshot-$name.png" <<'PY'
import sys
from PIL import Image
p = sys.argv[1]
im = Image.open(p).convert("RGB")
w, h = im.size
target = (1080, 2340)
if (w, h) != target:
    ratio = target[0] / target[1]
    cur = w / h
    if cur > ratio:  # te breed -> snijd zijkanten
        nw = int(h * ratio); x = (w - nw)//2; im = im.crop((x, 0, x+nw, h))
    else:            # te hoog -> snijd boven/onder (hou bovenkant)
        nh = int(w / ratio); im = im.crop((0, 0, w, nh))
    im = im.resize(target, Image.LANCZOS)
im.save(p, optimize=True)
print(f"   {p}: {im.size}")
PY
done

echo "✅ screenshots in $OUT"
