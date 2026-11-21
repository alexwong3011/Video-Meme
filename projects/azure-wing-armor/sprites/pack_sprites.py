#!/usr/bin/env python3
"""Trim and pack the rendered 2.5D frames into WebP atlas pages, one set per weapon stance.
usage: pack_sprites.py RAW_DIR OUT_DIR mode[,mode...]
writes OUT_DIR/<mode>/p<N>.webp and OUT_DIR/<mode>.json
  frames["dir/clip/k"] = [page, x, y, w, h, ax, ay]   (ax, ay: anchor = feet, inside the trimmed rect)
  pts["dir/clip/k"] = {"bR"/"bL": [x0,y0,x1,y1] blade (guard->tip), "hR"/"hL": hand, "bk": wing root}, all relative to the anchor
"""
import sys, os, json
from PIL import Image
raw, out = sys.argv[1], sys.argv[2]
PAGE = 2048
for mode in sys.argv[3].split(","):
    meta = json.load(open(os.path.join(raw, mode, "meta.json")))
    items = []
    for key, m in meta["frames"].items():
        d, cl, k = key.split("/")
        im = Image.open(os.path.join(raw, mode, d, f"{cl}_{k}.png")).convert("RGBA")
        bb = im.getchannel("A").point(lambda v: 255 if v > 6 else 0).getbbox() or (0, 0, 1, 1)
        x0, y0, x1, y1 = max(0, bb[0] - 1), max(0, bb[1] - 1), min(im.width, bb[2] + 1), min(im.height, bb[3] + 1)
        items.append((key, im.crop((x0, y0, x1, y1)), x0, y0, m))
    items.sort(key=lambda t: -t[1].height)
    pages, frames, pts = [], {}, {}
    page = Image.new("RGBA", (PAGE, PAGE), (0, 0, 0, 0)); x = y = sh = 0
    for key, im, x0, y0, m in items:
        w, h = im.size
        if x + w > PAGE: x, y, sh = 0, y + sh + 1, 0
        if y + h > PAGE: pages.append(page); page = Image.new("RGBA", (PAGE, PAGE), (0, 0, 0, 0)); x = y = sh = 0
        page.alpha_composite(im, (x, y))
        ax, ay = m["anchor"]
        frames[key] = [len(pages), x, y, w, h, round(ax - x0, 1), round(ay - y0, 1)]
        rel = lambda p: [round(p[0] - ax, 1), round(p[1] - ay, 1)]
        e = {"hR": rel(m["hands"]["R"]), "hL": rel(m["hands"]["L"]), "bk": rel(m["back"])}
        for s, b in m["blades"].items(): e["b" + s] = rel(b[:2]) + rel(b[2:])
        pts[key] = e
        x += w + 1; sh = max(sh, h)
    page = page.crop((0, 0, PAGE, y + sh + 1)); pages.append(page)
    os.makedirs(os.path.join(out, mode), exist_ok=True)
    files = []
    for i, pg in enumerate(pages):
        f = f"{mode}/p{i}.webp"; pg.save(os.path.join(out, f), "WEBP", quality=88, method=6); files.append(f)
    json.dump(dict(mode=mode, ppm=meta["spr"]["PPM"], pages=files, dirs=meta["dirs"], clips=meta["clips"], attacks=meta["attacks"],
                   chop=meta["chop"], rain=meta["rain"], frames=frames, pts=pts), open(os.path.join(out, mode + ".json"), "w"), separators=(",", ":"))
    print(mode, len(frames), "frames,", len(pages), "pages", [p.size for p in pages], round(sum(os.path.getsize(os.path.join(out, f)) for f in files) / 1e6, 2), "MB")
