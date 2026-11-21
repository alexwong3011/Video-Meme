"""Render a vertex-coloured mesh from several angles with Blender (bpy). usage: render_views.py mesh.glb out_prefix [size]"""
import sys, math, bpy, mathutils

src, prefix = sys.argv[1], sys.argv[2]
size = int(sys.argv[3]) if len(sys.argv) > 3 else 512
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
objs = [o for o in bpy.context.scene.objects if o.type == "MESH"]

# frame the mesh
lo = mathutils.Vector((1e9,) * 3); hi = mathutils.Vector((-1e9,) * 3)
for o in objs:
    for v in o.bound_box:
        w = o.matrix_world @ mathutils.Vector(v)
        lo = mathutils.Vector(map(min, lo, w)); hi = mathutils.Vector(map(max, hi, w))
c = (lo + hi) / 2; r = (hi - lo).length / 2

sc = bpy.context.scene
sc.render.engine = "CYCLES"; sc.cycles.device = "CPU"; sc.cycles.samples = 24
sc.render.resolution_x = sc.render.resolution_y = size; sc.render.film_transparent = False
world = bpy.data.worlds.new("w"); sc.world = world; world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (0.05, 0.06, 0.08, 1)
world.node_tree.nodes["Background"].inputs[1].default_value = 1.2
for rot, energy in (((0.9, 0.2, 0.6), 4.5), ((1.1, 0, -2.4), 2.5), ((1.2, 0, 3.0), 2.0)):
    bpy.ops.object.light_add(type="SUN", rotation=rot); bpy.context.object.data.energy = energy
cam_data = bpy.data.cameras.new("cam"); cam_data.type = "ORTHO"; cam_data.ortho_scale = r * 2.1
cam = bpy.data.objects.new("cam", cam_data); sc.collection.objects.link(cam); sc.camera = cam

# up axis: glTF import makes +Z up; the figure faces -Y after import
for name, az in (("front", 0), ("threequarter", 35), ("side", 90), ("backthreequarter", 145), ("back", 180)):
    a = math.radians(az)
    d = mathutils.Vector((math.sin(a), -math.cos(a), 0))
    cam.location = c + d * r * 4
    cam.rotation_euler = (c - cam.location).to_track_quat("-Z", "Y").to_euler()
    sc.render.filepath = f"{prefix}_{name}.png"
    bpy.ops.render.render(write_still=True)
print("rendered", prefix)
