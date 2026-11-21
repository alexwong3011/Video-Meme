"""Write the crops for one view into the current dir: crops/<box>.png (3x, for the segmentation model) and figure_in.png.
usage: prep.py VIEW"""
import sys, os
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from views import VIEWS
V = VIEWS[sys.argv[1]]
im = Image.open(os.path.join(os.path.dirname(os.path.abspath(__file__)), V["source"])).convert("RGB")
os.makedirs("crops", exist_ok=True); os.makedirs("cut", exist_ok=True)
for k, b in V["seg_boxes"].items():
    c = im.crop(b); c.resize((c.width * 3, c.height * 3), Image.LANCZOS).save(f"crops/{k}.png")
im.crop(V["figure"]).save("figure_in.png")
