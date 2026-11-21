#!/usr/bin/env bash
# Image -> rigged 3D knight. Run after build.sh (needs work/body_front/p4 and work/body_back/p4).
#   bash projects/azure-wing-armor/3d/build3d.sh   -> projects/azure-wing-armor/assets/3d/azure_knight.glb
# Needs network access to huggingface.co (TripoSR weights, ~1.7 GB) and github.com (TripoSR code).
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"; ROOT="$(dirname "$HERE")"
TMP="${TMPDIR:-/tmp}/azure-wing-armor"; WORK="$TMP/work"; T="$TMP/3d"; mkdir -p "$T"
pip install -q torch trimesh omegaconf einops "transformers<4.50" huggingface-hub PyMCubes scikit-image bpy
if [ ! -d "$T/TripoSR" ]; then
  git clone --depth 1 https://github.com/VAST-AI-Research/TripoSR.git "$T/TripoSR"
  # CPU: PyMCubes instead of the compiled torchmcubes; background removal is already done upstream
  python3 - "$T/TripoSR" <<'PY'
import sys; r = sys.argv[1]
p = r + "/tsr/models/isosurface.py"; s = open(p).read()
s = s.replace("from torchmcubes import marching_cubes", "import mcubes\n\n\ndef marching_cubes(level, threshold):\n    v, f = mcubes.marching_cubes(level.cpu().numpy().astype(np.float32), threshold)\n    return torch.from_numpy(v.astype(np.float32)), torch.from_numpy(f.astype(np.int64))")
open(p, "w").write(s)
p = r + "/tsr/utils.py"; s = open(p).read(); s = s.replace("import rembg\n", "try:\n    import rembg\nexcept ImportError:\n    rembg = None\n"); open(p, "w").write(s)
PY
fi
cp "$HERE/run_tsr.py" "$T/"
# 1. TripoSR on the front body (triplane codes + a coloured preview mesh)
python3 "$T/run_tsr.py" "$WORK/body_front/p4/body.png" "$T/out" 256
# 2. finer geometry from the same codes, Y-up / +Z front, outward normals, light smoothing
python3 - "$T" <<'PY'
import sys, os, torch, numpy as np, trimesh
T = sys.argv[1]; sys.path.insert(0, T + "/TripoSR")
from tsr.system import TSR
m = TSR.from_pretrained("stabilityai/TripoSR", config_name="config.yaml", weight_name="model.ckpt"); m.renderer.set_chunk_size(8192)
mesh = m.extract_mesh(torch.load(T + "/out/codes.pt"), False, resolution=384)[0]
v = mesh.vertices.copy(); mesh.vertices = np.stack([-v[:, 1], v[:, 0], v[:, 2]], 1)
mesh.vertices -= [mesh.vertices[:, 0].mean(), mesh.vertices[:, 1].min(), mesh.vertices[:, 2].mean()]
mesh = max(mesh.split(only_watertight=False), key=lambda p: len(p.faces))
if mesh.volume < 0: mesh.invert()
trimesh.smoothing.filter_taubin(mesh, iterations=6); mesh.export(T + "/geo.glb")
PY
# 3. project the front and back art, bake one 2048 texture; 4. skeleton + automatic weights
python3 "$HERE/project_bake.py" "$T/geo.glb" "$WORK/body_front/p4/body.png" "$WORK/body_back/p4/body.png" "$T/textured.glb" 2048 40000
mkdir -p "$ROOT/assets/3d"
python3 "$HERE/rig3d.py" "$T/textured.glb" "$WORK/body_front/p4/body.png" "$WORK/body_front/p4/layout.json" "$ROOT/assets/3d/azure_knight.glb"
echo "done -> $ROOT/assets/3d/azure_knight.glb"
