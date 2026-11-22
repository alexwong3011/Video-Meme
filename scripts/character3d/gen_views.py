#!/usr/bin/env python3
"""Generate the A-pose views of a character variant with Meshy Image to Image, from an existing character's clean views,
so the new one keeps the same body proportions, pose and framing (and so the same rig fits it).
usage: gen_views.py REF_WHITE_DIR OUT_DIR PROMPT_FILE [--model gpt-image-2] [--only front|side|back]
  REF_WHITE_DIR: {front,left,back}.png of the existing character (apose.py output, white background)
  PROMPT_FILE: JSON {"character": "...description of the new outfit/character..."}
  writes OUT_DIR/{front,side,back}.png (transparent, Meshy's background removal) and OUT_DIR/tasks.json (resumable)
"""
import sys, os, json, time, base64, urllib.request
API = "https://api.meshy.ai/openapi/v1"
args = sys.argv[1:]; ref, out, pf = args[0], args[1], args[2]
model = args[args.index("--model") + 1] if "--model" in args else "gpt-image-2"
only = args[args.index("--only") + 1] if "--only" in args else None
os.makedirs(out, exist_ok=True); CH = json.load(open(pf))["character"]
sp = os.path.join(out, "tasks.json"); T = json.load(open(sp)) if os.path.exists(sp) else {}
def call(method, path, body=None):
    req = urllib.request.Request(API + path, method=method, data=json.dumps(body).encode() if body is not None else None, headers={"Content-Type": "application/json"})
    if os.environ.get("MESHY_API_KEY"): req.add_header("Authorization", "Bearer " + os.environ["MESHY_API_KEY"])
    try:
        with urllib.request.urlopen(req, timeout=180) as r: return json.loads(r.read() or b"{}")
    except urllib.error.HTTPError as e: raise SystemExit(f"Meshy {method} {path}: HTTP {e.code} {e.read()[:400]!r}")
def uri(p): return "data:image/png;base64," + base64.b64encode(open(p, "rb").read()).decode()
def wait(tid):
    while True:
        d = call("GET", f"/image-to-image/{tid}"); st = d.get("status"); print(f"  {tid[:8]} {st} {d.get('progress')}%", flush=True)
        if st == "SUCCEEDED": return d
        if st in ("FAILED", "CANCELED"): raise SystemExit(f"task {tid} {st}: {d.get('task_error')}")
        time.sleep(8)
COMMON = ("Orthographic, camera at chest height, no perspective distortion. Full body from the top of the head to the soles, centered, "
          "with empty margin around. Flat even studio lighting, no strong shadows, no glow, no floor, no cast shadow. Plain white background. "
          "No text, no labels, no weapon, no armor.")
PROMPTS = {
  "front": ("front", ["front"], "Image 1 shows a character standing in a neutral A-pose, seen from the front. Draw a DIFFERENT outfit on exactly the same body: "
            "the same height, body proportions, head size, pose, arm angle, hand position, leg stance, camera framing and scale as image 1, but with no armor at all. "
            f"{CH} Front view, facing the camera. Arms straight and held 35 degrees away from the body with a clear gap under the armpits, hands open and relaxed. {COMMON}"),
  "side": ("side", ["front:new", "left"], "Image 1 is the front view of this character. Image 2 shows the exact pose, framing and scale for the side view. "
           f"Draw the same character as image 1 (same face, hair, outfit, colors and every detail) seen from its left side: exact profile facing screen-left, in the same pose, proportions and scale as image 2. {CH} {COMMON}"),
  "back": ("back", ["front:new", "back"], "Image 1 is the front view of this character. Image 2 shows the exact pose, framing and scale for the back view. "
           f"Draw the same character as image 1 (same hair, outfit, colors and every detail) seen from directly behind, in the same pose, proportions and scale as image 2. {CH} {COMMON}"),
}
for v in ["front", "side", "back"]:
    if only and v != only: continue
    name, refs, prompt = PROMPTS[v]
    if not T.get(v):
        imgs = [uri(os.path.join(out, "front.png")) if r == "front:new" else uri(os.path.join(ref, r + ".png")) for r in refs]
        T[v] = call("POST", "/image-to-image", {"ai_model": model, "prompt": prompt, "reference_image_urls": imgs, "aspect_ratio": "2:3" if "gpt" in model else "3:4", "remove_background": True})["result"]
        json.dump(T, open(sp, "w"), indent=1); print(v, "task", T[v], flush=True)
    d = wait(T[v]); url = (d.get("image_urls") or [None])[0]
    with urllib.request.urlopen(url, timeout=300) as r, open(os.path.join(out, v + ".png"), "wb") as f: f.write(r.read())
    print("saved", v, flush=True)
print("balance:", call("GET", "/balance").get("balance"))
