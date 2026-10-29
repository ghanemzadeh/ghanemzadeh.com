#!/bin/bash
# Newsletter sync from this Mac, where Substack serves the feed normally. It
# refuses GitHub's runners outright and often refuses the Cloudflare Worker
# proxy too (see workers/substack-proxy/README.md), so a new post can sit
# unlisted until a run gets through. This job is the dependable path.
#
# It works in its own clone, so it never touches a working copy or branch, and
# pushes to main only when the article list changed. A launchd agent runs it
# twice a day (09:00 and 21:00; a run missed while the Mac sleeps happens on
# wake). Log: ~/Library/Logs/ghanemzadeh-newsletter-sync.log
#
#   scripts/newsletter-local-sync.sh --install     install and load the agent
#   scripts/newsletter-local-sync.sh --uninstall   unload and remove it
#   scripts/newsletter-local-sync.sh               run once now

set -euo pipefail

LABEL=com.ghanemzadeh.newsletter-sync
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
LOG="$HOME/Library/Logs/ghanemzadeh-newsletter-sync.log"
SOURCE_REPO="$(cd "$(dirname "$0")/.." && pwd)"
CLONE="$HOME/Library/Application Support/ghanemzadeh-newsletter-sync"

case "${1:-}" in
  --install)
    cat > "$PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>$LABEL</string>
  <key>ProgramArguments</key>
  <array><string>/bin/bash</string><string>$SOURCE_REPO/scripts/newsletter-local-sync.sh</string></array>
  <key>StartCalendarInterval</key>
  <array>
    <dict><key>Hour</key><integer>9</integer><key>Minute</key><integer>0</integer></dict>
    <dict><key>Hour</key><integer>21</integer><key>Minute</key><integer>0</integer></dict>
  </array>
  <key>StandardOutPath</key><string>$LOG</string>
  <key>StandardErrorPath</key><string>$LOG</string>
</dict>
</plist>
EOF
    launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null || true
    launchctl bootstrap "gui/$(id -u)" "$PLIST"
    echo "Installed $PLIST. Run it now with: launchctl kickstart gui/$(id -u)/$LABEL"
    exit 0
    ;;
  --uninstall)
    launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null || true
    rm -f "$PLIST"
    echo "Removed $LABEL. The clone at $CLONE can be deleted by hand."
    exit 0
    ;;
esac

# launchd starts with a bare PATH: pick up nvm's default node, or Homebrew's.
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
if [ -s "$HOME/.nvm/nvm.sh" ]; then
  set +u; . "$HOME/.nvm/nvm.sh" >/dev/null; set -u
fi

echo "== $(date '+%Y-%m-%d %H:%M %Z')"
if [ ! -d "$CLONE/.git" ]; then
  git clone --quiet "$(git -C "$SOURCE_REPO" remote get-url origin)" "$CLONE"
fi
cd "$CLONE"
git fetch --quiet origin main
git checkout --quiet --detach origin/main
git reset --quiet --hard origin/main

node scripts/update-newsletter.mjs
if git diff --quiet -- newsletter/index.html; then
  exit 0
fi
node scripts/update-sitemap.mjs >/dev/null
node scripts/generate-llms-full.mjs >/dev/null
git add -- newsletter/index.html sitemap.xml llms-full.txt
git commit --quiet -m "chore: refresh newsletter from Substack (local sync) [skip ci]"
git push --quiet origin HEAD:main
echo "Pushed $(git rev-parse --short HEAD)."
