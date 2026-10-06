#!/bin/bash
# Prépare une session cloud Claude Code : ffmpeg (conversion des vidéos de
# dimension-redesign) et dépendances npm des deux projets Next.js.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

if ! command -v ffmpeg >/dev/null 2>&1; then
  SUDO=""
  [ "$(id -u)" -ne 0 ] && SUDO="sudo"
  $SUDO apt-get update -qq
  DEBIAN_FRONTEND=noninteractive $SUDO apt-get install -y -qq ffmpeg >/dev/null
fi

for app in dimension-redesign firniss-phone; do
  if [ -f "$app/package.json" ]; then
    (cd "$app" && npm install --no-audit --no-fund --loglevel=error)
  fi
done

# Le fetch de Node ne passe par le proxy sortant de la session qu'avec ce drapeau.
if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  echo 'export NODE_USE_ENV_PROXY=1' >> "$CLAUDE_ENV_FILE"
fi
