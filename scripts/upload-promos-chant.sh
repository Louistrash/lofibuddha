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

upload promo-temple-chanting.mp4 "Temple Chanting — Deep Calm"            "Ancient temple chants with a soft bell chime to settle into deep calm." '["temple chanting","chant","meditation","mindfulness","temple"]'
upload promo-sacred-mantra.mp4  "Sacred Mantra — Chanting Under the Stars" "Monks chanting a sacred mantra beneath a field of stars." '["mantra","chanting","meditation","stars","mindfulness"]'
upload promo-ancient-temple.mp4 "Ancient Temple — Stone Halls & Chant"    "Soft chanting echoes through ancient stone halls." '["temple","chant","ancient","meditation","mindfulness"]'
upload promo-zen-lake.mp4       "Zen Lake — Still Water, Soft Chant"      "Quiet temple chant over still, mirror-calm water." '["zen","lake","chant","meditation","mindfulness"]'
upload promo-moon-chant.mp4     "Moon Temple — Moonlit Chanting"          "Moonlit temple chanting for deep meditation." '["moon","temple","chanting","meditation","mindfulness"]'

echo "=== CHANT UPLOADS DONE ==="
