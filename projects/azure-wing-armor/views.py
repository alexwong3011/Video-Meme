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
  floor_y      y where the floor glow starts (matte gets stricter below it)
  origin       character origin: between the feet, on the floor
  attach       piece -> socket point (pivot) used for rigging
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
  ),
}
