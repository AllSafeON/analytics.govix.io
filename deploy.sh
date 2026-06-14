#!/bin/bash
# Deploy analytics.govix.io to production server

set -e

echo "==> Pushing to GitHub..."
git add -A
git commit -m "${1:-chore: update}" || true
git push origin main

echo "==> Deploying to server..."
ssh compro "
  cd /var/www/analytics.govix.io &&
  git pull origin main &&
  echo '✅ Done'
"
