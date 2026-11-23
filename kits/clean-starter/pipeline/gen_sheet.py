#!/usr/bin/env python3
"""One image from a reference image and a prompt with Meshy Image to Image (e.g. an armour-set sheet in a fixed layout).
usage: gen_sheet.py REF.jpg PROMPT.txt OUT.png [--model gpt-image-2] [--aspect 16:9] [--keep-bg]
  the background is removed (transparent PNG) unless --keep-bg; the task id is kept in OUT.png.task so a rerun resumes it"""
import sys, os, json, time, base64, urllib.request
API = "https://api.meshy.ai/openapi/v1"
a = sys.argv[1:]; ref, pf, out = a[0], a[1], a[2]
opt = lambda n, d: a[a.index(n) + 1] if n in a else d
model, aspect = opt("--model", "gpt-image-2"), opt("--aspect", "16:9")
def call(m, p, b=None):
    req = urllib.request.Request(API + p, method=m, data=json.dumps(b).encode() if b is not None else None, headers={"Content-Type": "application/json"})
    if os.environ.get("MESHY_API_KEY"): req.add_header("Authorization", "Bearer " + os.environ["MESHY_API_KEY"])
    try:
        with urllib.request.urlopen(req, timeout=180) as r: return json.loads(r.read() or b"{}")
    except urllib.error.HTTPError as e: raise SystemExit(f"Meshy {m} {p}: HTTP {e.code} {e.read()[:400]!r}")
tf = out + ".task"
if os.path.exists(tf): tid = open(tf).read().strip()
else:
    mime = "image/png" if ref.endswith(".png") else "image/jpeg"
    tid = call("POST", "/image-to-image", {"ai_model": model, "prompt": open(pf).read(), "aspect_ratio": aspect, "remove_background": "--keep-bg" not in a,
                                          "reference_image_urls": [f"data:{mime};base64," + base64.b64encode(open(ref, "rb").read()).decode()]})["result"]
    open(tf, "w").write(tid)
while True:
    d = call("GET", f"/image-to-image/{tid}"); st = d.get("status"); print(f"  {tid[:8]} {st} {d.get('progress')}%", flush=True)
    if st == "SUCCEEDED": break
    if st in ("FAILED", "CANCELED"): raise SystemExit(f"{st}: {d.get('task_error')}")
    time.sleep(8)
with urllib.request.urlopen(d["image_urls"][0], timeout=300) as r, open(out, "wb") as f: f.write(r.read())
print("saved", out, "balance", call("GET", "/balance").get("balance"))
