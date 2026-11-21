#!/usr/bin/env python3
"""Clean the A-pose views ({front,side,back}.jpg) into a matched multi-view set for image-to-3D tools.
usage: apose.py SRC_DIR CUT_DIR OUT_DIR
  SRC_DIR/{front,side,back}.jpg (or .png): the generated A-pose views; side = the character's LEFT side (facing screen-left)
  CUT_DIR/{front,side,back}.png: background-removal mattes of those files (cutout.mjs)
  - enclosed holes the matte left (visor slit, dark gaps) are filled from the original pixels; stray specks dropped
  - one common scale for every view (taken from the front), soles on one line, body centred, 2048 px square canvas
  - side.jpg faces screen-left, i.e. the knight's LEFT side; the right view is its mirror (the body has no asymmetric gear)
writes OUT_DIR/transparent/{front,left,back,right}.png, OUT_DIR/white/{...}.png and OUT_DIR/preview.jpg
"""
import sys, os, cv2, numpy as np
src_dir, cut, out = sys.argv[1], sys.argv[2], sys.argv[3]
def src_img(v):
    for ext in (".jpg", ".jpeg", ".png", ".webp"):
        p = os.path.join(src_dir, v + ext)
        if os.path.exists(p): return cv2.imread(p)
    raise SystemExit("missing " + os.path.join(src_dir, v) + ".jpg/.png")
SIZE, FIG, FOOT = 2048, 1720, 1900                     # canvas, figure height of the front view, sole line
views = {}
for v in ["front", "side", "back"]:
    rgb = src_img(v)
    a = cv2.imread(os.path.join(cut, v + ".png"), cv2.IMREAD_UNCHANGED)[:, :, 3]
    solid = (a > 128).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(solid, 8)              # keep the body, drop specks
    big = st[1:, 4].max(); body = np.isin(lab, [i for i in range(1, n) if st[i, 4] > 0.02 * big])
    a = np.where(body | (cv2.dilate(body.astype(np.uint8), np.ones((5, 5), np.uint8)) > 0), a, 0)
    ff = (a > 128).astype(np.uint8); fl = ff.copy(); cv2.floodFill(fl, np.zeros((ff.shape[0] + 2, ff.shape[1] + 2), np.uint8), (0, 0), 1)
    n, lab, st, _ = cv2.connectedComponentsWithStats((1 - fl).astype(np.uint8), 4)   # holes not connected to the outside
    for i in range(1, n):
        if st[i, 4] < 0.01 * body.sum(): a[lab == i] = 255
    views[v] = (rgb, a)
ys, xs = np.where(views["front"][1] > 128); k = FIG / (ys.max() - ys.min())
os.makedirs(os.path.join(out, "transparent"), exist_ok=True); os.makedirs(os.path.join(out, "white"), exist_ok=True)
res = {}
for v, (rgb, a) in views.items():
    ys, xs = np.where(a > 128); x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    rgba = np.dstack([rgb, a])[y0:y1 + 1, x0:x1 + 1].astype(np.float32)
    rgba[:, :, :3] *= rgba[:, :, 3:] / 255                                     # premultiplied resize keeps clean edges
    rgba = cv2.resize(rgba, None, fx=k, fy=k, interpolation=cv2.INTER_LANCZOS4 if k > 1 else cv2.INTER_AREA).clip(0, 255)
    rgba[:, :, :3] /= np.maximum(rgba[:, :, 3:], 1e-3) / 255
    canvas = np.zeros((SIZE, SIZE, 4), np.float32); h, w = rgba.shape[:2]
    cx = SIZE // 2 - w // 2; cy = FOOT - h
    canvas[cy:cy + h, cx:cx + w] = rgba
    res[{"side": "left"}.get(v, v)] = canvas.clip(0, 255).astype(np.uint8)
res["right"] = res["left"][:, ::-1].copy()
for v, im in res.items():
    cv2.imwrite(os.path.join(out, "transparent", v + ".png"), im)
    f = im[:, :, 3:].astype(np.float32) / 255; wbg = (im[:, :, :3] * f + 255 * (1 - f)).astype(np.uint8)
    cv2.imwrite(os.path.join(out, "white", v + ".png"), wbg)
prev = []
for v in ["front", "left", "back", "right"]:
    im = cv2.imread(os.path.join(out, "white", v + ".png")); im = cv2.resize(im, (512, 512), interpolation=cv2.INTER_AREA)
    cv2.putText(im, v, (12, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (60, 60, 60), 2)
    for y in (int(512 * (FOOT - FIG) / SIZE), int(512 * FOOT / SIZE)): cv2.line(im, (0, y), (511, y), (0, 140, 255), 1)
    prev.append(im)
cv2.imwrite(os.path.join(out, "preview.jpg"), np.hstack(prev), [cv2.IMWRITE_JPEG_QUALITY, 88])
print("scale", round(k, 3), {v: im.shape for v, im in res.items()})
