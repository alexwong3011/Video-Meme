#!/usr/bin/env bash
# Full "Lá Thu Trôi" MV (5:06, 1080x1920) from 4 stills + the 10 s bridge clip.
# usage: build.sh IMG_DIR SONG.mp3 WALK_48FPS.mp4 [OUT]
#   IMG_DIR must contain palace.jpg stream.jpg boat.jpg bridge.jpg
#   WALK_48FPS.mp4: the bridge clip interpolated to 48 fps (see ../la-thu-troi-2min/build.sh)
# needs: python3 with opencv-python-headless numpy librosa; node (for background removal)
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"; ROOT="$(cd "$HERE/../.." && pwd)"
IMG="$(realpath "$1")"; SONG="$(realpath "$2")"; WALK="$(realpath "$3")"
OUT="$(realpath -m "${4:-$ROOT/out/la-thu-troi-mv.mp4}")"
PUB="$ROOT/remotion/public/mv"; TMP="${TMPDIR:-/tmp}/la-thu-troi-mv"; mkdir -p "$PUB" "$TMP/cut" "$TMP/bgrm"
log() { printf '\033[1;35m==> %s\033[0m\n' "$*"; }
. "$ROOT/scripts/env.sh"

log "Cutting out the characters (IMG.LY background removal, model ships in the npm package)"
[ -d "$TMP/bgrm/node_modules/@imgly" ] || (cd "$TMP/bgrm" && npm init -y >/dev/null && npm i --no-audit --no-fund @imgly/background-removal-node@1.4.5)
BGRM_DIR="$TMP/bgrm" node "$HERE/cutout.mjs" "$TMP/cut" "$IMG"/{palace,stream,boat,bridge}.jpg

log "Building 2.5D layers (inpainted background, foreground, bloom)"
python3 "$HERE/prep_assets.py" "$IMG" "$TMP/cut" "$PUB"

log "Beat tracking"
python3 "$HERE/beats.py" "$SONG" "$ROOT/remotion/src/LaThuTroiMV/beats.json"

log "Audio + video assets"
ffmpeg -y -hide_banner -loglevel error -i "$SONG" -map 0:a -af "loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000" -c:a aac -b:a 256k "$PUB/song.m4a"
cp "$WALK" "$PUB/walk.mp4"

log "Rendering with Remotion"
cd "$ROOT/remotion"; [ -d node_modules ] || npm ci --no-audit --no-fund
npx remotion render LaThuTroiMV "$OUT" --codec=h264 --crf=19 --audio-bitrate=256k --concurrency="$(nproc)"
