#!/usr/bin/env python3
"""Cut a generated armour-set sheet (Cánh Lam layout) into the paper-doll pieces and icons of the game, on the Cánh Lam body frame.
usage: set_pieces.py ARMOR.png WEAPON.png REF_LAYOUT.jpg OUT_DIR
  ARMOR.png / WEAPON.png: transparent sheets (Meshy Image to Image with remove_background) in the layout of REF_LAYOUT.jpg
  writes OUT_DIR/pieces/{helmet,chestplate,leggings,gauntlet_left,gauntlet_right,boot_left,boot_right,greatsword}.png,
         OUT_DIR/icons/{helm,cuirass,greaves,gauntlets,sabatons,greatsword}_128.png and OUT_DIR/doll.json (box of every piece in
         paper-doll 1x pixels, from the feet, y down: the game's DOLL table for this set)
  Each piece is matched to the reference piece nearest to it, then fitted (by height, uniform scale) into that piece's box on the doll,
  so mixed sets line up. The chestplate and leggings often come out joined: they are split at the waist with a wedge for the faulds.
"""
import sys, os, json, numpy as np, cv2
armor_p, weapon_p, ref_p, out = sys.argv[1:5]
os.makedirs(out + "/pieces", exist_ok=True); os.makedirs(out + "/icons", exist_ok=True)
# the Cánh Lam doll boxes (1x px from the feet), as in the game
DOLL = {"helmet": ([-84.5, -832.25], [169.75, 235.5]), "chestplate": ([-164.5, -633.0], [331.0, 312.0]), "leggings": ([-130.25, -412.0], [262.75, 358.0]),
        "gauntlet_left": ([-296.5, -604.5], [91.25, 328.0]), "gauntlet_right": ([191.5, -605.0], [89.0, 331.75]),
        "boot_left": ([-230.0, -197.75], [127.25, 199.25]), "boot_right": ([103.0, -199.0], [128.5, 200.5])}
A = cv2.imread(armor_p, cv2.IMREAD_UNCHANGED); H, W = A.shape[:2]
alpha = A[:, :, 3]
def comps(mask, min_area):
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
    n, lab, st, cen = cv2.connectedComponentsWithStats(mask, 8)
    return [(lab == i, st[i, :4], cen[i]) for i in range(1, n) if st[i, 4] > min_area]
parts = comps((alpha > 100).astype(np.uint8), 2000)
# reference pieces, in the sheet's own pixels
R = cv2.imread(ref_p).astype(np.float32); kx, ky = W / R.shape[1], H / R.shape[0]
rm = (np.abs(R - np.array([30, 27, 27])).max(2) > 45).astype(np.uint8)
rm = cv2.morphologyEx(cv2.morphologyEx(rm, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8)), cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
n, lab, st, cen = cv2.connectedComponentsWithStats(rm, 8)
ref = [(st[i, :4] * [kx, ky, kx, ky], cen[i] * [kx, ky]) for i in range(1, n) if st[i, 4] > 2000]
def ref_name(c):     # name a reference piece by where it sits: helmet top, gauntlets at the sides, boots low at the sides, legs low in the middle
    cx, cy = c; mid = abs(cx - W / 2) < 0.06 * W
    if cy < 0.3 * H: return "helmet"
    if not mid and cy > 0.78 * H: return "boot_left" if cx < W / 2 else "boot_right"
    if not mid and abs(cx - W / 2) > 0.11 * W and cy < 0.7 * H: return "gauntlet_left" if cx < W / 2 else "gauntlet_right"
    if cy > 0.62 * H: return "leggings"
    return "chestplate"
REF = {}
for box, c in ref:
    nm = ref_name(c)
    if nm in REF:            # the two legs of the reference: one box
        b = REF[nm]; x0, y0 = min(b[0], box[0]), min(b[1], box[1]); x1, y1 = max(b[0] + b[2], box[0] + box[2]), max(b[1] + b[3], box[1] + box[3]); REF[nm] = np.array([x0, y0, x1 - x0, y1 - y0])
    else: REF[nm] = box
print("reference pieces", sorted(REF))
waist = (REF["chestplate"][1] + REF["chestplate"][3] + REF["leggings"][1]) / 2      # between the reference's chest bottom and leg top
pieces = {}
for m, box, c in parts:
    nm = ref_name(c)
    if nm == "chestplate" and box[1] + box[3] > REF["leggings"][1] + 0.5 * REF["leggings"][3]:      # chest and legs came out joined
        x0, y0, w, h = box; cx = x0 + w / 2; ys, xs = np.nonzero(m)
        wedge = np.zeros_like(m); tip = REF["chestplate"][1] + REF["chestplate"][3] + 0.02 * H
        cv2.fillPoly(wedge.view(np.uint8), [np.array([[cx - 0.035 * W, waist - 0.05 * H], [cx + 0.035 * W, waist - 0.05 * H], [cx, tip + 0.03 * H]], np.int32)], 1)
        yy = np.arange(H)[:, None] * np.ones((1, W))
        chest = m & ((yy < waist - 0.05 * H) | wedge.astype(bool)); legs = m & ~chest
        pieces["chestplate"] = chest; pieces["leggings"] = legs
    else: pieces[nm] = m
print("pieces found", sorted(pieces))
def crop(m, src=None):
    src = A if src is None else src; ys, xs = np.nonzero(m); x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    rgba = src[y0:y1, x0:x1].copy(); rgba[:, :, 3] = np.where(m[y0:y1, x0:x1], rgba[:, :, 3], 0); return rgba
# fit every piece into its doll box by height (one scale per piece, held within 15% of the median so proportions stay)
sc = {n: DOLL[n][1][1] / crop(pieces[n]).shape[0] for n in pieces if n in DOLL}; med = float(np.median(list(sc.values())))
doll = {}
for n, m in pieces.items():
    if n not in DOLL: continue
    im = crop(m); k = float(np.clip(sc[n], med * 0.85, med * 1.15)); w, h = im.shape[1] * k, im.shape[0] * k
    (ox, oy), (bw, bh) = DOLL[n]; cx, cy = ox + bw / 2, oy + bh / 2
    if n.startswith("boot"): cy = oy + bh - h / 2          # boots stand on the floor line
    if n == "helmet": cy = oy + bh - h / 2                  # helmet sits on the neck
    doll[n] = {"o": [round(cx - w / 2, 2), round(cy - h / 2, 2)], "s": [round(w, 2), round(h, 2)]}
    cv2.imwrite(f"{out}/pieces/{n}.png", cv2.resize(im, (max(1, round(w)), max(1, round(h))), interpolation=cv2.INTER_AREA), [cv2.IMWRITE_PNG_COMPRESSION, 9])
# the greatsword: the left (front) view of the weapon sheet, point down; the grip pivot sits in the handle just above the crossguard
Wp = cv2.imread(weapon_p, cv2.IMREAD_UNCHANGED); wa = (Wp[:, :, 3] > 100).astype(np.uint8)
big2 = sorted(comps(wa, 3000), key=lambda p: -p[0].sum())[:2]; sw = sorted(big2, key=lambda p: p[2][0])[0][0]; sword = crop(sw, Wp); sa = sword[:, :, 3] > 100   # the two swords; the left one is the front view
POLE = "--pole" in sys.argv          # a staff or polearm drawn head up: held a little below the middle of its shaft, head up in the hand
if POLE: py = int(0.56 * sa.shape[0])
else:
    widths = sa.sum(1); top = int(0.45 * len(widths)); guard = int(np.argmax(widths[:top]))
    hand = [y for y in range(guard) if widths[y] < 0.18 * widths[guard]]; py = (hand[len(hand) // 2] if hand else guard * 0.6)
xs = np.nonzero(sa[int(py)])[0]; px = xs.mean() if len(xs) else sa.shape[1] / 2
gh = 620.0 if POLE else 381.6; k = gh / sword.shape[0]; gw = sword.shape[1] * k; gp = [px / sword.shape[1], py / sword.shape[0]]
cv2.imwrite(f"{out}/pieces/greatsword.png", cv2.resize(sword, (round(gw), round(gh)), interpolation=cv2.INTER_AREA), [cv2.IMWRITE_PNG_COMPRESSION, 9])
doll["greatsword"] = {"o": [round(-260 - gp[0] * gw, 2), round(-364 - gp[1] * gh, 2)], "s": [round(gw, 2), round(gh, 2)], "gp": [round(gp[0], 4), round(gp[1], 4)]}
doll["greatsword_off"] = {"o": [round(235 - (1 - gp[0]) * gw, 2), round(-364 - gp[1] * gh, 2)], "s": [round(gw, 2), round(gh, 2)], "img": "greatsword", "flip": True}
json.dump(doll, open(f"{out}/doll.json", "w"), indent=1)
# the in-hand cards for the 3D hero: both views of the weapon at full resolution; the game turns the card so the image's bottom points up the hand,
# so a sword is kept point down and a staff is flipped (head down in the image, head up in the hand). weapon.json: aspect, grip pivot, tip
views = sorted(big2, key=lambda p: p[2][0]); spec = None
for nm, (m, _, _) in zip(["weapon_front", "weapon_back"], views):
    im = crop(m, Wp)
    if POLE: im = im[::-1].copy()
    cv2.imwrite(f"{out}/{nm}.png", im, [cv2.IMWRITE_PNG_COMPRESSION, 9])
    if spec is None:
        a = im[:, :, 3] > 100; H2, W2 = a.shape; gy = (1 - 0.56) * H2 if POLE else py * H2 / sa.shape[0]; row = np.nonzero(a[int(gy)])[0]
        ys, xs2 = np.nonzero(a); bot = ys.max(); spec = {"aspect": round(W2 / H2, 4), "gp": [round((row.mean() if len(row) else W2 / 2) / W2, 4), round(gy / H2, 4)], "tip": [round(xs2[ys == bot].mean() / W2, 4), round(bot / H2, 4)]}
json.dump(spec, open(f"{out}/weapon.json", "w"))
# icons: 128 px, the piece (or the pair) fitted with a margin; the sword laid diagonally
def icon(ims, name, rot=0):
    gap = 6; hh = max(i.shape[0] for i in ims); cw = sum(i.shape[1] for i in ims) + gap * (len(ims) - 1)
    can = np.zeros((hh, cw, 4), np.uint8); x = 0
    for i in ims: can[(hh - i.shape[0]) // 2:(hh - i.shape[0]) // 2 + i.shape[0], x:x + i.shape[1]] = i; x += i.shape[1] + gap
    if rot:
        d = int(np.hypot(*can.shape[:2])) + 4; big = np.zeros((d, d, 4), np.uint8); y0, x0 = (d - can.shape[0]) // 2, (d - can.shape[1]) // 2; big[y0:y0 + can.shape[0], x0:x0 + can.shape[1]] = can
        can = cv2.warpAffine(big, cv2.getRotationMatrix2D((d / 2, d / 2), rot, 1), (d, d), flags=cv2.INTER_AREA)
        ys, xs = np.nonzero(can[:, :, 3] > 10); can = can[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    s = 116 / max(can.shape[:2]); can = cv2.resize(can, (max(1, round(can.shape[1] * s)), max(1, round(can.shape[0] * s))), interpolation=cv2.INTER_AREA)
    o = np.zeros((128, 128, 4), np.uint8); y0, x0 = (128 - can.shape[0]) // 2, (128 - can.shape[1]) // 2; o[y0:y0 + can.shape[0], x0:x0 + can.shape[1]] = can
    cv2.imwrite(f"{out}/icons/{name}_128.png", o, [cv2.IMWRITE_PNG_COMPRESSION, 9])
P = {n: crop(m) for n, m in pieces.items()}
icon([P["helmet"]], "helm"); icon([P["chestplate"]], "cuirass"); icon([P["leggings"]], "greaves")
icon([P["gauntlet_left"], P["gauntlet_right"]], "gauntlets"); icon([P["boot_left"], P["boot_right"]], "sabatons"); icon([sword], "greatsword", rot=-40 if not POLE else -35)
print(json.dumps(doll))
