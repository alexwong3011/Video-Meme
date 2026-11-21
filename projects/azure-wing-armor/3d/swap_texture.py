"""Replace the base-colour image of a (rigged) glb and export it again. usage: swap_texture.py IN.glb ALBEDO.png OUT.glb"""
import sys, bpy
src, tex, out = sys.argv[1:4]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
img = bpy.data.images.load(tex)
for m in bpy.data.materials:
    if m.use_nodes:
        for n in m.node_tree.nodes:
            if n.type == "TEX_IMAGE": n.image = img
bpy.ops.object.select_all(action="SELECT")
bpy.ops.export_scene.gltf(filepath=out, export_format="GLB", export_image_format="JPEG", export_jpeg_quality=92, export_skins=True, export_animations=False)
print("ok")
