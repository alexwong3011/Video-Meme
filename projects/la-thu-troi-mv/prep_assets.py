#!/usr/bin/env python3
"""Prepare 2.5D layers for each still: inpainted background, clean foreground cutout, bloom.

usage: prep_assets.py SRC_DIR CUT_DIR OUT_DIR
  SRC_DIR/<name>.jpg   original image
  CUT_DIR/<name>.png   background-removal cutout (alpha = subject)
writes OUT_DIR/<name>-bg.jpg, <name>-fg.png, <name>-bloom.jpg
"""
import sys, os, cv2, numpy as np


def push_pull(img, hole):
    """Fill hole pixels by pyramid push-pull: smooth colour diffusion from the surroundings."""
    w = (hole == 0).astype(np.float32)
    levels, c, ww = [], img.astype(np.float32) * w[..., None], w
    while min(ww.shape) > 8:
        levels.append((c, ww))
        c = cv2.pyrDown(c); ww = cv2.pyrDown(ww)
    est = c / np.maximum(ww, 1e-6)[..., None]
    for c, ww in reversed(levels):
        up = cv2.resize(est, (c.shape[1], c.shape[0]), interpolation=cv2.INTER_LINEAR)
        known = np.clip(ww * 4, 0, 1)[..., None]
        est = (c / np.maximum(ww, 1e-6)[..., None]) * known + up * (1 - known)
    return np.clip(est, 0, 255).astype(np.uint8)

src_dir, cut_dir, out_dir = sys.argv[1:4]
os.makedirs(out_dir, exist_ok=True)
for f in sorted(os.listdir(src_dir)):
    if not f.endswith(".jpg"):
        continue
    name = f[:-4]
    img = cv2.imread(os.path.join(src_dir, f), cv2.IMREAD_COLOR)
    cut = cv2.imread(os.path.join(cut_dir, name + ".png"), cv2.IMREAD_UNCHANGED)
    alpha = cut[:, :, 3] if cut.shape[2] == 4 else cv2.cvtColor(cut, cv2.COLOR_BGR2GRAY)
    alpha = cv2.resize(alpha, (img.shape[1], img.shape[0]))
    # clean matte: drop faint noise, keep soft edges
    a = alpha.astype(np.float32) / 255
    a = np.clip((a - 0.12) / 0.76, 0, 1)
    n, lab, stats, _ = cv2.connectedComponentsWithStats((a > 0.5).astype(np.uint8))
    keep = np.zeros_like(a, bool)
    for i in range(1, n):
        if stats[i, cv2.CC_STAT_AREA] > 0.002 * a.size:
            keep |= lab == i
    keep = cv2.dilate(keep.astype(np.uint8), np.ones((25, 25), np.uint8)) > 0
    a = a * keep
    a = cv2.GaussianBlur(a, (0, 0), 1.0)
    # foreground PNG (straight alpha)
    fg = np.dstack([img, (a * 255).astype(np.uint8)])
    cv2.imwrite(os.path.join(out_dir, name + "-fg.png"), fg)
    # background: inpaint a dilated hole, done at half-res for smoother fills
    hole = cv2.dilate((a > 0.04).astype(np.uint8) * 255, np.ones((7, 7), np.uint8))
    small = cv2.resize(img, None, fx=0.5, fy=0.5, interpolation=cv2.INTER_AREA)
    hs = cv2.resize(hole, (small.shape[1], small.shape[0]), interpolation=cv2.INTER_NEAREST)
    fill = push_pull(small, hs)
    fill = cv2.GaussianBlur(fill, (0, 0), 3)
    fill = cv2.resize(fill, (img.shape[1], img.shape[0]), interpolation=cv2.INTER_CUBIC)
    m = cv2.GaussianBlur(hole.astype(np.float32) / 255, (0, 0), 1.5)[..., None]
    bg = (img * (1 - m) + fill * m).astype(np.uint8)
    cv2.imwrite(os.path.join(out_dir, name + "-bg.jpg"), bg, [cv2.IMWRITE_JPEG_QUALITY, 94])
    # bloom: highlights only, heavily blurred (used with screen blend)
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    v = hsv[:, :, 2].astype(np.float32) / 255
    hi = np.clip((v - 0.62) / 0.38, 0, 1)[..., None]
    bloom = cv2.GaussianBlur((img * hi).astype(np.uint8), (0, 0), max(img.shape) / 90)
    cv2.imwrite(os.path.join(out_dir, name + "-bloom.jpg"), bloom, [cv2.IMWRITE_JPEG_QUALITY, 90])
    print(name, img.shape[1], "x", img.shape[0])
