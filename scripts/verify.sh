#!/usr/bin/env bash
# End-to-end check: HyperFrames + Remotion + FFmpeg all produce valid video.
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
. "$ROOT/scripts/env.sh"
OUT="$ROOT/out"; mkdir -p "$OUT"
FF="$ROOT/scripts/ffmpeg-tools.sh"
HF="npx --yes hyperframes@0.8.223"
pass=0; fail=0
ok()   { printf '  \033[32m✓\033[0m %s\n' "$*"; pass=$((pass+1)); }
bad()  { printf '  \033[31m✗\033[0m %s\n' "$*"; fail=$((fail+1)); }
step() { printf '\n\033[1m%s\033[0m\n' "$*"; }
run()  { local label="$1"; shift; if "$@" >"$OUT/.log" 2>&1; then ok "$label"; else bad "$label"; tail -15 "$OUT/.log"; fi; }
# expect_video FILE W H MIN_DURATION
expect_video() {
  local f="$1" w="$2" h="$3" d="$4" fw fh fd
  fw=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of default=nw=1:nk=1 "$f" 2>/dev/null)
  fh=$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of default=nw=1:nk=1 "$f" 2>/dev/null)
  fd=$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$f" 2>/dev/null)
  local info="${fw}x${fh} ${fd}s"
  if [ "$fw" = "$w" ] && [ "$fh" = "$h" ] && awk -v a="$fd" -v b="$d" 'BEGIN{exit !(a>=b)}'; then
    ok "$(basename "$f") → ${fw}x${fh}, ${fd}s"
  else bad "$(basename "$f") expected ${w}x${h} ≥${d}s, got '${info}'"; fi
}

step "1. Toolchain"
command -v node >/dev/null && [ "$(node -p 'process.versions.node.split(".")[0]')" -ge 22 ] && ok "Node $(node -v)" || bad "Node >= 22 missing"
command -v ffmpeg >/dev/null && ok "$(ffmpeg -hide_banner -version | head -1 | cut -d' ' -f1-3)" || bad "ffmpeg missing"
command -v ffprobe >/dev/null && ok "ffprobe present" || bad "ffprobe missing"
ENCODERS="$(ffmpeg -hide_banner -encoders 2>/dev/null)"; FILTERS="$(ffmpeg -hide_banner -filters 2>/dev/null)"
for enc in libx264 libx265 libvpx-vp9 aac libmp3lame libopus gif; do
  grep -q " $enc " <<<"$ENCODERS" && ok "encoder $enc" || bad "encoder $enc missing"
done
for flt in drawtext subtitles loudnorm xfade palettegen; do
  grep -q " $flt " <<<"$FILTERS" && ok "filter $flt" || bad "filter $flt missing"
done
[ -n "${HYPERFRAMES_BROWSER_PATH:-}" ] && ok "headless browser: $HYPERFRAMES_BROWSER_PATH" || ok "headless browser: auto (HyperFrames/Remotion will locate one)"

step "2. HyperFrames"
run "hyperframes doctor" bash -c "cd '$ROOT/hyperframes' && $HF doctor | grep -E 'FFmpeg|Chrome|Node' | grep -q '✓'"
run "hyperframes check (lint/runtime/layout/motion/contrast)" bash -c "cd '$ROOT/hyperframes' && $HF check"
run "hyperframes render" bash -c "cd '$ROOT/hyperframes' && $HF render -o '$OUT/hyperframes-demo.mp4'"
expect_video "$OUT/hyperframes-demo.mp4" 1920 1080 5.9

step "3. Remotion"
[ -d "$ROOT/remotion/node_modules" ] || (cd "$ROOT/remotion" && npm ci --no-audit --no-fund >/dev/null 2>&1)
run "remotion typecheck" bash -c "cd '$ROOT/remotion' && npx tsc --noEmit"
run "remotion render" bash -c "cd '$ROOT/remotion' && npx remotion render MemeIntro '$OUT/remotion-demo.mp4'"
expect_video "$OUT/remotion-demo.mp4" 1920 1080 4.9

step "4. FFmpeg post-production"
run "generate test tone" ffmpeg -y -hide_banner -loglevel error -f lavfi -i "sine=frequency=440:duration=12" -c:a libmp3lame "$OUT/tone.mp3"
run "crossfade (xfade)"   "$FF" xfade "$OUT/combined.mp4" "$OUT/hyperframes-demo.mp4" "$OUT/remotion-demo.mp4" 0.5
expect_video "$OUT/combined.mp4" 1920 1080 10
run "concat"              "$FF" concat "$OUT/concat.mp4" "$OUT/hyperframes-demo.mp4" "$OUT/remotion-demo.mp4"
expect_video "$OUT/concat.mp4" 1920 1080 10.9
run "add audio + loudnorm" "$FF" add-audio "$OUT/final.mp4" "$OUT/combined.mp4" "$OUT/tone.mp3"
ffprobe -v error -select_streams a:0 -show_entries stream=codec_name -of csv=p=0 "$OUT/final.mp4" | grep -q aac && ok "final.mp4 has AAC audio" || bad "final.mp4 audio missing"
run "caption (drawtext)"  "$FF" caption "$OUT/captioned.mp4" "$OUT/final.mp4" "WHEN THE RENDER WORKS"
run "vertical 9:16"       "$FF" vertical "$OUT/vertical.mp4" "$OUT/final.mp4"
expect_video "$OUT/vertical.mp4" 1080 1920 10
run "webm (VP9/Opus)"     "$FF" webm "$OUT/final.webm" "$OUT/final.mp4"
run "gif"                 "$FF" gif "$OUT/preview.gif" "$OUT/remotion-demo.mp4" 480 12
[ -s "$OUT/preview.gif" ] && ok "preview.gif $(du -h "$OUT/preview.gif" | cut -f1)" || bad "gif empty"

rm -f "$OUT/.log"
printf '\n\033[1m%d passed, %d failed\033[0m — outputs in %s\n' "$pass" "$fail" "$OUT"
[ "$fail" -eq 0 ]
