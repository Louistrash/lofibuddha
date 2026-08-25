#!/usr/bin/env bash
set -e
cd /opt/data/bodhi-dashboard
export HYPERFRAMES_BROWSER_PATH=/root/chrome-headless-shell/linux-153.0.7998.0/chrome-headless-shell-linux64/chrome-headless-shell

# 5 YouTube promo's: 20s, 16:9, met chime + temple-chanting audio
render () {
  local name="$1"; local template="$2"; local caption="$3"; local subtitle="$4"
  echo "==================== RENDERING PROMO: $name ===================="
  node scripts/generate-video.mjs --size 16:9 --duration 20 --template "$template" \
    --caption "$caption" --subtitle "$subtitle" --audio temple-chanting --output "promos/$name.mp4"
}

render promo-temple-chanting temple        "Temple Chanting"    "ancient chants, deep calm"
render promo-sacred-mantra  buddha-stars   "Sacred Mantra"      "chanting under the stars"
render promo-ancient-temple ancient-temple "Ancient Temple"     "stone halls + soft chant"
render promo-zen-lake       zen-lake       "Zen Lake Chant"     "still water, quiet chant"
render promo-moon-chant     moon-temple    "Moon Temple Chant"  "moonlit temple chanting"

echo "==================== ALL CHANT PROMOS DONE ===================="
ls -la public/videos/promos/
