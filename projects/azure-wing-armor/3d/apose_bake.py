#!/usr/bin/env python3
"""Paint the A-pose reference views straight onto the Meshy model's texture.
usage: apose_bake.py MODEL.glb VIEW_DIR OLD_ALBEDO.png OUT_ALBEDO.png [size]
  MODEL.glb    the static A-pose model from Multi-Image to 3D (same UV layout as the rigged one)
  VIEW_DIR     {front,left,back,right}.png with alpha: the cleaned A-pose set (apose.py, transparent)
  The views are orthographic at chest height. glTF axes: +Y up, the knight faces +Z, its left hand is +X.
    front: camera on +Z, image right = +X      back:  camera on -Z, image right = -X
    left:  camera on +X, image right = -Z      right: camera on -X, image right = +Z
  For every texel: its 3D point and normal (rasterised in UV space), the views that see it (depth buffer) and a weight from
  how squarely the surface faces each view; the views' colours replace Meshy's texture where they reach, blended at the edges.
  Each view is registered to the mesh by matching silhouettes (scale and offset), so small framing errors do not smear detail.
"""
import sys, numpy as np, cv2, trimesh
model, vdir, old_p, out_p = sys.argv[1:5]; TS = int(sys.argv[5]) if len(sys.argv) > 5 else 4096
mesh = trimesh.load(model, force="scene").to_geometry()
V = np.asarray(mesh.vertices, np.float64); F = np.asarray(mesh.faces); UV = np.asarray(mesh.visual.uv, np.float64)
FN = np.cross(V[F[:, 1]] - V[F[:, 0]], V[F[:, 2]] - V[F[:, 0]]); FN /= np.linalg.norm(FN, axis=1, keepdims=True) + 1e-12
print("faces", len(F), "verts", len(V), "height", round(np.ptp(V[:, 1]), 3), flush=True)
VIEWS = {"front": ([1, 0, 0], [0, 0, 1]), "back": ([-1, 0, 0], [0, 0, -1]), "left": ([0, 0, -1], [1, 0, 0]), "right": ([0, 0, 1], [-1, 0, 0])}

# ---- texels: 3D point and normal of every covered texel
P3 = np.zeros((TS, TS, 3), np.float32); N3 = np.zeros((TS, TS, 3), np.float32); cov = np.zeros((TS, TS), bool)
uvp = np.stack([UV[:, 0] * TS, (1 - UV[:, 1]) * TS], 1)
for t, (a, b, c) in enumerate(F):
    A, B, C = uvp[a], uvp[b], uvp[c]
    x0, x1 = int(max(0, np.floor(min(A[0], B[0], C[0])))), int(min(TS - 1, np.ceil(max(A[0], B[0], C[0]))))
    y0, y1 = int(max(0, np.floor(min(A[1], B[1], C[1])))), int(min(TS - 1, np.ceil(max(A[1], B[1], C[1]))))
    if x1 < x0 or y1 < y0: continue
    d = (B[1] - C[1]) * (A[0] - C[0]) + (C[0] - B[0]) * (A[1] - C[1])
    if abs(d) < 1e-12: continue
    xs, ys = np.meshgrid(np.arange(x0, x1 + 1) + 0.5, np.arange(y0, y1 + 1) + 0.5)
    l1 = ((B[1] - C[1]) * (xs - C[0]) + (C[0] - B[0]) * (ys - C[1])) / d; l2 = ((C[1] - A[1]) * (xs - C[0]) + (A[0] - C[0]) * (ys - C[1])) / d; l3 = 1 - l1 - l2
    m = (l1 >= -0.01) & (l2 >= -0.01) & (l3 >= -0.01)
    if not m.any(): continue
    yy, xx = (ys[m] - 0.5).astype(int), (xs[m] - 0.5).astype(int)
    P3[yy, xx] = l1[m][:, None] * V[a] + l2[m][:, None] * V[b] + l3[m][:, None] * V[c]; N3[yy, xx] = FN[t]; cov[yy, xx] = True
print("texels covered", round(cov.mean(), 3), flush=True)
pts, nrm = P3[cov].astype(np.float64), N3[cov].astype(np.float64)

def sil(q, W, H):
    m = np.zeros((H, W), np.uint8); cv2.fillPoly(m, list(np.round(q[F]).astype(np.int32)), 1); return m
acc = np.zeros((len(pts), 3)); wsum = np.zeros(len(pts))
for name, (right, toward) in VIEWS.items():
    img = cv2.cvtColor(cv2.imread(f"{vdir}/{name}.png", cv2.IMREAD_UNCHANGED), cv2.COLOR_BGRA2RGBA).astype(np.float32)
    H, W = img.shape[:2]; right, toward = np.array(right, float), np.array(toward, float)
    u, v, z = V @ right, V[:, 1], V @ toward                      # image right, up, toward the camera
    am = img[:, :, 3] > 128; ys_, xs_ = np.where(am); bx = (xs_.min(), ys_.min(), xs_.max(), ys_.max())
    k0 = (bx[3] - bx[1]) / (v.max() - v.min())
    best = (-1, None)
    small = 0.25; tgt = cv2.resize(am.astype(np.uint8), (int(W * small), int(H * small)), interpolation=cv2.INTER_AREA) > 0
    for ks in np.linspace(0.96, 1.04, 9):                        # register: scale and offset with the best silhouette overlap
        k = k0 * ks; ox0 = (bx[0] + bx[2]) / 2 - k * (u.max() + u.min()) / 2; oy0 = bx[3] + k * v.min()
        for dx in range(-24, 25, 6):
            for dy in range(-24, 25, 6):
                q = np.stack([(ox0 + dx + k * u) * small, (oy0 + dy - k * v) * small], 1)
                s = sil(q, tgt.shape[1], tgt.shape[0]) > 0; iou = (s & tgt).sum() / max(1, (s | tgt).sum())
                if iou > best[0]: best = (iou, (k, ox0 + dx, oy0 + dy))
    k, ox, oy = best[1]; print(name, "silhouette IoU", round(best[0], 3), flush=True)
    toimg = lambda U, Vv: np.stack([ox + k * U, oy - k * Vv], 1)
    # depth buffer (larger = nearer the camera), half resolution, faces painted far to near
    db = np.full((H // 2, W // 2), -np.inf, np.float32); q = (toimg(u, v) / 2).astype(np.int32); fz = z[F].mean(1)
    for t in np.argsort(fz): cv2.fillPoly(db, [q[F[t]]], float(fz[t]))
    pu, pv, pz = pts @ right, pts[:, 1], pts @ toward; pix = toimg(pu, pv)
    px, py = np.clip((pix[:, 0] / 2).astype(int), 0, W // 2 - 1), np.clip((pix[:, 1] / 2).astype(int), 0, H // 2 - 1)
    vis = pz >= db[py, px] - 0.015 * np.ptp(V[:, 1])
    facing = np.clip(nrm @ toward, 0, 1)
    n = len(pix); side = int(np.ceil(np.sqrt(n))); pad = side * side - n
    mx = np.concatenate([pix[:, 0], np.zeros(pad)]).astype(np.float32).reshape(side, side); my = np.concatenate([pix[:, 1], np.zeros(pad)]).astype(np.float32).reshape(side, side)
    samp = cv2.remap(img, mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=0).reshape(-1, 4)[:n]
    w = vis * facing ** 4 * np.clip((samp[:, 3] - 128) / 100, 0, 1) * (0.8 if name == "right" else 1.0)   # right = mirrored left
    acc += w[:, None] * samp[:, :3]; wsum += w
    print(name, "texels hit", round((w > 0.05).mean(), 3), flush=True)

old = cv2.cvtColor(cv2.imread(old_p), cv2.COLOR_BGR2RGB).astype(np.float32); old = cv2.resize(old, (TS, TS), interpolation=cv2.INTER_CUBIC)
oc = old[cov]; newc = acc / np.maximum(wsum, 1e-6)[:, None]
sel = wsum > 0.05
gain = np.median(oc[sel], 0) / np.maximum(np.median(newc[sel], 0), 1); gain = np.clip(gain, 0.8, 1.25)   # gentle level match only
newc = np.clip(newc * gain, 0, 255)
blend = np.clip(wsum / 0.12, 0, 1)[:, None]
res = old.copy(); res[cov] = newc * blend + oc * (1 - blend)
mask = cov.astype(np.uint8); out = res.copy()
for _ in range(12):     # pad UV islands with the average of covered neighbours
    m3 = mask.astype(np.float32)[..., None]; num = cv2.blur(out * m3, (3, 3)); den = cv2.blur(m3[..., 0], (3, 3))[..., None]
    grow = (cv2.dilate(mask, np.ones((3, 3), np.uint8)) & (1 - mask)).astype(bool)
    out[grow] = (num / np.maximum(den, 1e-6))[grow]; mask = mask | grow.astype(np.uint8)
cv2.imwrite(out_p, cv2.cvtColor(np.clip(out, 0, 255).astype(np.uint8), cv2.COLOR_RGB2BGR))
print("projected share", round(float((blend[:, 0] > 0.5).mean()), 3), "gain", np.round(gain, 3), "->", out_p)
