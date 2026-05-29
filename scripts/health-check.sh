#!/bin/bash
# 🧘 Bodhi Health Check — toon status van alle systemen
# Gebruik: ./health-check.sh

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   🧘 BODHI STATUS — $(date '+%Y-%m-%d %H:%M')    ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# ── GitHub ──
echo "📦 GITHUB REPO"
echo "──────────────────────────────────────────"
cd /opt/data/bodhi-dashboard
COMMITS_AHEAD=$(git rev-list --count HEAD ^origin/main 2>/dev/null || echo "?")
COMMITS_BEHIND=$(git rev-list --count origin/main ^HEAD 2>/dev/null || echo "?")
LAST_COMMIT=$(git log -1 --format="%ar: %s" 2>/dev/null)
UNCOMMITTED=$(git status --porcelain 2>/dev/null | wc -l)

echo "  Branch:     $(git branch --show-current 2>/dev/null)"
echo "  Ahead:      $COMMITS_AHEAD commits"
echo "  Behind:     $COMMITS_BEHIND commits"
echo "  Uncommitted: $UNCOMMITTED files"
echo "  Last:       $LAST_COMMIT"
echo ""

# ── Sites check (HTTP) ──
echo "🌐 LIVE SITES"
echo "──────────────────────────────────────────"

check_url() {
    local url=$1
    local label=$2
    local code=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "$url" 2>/dev/null)
    if [ "$code" = "200" ]; then
        echo "  ✅ $label → $url ($code)"
    elif [ -n "$code" ]; then
        echo "  ⚠️  $label → $url ($code)"
    else
        echo "  ❌ $label → $url (geen verbinding)"
    fi
}

check_url "https://aibuddha.net" "aibuddha.net"
check_url "https://lofibuddha.com" "lofibuddha.com"
check_url "https://bodhi.aibuddha.net" "bodhi.aibuddha.net"
echo ""

# ── Docker (lokaal) ──
echo "🐳 DOCKER (lokaal)"
echo "──────────────────────────────────────────"
if command -v docker &>/dev/null && docker ps &>/dev/null 2>&1; then
    docker ps --format "  - {{.Names}} ({{.Status}})"
else
    echo "  ⚠️  Docker niet beschikbaar / geen rechten"
fi
echo ""

# ── Next.js app ──
echo "⚛️  NEXT.JS APP"
echo "──────────────────────────────────────────"
if curl -s -o /dev/null -w "%{http_code}" --connect-timeout 2 "http://localhost:3000" 2>/dev/null | grep -q 200; then
    echo "  ✅ Dev server draait op :3000"
else
    echo "  ⚠️  Dev server niet actief op :3000"
fi
echo ""

# ── Backup status ──
echo "💾 BACKUP"
echo "──────────────────────────────────────────"
LOG_FILE="/opt/data/.hermes/logs/bodhi-backup.log"
if [ -f "$LOG_FILE" ]; then
    LAST_BACKUP=$(tail -5 "$LOG_FILE" | grep "✅ Backup" | tail -1 || echo "geen succesvolle backup")
    echo "  Log: $LOG_FILE"
    echo "  Laatste: $LAST_BACKUP"
else
    echo "  ⚠️  Nog geen backup gelogd"
fi
echo ""

echo "──────────────────────────────────────────"
echo "  🧘 Bodhi is watching over you"
echo "──────────────────────────────────────────"
echo ""
