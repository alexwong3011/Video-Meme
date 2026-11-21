#!/usr/bin/env python3
"""Cut the pose sheets (source/poses/poseNN.jpg) into game sprites without wings, pedestal or background.
usage: poses.py CUT_DIR OUT_DIR      CUT_DIR/pNN.png: background-removal mattes of the sheets
Pixels are classed by colour: armour (purple), feathers (blue), sword (gold / purple blade) are kept; the crystal wings
(bright, pale) and the pedestal (dull, inside its ellipse) are dropped; dark crevices enclosed by armour are filled back.
writes OUT_DIR/poseNN.webp (0.6x the sheet) and OUT_DIR/poses.json (anchor = between the feet, back = wing root, grip, blade guard->tip; px in the sprite)
"""
import sys, os, json, numpy as np, cv2
HERE = os.path.dirname(os.path.abspath(__file__))
# pedestal top ellipse (cx, cy, rx, ry) on each 1792x1008 sheet
# landmarks on each sheet: feet (ground point between the feet), back (wing root, upper back), grip (hands), guard -> tip (blade)
MARK = {"01": dict(feet=(910, 836), boots=((764, 850), (1057, 821)), back=(893, 400), grip=(1000, 307), guard=(879, 257), tip=(436, 64)),
        "02": dict(feet=(925, 822), boots=((771, 893), (1079, 750)), back=(929, 429), grip=(850, 493), guard=(793, 429), tip=(429, 29)),
        "03": dict(feet=(916, 803), boots=((699, 907), (1134, 699)), back=(915, 320), grip=(1026, 354), guard=(899, 421), tip=(327, 680)),
        "04": dict(feet=(882, 730), boots=((683, 789), (1081, 671)), back=(915, 330), grip=(727, 390), guard=(831, 493), tip=(1171, 907)),
        "05": dict(feet=(992, 826), boots=((866, 844), (1119, 807)), back=(880, 340), grip=(1037, 517), guard=(937, 553), tip=(457, 934))}
PED = {"01": (895, 800, 340, 205), "02": (930, 780, 345, 240), "03": (900, 770, 365, 245), "04": (890, 748, 365, 275), "05": (935, 732, 360, 290)}
cut, out = sys.argv[1], sys.argv[2]; OUT = 0.6; os.makedirs(out, exist_ok=True)
meta = {}
for k, (pcx, pcy, prx, pry) in PED.items():
    im = cv2.imread(os.path.join(HERE, "source", "poses", f"pose{k}.jpg")); H, W = im.shape[:2]
    alpha = cv2.imread(os.path.join(cut, f"p{k}.png"), cv2.IMREAD_UNCHANGED)[:, :, 3].astype(np.float32) / 255
    h, s, v = [c.astype(int) for c in cv2.split(cv2.cvtColor(im, cv2.COLOR_BGR2HSV))]
    wing = (v > 120) & (s < 140) & (((h >= 95) & (h <= 135)) | (s < 45))
    gold = (h >= 8) & (h <= 34) & (s > 60) & (v > 70)
    purple = (h >= 122) & (h <= 168) & (s > 40)
    blue = (h >= 98) & (h < 122) & (s >= 55) & (v <= 170)
    yy, xx = np.mgrid[0:H, 0:W]
    ped = (((xx - pcx) / prx) ** 2 + ((yy - pcy) / pry) ** 2 <= 1.2) | ((np.abs(xx - pcx) < prx * 1.05) & (yy > pcy))
    keep = (purple | blue | gold) & (alpha > 0.3)
    M_ = MARK[k]; (bx0, by0), (bx1, by1) = M_["boots"]
    below = yy > by0 + (by1 - by0) * (xx - bx0) / (bx1 - bx0) + 12           # under the line through both soles
    g0, t0 = np.array(M_["guard"], float), np.array(M_["tip"], float); d = t0 - g0
    u = np.clip(((xx - g0[0]) * d[0] + (yy - g0[1]) * d[1]) / (d @ d), 0, 1)
    near_blade = np.hypot(xx - g0[0] - u * d[0], yy - g0[1] - u * d[1]) < 70
    keep &= ~(ped & below & ~gold & ~near_blade)                               # pedestal under the feet
    keep &= ~(ped & ~below & (s < 62) & ~gold)                                 # pedestal seen between the legs                       # dull pixels on the pedestal are the pedestal
    keep |= near_blade & (alpha > 0.5) & ~wing & (u > 0.03) & ~(ped & (s < 62))   # dark facets of the blade (not the pedestal)
    wd = cv2.blur(wing.astype(np.float32), (31, 31))
    keep &= ~((wd > 0.4) & ~gold & ~near_blade)                                # crystal scraps stuck to the armour edge
    keep = cv2.morphologyEx(keep.astype(np.uint8), cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    keep = cv2.morphologyEx(keep, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (11, 11)))
    # fill enclosed dark gaps (boot soles, joints) but not windows onto the wings
    ff = keep.copy(); cv2.floodFill(ff, np.zeros((H + 2, W + 2), np.uint8), (0, 0), 1)
    n, lab, st, _ = cv2.connectedComponentsWithStats((1 - ff).astype(np.uint8), 4)
    for i in range(1, n):
        m = lab == i
        if st[i, 4] < 2500 or (wing[m].mean() < 0.08 and st[i, 4] < 9000): keep[m] = 1
    n, lab, st, _ = cv2.connectedComponentsWithStats(keep, 8)
    big = st[1:, 4].max(); keep = np.isin(lab, [i for i in range(1, n) if st[i, 4] > 0.08 * big]).astype(np.uint8)
    a = np.minimum(alpha, cv2.GaussianBlur(keep.astype(np.float32), (0, 0), 0.8))
    a = np.clip((a - 0.05) / 0.95, 0, 1)
    ys, xs = np.where(a > 0.05); x0, x1, y0, y1 = xs.min() - 2, xs.max() + 3, ys.min() - 2, ys.max() + 3
    rgba = np.dstack([im, a * 255])[y0:y1, x0:x1]
    # game size: 0.6x the sheet (premultiplied resize), WebP
    f = rgba.astype(np.float32); f[:, :, :3] *= f[:, :, 3:] / 255
    f = cv2.resize(f, None, fx=OUT, fy=OUT, interpolation=cv2.INTER_AREA); f[:, :, :3] /= np.maximum(f[:, :, 3:], 1e-3) / 255
    cv2.imwrite(os.path.join(out, f"pose{k}.webp"), np.clip(f, 0, 255).astype(np.uint8), [cv2.IMWRITE_WEBP_QUALITY, 92])
    x0, y0 = int(x0), int(y0); o = lambda p: [round(float(p[0] - x0) * OUT, 1), round(float(p[1] - y0) * OUT, 1)]
    anchor = M_["feet"]
    meta[k] = dict(file=f"pose{k}.webp", size=[f.shape[1], f.shape[0]], scale=OUT, anchor=o(M_["feet"]), back=o(M_["back"]), grip=o(M_["grip"]),
                   blade=o(M_["guard"]) + o(M_["tip"]))
    print(k, meta[k])
json.dump(meta, open(os.path.join(out, "poses.json"), "w"), indent=1)
