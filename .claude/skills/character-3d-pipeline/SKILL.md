---
name: character-3d-pipeline
description: Turn 2D concept art of a game character into a rigged, animated 3D model with fingers and a texture repainted from the art, for the browser (three.js). Use when the user wants a new character, armour set or monster made "like the Azure Wing knight", wants to redo or update that knight's model, add animations to it, or asks how the 3D character pipeline works.
---

# Character 3D pipeline

The tools and the full write-up are in `scripts/character3d/` (read `scripts/character3d/README.md` first). The reference result is the Azure Wing knight in `projects/azure-wing-armor/` (model in `assets/meshy/`, game page `character-test.html`).

## Steps

1. **A-pose views**: the user generates front, left-profile and back A-pose images with an image model that takes reference images (Grok worked), using `scripts/character3d/prompts.md`. The front comes first and is uploaded first for the other two. Check the three views line up (shoulder, fingertip, knee, boot-top heights) before going on.
2. **Clean**: `BGRM_DIR=<imgly install> node scripts/character3d/cutout.mjs CUT SRC/front.jpg SRC/side.jpg SRC/back.jpg`, then `python3 scripts/character3d/apose.py SRC CUT CLEAN`. Look at `CLEAN/preview.jpg`.
3. **Meshy**: the user needs a Meshy API key. In a cloud session, ask for it with the credential tool for host `api.meshy.ai` (never in chat), and get `assets.meshy.ai` and `docs.meshy.ai` allowed. Copy `config.example.json`, set the paths, name and action ids (the library: `GET https://api.meshy.ai/openapi/v1/animations/library`), then `python3 scripts/character3d/run_pipeline.py CONFIG`. Tell the user the credit cost first: about 35 for the model, 5 for the rig, 3 per animation.
4. **Check**: render the static model with the painted texture from four sides, and compare with the art before wiring it into the game.
5. **Game**: reuse the `3D knight`, `idle stance`, `hands` and `armour level` sections of `projects/azure-wing-armor/character-test.html`. Update the clip names in `K3CLIP`, and check the sword grip, wing mount and idle stance in all four facings.

## Rules learned the hard way

- Keep `image_enhancement: false`, `geometry_resolution: "2k"`, about 80k triangles, `texture_resolution: "4k"`, `enable_pbr: true` and `include_fingers: true`.
- Meshy bones are in centimetres under a 0.01 armature. Size the model from the bones, push outlines and aura shells along the normal in view space, and never call `skeleton.pose()`: restore the rest pose saved at load instead.
- Remove the hips' sideways and forward drift from every clip; the game moves the character.
- Animation URLs are signed and expire, so fetch fresh ones from the task before downloading.
