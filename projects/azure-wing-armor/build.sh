#!/usr/bin/env bash
# Rebuild the Azure Wing armor assets from the reference sheets (armour front + back, weapon; see views.py).
#   bash projects/azure-wing-armor/build.sh            -> projects/azure-wing-armor/assets/
# Needs: python3 + numpy + pillow + opencv-python-headless, node >= 18, npm (models come from the npm registry).
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
TMP="${TMPDIR:-/tmp}/azure-wing-armor"; TOOLS="$TMP/tools"; WORK="$TMP/work"
mkdir -p "$TOOLS/bgrm" "$TOOLS/up" "$WORK"
python3 -c "import cv2" 2>/dev/null || pip install -q opencv-python-headless

# 1. tools: segmentation model (IS-Net via @imgly) + ESRGAN-thick 4x (TF.js, weights ship inside the npm package)
if [ ! -d "$TOOLS/bgrm/node_modules/@imgly" ]; then
  (cd "$TOOLS/bgrm" && npm init -y >/dev/null && npm i --no-audit --no-fund --ignore-scripts @imgly/background-removal-node@1.4.5 && npm rebuild sharp)
fi
if [ ! -d "$TOOLS/up/node_modules/@upscalerjs" ]; then
  (cd "$TOOLS/up" && npm init -y >/dev/null && npm i --no-audit --no-fund --legacy-peer-deps @tensorflow/tfjs@4.22.0 @tensorflow/tfjs-backend-wasm@4.22.0 @upscalerjs/esrgan-thick@1.0.0)
fi

for VIEW in front back weapon body_front body_back; do
  W="$WORK/$VIEW"; mkdir -p "$W"; cd "$W"
  # 2. crops: 3x boxes for the segmentation model + the figure crop everything else works on
  python3 "$HERE/prep.py" "$VIEW"
  BGRM_DIR="$TOOLS/bgrm" node "$HERE/cutout.mjs" cut crops/*.png
  # 3. background model + colour-distance map
  python3 "$HERE/matte.py" "$VIEW"
  # 4. AI 4x upscale of the figure (single-threaded WASM, ~10 min per view)
  [ -f figure_x4.png ] || TOOLS="$TOOLS" node "$HERE/upscale.mjs" figure_in.png figure_x4.png 4
  # 5. cut the pieces at 4x
  python3 "$HERE/pieces.py" "$VIEW" 4 figure_x4.png p4
done
# 6. pack sprites, paper dolls, atlas, icons, JSON
rm -rf "$HERE/assets"; python3 "$HERE/pack.py" "$HERE/assets" front="$WORK/front/p4" back="$WORK/back/p4" weapon="$WORK/weapon/p4"
# 7. rig the assembled bodies (head, torso, arms, legs with joints) for character-test.html
for VIEW in body_front body_back; do
  python3 "$HERE/rig.py" "$VIEW" "$WORK/$VIEW/p4" "$HERE/assets/rig/$VIEW" --scales 2,1
done
echo "done -> $HERE/assets"
