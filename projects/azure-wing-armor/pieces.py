"""Cut each armor piece of one view from its figure crop with a background-difference matte.
usage: pieces.py VIEW SCALE IMG.png OUTDIR
  IMG = figure crop at SCALE x the reference resolution; cwd holds bg.npy / am.npy from matte.py"""
import numpy as np, cv2, sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from views import VIEWS
V = VIEWS[sys.argv[1]]; s = int(sys.argv[2]); src = sys.argv[3]; out = sys.argv[4]; os.makedirs(out, exist_ok=True)
FX, FY = V["figure"][:2]
fig = cv2.cvtColor(cv2.imread(src), cv2.COLOR_BGR2RGB).astype(np.float32)
H, W = fig.shape[:2]
bg = cv2.resize(np.load("bg.npy"), (W, H), interpolation=cv2.INTER_CUBIC)
am = cv2.resize(np.load("am.npy"), (W, H), interpolation=cv2.INTER_LINEAR)
D = np.sqrt(((fig - bg) ** 2).sum(2))
D = cv2.GaussianBlur(D, (0, 0), 0.35 * s)
ell = lambda d: cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (int(d) | 1, int(d) | 1))

def P(pts): return np.array([[round((x - FX + 0.5) * s - 0.5), round((y - FY + 0.5) * s - 0.5)] for x, y in pts], np.int32)
def poly(pts):
    m = np.zeros((H, W), np.uint8); cv2.fillPoly(m, [P(pts)], 1); return m

regions = {}
for name, ops in V["regions"].items():
    R = np.zeros((H, W), np.uint8)
    for sign, shape in ops:
        m = regions[shape] if isinstance(shape, str) else poly(shape)
        R = (R | m) if sign == "+" else (R & (1 - m))
    regions[name] = R

# things that are not armour: leader lines, their dots, text-panel borders, the floor under the soles
excl = np.zeros((H, W), np.uint8)
for L in V["lines"]:
    pts, t = L if isinstance(L, tuple) else (L, 7)
    cv2.polylines(excl, [P(pts)], False, 1, thickness=int(t * s))
for x, y, r in V["dots"]: cv2.circle(excl, tuple(int(v) for v in P([(x, y)])[0]), int(round(r * s)), 1, -1)
for e in V["erase"]: excl |= poly(e)
keepR = 1 - excl
solid = np.zeros((H, W), np.uint8)
for e in V.get("solid", []): solid |= poly(e)

# soft matte from colour distance to the background; stricter on the lit floor
yy = (np.arange(H)[:, None] / s + FY) * np.ones((1, W))
floor = np.clip((yy - V["floor_y"]) / 30, 0, 1)
t0, t1 = 7.0 + 6 * floor, 20.0 + 6 * floor
A = np.clip((D - t0) / (t1 - t0), 0, 1); A = A * A * (3 - 2 * A); A *= keepR
lumd = (fig - bg).mean(2)
Bo = cv2.morphologyEx((A > 0.5).astype(np.uint8), cv2.MORPH_OPEN, ell(round(1.6 * s)))
meta = {}
for name, R in regions.items():
    # core = sizeable opened components; keep every soft-matte component that touches the core
    n, lab, st, _ = cv2.connectedComponentsWithStats(Bo & R, 8)
    if n <= 1: continue
    big = st[1:, cv2.CC_STAT_AREA].max()
    core = np.isin(lab, [i for i in range(1, n) if st[i, cv2.CC_STAT_AREA] >= 0.03 * big]).astype(np.uint8)
    Ar = A * R
    n, lab, st, _ = cv2.connectedComponentsWithStats((Ar > 0.06).astype(np.uint8), 8)
    ids = np.unique(lab[core > 0]); ids = ids[ids > 0]
    Ar = Ar * np.isin(lab, ids)
    # fill enclosed holes that are darker than the background (inner faces of the armour)
    sol = (Ar > 0.3).astype(np.uint8)
    cl = cv2.morphologyEx(sol, cv2.MORPH_CLOSE, ell(5 * s))
    ff = cl.copy(); cv2.floodFill(ff, np.zeros((H + 2, W + 2), np.uint8), (0, 0), 1)
    holes = ((1 - ff) | (cl & (1 - sol))).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(holes, 4)
    fill = np.zeros_like(holes)
    for i in range(1, n):
        msk = lab == i
        if (not ff[msk].all() and lumd[msk].mean() < -5) or st[i, 4] <= (1.5 * s) ** 2 * 4: fill[msk] = 1
    a = np.maximum(Ar, fill.astype(np.float32) * R * keepR)
    sil = (cl | (1 - ff)).astype(np.uint8) * R * keepR
    # shaded armour close to the background colour, and the segmentation model's confident interior
    a = np.maximum(a, np.clip((-lumd - 4) / 8, 0, 1) * sil)
    amc = cv2.erode((am > 0.9).astype(np.uint8), ell(3 * s))
    a = np.maximum(a, amc * cv2.dilate(sil, np.ones((3, 3), np.uint8)) * R * keepR)
    a = np.maximum(a, solid * R)
    # de-speckle the soft zone, drop faint haze and stray specks
    med = cv2.medianBlur((a * 255).astype(np.uint8), 5 if s > 1 else 3).astype(np.float32) / 255
    a = np.where((a > 0.02) & (a < 0.98), med, a)
    a = np.clip((a - 0.08) / 0.92, 0, 1)
    n, lab, st, _ = cv2.connectedComponentsWithStats((a > 0.02).astype(np.uint8), 8)
    if n > 2:
        main = 1 + np.argmax(st[1:, 4]); keepc = [i for i in range(1, n) if i == main or st[i, 4] > 0.01 * st[main, 4]]
        a = a * np.isin(lab, keepc)
    # colour decontamination: remove background spill from soft edges
    F = np.clip(bg + (fig - bg) / np.maximum(a, 0.25)[..., None], 0, 255)
    F = np.where(a[..., None] > 0.98, fig, F)
    ys, xs = np.where(a > 0.02); x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    pad = 2 * s; x0 = max(0, x0 - pad); y0 = max(0, y0 - pad); x1 = min(W, x1 + pad); y1 = min(H, y1 + pad)
    rgba = np.dstack([F, a * 255])[y0:y1, x0:x1]
    cv2.imwrite(f"{out}/{name}.png", cv2.cvtColor(np.round(rgba).astype(np.uint8), cv2.COLOR_RGBA2BGRA))
    meta[name] = {"x": int(x0), "y": int(y0), "w": int(x1 - x0), "h": int(y1 - y0)}
json.dump({"view": sys.argv[1], "scale": s, "figure": V["figure"], "pieces": meta}, open(f"{out}/layout.json", "w"), indent=1)
print(meta)
