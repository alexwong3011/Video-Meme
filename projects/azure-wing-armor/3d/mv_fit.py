"""Find the camera of each turntable view: yaw around the knight, elevation and distance, by matching silhouettes.
usage: mv_fit.py MODEL.glb CUT_DIR OUT.json      CUT_DIR/v1..v6.png = background-removed crops (x 560.., y 80..)
Camera: perspective, looking at the body centre; yaw 0 = in front of the knight (+Z), elevation measured from the floor.
"""
import sys, json, numpy as np, cv2, trimesh
model, cut, out = sys.argv[1:4]
sc = trimesh.load(model, force="scene"); mesh = sc.dump(concatenate=True) if hasattr(sc, "dump") else sc
V = np.asarray(mesh.vertices, np.float64); F = np.asarray(mesh.faces)
V = V - [ (V[:, 0].min() + V[:, 0].max()) / 2, V[:, 1].min(), (V[:, 2].min() + V[:, 2].max()) / 2 ]
Hm = V[:, 1].max(); target = np.array([0, Hm * 0.5, 0])
def project(yaw, elev, dist):
    cam = target + dist * Hm * np.array([np.cos(elev) * np.sin(yaw), np.sin(elev), np.cos(elev) * np.cos(yaw)])
    f = target - cam; f /= np.linalg.norm(f); r = np.cross(f, [0, 1, 0]); r /= np.linalg.norm(r); u = np.cross(r, f)
    d = V - cam; z = d @ f
    return np.stack([d @ r / z, -(d @ u) / z], 1), z
def sil(xy, box, size):
    (x0, y0, x1, y1), (W, H) = box, size
    q = np.round((xy - [x0, y0]) / [x1 - x0, y1 - y0] * [W - 1, H - 1]).astype(np.int32)
    m = np.zeros((H, W), np.uint8); cv2.fillPoly(m, list(q[F]), 1); return m
def clean(a):
    m = (a > 100).astype(np.uint8); m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(m, 8); return (lab == 1 + np.argmax(st[1:, 4])).astype(np.uint8)
res = {}
for i in range(1, 7):
    a = cv2.imread(f"{cut}/v{i}.png", cv2.IMREAD_UNCHANGED)[:, :, 3]; m = clean(a)
    ys, xs = np.where(m); bx = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
    Hs = 200; Ws = int(Hs * (bx[2] - bx[0]) / (bx[3] - bx[1])) + 1
    tgt = cv2.resize(m[bx[1]:bx[3], bx[0]:bx[2]], (Ws, Hs), interpolation=cv2.INTER_AREA) > 0
    best = (-1,)
    for elev in np.radians([30, 37, 45, 52]):
        for dist in (1.6, 2.4, 4.0):
            for yaw in np.radians(np.arange(0, 360, 5)):
                xy, _ = project(yaw, elev, dist)
                box = (xy[:, 0].min(), xy[:, 1].min(), xy[:, 0].max(), xy[:, 1].max())
                s = sil(xy, box, (Ws, Hs)).astype(bool); iou = (s & tgt).sum() / (s | tgt).sum()
                if iou > best[0]: best = (iou, yaw, elev, dist)
    iou, yaw, elev, dist = best
    # refine yaw/elev locally
    for yaw2 in yaw + np.radians(np.arange(-4, 5, 1)):
        for elev2 in elev + np.radians(np.arange(-5, 6, 2.5)):
            xy, _ = project(yaw2, elev2, dist); box = (xy[:, 0].min(), xy[:, 1].min(), xy[:, 0].max(), xy[:, 1].max())
            s = sil(xy, box, (Ws, Hs)).astype(bool); v = (s & tgt).sum() / (s | tgt).sum()
            if v > iou: iou, yaw, elev = v, yaw2, elev2
    res[f"v{i}"] = dict(yaw=float(np.degrees(yaw)) % 360, elev=float(np.degrees(elev)), dist=dist, iou=float(iou), bbox=[int(b) for b in bx])
    print(i, {k: (round(v, 3) if isinstance(v, float) else v) for k, v in res[f"v{i}"].items()}, flush=True)
json.dump(dict(height=float(Hm), views=res), open(out, "w"), indent=1)
