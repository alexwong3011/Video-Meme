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
# side view (facing screen-left). The near arm lies across the body and the near leg hides the far one: the far limbs are
# drawn in code as darker copies of the near ones. "fill": pixels of those parts inside fill_zone are inpainted into this
# part, so nothing gapes behind the arm or the hand when they swing away.
SIDE = dict(
  head=dict(z=40, parent="torso", pivot=(888, 305),
            poly=[(808, 112), (990, 112), (990, 215), (955, 250), (935, 300), (905, 315), (860, 315), (828, 300), (808, 250)]),
  forearm=dict(z=32, parent="upperarm", pivot=(905, 512), grip=(872, 640),
            poly=[(862, 508), (958, 508), (952, 560), (935, 600), (930, 640), (915, 684), (826, 684), (826, 640), (850, 600), (862, 560)]),
  upperarm=dict(z=31, parent="torso", pivot=(908, 420), poly=[(870, 438), (960, 438), (962, 508), (862, 508)]),
  shin=dict(z=19, parent="thigh", pivot=(884, 722), poly=[(780, 718), (1015, 718), (1015, 990), (780, 990)]),
  thigh=dict(z=18, parent="torso", pivot=(880, 566), poly=[(830, 556), (1000, 556), (1000, 722), (830, 722)],
             fill=["forearm"], fill_zone=[(830, 556), (1000, 556), (1000, 722), (830, 722)]),
  torso=dict(z=20, parent=None, pivot=(885, 560), fill=["upperarm", "forearm"], fill_zone=[(800, 300), (1000, 300), (1000, 572), (800, 572)]),
)
# 45-degree camera (source/turntable, the angle of the pose sheets): every limb is drawn, screen-left = L.
# The quarter view (turntable rotation 60deg) faces screen-left: R is the near arm/leg, drawn over the torso and the near thigh.
FRONT45 = dict(
  head=dict(z=40, parent="torso", pivot=(875, 300),
            poly=[(832, 118), (995, 118), (995, 255), (962, 298), (905, 318), (868, 314), (840, 292), (832, 255)]),
  upperarm_L=dict(z=20, parent="torso", pivot=(783, 378), poly=[(698, 352), (802, 352), (806, 420), (772, 476), (698, 476)]),
  forearm_L=dict(z=22, parent="upperarm_L", pivot=(740, 470), grip=(726, 548),
            poly=[(686, 466), (778, 466), (772, 520), (762, 596), (686, 596)]),
  upperarm_R=dict(z=20, parent="torso", pivot=(1012, 405), poly=[(986, 392), (1085, 392), (1085, 506), (1000, 510), (990, 470)]),
  forearm_R=dict(z=22, parent="upperarm_R", pivot=(1032, 503), grip=(1020, 640),
            poly=[(984, 500), (1085, 500), (1078, 600), (1062, 694), (984, 694), (994, 600)]),
  thigh_L=dict(z=10, parent="torso", pivot=(836, 568), poly=[(776, 548), (874, 548), (868, 604), (868, 664), (776, 664)]),
  shin_L=dict(z=12, parent="thigh_L", pivot=(825, 666), poly=[(726, 656), (876, 656), (876, 852), (726, 852)]),
  thigh_R=dict(z=10, parent="torso", pivot=(926, 568), poly=[(874, 548), (984, 548), (984, 712), (880, 712), (868, 604)]),
  shin_R=dict(z=12, parent="thigh_R", pivot=(936, 712), poly=[(876, 702), (1002, 702), (1002, 932), (876, 932)]),
  torso=dict(z=30, parent=None, pivot=(880, 560)),
)
BACK45 = dict(
  head=dict(z=40, parent="torso", pivot=(905, 300),
            poly=[(815, 98), (1000, 98), (1000, 258), (962, 298), (932, 312), (880, 312), (846, 292), (815, 258)]),
  upperarm_L=dict(z=20, parent="torso", pivot=(772, 400), poly=[(696, 392), (802, 392), (802, 452), (792, 526), (696, 526)]),
  forearm_L=dict(z=22, parent="upperarm_L", pivot=(737, 520), grip=(726, 600),
            poly=[(686, 516), (796, 516), (782, 560), (772, 644), (686, 644)]),
  upperarm_R=dict(z=20, parent="torso", pivot=(1032, 400), poly=[(996, 386), (1098, 386), (1098, 504), (1014, 504), (1000, 460)]),
  forearm_R=dict(z=22, parent="upperarm_R", pivot=(1060, 500), grip=(1066, 560),
            poly=[(1004, 496), (1104, 496), (1104, 604), (1008, 604)]),
  thigh_L=dict(z=10, parent="torso", pivot=(852, 578), poly=[(778, 572), (886, 572), (892, 706), (778, 706)]),
  shin_L=dict(z=12, parent="thigh_L", pivot=(842, 702), poly=[(736, 696), (896, 696), (896, 912), (736, 912)]),
  thigh_R=dict(z=10, parent="torso", pivot=(962, 578), poly=[(918, 572), (1022, 572), (1022, 690), (912, 690)]),
  shin_R=dict(z=12, parent="thigh_R", pivot=(970, 686), poly=[(902, 680), (1045, 680), (1045, 866), (902, 866)]),
  torso=dict(z=30, parent=None, pivot=(905, 570)),
)
QUARTER45 = dict(
  head=dict(z=40, parent="torso", pivot=(862, 322),
            poly=[(826, 92), (978, 92), (978, 282), (936, 330), (862, 338), (828, 312)]),
  upperarm_L=dict(z=20, parent="torso", pivot=(788, 402), poly=[(736, 388), (804, 388), (800, 470), (742, 478)]),
  forearm_L=dict(z=22, parent="upperarm_L", pivot=(765, 470), grip=(755, 530),
            poly=[(722, 464), (802, 464), (800, 520), (786, 572), (722, 572)]),
  upperarm_R=dict(z=28, parent="torso", pivot=(978, 428), poly=[(948, 432), (1046, 432), (1046, 566), (952, 566)]),
  forearm_R=dict(z=34, parent="upperarm_R", pivot=(1000, 560), grip=(975, 650),
            poly=[(962, 556), (1046, 556), (1040, 640), (1012, 702), (932, 702), (932, 612), (950, 598)]),
  thigh_L=dict(z=10, parent="torso", pivot=(840, 582), poly=[(788, 562), (880, 562), (870, 620), (862, 692), (788, 692)]),
  shin_L=dict(z=12, parent="thigh_L", pivot=(830, 690), poly=[(740, 682), (868, 682), (860, 722), (852, 812), (740, 812)]),
  thigh_R=dict(z=14, parent="torso", pivot=(910, 590), poly=[(880, 562), (966, 562), (966, 732), (864, 732), (866, 650)],
               fill=["forearm_R"], fill_zone=[(880, 556), (966, 556), (966, 732), (864, 732)]),
  shin_R=dict(z=16, parent="thigh_R", pivot=(905, 730), poly=[(854, 722), (978, 722), (978, 928), (854, 928)]),
  torso=dict(z=30, parent=None, pivot=(870, 572), fill=["upperarm_R"], fill_zone=[(930, 420), (968, 420), (968, 572), (930, 572)]),
)
RIG = {"body_front": full(FRONT), "body_back": full(BACK), "body_side": SIDE,
       "body_front45": FRONT45, "body_back45": BACK45, "body_quarter45": QUARTER45}

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
        if p.get("fill"):   # repaint what the listed parts cover inside the zone (inpainting from this part's own pixels)
            zone = np.zeros((H, W), np.uint8); cv2.fillPoly(zone, [P(p["fill_zone"])], 1)
            hole = np.zeros((H, W), bool)
            for q in p["fill"]: hole |= owned[q]
            hole &= zone.astype(bool) & (canvas[:, :, 3] > 128)
            known = mask & ~hole & (canvas[:, :, 3] > 128)
            src = np.where(known[..., None], canvas[:, :, :3], 0).astype(np.uint8)
            inp = cv2.inpaint(src, (~known).astype(np.uint8) * 255, max(3, int(4 * s)), cv2.INPAINT_TELEA).astype(np.float32)
            # the inpaint only carries colour: add back armour-scale detail tiled from a strip of this part, and shade it
            # like the hollow under a raised arm, so a revealed patch reads as armour in shadow rather than a smear
            ys_, xs_ = np.where(known); cx0 = int(np.percentile(xs_, 5)); bw = max(8, int(30 * s))
            strip = canvas[ys_.min():ys_.max() + 1, cx0:cx0 + bw, :3].astype(np.float32)
            detail = strip - cv2.GaussianBlur(strip, (0, 0), 2.5 * s)
            reps = (H // max(1, strip.shape[0]) + 2, W // bw + 2, 1)
            tiled = np.tile(detail, reps)[:H, :W]
            fillc = np.clip(inp * 0.62 + tiled * 0.9, 0, 255).astype(np.uint8)
            part[:, :, :3] = np.where(hole[..., None], fillc, part[:, :, :3]); part[:, :, 3] = np.where(hole, canvas[:, :, 3], part[:, :, 3])
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
