#!/usr/bin/env python3
"""Merge Meshy animation GLBs of one rig into a single model for the browser.
usage: meshy_merge.py OUT.gltf.json BASE.glb [MORE.glb ...] [--albedo PAINTED.png] [--images DIR]
  BASE.glb: rigged character with clips (Meshy Animation task, action_ids); every MORE.glb holds more clips on the same rig,
  their animations are appended (accessors and buffer data copied, node indices remapped by name).
  The base colour texture is re-encoded to 2048 px JPEG; the result is glTF JSON with one base64 buffer
  (artifact pages cannot serve .glb, and the page rebuilds a GLB from it in memory).
"""
import sys, json, struct, base64, io
import numpy as np, cv2
def read(p):
    b = open(p, "rb").read(); jl = struct.unpack("<I", b[12:16])[0]; j = json.loads(b[20:20 + jl])
    o = 20 + jl; bl = struct.unpack("<I", b[o:o + 4])[0]; return j, bytearray(b[o + 8:o + 8 + bl])
args = sys.argv[1:]
def opt(n):
    if n in args: i = args.index(n); v = args[i + 1]; del args[i:i + 2]; return v
ALBEDO, IMGDIR = opt("--albedo"), opt("--images")
out, base, more = args[0], args[1], args[2:]
J, BIN = read(base)
def add_view(data):
    global BIN
    while len(BIN) % 4: BIN.append(0)
    J["bufferViews"].append({"buffer": 0, "byteOffset": len(BIN), "byteLength": len(data)}); BIN += data; return len(J["bufferViews"]) - 1
# textures: 2048 px JPEG; the base colour can be replaced by the painted one; optionally written beside the model as files
mat = J["materials"][0]; base_tex = mat.get("pbrMetallicRoughness", {}).get("baseColorTexture", {}).get("index")
roles = {base_tex: "basecolor", mat.get("normalTexture", {}).get("index"): "normal", mat.get("pbrMetallicRoughness", {}).get("metallicRoughnessTexture", {}).get("index"): "metalrough"}
for ii, img in enumerate(J.get("images", [])):
    role = next((r for t, r in roles.items() if t is not None and J["textures"][t]["source"] == ii), "image%d" % ii)
    bv = J["bufferViews"][img["bufferView"]]; raw = bytes(BIN[bv.get("byteOffset", 0): bv.get("byteOffset", 0) + bv["byteLength"]])
    im = cv2.imread(ALBEDO) if (role == "basecolor" and ALBEDO) else cv2.imdecode(np.frombuffer(raw, np.uint8), cv2.IMREAD_COLOR); h, w = im.shape[:2]
    if max(h, w) > 2048: im = cv2.resize(im, (2048 * w // max(h, w), 2048 * h // max(h, w)), interpolation=cv2.INTER_AREA)
    ok, enc = cv2.imencode(".jpg", im, [cv2.IMWRITE_JPEG_QUALITY, 92 if role == "normal" else 90])
    if IMGDIR:
        import os; os.makedirs(IMGDIR, exist_ok=True); fn = "knight_%s.jpg" % role; open(os.path.join(IMGDIR, fn), "wb").write(bytes(enc))
        del img["bufferView"]; img["uri"] = fn; img["mimeType"] = "image/jpeg"
    else: img["bufferView"] = add_view(bytes(enc)); img["mimeType"] = "image/jpeg"
    print("texture", role, (w, h), "->", im.shape[1::-1], len(raw), "->", len(enc))
names = {n.get("name"): i for i, n in enumerate(J["nodes"])}
for p in more:
    j, b = read(p); nn = [n.get("name") for n in j["nodes"]]
    for a in j.get("animations", []):
        amap = {}
        def acc(i):
            if i in amap: return amap[i]
            A = dict(j["accessors"][i]); V = j["bufferViews"][A["bufferView"]]
            data = bytes(b[V.get("byteOffset", 0): V.get("byteOffset", 0) + V["byteLength"]])
            A["bufferView"] = add_view(data); J["accessors"].append(A); amap[i] = len(J["accessors"]) - 1; return amap[i]
        na = {"name": a["name"], "samplers": [], "channels": []}
        for s in a["samplers"]: na["samplers"].append({"input": acc(s["input"]), "output": acc(s["output"]), "interpolation": s.get("interpolation", "LINEAR")})
        for c in a["channels"]:
            t = dict(c["target"]); t["node"] = names[nn[t["node"]]]; na["channels"].append({"sampler": c["sampler"], "target": t})
        J["animations"].append(na); print("added", a["name"])
# compact: keep only the buffer views something still points at
used = sorted({a["bufferView"] for a in J["accessors"] if "bufferView" in a} | {i["bufferView"] for i in J.get("images", []) if "bufferView" in i})
remap, NB = {}, bytearray()
for k in used:
    V = J["bufferViews"][k]; data = BIN[V.get("byteOffset", 0): V.get("byteOffset", 0) + V["byteLength"]]
    while len(NB) % 4: NB.append(0)
    nv = dict(V); nv["byteOffset"] = len(NB); NB += data; remap[k] = len(remap); J["bufferViews"][k] = nv
J["bufferViews"] = [J["bufferViews"][k] for k in used]
for a in J["accessors"]:
    if "bufferView" in a: a["bufferView"] = remap[a["bufferView"]]
for i in J.get("images", []):
    if "bufferView" in i: i["bufferView"] = remap[i["bufferView"]]
BIN = NB
J["buffers"] = [{"byteLength": len(BIN), "uri": "data:application/octet-stream;base64," + base64.b64encode(bytes(BIN)).decode()}]
json.dump(J, open(out, "w"), separators=(",", ":"))
print("clips", [a["name"] for a in J["animations"]], "bytes", len(BIN))
