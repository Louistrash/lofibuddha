#!/bin/bash
# Post-build fix: standalone output needs static files + public + scripts
set -e
ROOT="/opt/data/bodhi-dashboard"
STANDALONE="$ROOT/.next/standalone"

echo "[postbuild] Copying static files..."
cp -r "$ROOT/.next/static" "$STANDALONE/.next/static"

echo "[postbuild] Copying public assets..."
mkdir -p "$STANDALONE/public"
cp -r "$ROOT/public/"* "$STANDALONE/public/" 2>/dev/null || true

echo "[postbuild] Copying scripts..."
cp -r "$ROOT/scripts" "$STANDALONE/scripts"

echo "[postbuild] Done"
