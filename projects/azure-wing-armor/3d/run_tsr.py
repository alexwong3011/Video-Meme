"""Run TripoSR (CPU) on a cut-out RGBA image. usage: run_tsr.py in.png out_dir [mc_res]"""
import sys, os, time, numpy as np, torch
from PIL import Image
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "TripoSR"))
from tsr.system import TSR

src, out = sys.argv[1], sys.argv[2]
res = int(sys.argv[3]) if len(sys.argv) > 3 else 256
os.makedirs(out, exist_ok=True)
torch.set_num_threads(os.cpu_count())

# object centred on a square, 85% of the frame, composited on 50% grey (what TripoSR was trained on)
im = Image.open(src).convert("RGBA")
im = im.crop(im.getchannel("A").point(lambda v: 255 if v > 10 else 0).getbbox())
side = int(max(im.size) / 0.85)
sq = Image.new("RGBA", (side, side), (0, 0, 0, 0))
sq.alpha_composite(im, ((side - im.width) // 2, (side - im.height) // 2))
a = np.asarray(sq).astype(np.float32) / 255
rgb = a[:, :, :3] * a[:, :, 3:] + 0.5 * (1 - a[:, :, 3:])
inp = Image.fromarray((rgb * 255).astype(np.uint8)).resize((512, 512), Image.LANCZOS)
inp.save(os.path.join(out, "input.png"))

t = time.time()
model = TSR.from_pretrained("stabilityai/TripoSR", config_name="config.yaml", weight_name="model.ckpt")
model.renderer.set_chunk_size(8192)
model.to("cpu")
print("model loaded", round(time.time() - t, 1), "s", flush=True)

t = time.time()
with torch.no_grad():
    codes = model([inp], device="cpu")
print("triplane", round(time.time() - t, 1), "s", flush=True)

t = time.time()
meshes = model.extract_mesh(codes, True, resolution=res)
print("mesh", round(time.time() - t, 1), "s", len(meshes[0].vertices), "verts", flush=True)
meshes[0].export(os.path.join(out, "mesh.obj"))
meshes[0].export(os.path.join(out, "mesh.glb"))
torch.save(codes, os.path.join(out, "codes.pt"))
