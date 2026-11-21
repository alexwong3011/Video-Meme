# 2D-native animation pipelines (skeletal/mesh vs hand-drawn frame-by-frame) for a top-down / 45° action RPG with a winged armoured greatsword knight

> Research method note (2026-11-21): page fetches to gamedeveloper.com, esotericsoftware.com and cgw.com failed in this sandbox (host not in the allowed network list). Every finding below comes from search-engine extracts of the cited pages, not from reading the full page. Treat exact quotes as close paraphrases, and re-check numbers against the original URL before publishing. Where a search summary bundled several sources together and I could not tell which one said what, I cite the whole group and say so.

## 1. Spine in commercial games: art prep, meshes, directions, budgets

### Takeaway
Spine is the de-facto commercial standard for hand-painted 2D characters. Gacha games (Arknights, Nikke, Blue Archive and others) and PC titles (Darkest Dungeon) use it. The common pipeline: an illustrator paints a layered PSD with occluded parts filled in, a rigger cuts it into slots, meshes and weights it, and animators key poses. Directions are handled by drawing a separate art set per facing (Arknights: Front and Back) and mirroring for left/right. Public, official per-game numbers (frames, file sizes, artist-days) are almost non-existent; most data comes from community asset rips.

### Cited Findings
**Arknights (Hypergryph)**
- Community asset repos import Arknights battle chibis from separate `Front` and `Back` folders, each tagged with a facing value (e.g. `spine/char_002_amiya/.../Front` and `/Back`). This means each operator has two separately authored Spine skeletons/art sets, one front-facing and one back-facing. — [arkpedia-sd-assets (GitHub)](https://github.com/arkpedia/arkpedia-sd-assets)
- Arknights character Spine files were authored in Spine Editor 3.8.99 (the repo recommends opening them in 3.8.x). The assets are © Hypergryph and were extracted from the game. — [Arknights-Base (GitHub)](https://github.com/kiraio-moe/Arknights-Base)
- I found no official Hypergryph/Yostar statement on how the chibis are drawn or rigged. — (search gap; see [arkpedia-sd-assets](https://github.com/arkpedia/arkpedia-sd-assets))

**Darkest Dungeon (Red Hook, 2016)** (older info)
- Art by Chris Bourassa and Trudi Castle was drawn in Photoshop and then animated in Spine. — [Game Developer, Road to the IGF: Darkest Dungeon](https://www.gamedeveloper.com/audio/road-to-the-igf-red-hook-studios-i-darkest-dungeon-i-)
- Animator/technical artist Brooks Gordon received "cut-up Photoshop files" and did all the rigging, weighting and animation in Spine for the game and its DLCs. This is a one-person rig+anim role per project. — [Brooks Gordon, ArtStation](https://www.artstation.com/artwork/VAVxX)
- Animations are exported to Spine's binary `.skel` format and read by a custom C++ reader built on the Spine C++ runtime. — [Steam DD Workshop: Animating Sprites for Darkest Dungeon](https://steamcommunity.com/groups/dd-workshop/discussions/0/135514800409348324/)
- Darkest Dungeon is side-view only (characters face one way and are mirrored). It is not an example of multi-direction Spine. — inference from the same sources.

**Nikke (Shift Up)**
- Community viewers show Nikke characters as Spine 4.0/4.1 skeletons (portrait/full-body standing art; "cover" and "aim" views exist as separate rigs). Fan sites call them "Live2D", but the files are Spine. — [Nikke-DB spine-web-player-template](https://github.com/Nikke-db/spine-web-player-template); [NikkeViewerEX](https://github.com/bungaku-moe/NikkeViewerEX); [Nikke-DB](https://nikke-db.github.io/)
- The full-body standing pose is a separate asset from the combat "aim" view (fan inference). — [IMFDB Nikke page](https://www.imfdb.org/wiki/Goddess_of_Victory:_Nikke)

**Blue Archive, Epic Seven, Brown Dust 2**
- I found no source with official pipeline details, atlas sizes or runtime budgets for these titles. — [search result summary on Spine runtimes](http://en.esotericsoftware.com/spine-runtimes)

**Art preparation (parts breakdown)**
- Spine imports PSD content directly (the official "Import PSD" feature) and the PhotoshopToSpine script. Layer tags such as `[skin]`/`[skin:name]`, `[slot]` and `[scale:n]` route layers into skins/slots. Spine imports pixel data only: masks and effects must be baked. — [Spine User Guide: Import PSD](https://en.esotericsoftware.com/spine-import-psd); [4Enjoy: Photoshop to Spine](https://www.4enjoy.com/uncategorized/photoshop-to-spine-everything-about-export-and-even-more/)
- Official Esoteric tutorial on adding new poses: export a mid-animation pose to PSD, paint new attachments over it, and name layers with `[slot]` tags that match existing slots so Spine re-imports them in place. This is the official route for adding drawn key poses to a rig. — [Esoteric blog: Rigging new poses tutorial](https://esotericsoftware.com/blog/Rigging-new-poses-tutorial)
- Prep rules from tutorials: paint overlap at every joint so rotation never shows gaps, re-colour or paint the hidden part underneath (content-aware fill as a start), and work back-to-front. The source is a lecture summary, so it is secondary. — [Coconote: Artwork Preparation for Spine](https://coconote.app/notes/a8b4b298-4341-4940-a43c-6b7770e0d3cd); [ArmAnimation: Preparing Photoshop files for Spine](https://warmanw.wixsite.com/armanimation/post/preparing-photoshop-files-for-export-to-spine)
- AI "layer separation/inpainting" tools now claim to auto-split a single image into rig-ready layers. One vendor admits reconstruction "does not recover the original hidden artwork" (vendor claims, unverified). — [imagetolayers: Spine character layer separator](https://www.imagetolayers.com/character-to-layers/spine); [Riggy](https://riggyapp.com/)

**File size / performance**
- Binary `.skel` is "very small and fast". JSON is larger and slower to parse. Atlas pages are decompressed into large runtime memory, and multiple pages cause extra texture binds. — [Spine Runtimes Guide: Loading skeleton data](http://esotericsoftware.com/spine-loading-skeleton-data); [Using Spine Runtimes](http://esotericsoftware.com/spine-using-runtimes/)
- Mobile guidance: keep atlas pages ≤2048 px on the long side. PNG metadata can bloat atlases. — [G5 Medium: Spine animation optimization](https://medium.com/g5careers/spine-animation-optimization-save-your-nerves-and-time-by-avoiding-bugs-2cda96d27c8e)
- One anecdotal comparison: a sprite-sheet animation of ~2.57 MB versus the equivalent Spine asset of ~102.7 KB. — [Medium: Animate your PixiJS v5 game with Spine](https://medium.com/anvoevodin/lets-animate-your-pixijs-v5-game-with-spine-14dda65a0f41)
- Spine WebGL runtime: 175 KB minified / 46 KB gzipped. — [Phaser Dev Log 177](https://phaser.io/devlogs/177)

**Licensing (2026)**
- Essential: $69 (meshes and other advanced features NOT included). Professional: $369 (all features). Enterprise: from $2,499/year, required above $500k revenue/funding. Essential/Pro are perpetual, per named person. — [Spine purchase page](https://esotericsoftware.com/spine-purchase); [Esoteric forum: licensing](https://it.esotericsoftware.com/forum/d/6070-licensing-question)

### Inferences
- For a hand-painted look plus smooth motion, the pattern is "one painted PSD per facing → rig". The labour sits in (a) painting occluded parts for every facing and (b) re-rigging/re-animating per facing. Arknights' minimal two-facing scheme (front/back, mirrored L/R) shows even big gacha studios limit direction count on Spine chibis.
- Meshes require Spine Professional ($369). Essential is not viable for this project.

### Gaps
- No official frame counts, bone counts, artist-days per character, or file sizes for Arknights, Blue Archive, Epic Seven, Brown Dust 2 or Nikke. A primary-source search on 4Gamer/Famitsu/Inven (KR) dev interviews could not be done within budget.
- I could not confirm whether Arknights Back skeletons are fully separate rigs or re-skinned copies of the Front rig.

## 2. Spine feature set relevant to the knight (meshes, weights, IK, physics, skins, clipping, sequences, fake 3D turns)

### Takeaway
Spine 4.2 and later covers almost everything a hybrid pipeline needs: weighted meshes, IK, physics constraints for secondary motion (wings, cape, hair, plumes), skins for equipment swaps, clipping, and, since 4.1, "Sequence" attachments that play hand-drawn frame-by-frame images inside a rig. This last feature makes "skeletal body + drawn smear/key frames" a first-class workflow. Fake 3D head/body turns are done with mesh FFD plus transform constraints but only work within a limited angle range.

### Cited Findings
- Spine 4.2 ("the physics revolution") added physics constraints that move bones automatically by simulating real-world physics. Use them for hair, cloth, tails, ears, i.e. secondary motion driven by the skeleton instead of hand-keyed. — [Esoteric blog: Spine 4.2 The physics revolution](https://esotericsoftware.com/blog/Spine-4.2-The-physics-revolution); [Spine 4.2 viewer description](https://spineanimationviewer.com/spine-4-2-viewer)
- 4.2 also added "Weld" (match weights across meshes so they deform as one image), copy/paste of weights across meshes, constraint folders and multi-edit. It also added Tint Black support on URP shaders. — [Spine changelog](http://en.esotericsoftware.com/spine-changelog); [spine-runtimes 4.2 CHANGELOG](https://github.com/EsotericSoftware/spine-runtimes/blob/4.2/CHANGELOG.md)
- The runtime 4.2 API adds physics translate/rotate functions to move all physics constraints in skeleton space. This matters when a character teleports or dashes, so wings and capes don't whip. — [spine-runtimes 4.2 CHANGELOG](https://github.com/EsotericSoftware/spine-runtimes/blob/4.2/CHANGELOG.md)
- A 4.3 runtime branch exists (CHANGELOG present). — [spine-runtimes 4.3 CHANGELOG](https://raw.githubusercontent.com/EsotericSoftware/spine-runtimes/4.3/CHANGELOG.md)
- Skins hold attachments, bones AND constraints. A constraint can belong to one or more skins and is active only when that skin is active, so swapped armour/weapons can bring their own bones and physics. — [Spine User Guide: Skins](https://en.esotericsoftware.com/spine-skins); [Spine constraints](https://ar.esotericsoftware.com/spine-constraints)
- Clipping: the affected parts are defined by the clipping attachment's draw-order position and its End slot. IK constraint order matters (the Spineboy example applies front-leg-ik then front-foot-ik). — [Spine examples: Spineboy](https://esotericsoftware.com/spine-examples-spineboy)
- Spine 4.1 added the "Sequence" checkbox on region and mesh attachments. A numbered image series (same width/height) plays from one attachment. Sequence keys set mode (hold/once/loop/pingpong/reverse variants), fps and start frame. This is official support for frame-by-frame drawings inside a skeletal animation. — [Esoteric blog: Spine 4.1 released](https://en.esotericsoftware.com/blog/Spine-4-1-released); [Spine User Guide: Keys](https://esotericsoftware.com/spine-keys); [Regions](https://esotericsoftware.com/spine-regions)
- Fake 3D head turn tutorials, with time estimates:
  - Simple, about 20 minutes: mesh bound to one controller bone. Works for flat human faces only.
  - Intermediate, 1–2 hours: features in bone containers driven by transform constraints. The author says this "still doesn't rotate the head in 3D, just moves the face and back of head in opposite directions".
  - Complex, about 4 hours: multiple transform constraints, mesh bound to 4+ bones. Best result.
  — [ArmAnimation: Simple](https://www.armanimation.com/post/simple-rigging-a-face-in-spine-2d-for-3d-turn); [Intermediate](https://www.armanimation.com/post/intermediate-rigging-a-face-in-spine-2d-for-3d-turn); [Complex](https://www.armanimation.com/post/complex-rigging-a-face-in-spine-2d-for-3d-turn)
- Third-party SpineFX attaches particle emitters to bones and fires them on animation events (e.g. emitters follow the sword). — [SpineFX](https://spinefx.io/)
- Spine animation mixing (crossfade) is tuned per transition: fast walk→run blend for responsiveness, slow attack→idle for "recovery" weight. — [Spine: In Depth](https://en.esotericsoftware.com/spine-in-depth); [Game Developer: juicy animations with Spine basics](https://www.gamedeveloper.com/design/tips-to-create-funny-and-juicy-character-animations-with-spine-basics)

### Inferences
- For a winged armoured knight, the most useful features are: physics constraints for wing feathers, cape and plume; IK for planted feet during heavy swings; skins for armour/weapon variants; and Sequence attachments for drawn smear arcs, wing-flap key drawings and impact frames. Armour plates should be mostly rigid regions with little mesh bending, because bending painted metal reads as "rubber".
- Fake 3D turns are good for small head/torso yaw (looking toward the target within one facing). They do not replace drawing additional facings.

### Gaps
- No primary Esoteric figures on physics performance cost per constraint on mobile/PC.
- I could not read the full 4.2/4.3 release notes (site blocked). Check for 4.3 features (released or beta) on esotericsoftware.com.

## 3. Live2D Cubism: face turns vs full-body action

### Takeaway
Live2D excels at subtle ±~30° parallax turns of one drawn view (faces, upper bodies, VTubers, gacha home-screen art). It is not suited to full-body locomotion or combat with many facings. Even its community concludes a 360° full-body turn is "close to impossible" with 2D deformation.

### Cited Findings
- Older (Cubism 2.1 era) note: Live2D characters are limited to about ±30° horizontally because "it's not a full-3D model". — [GameDev.net: Introducing Live2D Cubism](https://gamedev.net/forums/topic/672034-introducing-live2d-cubism-turns-your-2d-art-into-animated-3d-in-just-an-hour-work/) (older info)
- A 360° body turn is near impossible with 2D deformation. Live2D-style rigs work best within a limited angle range around one drawn view. (Maintainer comment, not official Live2D.) — [psd2live issue #63](https://github.com/tsunehimatoi/psd2live/issues/63)
- Free edition limits (per third-party review): 1 texture of 2048 px, 100 ArtMeshes, 30 parameters, 50 deformers. — [exedepot Live2D review](https://exedepot.com/en/soft/live2d-cubism/); feature list at [Live2D: Compare features](https://www.live2d.com/en/cubism/comparison/)
- Live2D has a "frame step" option to reproduce sharp limited-animation timing. — [Live2D: Compare features](https://www.live2d.com/en/cubism/comparison/)
- Nikke's in-game characters, often called "Live2D", are Spine skeletons (see section 1). — [Nikke-DB spine template](https://github.com/Nikke-db/spine-web-player-template)

### Inferences
- Live2D is a candidate only for dialogue portraits or menu art of the knight, not for top-down gameplay sprites.

### Gaps
- No official Live2D case study of a full-body action game. No Pro-version limits were found.

## 4. UbiArt Framework (Rayman Origins/Legends, Child of Light, Valiant Hearts)

### Takeaway
UbiArt was Ubisoft Montpellier's in-house 2D engine. It turned high-res hand-drawn/painted art into animated "puppets" through a skeleton plus image (patch) deformation tool called GenAnim. Its pitch was "artists pose, the tool handles the deformation", which kept teams small. Child of Light explicitly animated by stretching and moving a single cut image rather than drawing frames. All UbiArt titles are side-view, so none answer the multi-direction question.

### Cited Findings
- UbiArt is a 2.5D engine by Ubisoft Montpellier that lets artists turn hand-drawn, high-resolution art into animated pieces. Rayman Origins (2011) was the first title. — [Wikipedia: UbiArt Framework](https://en.wikipedia.org/wiki/UbiArt_Framework); [Wikipedia: Rayman Origins](https://en.wikipedia.org/wiki/Rayman_Origins)
- 2011 press: the engine incorporates detailed drawings "into a skeletal animation system". Michel Ancel planned to open the tech up. Any scanned, photographed or digitised artwork can be animated, and the engine helped keep the Origins team small. — [Game Developer: Ancel planning to open up Rayman Origins tech](https://www.gamedeveloper.com/business/ubisoft-s-ancel-planning-to-open-up-i-rayman-origins-i-tech); [Engadget 2011](https://www.engadget.com/2011-04-08-rayman-origins-to-be-a-big-event-ubisoft-ceo-says.html) (older info)
- GenAnim: skeletons/bones applied to separate assets. "The animator designs poses and the tool takes care of the image deformation." — [Giant Bomb: UbiArt Framework](https://giantbomb.com/wiki/Concepts/Ubiart_Framework)
- Fan and student descriptions: GenAnim lets you assemble sprite parts, rig them and animate. One portfolio describes it as "fusing hand-drawn key frames with bone animation" (informal sources). — [RaymanPC forum: Researching UbiArt](https://raymanpc.com/forum/viewtopic.php?t=74836); [student portfolio](https://matthewjamessaitdigitaldesign.wordpress.com/2017/07/06/extended-project-portfolio/)
- Child of Light animator Marie-Agnès Guy: rather than frame-by-frame, the team manipulates a single image by stretching/moving it. Artists place cuts where the character articulates, then import to GenAnim to build a skeleton and animate. — [Child of Light official Tumblr: Animator Marie-Agnès Guy](https://childoflightgame.tumblr.com/post/66109404038/animator-marie-agnes-guy)
- Patrick Plourde (creative director): "a puppet system that is very quick". "If Rayman is a cartoon… Child of Light is a living painting." — [Nintendo Life interview](https://www.nintendolife.com/news/2013/11/interview_child_of_light_team_tells_us_about_storytelling_ubiart_and_stepping_back_from_blockbusters); [Shacknews](https://www.shacknews.com/article/83889/if-rayman-is-a-cartoon-child-of-light-is-a)
- Raw painted art was imported directly, so the result looked "about as close to hand-painted as a computer game can get". Art director Thomas Rollus mixed watercolour-style illustration with 2D and 3D animation. — [God is a Geek preview](https://godisageek.com/2013/09/child-light-preview/); [Xbox Wire: The fantastic art of Child of Light](https://news.xbox.com/en-us/2014/05/23/games-child-of-light-art/)
- GDC 2014, Chris McEntee, "Rayman Legends: The Design Process Within the UbiArt Framework": covers engine strengths/weaknesses for prototyping and level design. A forum report says he also cited flaws (lack of tools, engine communication). — [Internet Archive: GDC2014McEntee](https://archive.org/details/GDC2014McEntee); [RaymanPC forum](https://raymanpc.com/forum/viewtopic.php?t=74836)
- A weak secondary source claims UbiArt uses Bézier-curve and lattice-grid patch deformation. — [Grokipedia (low reliability)](https://grokipedia.com/page/UbiArt_Framework)

### Inferences
- Child of Light is the closest precedent for "painted illustration → puppet". It proves painterly beauty survives skeletal deformation when the camera stays side-on and limbs are kept small relative to the painted mass. Rayman additionally relied on very exaggerated cartoon squash/stretch, which hides puppet stiffness.

### Gaps
- No primary numbers (bones per character, animator count, days per animation) for UbiArt titles. The CGW "Fine Tooning" (2012) article and the GDC Vault recording ([gdcvault.com/play/1021191](https://www.gdcvault.com/play/1021191)) were not reachable. Valiant Hearts details were not found.

## 5. Unity 2D Animation + PSD Importer, Godot Skeleton2D, DragonBones, Creature

### Takeaway
The engine-native alternatives work, but there is little evidence of big commercial productions using them. Unity's is the most mature: PSB import, Sprite Skin, skeleton sharing. Godot's is functional but its docs are flagged as outdated. DragonBones is effectively abandoned. Spine remains the safe production choice.

### Cited Findings
- Unity: the PSD Importer only supports `.psb`. It generates a prefab of sprites from layers, and a Sprite Skin component deforms sprites with GameObject-transform bones. — [Unity docs: Rigging a character imported with PSD Importer](https://docs.unity3d.com/Packages/com.unity.2d.animation@9.0/manual/ex-psd-importer.html); [Preparing and importing artwork](https://docs.unity3d.com/Packages/com.unity.2d.animation@9.0/manual/PreparingArtwork.html)
- PSD Importer 5.0 (Unity 2021.1) added skeleton sharing (`.skeleton` assets reused across imports) for character variants. — [Unity docs: Skeleton sharing](https://docs.unity3d.com/Packages/com.unity.2d.psdimporter@5.0/manual/skeleton-sharing.html); [Unity Discussions: PSDImporter 5.0 released](https://discussions.unity.com/t/2d-psdimporter-5-0-released-for-unity-2021-1/840313)
- Reported pain: bones/weights lost when making new PSD variants of a character. There was also a 2019 bug where root bone references disappeared on project restart (old). — [Unity Discussions: reusing skinning bones](https://discussions.unity.com/t/reusing-skinning-bones-structures-for-different-sprites-psd-import/936711); [Unity Issue Tracker](https://issuetracker.unity3d.com/issues/2d-animation-plus-psd-importer-root-bone-and-bone-list-references-disappear-when-you-restart-the-project)
- Unity's own showcase is the Happy Harvest sample (shared rigs across variants), not a shipped commercial game. — [Unity Discussions: How to animate 2D characters in Unity 6](https://discussions.unity.com/t/how-to-animate-2d-characters-in-unity-6/1642950)
- Skul: The Hero Slayer (SouthPAW) is NOT a 2D-Animation-package game. It used frame-based pixel animation imported from Aseprite/PyxelEdit and auto-converted to clips. The studio used the 2D Animation package on a different project and reported good performance. — [Unity case study: Skul](https://unity.com/resources/skul-the-hero-slayer-case-study) (about 4–5 years old)
- Godot: skeletal deform for Polygon2D since 3.1. The official post recommends splitting into parts and using bones on specific parts. Bending polygons gives "unexpected results" without internal vertices. The docs page is flagged as not yet updated for Godot 4.7. — [Godot: 2D skeletal deform](https://godotengine.org/article/godot-gets-2d-skeletal-deform); [Godot docs: 2D skeletons](https://docs.godotengine.org/en/stable/tutorials/animation/2d_skeletons.html)
- Community thread on the state of Godot Skeleton2D rigging. — [Godot Forum: State of Skeleton2D](https://forum.godotengine.org/t/state-of-skeleton2d-in-godot-bone-2d-rigging-cutout-animations/65393)
- DragonBones is listed as discontinued (developer unresponsive, download dead). A successor, "LoongBones", is mentioned, and a community tool converts DragonBones to Spine JSON. — [AlternativeTo: DragonBones](https://alternativeto.net/software/dragonbones/about); [Defold forum: LoongBones](https://forum.defold.com/t/hope-defold-can-continue-to-support-the-new-loongbones/81757); [db reborn](https://rfm-code-dev.itch.io/db-reborn)
- Spine is called "the industry standard" by engine community users. Its main drawback is cost. — [PlayCanvas forum: Spine vs DragonBones](https://forum.playcanvas.com/t/solved-spine-vs-dragonbone-integration-opinions-on-those-tools/27522); [Unreal forum: Spine alternatives](https://forums.unrealengine.com/t/spine-alternatives-for-unreal-2d-skeletal-animation/1238706)

### Inferences
- If the game engine is Unity, Unity 2D Animation is viable for a small team but riskier for variant/skin workflows. Spine's skin system and runtimes are more battle-tested.

### Gaps
- Creature (Kestrel Moon) status: nothing found. Assume inactive, but verify.
- No shipped commercial top-down action game confirmed to use Unity 2D Animation or Godot Skeleton2D.

## 6. Hand-drawn frame-by-frame: costs and numbers from commercial games

### Takeaway
Fully hand-drawn games achieve the highest beauty and "solidity" but cost enormous labour. Reported figures:
- Cuphead: roughly 50k frames over years of work, at 20–25 min per frame.
- Eastward: 50–70k frames, about 6 years.
- Sea of Stars: some single animations took over a month each.

All of these are side-view or use few facings. No fully hand-painted (non-pixel) game in this list does 8-direction top-down combat with many attacks.

### Cited Findings
**Cuphead (Studio MDHR, 2017)** (older info)

These figures are drawn from a group of sources: [Digital Trends producer interview](https://www.digitaltrends.com/gaming/cuphead-producer-interview/); [Inverse](https://www.inverse.com/article/36647-xbox-one-cuphead-animation); [GamesRadar: The making of Cuphead](https://www.gamesradar.com/the-making-of-cuphead/); [Game Developer: unique constraints of Cuphead's hand-drawn art](https://www.gamedeveloper.com/design/the-unique-development-constraints-of-i-cuphead-i-s-painstakingly-hand-drawn-art); [Intel Gaming Access](https://game.info.intel.com/gaming-access/you-wont-believe-how-many-hand-drawn-frames-of-animation-went-into-cuphead); [TIME preview](https://time.com/4123150/cuphead-preview/). The search summary did not let me attribute every figure to a single page.
- Frame rate: animation at 24 fps, drawn mostly "on ones" (every frame) per Maja Moldenhauer, while gameplay and movement run at 60 fps.
- Total frames: about 50,000 hand-drawn frames (initial estimate about 15,000). One report says 120,000+, which conflicts and probably counts differently. — [Intel](https://game.info.intel.com/gaming-access/you-wont-believe-how-many-hand-drawn-frames-of-animation-went-into-cuphead) vs [Digital Trends](https://www.digitaltrends.com/gaming/cuphead-producer-interview/)
- Time per frame: about 20 minutes per frame, which over about 50k frames is nearly 2 years of man-hours for character animation alone. — [Digital Trends](https://www.digitaltrends.com/gaming/cuphead-producer-interview/). An alternative average is 25 minutes per frame. — [GamesRadar](https://www.gamesradar.com/the-making-of-cuphead/)
- Bosses: 800–1,400 frames each. Cuphead and Mugman: about 1,200 frames each. A small flower enemy: 100+ frames.
- Pipeline: pencil on 12/16-field animation paper, then ink, scan, and digital colour (digital colouring "saved years").
- Staffing: the founders found only about five artists in North America still able to animate with pencil and paper.

**Hollow Knight / Silksong (Team Cherry)**
- Hollow Knight is described as "traditional 2D frame-by-frame animation", drawn in Photoshop and saved as PNGs. — [Nintendo AU interview](https://www.nintendo.com/au/news-and-articles/the-metamorphosis-of-hollow-knight-with-team-cherry-aussie-developer-interview/); [Educademy](https://www.educademy.co.uk/blog/games-made-in-unity-hollow-knight-by-team-cherry)
- Conflict: one blog claims Hollow Knight's character motion is "cutout and skeletal, not frame-by-frame". This is a low-reliability source contradicting the developer interview. It may refer to some large bosses/NPCs assembled from parts. — [egmatic blog](https://egmatic.com/blog/sprite-animation-techniques) vs [Nintendo AU](https://www.nintendo.com/au/news-and-articles/the-metamorphosis-of-hollow-knight-with-team-cherry-aussie-developer-interview/)
- Ari Gibson: drawing is "the least of really making it"; assembling the game takes the time. — [MCV/Develop: When We Made Hollow Knight](https://mcvuk.com/development-news/when-we-made-hollow-knight/)
- Dynamic lighting, shadows and particles "do a huge amount of work to solidify those 2D sketches". — [PC Gamer](https://www.pcgamer.com/hollow-knights-charming-art-sets-the-bar-for-hand-drawn-games/)
- Silksong (released 2025): "hundreds of hand-drawn sprites" for Hornet, with each new ability getting its own animation set. A leaked/released sheet had 400+ frames of Hornet plus needle. About 7 years of development is partly attributed to world objects reacting to tools, which needed "a ton of drawing and animation". — [ACMI](https://www.acmi.net.au/works/125388--hollow-knight-silksong-game-worlds-acmi/); [ABC News 2025-09-05](https://www.abc.net.au/news/2025-09-05/hollow-knight-silksong-explainer-team-cherry/105727946); [OpenCritic news](https://opencritic.com/news/15793/hollow-knight-silksong-fans-turn-new-sprite-sheet-into-hornet-animations-frame-by-frame); [Steam summary of Bloomberg interview](https://steamcommunity.com/app/367520/discussions/0/598535552010165128/)

**Blasphemous (The Game Kitchen)**
- "Extreme purity of pixel-by-pixel animation". "There is nothing that is not pixel art." Hand-pixelled cutscenes are few because "it's really crazy" to do 2D animation in pixel art. — [HeavyMag interview](https://heavymag.com.au/interview-blasphemous-the-game-kitchen/); [Hollywood Reporter](https://www.hollywoodreporter.com/movies/movie-news/blasphemous-designer-purist-approach-games-pixel-art-style-1238370/); [Gamereactor](https://www.gamereactor.eu/the-game-kitchen-on-blasphemous-ambiguous-story/)
- Animator Raúl Vivar speeds up work by creating new frames from manipulated existing frames (time-lapses). — [Game Anim: Blasphemous time-lapses](https://www.gameanim.com/2021/02/19/blasphemous-pixel-art-animation-time-lapses/)

**Eastward (Pixpil, 2021)**
- About 70,000 hand-drawn frames "so far" (pre-release preview) versus "over 50,000" in another source. These conflict. — [Film Stories preview](https://filmstories.co.uk/gaming/eastward-preview-a-promising-pixel-post-apocalypse/) vs [Baidu Baike](https://baike.baidu.com/en/item/Eastward/3410278)
- About 6 years of development. Aseprite pipeline. The studio had to hire experienced animators. — [Baidu Baike](https://baike.baidu.com/en/item/Eastward/3410278); [Game Developer: Eastward's creators](https://www.gamedeveloper.com/art/eastward-s-creators-share-insights-on-making-pixel-art-adventures); [80.lv](https://80.lv/articles/eastward-charming-chinese-pixel-art-adventure)

**Sea of Stars (Sabotage, 2023)**
- Animation is "the biggest corner of the studio". Some individual animations took "over a month, each". The process starts from a pixel idle-frame turnaround from the concept. — [Screen Rant interview with Thierry Boulanger](https://screenrant.com/sea-stars-interview-thierry-boulanger/)
- About 5-year production. "No reuse" ethos within a limited budget of extra-effort requests. — [MobileSyrup](https://mobilesyrup.com/2023/09/10/sea-of-stars-flimsy-hammers-behind-the-scenes-sabotage-thierry-boulanger-interview/); [Game Informer 2025](https://gameinformer.com/interview/2025/07/30/sea-of-stars-was-seven-times-more-successful-than-anticipated-and-more-from)

**Children of Morta (Dead Mage, 2019)**
- "Hand-painted pixel art and frame-by-frame animations". The team chose relatively high-res pixel art with "high keyframe animations" for smoothness, which put a lot of work on a two-person art team. Lighting and shadows are layered on top. — [Game Developer postmortem](https://www.gamedeveloper.com/design/postmortem-children-of-morta); [Steam page](https://store.steampowered.com/app/330020/Children_of_Morta/); [Engadget](https://www.engadget.com/2018-03-22-children-of-morta-hands-on-indie-xbox-gdc.html)

**Skul (SouthPAW)**: frame-based pixel animation from Aseprite/PyxelEdit (see section 5). — [Unity case study](https://unity.com/resources/skul-the-hero-slayer-case-study)

### Inferences
- Rough cost model from Cuphead: about 20–25 min per finished frame (pencil, ink and colour; cartoon line art, not painterly). A 12-frame attack at 24 fps (0.5 s) is about 4–5 hours per facing for clean line art. Painterly, rendered armour would be several times slower. Multiplied across 5 unique facings and 20+ attacks, this quickly reaches thousands of frames (the Cuphead boss scale of 800–1,400).
- Lighting/VFX layers (Hollow Knight, Children of Morta) are a cheap multiplier on perceived quality for either pipeline.

### Gaps
- No reliable frames-per-attack or run-cycle frame counts for Hollow Knight, Blasphemous, Skul or Eastward. No artist-days per animation except Sea of Stars' "over a month" outliers and Cuphead's per-frame minutes.

## 7. Multi-direction in top-down/isometric 2D: direction counts, mirroring, labour multiplier

### Takeaway
Standard practice:
- 4 directions is the indie/mobile default.
- 8 directions is the mid-scope standard. Mirroring makes 8 directions cost 5 unique facings: S, SE, E, NE, N.
- 16 directions is rare and expensive.

Fully drawn games rarely go beyond 4. Most 8+-direction 2D games (Diablo, Hades 1) pre-render 3D models to sprites. Spine projects do 8 directions by authoring art per facing inside one skeleton and mirroring, with per-direction IK repositioning and keyframe fixes. An asymmetric character (greatsword in one hand, a shield, a heraldic emblem) breaks mirroring.

### Cited Findings
- 4 directions is common in mobile/indie, 8 is standard for mid-scope projects, and 16 is a significantly more expensive niche. The original Diablo (1996) used pre-rendered 3D models converted to 2D frames across eight directions. — [RocketBrush: Isometric sprite sheet](https://rocketbrush.com/blog/isometric-sprite-sheet)
- Diablo II character sprites were reportedly rendered from 3D models at various angles (anecdotal forum comment). Mirroring can halve the art but fails for effects like semi-transparent shadows. — [GameDev.net: 16-direction character](https://gamedev.net/forums/topic/302215-16-direction-character-in-a-2d-isometric-game/2924590/)
- Mirroring math: in 4 directions, left is mirrored from right, leaving 3 unique (down, up, side). In 8 directions, 5 unique facings, roughly double the 4-direction work. If mirroring flips an important asymmetric detail, those facings must be counted as unique art. — [spritesheets.ai: 4 vs 8 direction](https://www.spritesheets.ai/blog/4-direction-vs-8-direction-sprites); [Goblin3D: 4-way vs 8-way](https://goblin3d.ai/blog/4-way-vs-8-way-directional-sprites)
- Moonlighter (11 bit / Digital Sun): "if you want to add more weapons or armors… you need to create a crazy amount of sprites, in 4 views!" (Aseprite). — [80.lv: Moonlighter](https://80.lv/articles/moonlighter-building-pixel-art-preparing-for-switch)
- Hades (2020) characters were 3D-modelled and animated, then rendered to sprite frames from many angles (secondary source/developer quote). Hades II uses real-time 3D characters while environments and portraits stay hand-painted. 3D models were built from Jen Zee's concept and portrait art. — [Hyperlific: Hades II art](https://www.hyperlific.com/articles/jen-zees-2d-defiance-and-the-hand-that-paints-hades-ii/); [Paige Carter ArtStation: Hades characters](https://artpaiges.artstation.com/projects/aYJLYz); [Wikipedia: Megaera (Hades)](https://en.wikipedia.org/wiki/Megaera_(Hades))
- Spine 8-direction tutorial (Danielle Elias, 2020):
  - Paint Down, Up and Right bases in Photoshop. Up can be derived from Down.
  - Build one side of the limbs and mirror.
  - Key each direction's attachments at different timeline frames ("0 = South, 1 = SE, 2 = E, 3 = NE, 4 = N").
  - Reposition arm/leg IK targets per direction, and negate foot scale where needed.
  - Create northern animations by duplicating South/SE animations and swapping in the N/NE attachments. "A few keyframes still need fixing in each direction."
  — [notslot: Spine 8 Direction Character Part 1](https://notslot.com/tutorials/2020/04/spine-8-direction-character-part-1); [Part 3](https://notslot.com/tutorials/2020/04/spine-8-direction-character-part-3); [GameDev.net Part 2 (rigging)](https://gamedev.net/tutorials/visual-arts/spine-8-direction-character-part-2-rigging-r5422); [LinkedIn Part 1](https://www.linkedin.com/pulse/spine-8-direction-character-part-1-photoshop-danielle-elias?articleId=6653300903627632640)
- Arknights reduces Spine chibis to Front + Back skeleton sets (mirrored horizontally). — [arkpedia-sd-assets](https://github.com/arkpedia/arkpedia-sd-assets)
- Hyper Light Drifter: sprite animation runs below 60 Hz and the game is intentionally 480p. Its direction count was not found (forum quotes of Alx Preston). — [NeoGAF thread](https://www.neogaf.com/threads/hyper-light-drifter-dev-alex-preston-our-game-is-480p-and-very-intentionally-so.933838/page-10); [The Art of Hyper Light Drifter](https://www.goodreads.com/en/book/show/45442615)
- Unity forum pattern: animate 4 directions and pick the nearest for diagonal movement. — [Unity Discussions: 4-direction sprites with diagonal movement](https://discussions.unity.com/t/2d-sprite-animation-in-4-directions-but-movement-can-also-go-diagonal/747965)

### Inferences
- Labour multiplier for the knight, relative to one side-view set:
  - 4-dir with mirror: about 3x (S, N, E).
  - 8-dir with mirror: about 5x (S, SE, E, NE, N).
  - Asymmetric greatsword or heraldry adds extra facings, or tricks like drawing the sword as a separate swappable layer so the body mirrors but the sword stays in the correct hand.
  - In Spine, each facing also needs its own painted PSD (with occluded parts) and partial re-animation. The saving versus frame-by-frame is in in-betweens, not in facings.
- A common compromise in action RPGs: 8-direction locomotion (idle/run), but attacks authored in fewer facings (e.g. 4 diagonals or 4 cardinals) with the character snapping to the nearest attack facing. Wings and greatsword VFX hide the snap. This is an inference; I did not find a citable commercial example in budget.
- At a 45° top-down camera, the "front" view is really a 3/4-from-above view. The concept sheets (front/back/side) will need repainting at the camera's elevation angle, or body foreshortening will look wrong.

### Gaps
- No verified direction counts for Hyper Light Drifter, CrossCode, Eastward, Children of Morta or Moonlighter (Moonlighter is confirmed only as "4 views").
- No commercial Spine top-down 8-direction action RPG postmortem was found.

## 8. Known limits of skeletal 2D ("paper puppet") and how studios hide it; the hybrid approach

### Takeaway
Skeletal 2D looks puppet-like when parts only rotate and translate rigidly, when big turns in depth are attempted, and when foreshortening is needed. Studios hide this by:
- keeping turns within one drawn facing;
- using meshes for squash/stretch;
- swapping in drawn extreme poses, smears and impact frames (Spine Sequence/attachment swaps);
- layering VFX, lighting and fast timing on top.

The proven hybrid is: bones for idle, locomotion and standard attacks; drawn frames for supers and extreme poses.

### Cited Findings
- Cutout/jointed figures move in a more limited "puppet" way. Turning a character or changing its shape needs extra pieces for each stage. — [AnimationExplainers: Cutout animation](https://animationexplainers.com/paper-cut-out-animation/)
- Skeletal rigs cost setup time, and meshes distort if pushed too far. — [egmatic: Sprite animation techniques](https://egmatic.com/blog/sprite-animation-techniques)
- Academic: in cutout animation the pose is "rigidly and precisely controlled by the skeleton… this strategy does not allow to control the look of the character in the desired pose". — [Generative Cutout Animation (Computer Graphics Forum)](https://onlinelibrary.wiley.com/doi/10.1111/cgf.70422); [Princeton: Video Puppetry](https://gfx.cs.princeton.edu/pubs/Barnes_2008_VPA/puppet.pdf)
- Fighting-game studio guide:
  - Use skeletal animation for idles, walks and standard attacks, and frame-by-frame for supers, throws and extreme poses.
  - Bone-only attacks can feel floaty, so animators swap in separate images for smears, impact frames and extreme poses.
  - Order one idle plus one attack first to test rig deformation at the actual camera distance and timing against frame data.
  — [DashFight: How 2D fighting game characters are designed, animated and rigged](https://dashfight.com/news/how-2-d-fighting-game-characters-are-designed-animated-and-rigged-9271)
- Smears can be faked in Spine with bone/mesh deformation alone, which avoids drawing every smear for each skin combination. — [Game Developer: juicy animations with Spine basics](https://www.gamedeveloper.com/design/tips-to-create-funny-and-juicy-character-animations-with-spine-basics)
- Smear frame definition and history. — [Wikipedia: Smear frame](https://en.wikipedia.org/wiki/Smear_frame)
- Spine's official route to inject drawn poses: export a pose to PSD, draw new attachments, re-import with `[slot]` names. Spine 4.1 Sequence attachments can play drawn frame series inside the rig. — [Esoteric: Rigging new poses](https://esotericsoftware.com/blog/Rigging-new-poses-tutorial); [Spine 4.1 released](https://en.esotericsoftware.com/blog/Spine-4-1-released)
- UbiArt GenAnim was described as fusing hand-drawn key frames with bone animation (informal source). — [student portfolio](https://matthewjamessaitdigitaldesign.wordpress.com/2017/07/06/extended-project-portfolio/)
- Fake 3D head turns only shift face and back-of-head features in opposite directions. They do not rotate in depth. — [ArmAnimation intermediate face rig](https://www.armanimation.com/post/intermediate-rigging-a-face-in-spine-2d-for-3d-turn)
- Lighting, shadow and particles "solidify" 2D art (Hollow Knight). — [PC Gamer](https://www.pcgamer.com/hollow-knights-charming-art-sets-the-bar-for-hand-drawn-games/)
- Bone-attached VFX emitters (SpineFX). — [SpineFX](https://spinefx.io/)

### Inferences
Applied to the winged greatsword knight:
- Run/idle/walk in 5 unique facings as Spine rigs. Armour is mostly rigid regions. The cape, wing feathers and plume use physics constraints.
- Each heavy attack gets 3–5 drawn key poses per facing (anticipation, apex, impact, recovery) as attachment swaps, plus a drawn smear arc (Sequence attachment or a VFX sprite) on the 1–3 fastest frames.
- Screen shake, hit-stop and light flashes go on impact. This matches the "skeletal body + drawn key poses/smear" prototype.
- The biggest risk areas:
  - Wings, which must read correctly in every facing. They likely need separate painted wing sets per facing, possibly 2–3 drawn wing poses (folded/half/spread) swapped and then deformed.
  - The greatsword, because a long rigid object rotating in a top-down plane needs foreshortening as it swings toward/away from the camera. Draw 3–4 sword-length/angle variants and swap them.
  - The step from AI concept sheets to rig-ready layered art. AI images lack consistent occluded parts and consistent design across facings, so a human paint-over pass per facing is required.
- Sheer frame-by-frame (Cuphead-style) for 8 directions × many attacks is economically out of reach for a small team: Cuphead hit about 1,200 frames for a side-view player with 2 facings. Pre-rendered 3D-to-2D (Diablo/Hades 1) is the main alternative for many facings while keeping a painted look, and should be compared by the parallel 3D-pipeline research.

### Gaps
- No primary-source postmortem of a commercial top-down Spine action game documenting its hybrid smear/key-pose workflow or its per-attack budget.
- No quantified comparison (hours per animation) of Spine versus frame-by-frame from the same studio.
