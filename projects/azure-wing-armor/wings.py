#!/usr/bin/env python3
"""Cut the three wing sheets into a left and right wing each, with a root (attach) point.

usage: wings.py CUT_DIR OUT_DIR
  CUT_DIR/<name>_{L,R}.png: segmentation mattes of the sheet halves at 1.5x (cutout.mjs on crops made below)
  Crystal-feather wings sit on a dark sheet with grid lines: keyed by brightness instead, thin lines removed.
writes OUT_DIR/<name>/{L,R}.png and OUT_DIR/wings.json
  root: attach point in the sprite (px), span: sprite size (px); L = wing on the screen-left when seen from behind.
"""
import sys, os, json, numpy as np, cv2
HERE = os.path.dirname(os.path.abspath(__file__))
K = 1.5
OUT = 0.5
WINGS = {   # root = attach point as a fraction of the screen-left wing sprite; the right wing mirrors it
  "crystal-bat":     dict(name_vi="Cánh Dơi Pha Lê", root=(0.82, 0.33), glow="#bcd8ff", key="model"),
  "crystal-feather": dict(name_vi="Cánh Lông Vũ Pha Lê", root=(0.86, 0.47), glow="#e6f0ff", key="luma"),
  "dragon":          dict(name_vi="Cánh Long Lam", root=(0.74, 0.30), glow="#5f8bff", key="model"),
}
cut, out = sys.argv[1], sys.argv[2]
meta = {}
for name, w in WINGS.items():
    src = cv2.imread(os.path.join(HERE, "source", f"wings-{name}.jpg"))
    os.makedirs(os.path.join(out, name), exist_ok=True); meta[name] = dict(name_vi=w["name_vi"], glow=w["glow"])
    for side, x0 in (("L", 0), ("R", 896)):
        half = cv2.resize(src[:, x0:x0 + 896], None, fx=K, fy=K, interpolation=cv2.INTER_LANCZOS4).astype(np.float32)
        if w["key"] == "model":
            a = cv2.imread(os.path.join(cut, f"{name}_{side}.png"), cv2.IMREAD_UNCHANGED)[:, :, 3].astype(np.float32) / 255
        else:
            lum = half.mean(2); d = lum - np.percentile(lum, 25)
            m = (d > 45).astype(np.uint8)
            m = cv2.morphologyEx(m, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7)))     # kills 1-3 px grid lines
            n, lab, st, _ = cv2.connectedComponentsWithStats(m, 8); big = 1 + np.argmax(st[1:, 4]); m = (lab == big).astype(np.uint8)
            m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (25, 25)))
            ff = m.copy(); cv2.floodFill(ff, np.zeros((m.shape[0] + 2, m.shape[1] + 2), np.uint8), (0, 0), 1); m = m | (1 - ff)
            soft = np.clip((d - 15) / 40, 0, 1)
            a = np.maximum(cv2.erode(m, np.ones((9, 9), np.uint8)).astype(np.float32), soft * cv2.dilate(m, np.ones((5, 5), np.uint8)))
            a = cv2.GaussianBlur(a, (0, 0), 0.8)
        a = np.clip((a - 0.06) / 0.94, 0, 1)
        n, lab, st, _ = cv2.connectedComponentsWithStats((a > 0.1).astype(np.uint8), 8)
        if n > 2: big = 1 + np.argmax(st[1:, 4]); a *= np.isin(lab, [i for i in range(1, n) if i == big or st[i, 4] > 0.02 * st[big, 4]])
        # decontaminate: the sheet background bleeds into soft edges
        bgc = np.median(half[a < 0.02], axis=0)
        F = np.clip(bgc + (half - bgc) / np.maximum(a, 0.2)[..., None], 0, 255)
        ys, xs = np.where(a > 0.03); X0, X1, Y0, Y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
        rgba = np.dstack([F, a * 255])[Y0:Y1, X0:X1]
        # game size: half of the 1.5x cut (0.75x the sheet), premultiplied resize
        f = rgba.astype(np.float32); f[:, :, :3] *= f[:, :, 3:] / 255
        f = cv2.resize(f, None, fx=OUT, fy=OUT, interpolation=cv2.INTER_AREA); f[:, :, :3] /= np.maximum(f[:, :, 3:], 1e-3) / 255
        rgba = np.clip(f, 0, 255); X0, Y0, X1, Y1 = 0, 0, rgba.shape[1], rgba.shape[0]
        cv2.imwrite(os.path.join(out, name, side + ".png"), np.round(rgba).astype(np.uint8), [cv2.IMWRITE_PNG_COMPRESSION, 9])
        fx, fy = w["root"]; fx = fx if side == "L" else 1 - fx
        rxl, ryl = fx * (X1 - X0), fy * (Y1 - Y0)
        meta[name][side] = dict(file=f"{name}/{side}.png", size=[int(X1 - X0), int(Y1 - Y0)], root=[round(rxl, 1), round(ryl, 1)])
json.dump(meta, open(os.path.join(out, "wings.json"), "w"), ensure_ascii=False, indent=1)
print(json.dumps(meta, ensure_ascii=False)[:600])
