#!/bin/bash
# Deploy analytics.govix.io to production server
# Usage:
#   ./deploy.sh                    — deploy without commit
#   ./deploy.sh "feat: something"  — commit + deploy

set -e

COMMIT_MSG="${1:-}"
SERVER_ALIAS="compro"
SERVER_APP_DIR="/root/analytics.govix.io"
SERVER_WEB_DIR="/var/www/analytics.govix.io"
PM2_NAME="analytics-govix"

# ── 1. Commit (если передан message) ──────────────────────────
if [ -n "$COMMIT_MSG" ]; then
  echo "==> Commit: $COMMIT_MSG"
  git add -A
  git commit -m "$COMMIT_MSG"
fi

# ── 2. Push to GitHub ─────────────────────────────────────────
echo "==> Pushing to GitHub..."
git push origin main

# ── 3. Pull on server + copy frontend + restart backend ───────
echo "==> Deploying to server..."
ssh $SERVER_ALIAS "
  set -e
  cd $SERVER_APP_DIR

  echo '→ git pull'
  git pull origin main

  echo '→ install deps (if changed)'
  cd server && npm install --omit=dev --silent && cd ..

  echo '→ copy frontend'
  cp index.html $SERVER_WEB_DIR/index.html

  echo '→ restart backend'
  pm2 restart $PM2_NAME --update-env

  echo '→ verify'
  pm2 list | grep $PM2_NAME
"

echo ""
echo "✅ Deployed: https://analytics.govix.io"
