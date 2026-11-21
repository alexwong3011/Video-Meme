#!/usr/bin/env python3
"""Pack the cut-out armor pieces of every view into game-ready assets.

usage: pack.py OUT_DIR VIEW=PIECES_DIR [VIEW=PIECES_DIR ...]      e.g. pack.py assets front=work/front/p4 back=work/back/p4
  PIECES_DIR: output of pieces.py for that view (PNG per piece + layout.json)
writes into OUT_DIR:
  sprites/<view>/@4x|@2x|@1x/<piece>.png   trimmed transparent sprites
  paperdoll/azure_wing_<view>@{4x,2x}.png  all pieces of a view assembled in their reference positions
  atlas/azure_wing@2x.png + .json          TexturePacker "JSON Hash" atlas, frames named "<view>/<piece>"
  icons/<item>_{256,128,64}.png, icons/framed/<item>_256.png   inventory icons (front view)
  azure_wing_set.json                      items + per-view layout data (pivots, offsets, z-order)
"""
import json, os, sys, math
from PIL import Image, ImageDraw, ImageFilter
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from views import VIEWS

out = sys.argv[1]
SRC = dict(a.split("=", 1) for a in sys.argv[2:])
ITEM_OF = {"leggings": "greaves", "chestplate": "cuirass", "helmet": "helm", "gauntlet_left": "gauntlets",
           "gauntlet_right": "gauntlets", "boot_left": "sabatons", "boot_right": "sabatons"}
Z = {"leggings": 10, "boot_left": 15, "boot_right": 15, "chestplate": 20, "helmet": 30, "gauntlet_left": 40, "gauntlet_right": 40}
# file names say where the piece sits on the sheet; which hand/foot of the character that is depends on the view
SIDE = {"front": {"gauntlet_left": "right", "gauntlet_right": "left", "boot_left": "right", "boot_right": "left"},
        "back":  {"gauntlet_left": "left", "gauntlet_right": "right", "boot_left": "left", "boot_right": "right"}}

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
    x0, y0, x1, y1 = im.getchannel("A").point(lambda v: 255 if v > 3 else 0).getbbox()
    x0, y0 = max(0, x0 - pad), max(0, y0 - pad); x1, y1 = min(im.width, x1 + pad), min(im.height, y1 + pad)
    return im.crop((x0, y0, x1, y1)), (x0, y0)

pieces = {n: dict(item=ITEM_OF[n], z=Z[n], views={}) for n in Z}
paperdolls, sprites = {}, {}
for view, pdir in SRC.items():
    V = VIEWS[view]; L = json.load(open(os.path.join(pdir, "layout.json"))); SC = L["scale"]
    FX, FY = V["figure"][:2]; OX, OY = V["origin"]
    for name in Z:
        raw = Image.open(os.path.join(pdir, name + ".png")).convert("RGBA")
        m = L["pieces"][name]
        im, (dx, dy) = trim(raw)
        rx, ry = FX + (m["x"] + dx) / SC, FY + (m["y"] + dy) / SC      # sprite top-left in reference px
        rw, rh = im.width / SC, im.height / SC
        sprites[(view, name)] = im
        files = {}
        for tag, k in (("@4x", 4), ("@2x", 2), ("@1x", 1)):
            w, h = round(rw * k), round(rh * k)
            files[tag] = f"sprites/{view}/{tag}/{name}.png"
            (im if (k == SC and im.size == (w, h)) else resize(im, w, h)).save(os.path.join(sub("sprites", view, tag), name + ".png"), optimize=True)
        ax, ay = V["attach"][name]
        pieces[name]["views"][view] = dict(
            size_1x=[round(rw, 2), round(rh, 2)],
            offset_1x=[round(rx - OX, 2), round(ry - OY, 2)],          # sprite top-left relative to the character origin
            pivot=[round((ax - rx) / rw, 4), round((ay - ry) / rh, 4)],  # normalized socket point inside the sprite
            socket_1x=[ax - OX, ay - OY],
            character_side=SIDE[view].get(name, "center"),
            files=files)
    # paper doll of this view
    vs = [pieces[n]["views"][view] for n in Z]
    bx0 = math.floor(min(p["offset_1x"][0] for p in vs)) - 4; by0 = math.floor(min(p["offset_1x"][1] for p in vs)) - 4
    bx1 = math.ceil(max(p["offset_1x"][0] + p["size_1x"][0] for p in vs)) + 4
    by1 = math.ceil(max(p["offset_1x"][1] + p["size_1x"][1] for p in vs)) + 4
    for tag, k in (("@4x", 4), ("@2x", 2)):
        doll = Image.new("RGBA", ((bx1 - bx0) * k, (by1 - by0) * k), (0, 0, 0, 0))
        for n in sorted(Z, key=Z.get):
            p = pieces[n]["views"][view]; im = Image.open(os.path.join(out, p["files"][tag]))
            doll.alpha_composite(im, (round((p["offset_1x"][0] - bx0) * k), round((p["offset_1x"][1] - by0) * k)))
        doll.save(os.path.join(sub("paperdoll"), f"azure_wing_{view}{tag}.png"), optimize=True)
    paperdolls[view] = dict(bounds_1x=dict(x=bx0, y=by0, w=bx1 - bx0, h=by1 - by0), origin_in_image_1x=[-bx0, -by0],
                            files={t: f"paperdoll/azure_wing_{view}{t}.png" for t in ("@4x", "@2x")})

# ---------- atlas (@2x, shelf packing), frames "<view>/<piece>" ----------
ims = {f"{v}/{n}": Image.open(os.path.join(out, pieces[n]["views"][v]["files"]["@2x"])) for v in SRC for n in Z}
order = sorted(ims, key=lambda n: -ims[n].height)
AW, PAD = 2048, 2
x = y = sh = 0; pos = {}
for n in order:
    w, h = ims[n].size
    if x + w + PAD > AW: x, y, sh = 0, y + sh + PAD, 0
    pos[n] = (x, y); x += w + PAD; sh = max(sh, h)
atlas = Image.new("RGBA", (AW, y + sh + PAD), (0, 0, 0, 0)); frames = {}
for n, (px, py) in pos.items():
    atlas.alpha_composite(ims[n], (px, py)); w, h = ims[n].size
    v, name = n.split("/")
    pv = pieces[name]["views"][v]["pivot"]
    frames[n] = dict(frame=dict(x=px, y=py, w=w, h=h), rotated=False, trimmed=False,
                     spriteSourceSize=dict(x=0, y=0, w=w, h=h), sourceSize=dict(w=w, h=h), pivot=dict(x=pv[0], y=pv[1]))
atlas.save(os.path.join(sub("atlas"), "azure_wing@2x.png"), optimize=True)
json.dump(dict(frames=frames, meta=dict(app="azure-wing-armor/pack.py", version="1.1", image="azure_wing@2x.png",
          format="RGBA8888", size=dict(w=atlas.width, h=atlas.height), scale="2")),
          open(os.path.join(out, "atlas", "azure_wing@2x.json"), "w"), indent=1)

# ---------- inventory icons ----------
def icon_art(item):
    names = ITEMS[item]["pieces"]
    if len(names) == 1: return sprites[("front", names[0])]
    a, b = sprites[("front", names[0])], sprites[("front", names[1])]          # pairs: draw both, slightly overlapped
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
            views=list(SRC),
            units="offset_1x/size_1x/socket_1x are @1x px relative to the character origin (between the feet, on the floor), y down. "
                  "At @2x/@4x multiply by 2/4. Piece names say where the piece sits on the sheet; character_side says which "
                  "hand/foot it is for that view.",
            stats_note="Stats are example values for balancing, not from the reference sheet.",
            items={k: dict(v, icon=icons[k]) for k, v in ITEMS.items()}, set_bonus=SET_BONUS,
            pieces=pieces, paperdoll=paperdolls, atlas="atlas/azure_wing@2x.json")
json.dump(data, open(os.path.join(out, "azure_wing_set.json"), "w"), ensure_ascii=False, indent=1)
print("atlas", atlas.size, {v: (p["bounds_1x"]["w"], p["bounds_1x"]["h"]) for v, p in paperdolls.items()})
