#!/usr/bin/env bash
# Build the 2-minute "Lá Thu Trôi" music video.
#   FFmpeg : 10 s source -> 48 fps interpolation -> 14-shot slow-motion montage (120 s)
#            song 157.8 s -> 277.8 s, fades, -14 LUFS
#   Remotion: gold metallic lyrics (word-synced) that burst into sparks, gold dust, title
# usage: build.sh SOURCE_VIDEO SONG_MP3 [OUT=../../out/la-thu-troi-2min.mp4]
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"; ROOT="$(cd "$HERE/../.." && pwd)"
SRC="$(realpath "$1")"; SONG="$(realpath "$2")"
OUT="$(realpath -m "${3:-$ROOT/out/la-thu-troi-2min.mp4}")"
START=157.8; DUR=120
PUB="$ROOT/remotion/public/la-thu-troi"; TMP="${TMPDIR:-/tmp}/la-thu-troi-build"
mkdir -p "$PUB" "$TMP" "$(dirname "$OUT")"
log() { printf '\033[1;35m==> %s\033[0m\n' "$*"; }
. "$ROOT/scripts/env.sh"

if [ ! -s "$TMP/src48.mp4" ]; then
  log "Interpolating source to 48 fps (a few minutes)"
  ffmpeg -y -hide_banner -loglevel error -i "$SRC" -map 0:v:0 -an \
    -vf "minterpolate=fps=48:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1,scale=1080:-2:flags=lanczos" \
    -c:v libx264 -crf 14 -preset fast "$TMP/src48.mp4"
fi

log "Building 120 s background montage"
python3 "$HERE/montage.py" "$TMP/src48.mp4" "$PUB/bg.mp4" --duration $DUR

log "Cutting song $START s + ${DUR} s"
ffmpeg -y -hide_banner -loglevel error -ss $START -t $DUR -i "$SONG" -map 0:a \
  -af "afade=t=in:st=0:d=1.2,afade=t=out:st=$((DUR - 3)).3:d=2.7,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000" \
  -c:a aac -b:a 256k "$PUB/hook.m4a"

log "Rendering with Remotion"
cd "$ROOT/remotion"
[ -d node_modules ] || npm ci --no-audit --no-fund
npx remotion render LaThuTroi "$OUT" --codec=h264 --crf=18 --audio-bitrate=256k --concurrency="$(nproc)"
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate:format=duration -of compact "$OUT"
