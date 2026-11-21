"""Per-view cut configuration. All coordinates are pixels in the 1792x1008 reference sheet of that view.

Each view lists:
  source       reference sheet (relative to this folder)
  figure       crop (x0, y0, x1, y1) that holds every piece; everything downstream works inside it
  seg_boxes    crops sent to the segmentation model (upscaled 3x first)
  regions      piece -> list of ("+"|"-", polygon). A pixel belongs to a piece if it is inside a "+" polygon
               and outside every "-" polygon. Polygons are (x, y) lists; ("rect", x0, y0, x1, y1) is a shortcut.
  solid        optional polygons forced opaque (dark inner faces the matte cannot tell from the background)
  lines/dots   leader lines and their end dots to erase: polyline (thickness 7 px) or (polyline, thickness) / (x, y, radius)
  erase        extra polygons to erase everywhere (text-panel borders, floor under the soles)
  inpaint_rows optional (x0, y0, x1, y1) boxes over a thin horizontal line: rows inside are interpolated from the rows outside
  floor_y      y where the floor glow starts (matte gets stricter below it)
  floor_shadow optional: below floor_y, dark pixels are cast shadow, not shaded metal
  origin       character origin: between the feet, on the floor
  attach       piece -> socket point (pivot) used for rigging
  grip         armour views: palm centre of each gauntlet, where a held weapon's grip goes
  tip/pommel   weapon sheet: blade tip and pommel, to orient the weapon in code
"""

def rect(x0, y0, x1, y1): return [(x0, y0), (x1, y0), (x1, y1), (x0, y1)]

VIEWS = {
  "front": dict(
    source="source/azure-wing-sheet.jpg",
    figure=(570, 110, 1215, 990),
    seg_boxes={"helmet": (790, 120, 1010, 395), "body": (715, 315, 1085, 935), "gauntlet_l": (580, 345, 710, 710),
               "gauntlet_r": (1075, 345, 1205, 710), "boot_l": (650, 755, 820, 985), "boot_r": (980, 755, 1150, 985)},
    regions={
      "helmet": [("+", [(795, 112), (1005, 112), (1005, 334), (956, 338), (940, 356), (933, 370), (920, 371), (880, 371), (867, 370), (860, 356), (844, 338), (795, 334)])],
      "chestplate": [("+", rect(712, 318, 1090, 557)), ("+", [(860, 557), (940, 557), (907, 664), (893, 664)]), ("-", "helmet")],
      "leggings": [("+", rect(760, 557, 1040, 940)), ("-", [(860, 557), (940, 557), (907, 664), (893, 664)]),
                   ("-", rect(640, 752, 796, 1000)), ("-", rect(1003, 752, 1160, 1000))],
      "gauntlet_left": [("+", rect(578, 342, 712, 712))],
      "gauntlet_right": [("+", rect(1073, 342, 1207, 712))],
      "boot_left": [("+", rect(648, 752, 796, 982))],
      "boot_right": [("+", rect(1003, 752, 1152, 982))],
    },
    lines=[[(460, 436), (546, 436), (582, 474), (605, 474)], [(1171, 474), (1200, 474), (1239, 436), (1320, 436)],
           [(587, 632), (558, 658)], [(1180, 631), (1199, 655), (1235, 655)],
           [(792, 690), (765, 717), (690, 717)], [(716, 830), (698, 850), (630, 850)], [(1079, 830), (1097, 850), (1170, 850)],
           ([(560, 689.5), (680, 689.5), (686, 693), (688.5, 700), (688.5, 816)], 4)],   # panel border touches a fingertip: thin erase
    dots=[(587, 632, 6), (1180, 631, 6), (792, 690, 5), (716, 830, 6.5), (1079, 830, 6.5)],
    erase=[rect(686, 700, 699, 816),
           [(640, 1000), (640, 970), (747, 968), (753, 958), (760, 948), (764, 953), (800, 953), (800, 1000)],
           [(1000, 1000), (1000, 953), (1032, 953), (1037, 948), (1043, 958), (1050, 968), (1160, 970), (1160, 1000)],
           rect(640, 972, 1160, 1000)],
    floor_y=880,
    origin=(900, 969),
    attach={"leggings": (900, 560), "chestplate": (900, 452), "helmet": (900, 362), "gauntlet_left": (646, 470),
            "gauntlet_right": (1140, 470), "boot_left": (735, 966), "boot_right": (1065, 966)},
    grip={"gauntlet_left": (640, 605), "gauntlet_right": (1135, 605)},   # palm centre: where a weapon handle goes
  ),
  "back": dict(
    source="source/azure-wing-sheet-back.jpg",
    figure=(570, 110, 1215, 990),
    seg_boxes={"helmet": (790, 120, 1010, 352), "chest": (712, 322, 1090, 590), "legs": (735, 530, 1050, 900),
               "gauntlet_l": (580, 345, 710, 705), "gauntlet_r": (1075, 345, 1205, 705),
               "boot_l": (655, 795, 805, 990), "boot_r": (985, 795, 1135, 990)},
    regions={
      "helmet": [("+", rect(795, 112, 1005, 348))],
      "chestplate": [("+", rect(705, 348, 1095, 551)), ("+", [(878, 551), (922, 551), (906, 576), (894, 576)])],
      "leggings": [("+", rect(735, 551, 1050, 905)), ("-", [(878, 551), (922, 551), (906, 576), (894, 576)]),
                   ("-", rect(640, 795, 784, 1000)), ("-", rect(1003, 795, 1160, 1000))],
      "gauntlet_left": [("+", rect(578, 342, 712, 708))],
      "gauntlet_right": [("+", rect(1073, 342, 1207, 708))],
      "boot_left": [("+", rect(650, 795, 784, 985))],
      "boot_right": [("+", rect(1006, 795, 1140, 985))],
    },
    lines=[[(460, 436), (546, 436), (582, 474), (604, 474)], [(1178, 474), (1201, 474), (1239, 436), (1320, 436)],
           [(589, 632), (560, 659)], [(1180, 632), (1205, 657), (1240, 657)],
           [(791, 690), (762, 716), (690, 716)], [(716, 830), (700, 851), (630, 851)], [(1078, 830), (1100, 851), (1170, 851)],
           ([(560, 690), (680, 690), (686, 693), (688.5, 700), (688.5, 806), (686, 811), (680, 812.5), (600, 812.5)], 4)],
    dots=[(589, 632, 6), (1180, 632, 6), (791, 690, 4.5), (716, 830, 9.5), (1078, 830, 9)],
    solid=[[(744, 830), (750, 821), (759, 818), (767, 821), (771, 830), (762, 847), (756, 847)],      # dark inside of the boot shafts
           [(1013, 832), (1019, 822), (1028, 818), (1037, 821), (1043, 830), (1033, 846), (1025, 846)]],
    erase=[rect(686, 700, 699, 806), rect(1181, 462, 1215, 481),   # line stub beside the right gauntlet
           [(640, 1000), (640, 964), (722, 963), (726, 979), (790, 979), (790, 1000)],
           [(1000, 1000), (1000, 979), (1062, 979), (1066, 965), (1130, 965), (1130, 1000)],
           rect(640, 981, 1160, 1000)],
    floor_y=880,
    origin=(900, 978),
    attach={"leggings": (900, 560), "chestplate": (900, 452), "helmet": (900, 335), "gauntlet_left": (642, 470),
            "gauntlet_right": (1140, 470), "boot_left": (735, 975), "boot_right": (1060, 975)},
    grip={"gauntlet_left": (638, 600), "gauntlet_right": (1137, 600)},
  ),
  # weapon sheet: one greatsword shown from both faces. attach = centre of the grip; tip/pommel help orient it in code
  "weapon": dict(
    source="source/azure-wing-weapon-sheet.jpg",
    figure=(520, 120, 1255, 995),
    seg_boxes={"sword_front": (525, 125, 830, 985), "sword_back": (945, 125, 1250, 985)},
    regions={"greatsword_front": [("+", rect(525, 128, 830, 985))], "greatsword_back": [("+", rect(945, 128, 1250, 985))]},
    # lines stop a few px short of the blade; the last stretch is erased as a 3 px strip (erase) so the gold edge survives
    lines=[[(440, 433), (545, 470), (614, 470)], [(450, 655), (540, 620), (628, 620)],
           [(500, 220), (570, 220), (633, 282)], [(572, 828), (556, 845), (495, 845)],
           [(1160, 470), (1220, 470), (1310, 433)], [(1140, 620), (1205, 620), (1240, 650), (1318, 650)],
           [(1130, 282), (1190, 222), (1265, 222)], [(1208, 832), (1230, 852), (1300, 852)]],

    dots=[(633, 282, 6.5), (572, 828, 7), (1130, 282, 6.5), (1208, 832, 7)],
    # where a line runs into the blade's glow: rebuild those rows from the rows just above and below (measured on the 4x image)
    inpaint_rows=[(606, 466.5, 629, 473.5), (622, 617.5, 645.3, 624), (1145.5, 467.5, 1170, 473), (1126.9, 619.5, 1150, 625.5)],
    erase=[           rect(520, 981, 1255, 995),   # cast shadow under each blade, just below its lower edge
           [(530, 977), (580, 975), (600, 973), (620, 969), (640, 964), (660, 957), (680, 950), (700, 945), (700, 995), (530, 995)],
           [(1090, 944), (1100, 945), (1120, 955), (1140, 963), (1160, 969), (1180, 973), (1200, 975), (1240, 978), (1255, 978), (1255, 995), (1090, 995)]],
    floor_y=950,
    floor_shadow=True,          # the blade casts a dark shadow on the floor: never treat dark pixels below floor_y as metal
    origin=(900, 980),
    attach={"greatsword_front": (684, 232), "greatsword_back": (1093, 232)},
    tip={"greatsword_front": (539, 976), "greatsword_back": (1237, 976)},
    pommel={"greatsword_front": (683, 134), "greatsword_back": (1093, 134)},
  ),
  # assembled character (one body per sheet) for the rigged playground
  "body_front": dict(
    source="source/azure-wing-body-front.jpg",
    figure=(690, 120, 1110, 990),
    seg_boxes={"top": (690, 120, 1110, 560), "bottom": (690, 500, 1110, 990)},
    regions={"body": [("+", rect(692, 122, 1108, 985))]},
    lines=[[(600, 222), (712, 222), (808, 305), (813, 307)], [(976, 282), (1003, 258), (1040, 222), (1155, 222)],
           [(600, 471.5), (712, 471.5)], [(1080, 471.5), (1200, 471.5)], [(1090, 634.5), (1200, 634.5)],
           [(690, 717), (757, 717), (788, 690)],
           [(718, 830), (698, 850), (600, 850)], [(1078, 830), (1100, 850), (1200, 850)]],
    dots=[(976, 282, 6.5), (715, 833, 7), (1078, 833, 7)],
    inpaint_rows=[(709, 468.5, 722, 475), (1062, 468.5, 1082, 475), (1074, 631.5, 1092, 637.5)],
    erase=[rect(690, 977, 1110, 990), rect(852, 940, 938, 990),          # floor: below the soles and between the feet
           rect(818, 968, 852, 990), rect(938, 966, 962, 990)],
    floor_y=930, floor_shadow=True,
    origin=(900, 975),
    attach={"body": (900, 975)},
  ),
  "body_back": dict(
    source="source/azure-wing-body-back.jpg",
    figure=(690, 120, 1110, 990),
    seg_boxes={"top": (690, 120, 1110, 560), "bottom": (690, 500, 1110, 990)},
    regions={"body": [("+", rect(692, 122, 1108, 985))]},
    lines=[[(600, 222), (712, 222), (801, 302)], [(975, 281), (1003, 256), (1040, 222), (1155, 222)],
           [(600, 471), (731, 471)], [(1095, 471), (1200, 471)],
           [(690, 716), (760, 716), (792, 689)],
           [(718, 830), (698, 850), (600, 850)], [(1078, 830), (1100, 850), (1200, 850)]],
    dots=[(975, 281, 6.5), (731, 471, 6), (1095, 471, 6), (792, 689, 5), (715, 833, 7), (1078, 833, 7)],
    erase=[rect(690, 981, 1110, 990), rect(852, 930, 962, 990),          # floor: below the soles and between the feet
           [(735, 968), (792, 966), (792, 990), (735, 990)], [(1025, 966), (1065, 968), (1065, 990), (1025, 990)]],
    floor_y=930, floor_shadow=True,
    origin=(900, 975),
    attach={"body": (900, 975)},
  ),
  "body_side": dict(
    source="source/azure-wing-body-side.jpg",
    figure=(770, 110, 1040, 990),
    seg_boxes={"top": (770, 110, 1040, 560), "bottom": (770, 500, 1040, 990)},
    regions={"body": [("+", rect(772, 112, 1038, 985))]},
    lines=[[(700, 222), (798, 300)], [(976, 283), (1040, 222), (1155, 222)], [(690, 717), (760, 717), (792, 690)]],
    dots=[(798, 300, 8), (976, 283, 11), (792, 690, 7)],
    erase=[rect(770, 981, 1040, 990)],
    floor_y=930, floor_shadow=True,
    origin=(890, 975),
    attach={"body": (890, 975)},
  ),
  # 45-degree camera turntable views (cut by turntable.py: background model + pedestal and boot-shadow removal)
  "body_front45": dict(source="source/turntable/view01.jpg", figure=(680, 70, 1130, 970), origin=(855, 882)),
  "body_quarter45": dict(source="source/turntable/view02.jpg", figure=(680, 70, 1130, 970), origin=(850, 865)),
  "body_back45": dict(source="source/turntable/view04.jpg", figure=(680, 70, 1130, 970), origin=(905, 872)),
}
