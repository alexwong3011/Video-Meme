#!/usr/bin/env bash
# Install & configure everything needed for HyperFrames, Remotion and FFmpeg.
# Safe to re-run. Works on Debian/Ubuntu (apt) and macOS (Homebrew).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
say() { printf '\n\033[1;35m==> %s\033[0m\n' "$*"; }

# ---- Node.js >= 22 (required by HyperFrames) --------------------------------
say "Checking Node.js"
if ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 22 ]; then
  echo "Node.js >= 22 is required. Install it from https://nodejs.org or via nvm:"
  echo "  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash && nvm install 22"
  exit 1
fi
node -v

# ---- FFmpeg / FFprobe + fonts + Chrome runtime libraries --------------------
say "Checking FFmpeg"
if ! command -v ffmpeg >/dev/null || ! command -v ffprobe >/dev/null; then
  if command -v apt-get >/dev/null; then
    SUDO=""; [ "$(id -u)" -ne 0 ] && SUDO="sudo"
    $SUDO apt-get update
    $SUDO apt-get install -y ffmpeg fonts-liberation fonts-noto-color-emoji \
      libnss3 libatk-bridge2.0-0 libgbm1 libxkbcommon0 libasound2t64 || \
    $SUDO apt-get install -y ffmpeg fonts-liberation libnss3 libatk-bridge2.0-0 libgbm1 libxkbcommon0
  elif command -v brew >/dev/null; then
    brew install ffmpeg
  else
    echo "Please install FFmpeg manually: https://ffmpeg.org/download.html"; exit 1
  fi
fi
ffmpeg -hide_banner -version | head -1

# ---- Remotion project dependencies ------------------------------------------
say "Installing Remotion dependencies"
(cd "$ROOT/remotion" && npm ci --no-audit --no-fund)

# ---- Headless browser for rendering -----------------------------------------
# Both HyperFrames and Remotion render through Chrome Headless Shell.
say "Ensuring Chrome Headless Shell"
if [ -z "${HYPERFRAMES_BROWSER_PATH:-}" ]; then
  PW_SHELL="$(ls -d /opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell 2>/dev/null | tail -1 || true)"
  if [ -n "$PW_SHELL" ]; then
    echo "Found pre-installed headless shell: $PW_SHELL"
    echo "export HYPERFRAMES_BROWSER_PATH=$PW_SHELL REMOTION_BROWSER_EXECUTABLE=$PW_SHELL" > "$ROOT/.env.browser"
  else
    (cd "$ROOT/remotion" && npx remotion browser ensure) || true
    npx -y @puppeteer/browsers install chrome-headless-shell@stable --path "$HOME/.cache/hyperframes-browsers" || \
      echo "Could not download chrome-headless-shell; HyperFrames will fall back to system Chrome."
  fi
fi

# ---- Warm the pinned HyperFrames CLI ----------------------------------------
say "Fetching HyperFrames CLI"
(cd "$ROOT/hyperframes" && npx --yes hyperframes@0.8.223 --version)

say "Done. Run: npm run verify"
