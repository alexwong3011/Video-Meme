#!/usr/bin/env python3
"""Cut an assembled body (pieces.py output of a body_* view) into rig parts for 2D skeletal animation.

usage: rig.py VIEW PIECES_DIR OUT_DIR [--preview preview.png] [--scales 4,2,1]
  Part polygons, pivots and draw order come from RIG below (reference-sheet px, screen-left = L).
  Each part is cut from the body matte; a part drawn *under* a neighbour also keeps a few px of that
  neighbour's area (hidden in the rest pose) so joints never open a gap when they move.
writes OUT_DIR/<part>.png and OUT_DIR/rig.json (pivot + parent offset per part, in reference px)
"""
import sys, os, json, numpy as np, cv2
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from views import VIEWS

def mirror(poly): return [(1800 - x, y) for x, y in poly][::-1]
def mp(p): return (1800 - p[0], p[1])

# z: draw order. parent: bone it hangs from. pivot: joint the part rotates about. All x mirrored about 900 for R.
FRONT = dict(
  head=dict(z=40, parent="torso", pivot=(900, 306),
            poly=[(832, 120), (968, 120), (968, 300), (942, 316), (858, 316), (832, 300)]),
  upperarm_L=dict(z=20, parent="torso", pivot=(786, 408),
            poly=[(728, 395), (815, 395), (818, 430), (812, 455), (806, 472), (728, 472)]),
  forearm_L=dict(z=22, parent="upperarm_L", pivot=(764, 472), grip=(731, 628),
            poly=[(690, 466), (808, 466), (798, 490), (792, 540), (786, 600), (768, 615), (766, 705), (690, 705)]),
  thigh_L=dict(z=10, parent="torso", pivot=(850, 574),
            poly=[(760, 548), (862, 548), (901, 604), (901, 706), (760, 706)]),
  shin_L=dict(z=12, parent="thigh_L", pivot=(832, 712),
            poly=[(740, 700), (902, 700), (902, 992), (740, 992)]),
  torso=dict(z=30, parent=None, pivot=(900, 560)),
)
BACK = dict(
  head=dict(z=40, parent="torso", pivot=(900, 296),
            poly=[(822, 120), (985, 120), (985, 250), (968, 288), (942, 302), (858, 302), (832, 288), (822, 250)]),
  upperarm_L=dict(z=20, parent="torso", pivot=(796, 458),
            poly=[(735, 445), (838, 445), (842, 470), (836, 520), (735, 520)]),
  forearm_L=dict(z=22, parent="upperarm_L", pivot=(782, 522), grip=(752, 632),
            poly=[(700, 516), (840, 516), (835, 540), (797, 548), (795, 705), (700, 705)]),
  thigh_L=dict(z=10, parent="torso", pivot=(848, 574),
            poly=[(780, 548), (862, 548), (901, 598), (901, 735), (780, 735)]),
  shin_L=dict(z=12, parent="thigh_L", pivot=(835, 740),
            poly=[(735, 728), (902, 728), (902, 992), (735, 992)]),
  torso=dict(z=30, parent=None, pivot=(900, 560)),
  # the back sheet is not symmetric on the right arm: explicit shapes instead of a mirror
  upperarm_R=dict(z=20, parent="torso", pivot=(1035, 452),
            poly=[(992, 440), (1072, 440), (1072, 525), (998, 525), (995, 480)]),
  forearm_R=dict(z=22, parent="upperarm_R", pivot=(1036, 527), grip=(1050, 632),
            poly=[(996, 518), (1100, 518), (1100, 705), (1000, 705), (1000, 560)]),
)
def full(r):
    out = {}
    for n, p in r.items():
        out[n] = dict(p)
        if n.endswith("_L") and n[:-2] + "_R" not in r:
            m = dict(p); m["poly"] = mirror(p["poly"]); m["pivot"] = mp(p["pivot"])
            if "grip" in p: m["grip"] = mp(p["grip"])
            if m["parent"].endswith("_L"): m["parent"] = m["parent"][:-2] + "_R"
            out[n[:-2] + "_R"] = m
    return out
RIG = {"body_front": full(FRONT), "body_back": full(BACK)}

if __name__ == "__main__":
    view, pdir, out = sys.argv[1], sys.argv[2], sys.argv[3]
    preview = sys.argv[sys.argv.index("--preview") + 1] if "--preview" in sys.argv else None
    os.makedirs(out, exist_ok=True)
    scales = [int(x) for x in sys.argv[sys.argv.index("--scales") + 1].split(",")] if "--scales" in sys.argv else None
    V = VIEWS[view]; R = RIG[view]; FX, FY = V["figure"][:2]
    L = json.load(open(os.path.join(pdir, "layout.json"))); s = L["scale"]; m = L["pieces"]["body"]
    scales = scales or [s]
    body = cv2.imread(os.path.join(pdir, "body.png"), cv2.IMREAD_UNCHANGED)
    H, W = round((V["figure"][3] - FY) * s), round((V["figure"][2] - FX) * s)
    canvas = np.zeros((H, W, 4), np.uint8); canvas[m["y"]:m["y"] + body.shape[0], m["x"]:m["x"] + body.shape[1]] = body
    P = lambda pts: np.array([[round((x - FX) * s), round((y - FY) * s)] for x, y in pts], np.int32)
    owned, taken = {}, np.zeros((H, W), bool)
    for n in sorted([n for n in R if "poly" in R[n]], key=lambda n: 0 if n == "head" else 1):
        mk = np.zeros((H, W), np.uint8); cv2.fillPoly(mk, [P(R[n]["poly"])], 1)
        owned[n] = mk.astype(bool) & ~taken; taken |= owned[n]
    owned["torso"] = ~taken
    # pinholes: dark crevices the matte left see-through, fully enclosed after a tiny closing -> opaque
    solid = (canvas[:, :, 3] > 128).astype(np.uint8)
    cl = cv2.morphologyEx(solid, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (int(3 * s) | 1, int(3 * s) | 1)))
    ff = cl.copy(); cv2.floodFill(ff, np.zeros((H + 2, W + 2), np.uint8), (0, 0), 1)
    holes = ((ff == 0) | ((cl == 1) & (solid == 0))).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(holes, 4)
    small = np.isin(lab, [i for i in range(1, n) if st[i, 4] <= 30 * s * s])      # real gaps (arm/torso) stay open
    canvas[:, :, 3] = np.where(small, 255, canvas[:, :, 3])
    alpha = canvas[:, :, 3] > 0
    d = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (int(10 * s) | 1, int(10 * s) | 1))
    rig = {}
    vis = np.zeros((H, W, 3), np.uint8)
    rng = np.random.default_rng(3)
    for n, p in R.items():
        above = np.zeros((H, W), bool)
        for q, pq in R.items():
            if pq["z"] > p["z"]: above |= owned[q]
        mask = owned[n] | (cv2.dilate(owned[n].astype(np.uint8), d).astype(bool) & above)
        part = canvas.copy(); part[:, :, 3] = np.where(mask, part[:, :, 3], 0)
        # drop stray specks (leftovers of leader lines) that are not attached to the part
        n_, lab_, st_, _ = cv2.connectedComponentsWithStats((part[:, :, 3] > 20).astype(np.uint8), 8)
        if n_ > 2:
            big = st_[1:, 4].max(); junk = [i for i in range(1, n_) if st_[i, 4] < 0.004 * big]
            part[:, :, 3] = np.where(np.isin(lab_, junk), 0, part[:, :, 3])
        ys, xs = np.where(part[:, :, 3] > 3)
        x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
        crop = part[y0:y1, x0:x1]
        files = {}
        for sc in scales:
            if sc == s: im = crop
            else:   # premultiplied resize so soft edges keep their colour
                f = crop.astype(np.float32); f[:, :, :3] *= f[:, :, 3:] / 255
                f = cv2.resize(f, (max(1, round(crop.shape[1] * sc / s)), max(1, round(crop.shape[0] * sc / s))), interpolation=cv2.INTER_AREA)
                f[:, :, :3] /= np.maximum(f[:, :, 3:], 1e-3) / 255; im = np.clip(f, 0, 255).astype(np.uint8)
            d_ = os.path.join(out, f"@{sc}x"); os.makedirs(d_, exist_ok=True)
            cv2.imwrite(os.path.join(d_, n + ".png"), im, [cv2.IMWRITE_PNG_COMPRESSION, 9]); files[f"@{sc}x"] = f"@{sc}x/{n}.png"
        ox, oy = FX + x0 / s, FY + y0 / s
        px, py = p["pivot"]
        e = dict(z=p["z"], parent=p["parent"], size=[round((x1 - x0) / s, 2), round((y1 - y0) / s, 2)],
                 origin=[round(ox, 2), round(oy, 2)],             # sprite top-left in reference px
                 pivot=[round(px - ox, 2), round(py - oy, 2)],    # joint inside the sprite, reference px
                 joint=[px, py])                                  # joint in reference px (rest pose)
        e["files"] = files
        if "grip" in p: e["grip"] = [p["grip"][0], p["grip"][1]]
        rig[n] = e
        vis[owned[n] & alpha] = rng.integers(60, 255, 3)
    json.dump(dict(view=view, origin=V["origin"], parts=rig), open(os.path.join(out, "rig.json"), "w"), indent=1)
    if preview:
        base = cv2.cvtColor(canvas[:, :, :3], cv2.COLOR_BGR2RGB) if False else canvas[:, :, :3]
        out_img = np.where(alpha[..., None], (base * 0.45 + vis * 0.55).astype(np.uint8), 30)
        for n, p in R.items():
            jx, jy = P([p["pivot"]])[0]; cv2.circle(out_img, (int(jx), int(jy)), max(3, int(2 * s)), (0, 255, 255), -1)
            if "grip" in p: gx, gy = P([p["grip"]])[0]; cv2.circle(out_img, (int(gx), int(gy)), max(3, int(2 * s)), (0, 0, 255), -1)
        cv2.imwrite(preview, out_img)
    print({n: rig[n]["size"] for n in rig})
