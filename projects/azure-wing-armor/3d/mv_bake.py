"""Re-texture the rigged knight from the turntable views.
usage: mv_bake.py MODEL.glb CUT_DIR FIT.json OLD_ALBEDO.png OUT_ALBEDO.png [size]
For every texel of the model's UV layout: its 3D point, the views that see it (z-buffer), and a weight from how squarely
the surface faces each camera. Each view also gives a mirrored view (the armour is symmetric) at the opposite yaw.
Texels no view reaches keep the previous albedo.
"""
import sys, json, numpy as np, cv2, trimesh
model, cut, fitp, old_p, out_p = sys.argv[1:6]; TS = int(sys.argv[6]) if len(sys.argv) > 6 else 2048
FIT = json.load(open(fitp)); BACK = {"v3", "v4", "v5"}
mesh = trimesh.load(model, force="scene").to_geometry()
V = np.asarray(mesh.vertices, np.float64); Fc = np.asarray(mesh.faces); UV = np.asarray(mesh.visual.uv, np.float64)
V = V - [(V[:, 0].min() + V[:, 0].max()) / 2, V[:, 1].min(), (V[:, 2].min() + V[:, 2].max()) / 2]
Hm = V[:, 1].max(); target = np.array([0, Hm * 0.5, 0])
FN = np.cross(V[Fc[:, 1]] - V[Fc[:, 0]], V[Fc[:, 2]] - V[Fc[:, 0]]); FN /= np.linalg.norm(FN, axis=1, keepdims=True) + 1e-12
# ---- texel rasterization in UV space
P3 = np.zeros((TS, TS, 3), np.float32); N3 = np.zeros((TS, TS, 3), np.float32); TID = np.full((TS, TS), -1, np.int32)
uvp = np.stack([UV[:, 0] * TS, (1 - UV[:, 1]) * TS], 1)
for t, (a, b, c) in enumerate(Fc):
    A, B, C = uvp[a], uvp[b], uvp[c]
    x0, x1 = int(max(0, np.floor(min(A[0], B[0], C[0])))), int(min(TS - 1, np.ceil(max(A[0], B[0], C[0]))))
    y0, y1 = int(max(0, np.floor(min(A[1], B[1], C[1])))), int(min(TS - 1, np.ceil(max(A[1], B[1], C[1]))))
    if x1 < x0 or y1 < y0: continue
    xs, ys = np.meshgrid(np.arange(x0, x1 + 1) + 0.5, np.arange(y0, y1 + 1) + 0.5)
    d = (B[1] - C[1]) * (A[0] - C[0]) + (C[0] - B[0]) * (A[1] - C[1])
    if abs(d) < 1e-9: continue
    l1 = ((B[1] - C[1]) * (xs - C[0]) + (C[0] - B[0]) * (ys - C[1])) / d; l2 = ((C[1] - A[1]) * (xs - C[0]) + (A[0] - C[0]) * (ys - C[1])) / d; l3 = 1 - l1 - l2
    m = (l1 >= -0.02) & (l2 >= -0.02) & (l3 >= -0.02)
    if not m.any(): continue
    yy, xx = (ys[m] - 0.5).astype(int), (xs[m] - 0.5).astype(int)
    P3[yy, xx] = l1[m][:, None] * V[a] + l2[m][:, None] * V[b] + l3[m][:, None] * V[c]; N3[yy, xx] = FN[t]; TID[yy, xx] = t
cov = TID >= 0; print("texels covered", round(cov.mean(), 3), flush=True)
pts, nrm = P3[cov].astype(np.float64), N3[cov].astype(np.float64)
def camera(yaw, elev, dist):
    cam = target + dist * Hm * np.array([np.cos(elev) * np.sin(yaw), np.sin(elev), np.cos(elev) * np.cos(yaw)])
    f = target - cam; f /= np.linalg.norm(f); r = np.cross(f, [0, 1, 0]); r /= np.linalg.norm(r); u = np.cross(r, f); return cam, f, r, u
def proj(X, cam, f, r, u):
    d = X - cam; z = d @ f; return np.stack([d @ r / z, -(d @ u) / z], 1), z
acc = np.zeros((len(pts), 3)); wsum = np.zeros(len(pts))
for name, v in FIT["views"].items():
    img = cv2.cvtColor(cv2.imread(f"{cut}/{name}.png", cv2.IMREAD_UNCHANGED), cv2.COLOR_BGRA2RGBA).astype(np.float32)
    yaw = v["yaw"] % 360
    if name in BACK and not 90 <= yaw <= 270: yaw = 180 - yaw      # silhouettes cannot tell front from back: the sheet can
    if name not in BACK and 90 < yaw < 270: yaw = 180 - yaw
    for mirror in (False, True):
        im = img[:, ::-1] if mirror else img; bx = v["bbox"]
        if mirror: bx = [img.shape[1] - bx[2], bx[1], img.shape[1] - bx[0], bx[3]]
        cam, f, r, u = camera(np.radians(-yaw if mirror else yaw), np.radians(v["elev"]), v["dist"])
        xyV, zV = proj(V, cam, f, r, u); X0, Y0 = xyV.min(0); X1, Y1 = xyV.max(0)
        toimg = lambda xy: np.stack([bx[0] + (xy[:, 0] - X0) / (X1 - X0) * (bx[2] - bx[0]), bx[1] + (xy[:, 1] - Y0) / (Y1 - Y0) * (bx[3] - bx[1])], 1)
        # depth buffer by painting faces far to near
        Hb, Wb = img.shape[:2]; db = np.full((Hb // 2, Wb // 2), np.inf, np.float32)
        q = (toimg(xyV) / 2).astype(np.int32); fz = zV[Fc].mean(1)
        for t in np.argsort(-fz): cv2.fillPoly(db, [q[Fc[t]]], float(fz[t]))
        xy, z = proj(pts, cam, f, r, u); pix = toimg(xy)
        px, py = np.clip((pix[:, 0] / 2).astype(int), 0, Wb // 2 - 1), np.clip((pix[:, 1] / 2).astype(int), 0, Hb // 2 - 1)
        vis = z <= db[py, px] + 0.012 * Hm * 4
        facing = np.clip(-(nrm @ f), 0, 1)
        n = len(pix); side = int(np.ceil(np.sqrt(n))); pad = side * side - n
        mx = np.concatenate([pix[:, 0], np.zeros(pad)]).astype(np.float32).reshape(side, side); my = np.concatenate([pix[:, 1], np.zeros(pad)]).astype(np.float32).reshape(side, side)
        samp = cv2.remap(im, mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=0).reshape(-1, 4)[:n]
        w = vis * facing ** 8 * np.clip((samp[:, 3] - 128) / 100, 0, 1) * (0.7 if mirror else 1.0)
        acc += w[:, None] * samp[:, :3]; wsum += w
        print(name, "mirror" if mirror else "", "yaw", round(-yaw if mirror else yaw), "texels hit", round((w > 0.05).mean(), 3), flush=True)
old = cv2.cvtColor(cv2.imread(old_p), cv2.COLOR_BGR2RGB).astype(np.float32)
old = cv2.resize(old, (TS, TS), interpolation=cv2.INTER_AREA)
newc = acc / np.maximum(wsum, 1e-6)[:, None]
# the old texture came from straight front/back projections: keep it where the surface faces those cameras
fz = np.abs(nrm[:, 2]); keep_old = np.clip((fz - 0.45) / 0.35, 0, 1)
blend = (np.clip(wsum / 0.02, 0, 1) * (1 - keep_old))[:, None]
res = old.copy(); oc = old[cov]
# match the new colours to the old texture's overall level so seams with fallback texels stay quiet
gain = np.median(oc[wsum > 0.02], 0) / np.maximum(np.median(newc[wsum > 0.02], 0), 1)
newc = np.clip(newc * gain, 0, 255)
res[cov] = newc * blend + oc * (1 - blend)
# pad UV islands so mip-mapping does not pull in black
mask = cov.astype(np.uint8); out = res.copy()
for _ in range(10):      # average of the covered neighbours (a max filter would brighten every seam)
    m3 = mask.astype(np.float32)[..., None]; num = cv2.blur(out * m3, (3, 3)); den = cv2.blur(m3[..., 0], (3, 3))[..., None]
    grow = (cv2.dilate(mask, np.ones((3, 3), np.uint8)) & (1 - mask)).astype(bool)
    out[grow] = (num / np.maximum(den, 1e-6))[grow]; mask = mask | grow.astype(np.uint8)
cv2.imwrite(out_p, cv2.cvtColor(np.clip(out, 0, 255).astype(np.uint8), cv2.COLOR_RGB2BGR))
print("texels from new views", round((blend[:, 0] > 0.5).mean(), 3), "gain", gain.round(2))
