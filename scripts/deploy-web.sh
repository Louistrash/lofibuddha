#!/usr/bin/env bash
# Deploy Expo web dist to lofibuddha.com
# Host alias: bodhi-vps → 157.97.107.194 (zie ~/.ssh/config)
# NIET 85.215.43.194 — dat IP is verouderd.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOST="${DEPLOY_HOST:-bodhi-vps}"
REMOTE="${DEPLOY_REMOTE:-/opt/data/bodhi-dashboard/mobile/dist/}"

if [[ ! -d "$ROOT/mobile/dist" ]]; then
  echo "Geen mobile/dist — eerst:"
  echo "  cd $ROOT/mobile && npm run export:web"
  exit 1
fi

echo "→ rsync $ROOT/mobile/dist/ → $HOST:$REMOTE"
rsync -az --delete --exclude '.DS_Store' -e 'ssh -o BatchMode=yes' \
  "$ROOT/mobile/dist/" "$HOST:$REMOTE"
echo "✓ Klaar. Hard-refresh https://lofibuddha.com/library"
