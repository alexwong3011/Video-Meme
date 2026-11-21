#!/usr/bin/env bash
# Rebuild the Azure Wing armor assets from the reference sheet.
#   bash projects/azure-wing-armor/build.sh            -> projects/azure-wing-armor/assets/
# Needs: python3 + numpy + pillow + opencv-python-headless, node >= 18, npm (models come from the npm registry).
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
SRC="$HERE/source/azure-wing-sheet.jpg"
TMP="${TMPDIR:-/tmp}/azure-wing-armor"; TOOLS="$TMP/tools"; WORK="$TMP/work"
mkdir -p "$TOOLS/bgrm" "$TOOLS/up" "$WORK/crops" "$WORK/cut"
python3 -c "import cv2" 2>/dev/null || pip install -q opencv-python-headless

# 1. tools: segmentation model (IS-Net via @imgly) + ESRGAN-thick 4x (TF.js, weights ship inside the npm package)
if [ ! -d "$TOOLS/bgrm/node_modules/@imgly" ]; then
  (cd "$TOOLS/bgrm" && npm init -y >/dev/null && npm i --no-audit --no-fund --ignore-scripts @imgly/background-removal-node@1.4.5 && npm rebuild sharp)
fi
if [ ! -d "$TOOLS/up/node_modules/@upscalerjs" ]; then
  (cd "$TOOLS/up" && npm init -y >/dev/null && npm i --no-audit --no-fund --legacy-peer-deps @tensorflow/tfjs@4.22.0 @tensorflow/tfjs-backend-wasm@4.22.0 @upscalerjs/esrgan-thick@1.0.0)
fi

cd "$WORK"
# 2. crops (3x) for the segmentation model + the figure crop that everything else works on
python3 - "$SRC" <<'EOF'
import sys
from PIL import Image
im = Image.open(sys.argv[1]).convert('RGB')
boxes = {'helmet': (790,120,1010,395), 'body': (715,315,1085,935), 'gauntlet_l': (580,345,710,710), 'gauntlet_r': (1075,345,1205,710),
         'boot_l': (650,755,820,985), 'boot_r': (980,755,1150,985)}
for k, b in boxes.items():
    c = im.crop(b); c.resize((c.width*3, c.height*3), Image.LANCZOS).save(f'crops/{k}.png')
im.crop((570,110,1215,990)).save('figure_in.png')
EOF
BGRM_DIR="$TOOLS/bgrm" node "$HERE/cutout.mjs" cut crops/*.png
# 3. background model + colour-distance map
python3 "$HERE/matte.py" "$SRC"
# 4. AI 4x upscale of the figure (single-threaded WASM, ~10 min)
[ -f figure_x4.png ] || TOOLS="$TOOLS" node "$HERE/upscale.mjs" figure_in.png figure_x4.png 4
# 5. cut pieces at 4x and pack
python3 "$HERE/pieces.py" 4 figure_x4.png p4
rm -rf "$HERE/assets"; python3 "$HERE/pack.py" p4 "$HERE/assets"
echo "done -> $HERE/assets"
