#!/usr/bin/env python3
"""A boss from a text prompt with Meshy: concept art (Text to Image) -> textured 3D model (Image to 3D) -> web model (glTF JSON + JPEG textures).
usage: gen_boss.py BOSSES.json KEY OUTDIR WEBDIR [--steps concept,model,web] [--poly 40000]
  BOSSES.json: {KEY: {"prompt": "...", ...}}; state (task ids) is kept in OUTDIR/KEY/state.json so a rerun resumes without new credits"""
import sys, os, json, time, base64, urllib.request, subprocess
API = "https://api.meshy.ai/openapi/v1"
a = sys.argv[1:]; spec, key, outd, webd = json.load(open(a[0]))[a[1]], a[1], a[2], a[3]
opt = lambda n, d: a[a.index(n) + 1] if n in a else d
steps = opt("--steps", "concept,model,web").split(","); poly = int(opt("--poly", "40000"))
def call(m, p, b=None):
    req = urllib.request.Request(API + p, method=m, data=json.dumps(b).encode() if b is not None else None, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=180) as r: return json.loads(r.read() or b"{}")
    except urllib.error.HTTPError as e: raise SystemExit(f"Meshy {m} {p}: HTTP {e.code} {e.read()[:400]!r}")
def wait(kind, tid, every=8):
    while True:
        d = call("GET", f"/{kind}/{tid}"); st = d.get("status"); print(f"  {key} {kind} {st} {d.get('progress')}%", flush=True)
        if st == "SUCCEEDED": return d
        if st in ("FAILED", "CANCELED"): raise SystemExit(f"{key} {kind} {st}: {d.get('task_error')}")
        time.sleep(every)
def fetch(u, p):
    with urllib.request.urlopen(u, timeout=600) as r, open(p, "wb") as f: f.write(r.read())
D = os.path.join(outd, key); os.makedirs(D, exist_ok=True); sp = os.path.join(D, "state.json")
S = json.load(open(sp)) if os.path.exists(sp) else {}; save = lambda: json.dump(S, open(sp, "w"), indent=1)
style = (" Full body, the whole creature visible and centered, three-quarter front view, slightly from below so it looks huge and majestic."
         " Bright, luminous, ornate legendary fantasy game boss, polished hand-painted 3D game-asset look, crisp details, clear readable silhouette,"
         " solid sculptural forms (no thin wisps, no loose particles, no smoke). Plain flat white background, no ground, no shadow, no text, no frame.")
img = os.path.join(D, "concept.png")
if "concept" in steps and not os.path.exists(img):
    if not S.get("img_task"): S["img_task"] = call("POST", "/text-to-image", {"ai_model": "gpt-image-2", "prompt": spec["prompt"] + style, "aspect_ratio": "1:1"})["result"]; save()
    d = wait("text-to-image", S["img_task"]); fetch(d["image_urls"][0], img); print("concept", img)
glb = os.path.join(D, "model.glb")
if "model" in steps and not os.path.exists(glb):
    if not S.get("model_task"):
        S["model_task"] = call("POST", "/image-to-3d", {"image_url": "data:image/png;base64," + base64.b64encode(open(img, "rb").read()).decode(), "ai_model": "latest",
            "should_texture": True, "enable_pbr": True, "should_remesh": True, "topology": "triangle", "target_polycount": poly, "image_enhancement": False})["result"]; save()
    d = wait("image-to-3d", S["model_task"], 15); fetch(d["model_urls"]["glb"], glb); print("model", glb)
if "web" in steps:
    os.makedirs(webd, exist_ok=True)
    subprocess.run([sys.executable, os.path.join(os.path.dirname(os.path.abspath(__file__)), "meshy_merge.py"), os.path.join(webd, f"{key}.gltf.json"), glb, "--images", webd], check=True)
print("balance", call("GET", "/balance").get("balance"))
