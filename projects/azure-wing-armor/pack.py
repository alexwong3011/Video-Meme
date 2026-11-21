#!/usr/bin/env python3
"""Pack the cut-out armor pieces into game-ready assets.

usage: pack.py PIECES_DIR OUT_DIR
  PIECES_DIR: output of pieces.py (PNG per piece + layout.json, at layout["scale"] x source resolution)
writes into OUT_DIR:
  sprites/@4x|@2x|@1x/<piece>.png   trimmed transparent sprites
  paperdoll/azure_wing_full@{4x,2x}.png   all pieces assembled in their reference positions
  atlas/azure_wing@2x.png + .json   TexturePacker "JSON Hash" atlas (Phaser, PixiJS, Cocos, Defold importers...)
  icons/<item>_{256,128,64}.png and icons/framed/<item>_256.png   inventory icons
  azure_wing_set.json   item + layout data (slots, pivots, offsets, z-order, stats)
"""
import json, os, sys, math
from PIL import Image, ImageDraw, ImageFilter

src, out = sys.argv[1], sys.argv[2]
L = json.load(open(os.path.join(src, "layout.json")))
SC = L["scale"]                      # pieces are SC x the reference image
FX, FY = 570, 110                    # figure crop origin in the reference image
ORIGIN = (900, 969)                  # character origin in the reference image: between the feet, on the floor

PIECES = {   # z: draw order on the paper doll (low = behind). attach = socket point in reference-image px
  "leggings":       dict(item="greaves",   z=10, attach=(900, 560)),
  "chestplate":     dict(item="cuirass",   z=20, attach=(900, 452)),
  "helmet":         dict(item="helm",      z=30, attach=(900, 362)),
  "gauntlet_left":  dict(item="gauntlets", z=40, attach=(646, 470)),
  "gauntlet_right": dict(item="gauntlets", z=40, attach=(1140, 470)),
  "boot_left":      dict(item="sabatons",  z=15, attach=(735, 966)),
  "boot_right":     dict(item="sabatons",  z=15, attach=(1065, 966)),
}
ITEMS = {
  "helm":      dict(slot="head",  name_vi="Mũ Cánh Lam",        name_en="Azure Wing Helm",      pieces=["helmet"],
                    desc_vi="Mũ giáp bạc mỏ chim ưng, hai cánh lông vũ xanh lam ôm lấy thái dương; đôi mắt lam phát sáng khi chiến đấu.",
                    stats=dict(defense=42, magic_resist=18, crit_resist=4)),
  "cuirass":   dict(slot="chest", name_vi="Giáp Ngực Cánh Lam", name_en="Azure Wing Cuirass",   pieces=["chestplate"],
                    desc_vi="Giáp ngực chạm hoa văn dây leo, vai nhọn như móng vuốt và bờm lông vũ lam xòe rộng hai bên.",
                    stats=dict(defense=96, hp=420, magic_resist=30)),
  "greaves":   dict(slot="legs",  name_vi="Giáp Chân Cánh Lam", name_en="Azure Wing Greaves",   pieces=["leggings"],
                    desc_vi="Giáp đùi và ống chân xếp vảy, gân lam chạy dọc, lông vũ lam mọc ở hông.",
                    stats=dict(defense=71, hp=260, move_speed=2)),
  "gauntlets": dict(slot="hands", name_vi="Găng Cánh Lam",      name_en="Azure Wing Gauntlets", pieces=["gauntlet_left", "gauntlet_right"],
                    desc_vi="Cặp găng dài tới khuỷu, cổ tay gai nhọn, ngón vuốt kim loại và lông vũ lam ở cẳng tay.",
                    stats=dict(defense=33, attack=24, attack_speed=5)),
  "sabatons":  dict(slot="feet",  name_vi="Giày Cánh Lam",      name_en="Azure Wing Sabatons",  pieces=["boot_left", "boot_right"],
                    desc_vi="Giày giáp cổ cao, mũi bọc vảy bạc, ống giày tỏa gai như cánh chim.",
                    stats=dict(defense=29, move_speed=6, evasion=3)),
}
SET_BONUS = [dict(pieces=2, vi="+8% phòng thủ", en="+8% defense"),
             dict(pieces=4, vi="+12% tốc độ di chuyển, miễn nhiễm làm chậm 2 giây sau khi né", en="+12% move speed; 2s slow immunity after a dodge"),
             dict(pieces=5, vi="Cánh Lam: khi máu dưới 30%, triệu hồi đôi cánh lam hấp thụ 25% sát thương trong 5 giây (hồi 60 giây)",
                  en="Azure Wing: below 30% HP, spread azure wings that absorb 25% damage for 5s (60s cooldown)")]

def sub(*p): d = os.path.join(out, *p); os.makedirs(d, exist_ok=True); return d

def resize(im, w, h):
    # premultiplied resampling: no dark/colour fringes on soft edges
    return im.convert("RGBa").resize((max(1, w), max(1, h)), Image.LANCZOS).convert("RGBA")

def trim(im, pad=2):
    bb = im.getchannel("A").point(lambda v: 255 if v > 3 else 0).getbbox()
    x0, y0, x1, y1 = bb
    x0, y0 = max(0, x0 - pad), max(0, y0 - pad); x1, y1 = min(im.width, x1 + pad), min(im.height, y1 + pad)
    return im.crop((x0, y0, x1, y1)), (x0, y0)

# ---------- sprites at three scales ----------
sprites, data_pieces = {}, {}
for name, info in PIECES.items():
    raw = Image.open(os.path.join(src, name + ".png")).convert("RGBA")
    m = L["pieces"][name]
    im, (dx, dy) = trim(raw)
    # top-left of the trimmed sprite in reference-image px
    rx, ry = FX + (m["x"] + dx) / SC, FY + (m["y"] + dy) / SC
    rw, rh = im.width / SC, im.height / SC
    sprites[name] = im
    for tag, k in (("@4x", 4), ("@2x", 2), ("@1x", 1)):
        w, h = round(rw * k), round(rh * k)
        (im if (k == SC and im.size == (w, h)) else resize(im, w, h)).save(os.path.join(sub("sprites", tag), name + ".png"), optimize=True)
    ax, ay = info["attach"]
    data_pieces[name] = dict(
        item=info["item"], z=info["z"],
        size_1x=[round(rw, 2), round(rh, 2)],
        # where the sprite's top-left goes relative to the character origin (feet, floor), in @1x px; multiply by the scale you use
        offset_1x=[round(rx - ORIGIN[0], 2), round(ry - ORIGIN[1], 2)],
        # normalized pivot (0..1, origin top-left) at the piece's socket: rotate/attach around this point
        pivot=[round((ax - rx) / rw, 4), round((ay - ry) / rh, 4)],
        socket_1x=[ax - ORIGIN[0], ay - ORIGIN[1]],
        files={t: f"sprites/{t}/{name}.png" for t in ("@4x", "@2x", "@1x")},
    )

# ---------- paper doll (assembled) ----------
xs = [data_pieces[n]["offset_1x"][0] for n in PIECES]; ys = [data_pieces[n]["offset_1x"][1] for n in PIECES]
xe = [data_pieces[n]["offset_1x"][0] + data_pieces[n]["size_1x"][0] for n in PIECES]
ye = [data_pieces[n]["offset_1x"][1] + data_pieces[n]["size_1x"][1] for n in PIECES]
bx0, by0, bx1, by1 = math.floor(min(xs)) - 4, math.floor(min(ys)) - 4, math.ceil(max(xe)) + 4, math.ceil(max(ye)) + 4
for tag, k in (("@4x", 4), ("@2x", 2)):
    doll = Image.new("RGBA", ((bx1 - bx0) * k, (by1 - by0) * k), (0, 0, 0, 0))
    for n in sorted(PIECES, key=lambda n: PIECES[n]["z"]):
        p = data_pieces[n]; im = Image.open(os.path.join(out, p["files"][tag]))
        doll.alpha_composite(im, (round((p["offset_1x"][0] - bx0) * k), round((p["offset_1x"][1] - by0) * k)))
    doll.save(os.path.join(sub("paperdoll"), f"azure_wing_full{tag}.png"), optimize=True)
paperdoll = dict(bounds_1x=dict(x=bx0, y=by0, w=bx1 - bx0, h=by1 - by0),
                 origin_in_image_1x=[-bx0, -by0], files={t: f"paperdoll/azure_wing_full{t}.png" for t in ("@4x", "@2x")})

# ---------- atlas (@2x, shelf packing) ----------
ims = {n: Image.open(os.path.join(out, data_pieces[n]["files"]["@2x"])) for n in PIECES}
order = sorted(ims, key=lambda n: -ims[n].height)
AW, PAD = 2048, 2
x = y = sh = 0; pos = {}
for n in order:
    w, h = ims[n].size
    if x + w + PAD > AW: x, y, sh = 0, y + sh + PAD, 0
    pos[n] = (x, y); x += w + PAD; sh = max(sh, h)
AH = 1 << (y + sh).bit_length()
atlas = Image.new("RGBA", (AW, AH), (0, 0, 0, 0)); frames = {}
for n, (px, py) in pos.items():
    atlas.alpha_composite(ims[n], (px, py)); w, h = ims[n].size
    frames[n] = dict(frame=dict(x=px, y=py, w=w, h=h), rotated=False, trimmed=False,
                     spriteSourceSize=dict(x=0, y=0, w=w, h=h), sourceSize=dict(w=w, h=h),
                     pivot=dict(x=data_pieces[n]["pivot"][0], y=data_pieces[n]["pivot"][1]))
bb = atlas.getbbox(); atlas = atlas.crop((0, 0, AW, bb[3] + PAD))
atlas.save(os.path.join(sub("atlas"), "azure_wing@2x.png"), optimize=True)
json.dump(dict(frames=frames, meta=dict(app="azure-wing-armor/pack.py", version="1.0", image="azure_wing@2x.png",
          format="RGBA8888", size=dict(w=atlas.width, h=atlas.height), scale="2")),
          open(os.path.join(out, "atlas", "azure_wing@2x.json"), "w"), indent=1)

# ---------- inventory icons ----------
def icon_art(item):
    names = ITEMS[item]["pieces"]
    if len(names) == 1: return sprites[names[0]]
    a, b = sprites[names[0]], sprites[names[1]]          # pairs: draw both, slightly overlapped
    gap = -int(min(a.width, b.width) * 0.12)
    c = Image.new("RGBA", (a.width + b.width + gap, max(a.height, b.height)), (0, 0, 0, 0))
    c.alpha_composite(a, (0, c.height - a.height)); c.alpha_composite(b, (a.width + gap, c.height - b.height))
    return c

def fit(art, S, margin):
    k = (S * (1 - 2 * margin)) / max(art.width, art.height)
    r = resize(art, round(art.width * k), round(art.height * k))
    c = Image.new("RGBA", (S, S), (0, 0, 0, 0)); c.alpha_composite(r, ((S - r.width) // 2, (S - r.height) // 2)); return c

def frame(S=256):
    f = Image.new("RGBA", (S, S), (0, 0, 0, 0)); d = ImageDraw.Draw(f)
    for i in range(S // 2):                                # radial-ish slot background
        t = i / (S / 2); col = (int(16 + 22 * t), int(20 + 30 * t), int(32 + 46 * t), 255)
        d.rounded_rectangle((i // 2, i // 2, S - 1 - i // 2, S - 1 - i // 2), radius=max(2, 28 - i // 4), fill=col)
    glow = Image.new("RGBA", (S, S), (0, 0, 0, 0)); g = ImageDraw.Draw(glow)
    g.rounded_rectangle((6, 6, S - 7, S - 7), radius=26, outline=(80, 160, 255, 200), width=6)
    f.alpha_composite(glow.filter(ImageFilter.GaussianBlur(6)))
    d = ImageDraw.Draw(f)
    d.rounded_rectangle((4, 4, S - 5, S - 5), radius=26, outline=(150, 200, 255, 255), width=3)
    d.rounded_rectangle((10, 10, S - 11, S - 11), radius=21, outline=(60, 90, 140, 255), width=1)
    return f

FR = frame()
icons = {}
for item in ITEMS:
    art = icon_art(item)
    for S in (256, 128, 64):
        fit(art, S, 0.06).save(os.path.join(sub("icons"), f"{item}_{S}.png"), optimize=True)
    fr = FR.copy(); fr.alpha_composite(fit(art, 256, 0.11)); fr.save(os.path.join(sub("icons", "framed"), f"{item}_256.png"), optimize=True)
    icons[item] = dict(plain={str(S): f"icons/{item}_{S}.png" for S in (256, 128, 64)}, framed=f"icons/framed/{item}_256.png")

data = dict(id="azure_wing", name_vi="Bộ Giáp Cánh Lam", name_en="Azure Wing Armor Set", rarity="legendary",
            units="offset_1x/size_1x/socket_1x are in @1x px relative to the character origin (between the feet, on the floor), y down. "
                  "At @2x/@4x multiply by 2/4.",
            stats_note="Stats are example values for balancing, not from the reference sheet.",
            items={k: dict(v, icon=icons[k]) for k, v in ITEMS.items()}, set_bonus=SET_BONUS,
            pieces=data_pieces, paperdoll=paperdoll, atlas="atlas/azure_wing@2x.json")
json.dump(data, open(os.path.join(out, "azure_wing_set.json"), "w"), ensure_ascii=False, indent=1)
print("atlas", atlas.size, "doll", (bx1 - bx0, by1 - by0))
