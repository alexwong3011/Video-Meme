#!/usr/bin/env python3
"""Cut the 45-degree turntable views (source/turntable/viewNN.jpg) into rig-ready bodies for rig.py.
usage: turntable.py CUT_DIR OUT_DIR [UPSCALED_DIR]
  CUT_DIR/viewNN.png       background-removal mattes (cutout.mjs); the model keeps the pedestal, so it is removed here:
                           dull blue-grey pixels on the pedestal ellipse, everything below the line through both soles,
                           and the glossy reflection / cast shadow next to the boots.
  UPSCALED_DIR/figNN_x4.png optional 4x upscale of the figure crop (upscale.mjs); without it the body is written at 1x.
writes OUT_DIR/body_<name>45/{body.png, layout.json}  (the pieces.py layout rig.py reads)
"""
import sys, os, json, numpy as np, cv2
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from views import VIEWS
NAMES = {"01": "front", "02": "quarter", "04": "back"}
PED = {"01": (900, 800, 345, 205), "02": (905, 795, 345, 205), "04": (905, 795, 345, 205)}     # pedestal top ellipse
SOLE = {"01": ((770, 842), (940, 922)), "02": ((790, 807), (910, 922)), "04": ((800, 887), (1010, 852))}
ERASE = {"02": [(818, 793, 880, 830)]}                                                        # shadow pool under a heel
cut, out = sys.argv[1], sys.argv[2]; up = sys.argv[3] if len(sys.argv) > 3 else None
for v, name in NAMES.items():
    V = VIEWS[f"body_{name}45"]; FX, FY, FX1, FY1 = V["figure"]
    im = cv2.imread(os.path.join(HERE, V["source"])); H, W = im.shape[:2]
    alpha = cv2.imread(os.path.join(cut, f"view{v}.png"), cv2.IMREAD_UNCHANGED)[:, :, 3].astype(np.float32) / 255
    h, s, val = [c.astype(int) for c in cv2.split(cv2.cvtColor(im, cv2.COLOR_BGR2HSV))]
    cx, cy, rx, ry = PED[v]; yy, xx = np.mgrid[0:H, 0:W]
    ped = (((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2 <= 1.25) | ((np.abs(xx - cx) < rx * 1.1) & (yy > cy))
    pedcol = ((h <= 125) & (s < 80)) | ((val < 30) & (s < 90)) | (h < 100)
    keep = ((alpha > 0.3) & ~(ped & pedcol)).astype(np.uint8)
    keep[:75] = 0
    (bx0, by0), (bx1, by1) = SOLE[v]; sole = by0 + (by1 - by0) * (xx - bx0) / (bx1 - bx0)
    keep[(yy > sole - 30) & (val < 48)] = 0
    keep[yy > sole + 6] = 0
    for x0, y0, x1, y1 in ERASE.get(v, []): keep[y0:y1, x0:x1] = 0
    keep[(yy > sole - 160) & (val < 24) & (h <= 124) & (alpha < 0.97)] = 0
    keep = cv2.morphologyEx(keep, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    keep = cv2.morphologyEx(keep, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7)))
    ff = keep.copy(); cv2.floodFill(ff, np.zeros((H + 2, W + 2), np.uint8), (0, 0), 1)       # enclosed holes (visor, joints)
    n, lab, st, _ = cv2.connectedComponentsWithStats((1 - ff).astype(np.uint8), 4)
    for i in range(1, n):
        if st[i, 4] < 1500: keep[lab == i] = 1
    n, lab, st, _ = cv2.connectedComponentsWithStats(keep, 8)
    big = st[1:, 4].max(); keep = np.isin(lab, [i for i in range(1, n) if st[i, 4] > 0.06 * big]).astype(np.uint8)
    a = np.minimum(np.where(keep > 0, np.maximum(alpha, 0.9), alpha), cv2.GaussianBlur(keep.astype(np.float32), (0, 0), 0.7))
    a = a[FY:FY1, FX:FX1]; rgb = im[FY:FY1, FX:FX1]; sc = 1
    upf = up and os.path.join(up, f"fig{v}_x4.png")
    if upf and os.path.exists(upf):
        rgb = cv2.imread(upf); sc = 4
        a = cv2.resize(a, (rgb.shape[1], rgb.shape[0]), interpolation=cv2.INTER_CUBIC).clip(0, 1)
        a = cv2.GaussianBlur(a, (0, 0), 1.2)
        a = np.clip((a - 0.5) * 1.6 + 0.5, 0, 1)                                                # crisp edge after the 4x resize
    d = os.path.join(out, f"body_{name}45"); os.makedirs(d, exist_ok=True)
    cv2.imwrite(os.path.join(d, "body.png"), np.dstack([rgb, (a * 255).astype(np.uint8)]))
    json.dump(dict(scale=sc, pieces=dict(body=dict(x=0, y=0))), open(os.path.join(d, "layout.json"), "w"))
    print(name, sc, rgb.shape)
