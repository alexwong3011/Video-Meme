"""Add a humanoid skeleton to the textured knight and skin it with Blender's automatic weights.

usage: rig3d.py textured.glb body_front.png layout.json out.glb [--test test_prefix]
Joints are picked on the front reference sheet (px), mapped onto the mesh through the silhouette bbox,
and pushed to the middle of the mesh in depth. Screen-left on the front sheet is the character's right (.R).
"""
import sys, json, math, numpy as np, bpy, mathutils
from PIL import Image

src, body_png, layout, out = sys.argv[1:5]
test = sys.argv[sys.argv.index("--test") + 1] if "--test" in sys.argv else None

# joints on the front sheet, reference px (x right, y down)
J = {
  "hips": (900, 572), "spine": (900, 500), "chest": (900, 420), "neck": (900, 318), "head_top": (900, 140),
  "shoulder.R": (796, 412), "elbow.R": (770, 497), "wrist.R": (748, 596), "hand_end.R": (737, 680),
  "hip.R": (852, 580), "knee.R": (836, 716), "ankle.R": (826, 912),
}
for k in list(J):
    if k.endswith(".R"): J[k[:-2] + ".L"] = (1800 - J[k][0], J[k][1])

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
mesh = [o for o in bpy.context.scene.objects if o.type == "MESH"][0]
import bmesh
bm = bmesh.new(); bm.from_mesh(mesh.data)
bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5); bm.to_mesh(mesh.data); bm.free()
print("verts after merge", len(mesh.data.vertices))
V = np.array([mesh.matrix_world @ v.co for v in mesh.data.vertices])

# image bbox of the body (reference px) <-> mesh bbox (Blender X right, Z up, -Y toward the viewer)
L = json.load(open(layout)); s = L["scale"]; fx, fy = L["figure"][:2]; m = L["pieces"]["body"]
a = np.asarray(Image.open(body_png).convert("RGBA"))[:, :, 3] > 40
ys, xs = np.where(a)
ix0, ix1 = fx + (m["x"] + xs.min()) / s, fx + (m["x"] + xs.max()) / s
iy0, iy1 = fy + (m["y"] + ys.min()) / s, fy + (m["y"] + ys.max()) / s
X0, X1, Z0, Z1 = V[:, 0].min(), V[:, 0].max(), V[:, 2].min(), V[:, 2].max()
def to3d(px, py, r=0.03):
    x = X0 + (px - ix0) / (ix1 - ix0) * (X1 - X0); z = Z1 - (py - iy0) / (iy1 - iy0) * (Z1 - Z0)
    near = V[(np.abs(V[:, 0] - x) < r) & (np.abs(V[:, 2] - z) < r)]
    y = (near[:, 1].min() + near[:, 1].max()) / 2 if len(near) > 8 else 0.0
    return mathutils.Vector((x, y, z))
P = {k: to3d(*v) for k, v in J.items()}
for side in "RL":   # toes: forward from the ankle, on the floor
    an = P["ankle." + side]; foot = V[(np.abs(V[:, 0] - an.x) < 0.05) & (V[:, 2] < an.z)]
    P["toe." + side] = mathutils.Vector((an.x, foot[:, 1].min() + 0.01, Z0 + 0.01))

# armature
bpy.ops.object.armature_add(location=(0, 0, 0)); arm = bpy.context.object; arm.name = "Knight"
arm.data.name = "KnightSkeleton"
bpy.ops.object.mode_set(mode="EDIT")
eb = arm.data.edit_bones; eb.remove(eb[0])
def bone(name, head, tail, parent=None, connect=False):
    b = eb.new(name); b.head = head; b.tail = tail
    if parent: b.parent = eb[parent]; b.use_connect = connect
    return b
root = P["hips"].copy(); root.z = 0
bone("root", root, root + mathutils.Vector((0, 0.05, 0)))
bone("hips", P["hips"], P["spine"], "root")
bone("spine", P["spine"], P["chest"], "hips", True)
bone("chest", P["chest"], P["neck"], "spine", True)
bone("head", P["neck"], P["head_top"], "chest", True)
for sd in "RL":
    bone(f"upper_arm.{sd}", P[f"shoulder.{sd}"], P[f"elbow.{sd}"], "chest")
    bone(f"forearm.{sd}", P[f"elbow.{sd}"], P[f"wrist.{sd}"], f"upper_arm.{sd}", True)
    bone(f"hand.{sd}", P[f"wrist.{sd}"], P[f"hand_end.{sd}"], f"forearm.{sd}", True)
    bone(f"thigh.{sd}", P[f"hip.{sd}"], P[f"knee.{sd}"], "hips")
    bone(f"shin.{sd}", P[f"knee.{sd}"], P[f"ankle.{sd}"], f"thigh.{sd}", True)
    bone(f"foot.{sd}", P[f"ankle.{sd}"], P[f"toe.{sd}"], f"shin.{sd}", True)
# consistent rolls: every bone's local Z points toward the viewer side (-Y) or up, so code can bend around local X
for b in eb:
    b.align_roll(mathutils.Vector((0, -1, 0)) if abs(b.vector.normalized().y) < 0.8 else mathutils.Vector((0, 0, 1)))
bpy.ops.object.mode_set(mode="OBJECT")

# skin
bpy.ops.object.select_all(action="DESELECT"); mesh.select_set(True); arm.select_set(True)
bpy.context.view_layer.objects.active = arm
bpy.ops.object.parent_set(type="ARMATURE_AUTO")
unweighted = sum(1 for v in mesh.data.vertices if not v.groups)
if unweighted > 0.02 * len(mesh.data.vertices):
    # fallback: distance-to-bone weights (top 3 bones, inverse 4th power), vectorised
    print("heat weighting incomplete, using distance weights")
    for g in list(mesh.vertex_groups): mesh.vertex_groups.remove(g)
    VV = np.array([mesh.matrix_world @ v.co for v in mesh.data.vertices]); names = []; D = []
    for b in arm.data.bones:
        if b.name == "root": continue
        h = np.array(arm.matrix_world @ b.head_local); t = np.array(arm.matrix_world @ b.tail_local); d = t - h
        u = np.clip(((VV - h) @ d) / (d @ d), 0, 1)
        D.append(np.linalg.norm(VV - (h + u[:, None] * d), axis=1)); names.append(b.name)
    D = np.array(D).T; W = 1 / np.maximum(D, 1e-3) ** 4
    top = np.argsort(-W, 1)[:, :3]; Wt = np.take_along_axis(W, top, 1); Wt /= Wt.sum(1, keepdims=True)
    groups = {n: mesh.vertex_groups.new(name=n) for n in names}
    for vi in range(len(VV)):
        for j in range(3):
            if Wt[vi, j] > 0.02: groups[names[top[vi, j]]].add([vi], float(Wt[vi, j]), "REPLACE")
    unweighted = sum(1 for v in mesh.data.vertices if not v.groups)
print("bones", len(arm.data.bones), "unweighted verts", unweighted, "of", len(mesh.data.vertices))

if test:   # bend a few joints and render, to check the skinning
    bpy.ops.object.mode_set(mode="POSE") if bpy.context.object == arm else None
    pb = arm.pose.bones
    for n, ang in (("upper_arm.R", -70), ("forearm.R", -60), ("thigh.L", -45), ("shin.L", 70), ("head", 20), ("upper_arm.L", 30)):
        pb[n].rotation_mode = "XYZ"; pb[n].rotation_euler.x = math.radians(ang)
    bpy.ops.object.mode_set(mode="OBJECT")
    sc = bpy.context.scene; sc.render.engine = "CYCLES"; sc.cycles.device = "CPU"; sc.cycles.samples = 16
    sc.render.resolution_x = sc.render.resolution_y = 600
    w = bpy.data.worlds.new("w"); sc.world = w; w.use_nodes = True; w.node_tree.nodes["Background"].inputs[1].default_value = 1.2
    w.node_tree.nodes["Background"].inputs[0].default_value = (0.25, 0.27, 0.32, 1)
    bpy.ops.object.light_add(type="SUN", rotation=(0.9, 0.2, 0.6)); bpy.context.object.data.energy = 4
    cd = bpy.data.cameras.new("c"); cd.type = "ORTHO"; cd.ortho_scale = 1.25
    cam = bpy.data.objects.new("c", cd); sc.collection.objects.link(cam); sc.camera = cam
    for name, az in (("front", 0), ("side", 90)):
        r = math.radians(az); cam.location = (math.sin(r) * 3, -math.cos(r) * 3, 0.5)
        cam.rotation_euler = (mathutils.Vector((0, 0, 0.5)) - cam.location).to_track_quat("-Z", "Y").to_euler()
        sc.render.filepath = f"{test}_{name}.png"; bpy.ops.render.render(write_still=True)
    bpy.ops.object.mode_set(mode="OBJECT")
    for p in pb: p.rotation_euler = (0, 0, 0)

bpy.ops.object.select_all(action="SELECT")
bpy.ops.export_scene.gltf(filepath=out, export_format="GLB", export_image_format="JPEG", export_jpeg_quality=92,
                          export_animations=False, export_skins=True)
print("exported", out)
