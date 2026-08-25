#!/usr/bin/env bash
set -e
cd /opt/data/bodhi-dashboard

# De upload-route leest public/ via cwd = .next/standalone → kopieer de promo's daarheen
mkdir -p .next/standalone/public/videos/promos
cp -f public/videos/promos/*.mp4 .next/standalone/public/videos/promos/
echo "promo's gekopieerd naar .next/standalone/public/videos/promos/"

upload () {
  local file="$1"; local title="$2"; local desc="$3"; local tags="$4"
  echo "=== Upload: $title ==="
  curl -s -X POST "http://localhost:3000/api/youtube" \
    -H "Content-Type: application/json" \
    -d "{\"videoPath\":\"/videos/promos/$file\",\"title\":\"$title\",\"description\":\"$desc\",\"tags\":$tags}"
  echo
}

upload promo-breathe.mp4   "Breathe with LofiBuddha — Guided Breathwork"  "A short guided breathwork session to calm your nervous system." '["lofi","breathwork","meditation","mindfulness","guided meditation"]'
upload promo-sleep.mp4     "Sleep Deeper Tonight — Lofi & Rain Sounds"     "Soft lofi and gentle rain to drift into deep, restful sleep." '["lofi","sleep","rain sounds","meditation","mindfulness"]'
upload promo-focus.mp4     "Find Your Focus — Deep Work, Guided"          "Deep work, guided — settle in and focus." '["lofi","focus","deep work","study music","mindfulness"]'
upload promo-night-sky.mp4 "Infinite Night Sky — Meditation World"         "Float through an infinite night sky — a peaceful meditation world." '["lofi","night sky","meditation","stars","mindfulness"]'
upload promo-moon-temple.mp4 "Moon Temple Calm — Night Sky Meditation"    "A dark temple under a great moon — calm for meditation." '["lofi","temple","meditation","night","mindfulness"]'

echo "=== UPLOADS DONE ==="
