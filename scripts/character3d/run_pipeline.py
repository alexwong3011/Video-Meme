#!/usr/bin/env python3
"""Character 3D pipeline: cleaned A-pose views -> Meshy model -> finger rig -> library animations -> painted texture -> web model.

usage: run_pipeline.py CONFIG.json [--from STEP] [--only STEP]
  steps, in order (each saves its result in OUT/state.json, so a rerun resumes where it stopped):
    generate   Multi-Image to 3D from the four cleaned views (front first)            ~35 credits with the default settings
    rig        Rigging with finger bones, scaled to height_m                          5 credits
    animate    Library animations in batches of at most 10 action ids                3 credits per action
    download   the static model (for the bake) and the animated GLBs
    bake       paint the A-pose views onto the model's base colour (apose_bake.py)
    merge      one web model: clips from every batch, the painted base colour, textures as JPEG files (meshy_merge.py)
  The Meshy API key: in a Claude Code cloud session it is injected by the network proxy for api.meshy.ai (nothing to set);
  elsewhere set MESHY_API_KEY. Generated files on assets.meshy.ai must be reachable for the download step.
See README.md next to this file for the whole process and config.example.json for every option.
"""
import sys, os, json, time, base64, subprocess, urllib.request, struct
HERE = os.path.dirname(os.path.abspath(__file__))
API = "https://api.meshy.ai/openapi/v1"
STEPS = ["generate", "rig", "animate", "download", "bake", "merge"]

def call(method, path, body=None):
    req = urllib.request.Request(API + path, method=method, data=json.dumps(body).encode() if body is not None else None)
    req.add_header("Content-Type", "application/json")
    if os.environ.get("MESHY_API_KEY"): req.add_header("Authorization", "Bearer " + os.environ["MESHY_API_KEY"])
    try:
        with urllib.request.urlopen(req, timeout=180) as r: return json.loads(r.read() or b"{}")
    except urllib.error.HTTPError as e: raise SystemExit(f"Meshy {method} {path}: HTTP {e.code} {e.read()[:400]!r}")

def wait(kind, tid, every=10, limit=3600):
    t0 = time.time()
    while True:
        d = call("GET", f"/{kind}/{tid}"); st = d.get("status")
        print(f"  {kind} {tid[:8]} {st} {d.get('progress')}%", flush=True)
        if st == "SUCCEEDED": return d
        if st in ("FAILED", "CANCELED", "EXPIRED"): raise SystemExit(f"{kind} task {tid} {st}: {d.get('task_error')}")
        if time.time() - t0 > limit: raise SystemExit(f"{kind} task {tid} still {st} after {limit}s")
        time.sleep(every)

def fetch(url, path):
    with urllib.request.urlopen(url, timeout=900) as r, open(path, "wb") as f:
        while True:
            b = r.read(1 << 20)
            if not b: break
            f.write(b)
    print("  saved", path, os.path.getsize(path), "bytes", flush=True)

def data_uri(path):
    import cv2
    im = cv2.imread(path); ok, b = cv2.imencode(".jpg", im, [cv2.IMWRITE_JPEG_QUALITY, 95])
    return "data:image/jpeg;base64," + base64.b64encode(b.tobytes()).decode()

def base_color_from_glb(glb, out_path):
    b = open(glb, "rb").read(); jl = struct.unpack("<I", b[12:16])[0]; j = json.loads(b[20:20 + jl]); o = 20 + jl; bin_ = b[o + 8:]
    tex = j["materials"][0]["pbrMetallicRoughness"]["baseColorTexture"]["index"]; img = j["images"][j["textures"][tex]["source"]]
    v = j["bufferViews"][img["bufferView"]]; open(out_path, "wb").write(bin_[v.get("byteOffset", 0): v.get("byteOffset", 0) + v["byteLength"]])

def main():
    args = sys.argv[1:]; cfg_path = args[0]; cfg = json.load(open(cfg_path)); base = os.path.dirname(os.path.abspath(cfg_path))
    P = lambda p: p if os.path.isabs(p) else os.path.join(base, p)
    out = P(cfg["out_dir"]); os.makedirs(out, exist_ok=True); sp = os.path.join(out, "state.json")
    S = json.load(open(sp)) if os.path.exists(sp) else {}
    save = lambda: json.dump(S, open(sp, "w"), indent=1)
    first = STEPS.index(args[args.index("--from") + 1]) if "--from" in args else 0
    only = args[args.index("--only") + 1] if "--only" in args else None
    todo = [s for s in STEPS[first:] if only in (None, s)]
    views = [os.path.join(P(cfg["views_white"]), v + ".png") for v in cfg.get("views", ["front", "left", "back", "right"])]

    if "generate" in todo and not S.get("model_task"):
        body = dict(cfg["model"]); body["image_urls"] = [data_uri(v) for v in views]
        S["model_task"] = call("POST", "/multi-image-to-3d", body)["result"]; save(); print("generate:", S["model_task"])
    if "generate" in todo: S["model"] = wait("multi-image-to-3d", S["model_task"], 15)["model_urls"]["glb"]; save()

    if "rig" in todo and not S.get("rig_task"):
        S["rig_task"] = call("POST", "/rigging", {"input_task_id": S["model_task"], "height_meters": cfg.get("height_m", 2.0),
                                                   "include_fingers": cfg.get("include_fingers", True)})["result"]; save(); print("rig:", S["rig_task"])
    if "rig" in todo: wait("rigging", S["rig_task"]); save()

    acts = cfg["actions"]; batches = [acts[i:i + 10] for i in range(0, len(acts), 10)]
    if "animate" in todo:
        S.setdefault("anim_tasks", [])
        for i, b in enumerate(batches):
            if i < len(S["anim_tasks"]): continue
            S["anim_tasks"].append(call("POST", "/animations", {"rig_task_id": S["rig_task"], "action_ids": b})["result"]); save()
        S["anim_urls"] = [wait("animations", t)["result"]["animation_glb_url"] for t in S["anim_tasks"]]; save()

    if "download" in todo:
        if not S.get("model"): S["model"] = call("GET", f"/multi-image-to-3d/{S['model_task']}")["model_urls"]["glb"]
        fetch(S["model"], os.path.join(out, "model.glb"))
        for i, t in enumerate(S["anim_tasks"]):        # signed URLs expire: ask for fresh ones
            url = call("GET", f"/animations/{t}")["result"]["animation_glb_url"]; fetch(url, os.path.join(out, f"anim{i + 1}.glb"))

    albedo = os.path.join(out, "albedo_painted.png")
    if "bake" in todo and cfg.get("bake", True):
        base_color_from_glb(os.path.join(out, "model.glb"), os.path.join(out, "albedo_meshy.jpg"))
        subprocess.run([sys.executable, os.path.join(HERE, "apose_bake.py"), os.path.join(out, "model.glb"), P(cfg["views_transparent"]),
                        os.path.join(out, "albedo_meshy.jpg"), albedo, str(cfg.get("bake_size", 4096))], check=True)

    if "merge" in todo:
        dest = P(cfg["web_dir"]); os.makedirs(dest, exist_ok=True)
        anims = [os.path.join(out, f"anim{i + 1}.glb") for i in range(len(S["anim_tasks"]))]
        cmd = [sys.executable, os.path.join(HERE, "meshy_merge.py"), os.path.join(dest, cfg.get("web_name", "character") + ".gltf.json"), *anims, "--images", dest]
        if cfg.get("bake", True) and os.path.exists(albedo): cmd += ["--albedo", albedo]
        subprocess.run(cmd, check=True)
    print("balance:", call("GET", "/balance").get("balance"), "credits")

if __name__ == "__main__": main()
