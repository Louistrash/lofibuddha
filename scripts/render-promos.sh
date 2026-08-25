#!/usr/bin/env bash
set -e
cd /opt/data/bodhi-dashboard
export HYPERFRAMES_BROWSER_PATH=/root/chrome-headless-shell/linux-153.0.7998.0/chrome-headless-shell-linux64/chrome-headless-shell

# 5 YouTube promo's: 20s, 16:9, met soundscape-audio + caption + brand
render () {
  local name="$1"; local template="$2"; local caption="$3"; local subtitle="$4"; local audio="$5"
  echo "==================== RENDERING PROMO: $name ===================="
  node scripts/generate-video.mjs --size 16:9 --duration 20 --template "$template" \
    --caption "$caption" --subtitle "$subtitle" --audio "$audio" --output "promos/$name.mp4"
}

render promo-breathe     breathe     "Breathe with LofiBuddha" "guided breathwork"      temple-ambience
render promo-sleep       night       "Sleep deeper tonight"    "lofi + rain sounds"     gentle-rain
render promo-focus       focus       "Find your focus"         "deep work, guided"      deep-space
render promo-night-sky   night-sky   "Infinite Night Sky"      "meditation worlds"      singing-bowls
render promo-moon-temple moon-temple "Moon Temple calm"        "temple + night sky"     temple-ambience

echo "==================== ALL PROMOS DONE ===================="
ls -la public/videos/promos/
