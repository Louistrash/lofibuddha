#!/usr/bin/env bash
set -e
cd /opt/data/bodhi-dashboard
export HYPERFRAMES_BROWSER_PATH=/root/chrome-headless-shell/linux-153.0.7998.0/chrome-headless-shell-linux64/chrome-headless-shell

WORLDS=(milky-way moon-temple himalayan-night zen-lake buddha-stars ancient-temple cosmic-void)

for t in "${WORLDS[@]}"; do
  echo "==================== RENDERING: $t ===================="
  node scripts/generate-video.mjs --size 16:9 --duration 30 --template "$t" --clean true --output "worlds/$t.mp4"
done

echo "==================== ALL WORLDS DONE ===================="
ls -la public/videos/worlds/
