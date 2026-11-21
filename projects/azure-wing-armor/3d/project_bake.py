"""Paint the front and back reference art onto a 3D body mesh and bake it into one texture (Blender, CPU).

usage: project_bake.py geo.glb front_rgba.png back_rgba.png out.glb [tex_size] [target_faces]
  1. fit each image's silhouette to the mesh's orthographic silhouette (scale + offset, best overlap)
  2. per-vertex visibility from the front and from the back (depth buffer of vertex splats)
  3. shader mixes the two projections by facing direction and visibility
  4. decimate, smart-UV unwrap, bake to one texture, export glTF
"""
import sys, math, numpy as np, bpy, bmesh
from PIL import Image

geo, f_img, b_img, out = sys.argv[1:5]
TEX = int(sys.argv[5]) if len(sys.argv) > 5 else 2048
TARGET = int(sys.argv[6]) if len(sys.argv) > 6 else 40000

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=geo)
obj = [o for o in bpy.context.scene.objects if o.type == "MESH"][0]
bpy.context.view_layer.objects.active = obj; obj.select_set(True)
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

# ---- decimate first so UVs / weights live on the final mesh
nf = len(obj.data.polygons)
if nf > TARGET:
    mod = obj.modifiers.new("dec", "DECIMATE"); mod.ratio = TARGET / nf
    bpy.ops.object.modifier_apply(modifier="dec")
me = obj.data
V = np.array([v.co[:] for v in me.vertices])                 # Blender: X right, Y back(-Y = front), Z up
me.calc_normals_split() if hasattr(me, "calc_normals_split") else None
N = np.array([v.normal[:] for v in me.vertices])
print("faces", len(me.polygons), "verts", len(V))

def silhouette(px, pz, W=200, H=400, box=None):
    x0, x1, z0, z1 = box
    g = np.zeros((H, W), np.uint8)
    ix = np.clip(((px - x0) / (x1 - x0) * (W - 1)).astype(int), 0, W - 1)
    iz = np.clip(((z1 - pz) / (z1 - z0) * (H - 1)).astype(int), 0, H - 1)
    g[iz, ix] = 1
    return g

# morphological closing in numpy (no scipy needed)
def close(g, r=2):
    from numpy.lib.stride_tricks import sliding_window_view as sw
    p = np.pad(g, r); d = sw(p, (2 * r + 1, 2 * r + 1)).max(axis=(2, 3))
    p = np.pad(d, r, constant_values=1); return sw(p, (2 * r + 1, 2 * r + 1)).min(axis=(2, 3))

def fit2(img_path, mirror):
    im = Image.open(img_path).convert("RGBA"); A = np.asarray(im); a = A[:, :, 3] > 40
    ys, xs = np.where(a); by0, by1, bx0, bx1 = ys.min(), ys.max(), xs.min(), xs.max()
    px = -V[:, 0] if mirror else V[:, 0]; pz = V[:, 2]
    mx0, mx1, mz0, mz1 = px.min(), px.max(), pz.min(), pz.max()
    Hh = 320; Ww = int(Hh * (bx1 - bx0) / (by1 - by0)) + 1
    small = np.asarray(Image.fromarray(a[by0:by1 + 1, bx0:bx1 + 1].astype(np.uint8) * 255).resize((Ww, Hh), Image.BILINEAR)) > 100
    best = (-1, None)
    for sx in np.linspace(0.8, 1.2, 17):
        for sz in (0.96, 0.98, 1.0, 1.02):
            for ox in np.linspace(-0.08, 0.08, 9):
                cx = (mx0 + mx1) / 2 + ox * (mx1 - mx0); hw = (mx1 - mx0) / 2 / sx
                z0 = mz1 - (mz1 - mz0) / sz
                g = close(silhouette(px, pz, Ww, Hh, (cx - hw, cx + hw, z0, mz1)), 2).astype(bool)
                iou = (g & small).sum() / max(1, (g | small).sum())
                if iou > best[0]: best = (iou, (cx - hw, cx + hw, z0, mz1))
    x0, x1, z0, z1 = best[1]
    print(img_path.split("/")[-1], "silhouette IoU", round(best[0], 3))
    # uv in [0,1] of the whole image
    u = (bx0 + (px - x0) / (x1 - x0) * (bx1 - bx0)) / A.shape[1]
    v = 1 - (by0 + (z1 - pz) / (z1 - z0) * (by1 - by0)) / A.shape[0]
    return u, v

uf, vf = fit2(f_img, mirror=False)
ub, vb = fit2(b_img, mirror=True)

# ---- visibility: a vertex is seen from the front if it is (nearly) the front-most at its (x, z)
def visible(front):
    G = 360; x0, x1, z0, z1 = V[:, 0].min(), V[:, 0].max(), V[:, 2].min(), V[:, 2].max()
    ix = np.clip(((V[:, 0] - x0) / (x1 - x0) * (G - 1)).astype(int), 0, G - 1)
    iz = np.clip(((V[:, 2] - z0) / (z1 - z0) * (2 * G - 1)).astype(int), 0, 2 * G - 1)
    d = V[:, 1] if front else -V[:, 1]                       # smaller = nearer that camera
    buf = np.full((2 * G, G), np.inf); np.minimum.at(buf, (iz, ix), d)
    # spread the depth a little so sparse cells still occlude
    from numpy.lib.stride_tricks import sliding_window_view as sw
    p = np.pad(buf, 2, constant_values=np.inf); buf = sw(p, (5, 5)).min(axis=(2, 3))
    depth_extent = V[:, 1].max() - V[:, 1].min()
    return (d - buf[iz, ix]) < 0.06 * depth_extent

vis_f, vis_b = visible(True), visible(False)
facing = -N[:, 1]                                            # +1 = faces the front camera
sm = lambda e0, e1, x: np.clip((x - e0) / (e1 - e0), 0, 1) ** 2 * (3 - 2 * np.clip((x - e0) / (e1 - e0), 0, 1))
wf = sm(-0.35, 0.35, facing) * (0.15 + 0.85 * vis_f)
wb = sm(-0.35, 0.35, -facing) * (0.15 + 0.85 * vis_b)
wfront = wf / np.maximum(wf + wb, 1e-4)
print("front-weighted verts", round(float((wfront > 0.5).mean()), 3))

# ---- write UV maps + weight attribute (per loop)
uvF = me.uv_layers.new(name="projF"); uvB = me.uv_layers.new(name="projB")
attr = me.color_attributes.new("wfront", "FLOAT_COLOR", "POINT")
for i, w in enumerate(wfront): attr.data[i].color = (w, w, w, 1)
for loop in me.loops:
    vi = loop.vertex_index
    uvF.data[loop.index].uv = (uf[vi], vf[vi]); uvB.data[loop.index].uv = (ub[vi], vb[vi])

# ---- projection material
mat = bpy.data.materials.new("proj"); mat.use_nodes = True; nt = mat.node_tree; nt.nodes.clear()
outn = nt.nodes.new("ShaderNodeOutputMaterial"); emi = nt.nodes.new("ShaderNodeEmission")
def tex(path, uvname):
    t = nt.nodes.new("ShaderNodeTexImage"); t.image = bpy.data.images.load(path); t.extension = "EXTEND"
    u = nt.nodes.new("ShaderNodeUVMap"); u.uv_map = uvname; nt.links.new(u.outputs["UV"], t.inputs["Vector"]); return t
tf, tb = tex(f_img, "projF"), tex(b_img, "projB")
mix = nt.nodes.new("ShaderNodeMix"); mix.data_type = "RGBA"
col = nt.nodes.new("ShaderNodeVertexColor"); col.layer_name = "wfront"
nt.links.new(col.outputs["Color"], mix.inputs["Factor"])
nt.links.new(tb.outputs["Color"], mix.inputs[6]); nt.links.new(tf.outputs["Color"], mix.inputs[7])
nt.links.new(mix.outputs[2], emi.inputs["Color"]); nt.links.new(emi.outputs["Emission"], outn.inputs["Surface"])
me.materials.clear(); me.materials.append(mat)

# ---- unwrap + bake the mix into one texture
uvT = me.uv_layers.new(name="UVMap"); me.uv_layers.active = uvT; uvT.active_render = True
bpy.ops.object.mode_set(mode="EDIT"); bpy.ops.mesh.select_all(action="SELECT")
bpy.ops.uv.smart_project(angle_limit=math.radians(60), island_margin=0.003)
bpy.ops.object.mode_set(mode="OBJECT")
baked = bpy.data.images.new("baked", TEX, TEX, alpha=False)
bt = nt.nodes.new("ShaderNodeTexImage"); bt.image = baked; nt.nodes.active = bt
sc = bpy.context.scene; sc.render.engine = "CYCLES"; sc.cycles.device = "CPU"; sc.cycles.samples = 1
sc.render.bake.margin = 8
bpy.ops.object.bake(type="EMIT")
baked.filepath_raw = out.replace(".glb", "_albedo.png"); baked.file_format = "PNG"; baked.save()

# ---- final PBR material using the baked texture, drop helper layers, export
fin = bpy.data.materials.new("azure_wing"); fin.use_nodes = True; fn = fin.node_tree
bs = fn.nodes["Principled BSDF"]; it = fn.nodes.new("ShaderNodeTexImage"); it.image = baked
fn.links.new(it.outputs["Color"], bs.inputs["Base Color"])
bs.inputs["Metallic"].default_value = 0.35; bs.inputs["Roughness"].default_value = 0.42
me.materials.clear(); me.materials.append(fin)
for name in ("projF", "projB"): me.uv_layers.remove(me.uv_layers[name])
me.color_attributes.remove(me.color_attributes["wfront"])
bpy.ops.export_scene.gltf(filepath=out, export_format="GLB", use_selection=False)
print("exported", out)
