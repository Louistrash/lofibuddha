#!/bin/bash
# 🧘 Bodhi Backup Script — draait dagelijks via Hermes cron
# Push alle wijzigingen naar GitHub als backup

REPO_DIR="/opt/data/bodhi-dashboard"
LOG_FILE="/opt/data/.hermes/logs/bodhi-backup.log"

echo "===== Bodhi Backup: $(date '+%Y-%m-%d %H:%M:%S') =====" | tee -a "$LOG_FILE"

cd "$REPO_DIR" || { echo "❌ Repo niet gevonden" | tee -a "$LOG_FILE"; exit 1; }

# Check of er wijzigingen zijn
if [[ -z $(git status --porcelain) ]] && [[ -z $(git log --branches --not --remotes --oneline 2>/dev/null) ]]; then
    echo "✅ Geen wijzigingen — alles al gesynced met GitHub" | tee -a "$LOG_FILE"
    exit 0
fi

# Toon wat er gewijzigd is
echo "📝 Gewijzigde bestanden:" | tee -a "$LOG_FILE"
git status --short | tee -a "$LOG_FILE"

# Commit alles
git add -A
git commit -m "💾 Auto-backup: $(date '+%Y-%m-%d %H:%M')" 2>&1 | tee -a "$LOG_FILE"

# Push naar GitHub
echo "🚀 Pushen naar GitHub..." | tee -a "$LOG_FILE"
if git push origin main 2>&1 | tee -a "$LOG_FILE"; then
    echo "✅ Backup geslaagd!" | tee -a "$LOG_FILE"
else
    echo "❌ Push mislukt — check SSH/GitHub verbinding" | tee -a "$LOG_FILE"
    exit 1
fi

echo "" | tee -a "$LOG_FILE"
