# 3D production pipelines for characters that look hand-painted / hand-drawn 2D

Method note (read first): in this session WebFetch could not reach most hosts (gamedeveloper.com, www.gamedeveloper.com, ggxrd.com, habr.com all failed with ENOTFOUND, meaning the session's network allowlist blocks them). Every finding below therefore comes from search-engine snippets and summaries of the pages linked, not from full-page reads. The primary documents worth reading in full once access is allowed are: Vasseur's Dead Cells article (gamedeveloper.com), Motomura's GDC 2015 handout PDF (ggxrd.com/Motomura_Junya_GuiltyGearXrd.pdf), ASW's "Guilty Gear Toon Line Control Techniques" slides (docswell), the Hi-Fi Rush GDC 2024 talk (GDC Vault / YouTube), and Supergiant's Paige Carter Nyx video. Claims I only remember from training data and could not confirm here are listed under Gaps and marked "unverified".

## Q1. Dead Cells (Motion Twin): 3D model to pixel-art sprite frames

### Takeaway
Dead Cells (2018) is the clearest documented case of 3D rendered down into pixel-art frames. One artist built low-detail 3D models and skeletons in 3ds Max, keyframed them, and rendered each frame at a tiny size with no smoothing through an in-house tool, exporting a PNG plus a normal map per frame so a simple toon shader and dynamic lights could shade them in game. The payoff was fluid 30 fps animation, reusable animations and attachable gear, without hand-drawn shading on every frame. The cost is occasional stray pixels that a pixel artist would not accept.

### Cited Findings
- Primary source: Thomas Vasseur, "Art Design Deep Dive: Using a 3D pipeline for 2D animation in Dead Cells", Game Developer, January 2018 — [Game Developer](https://www.gamedeveloper.com/production/art-design-deep-dive-using-a-3d-pipeline-for-2d-animation-in-i-dead-cells-i-); [author page](https://www.gamedeveloper.com/author/thomas-vasseur). Reposted at [Game Anim](https://www.gameanim.com/2018/01/31/dead-cells-3d-pipeline-2d-animation/); Russian translation on [Habr](https://habr.com/en/articles/416589/); English re-translation on [Sudo Null](https://sudonull.com/post/14066-Dead-Cells-Using-3D-Pipeline-for-2D-Animation/).
- The pipeline, as reported from the article:
  1. Draw a basic 2D pixel-art model sheet of the character.
  2. Model the character and its skeleton in 3ds Max, then export as FBX.
  3. Animate on keyframes, then add in-between frames once the motion works.
  4. Render each frame at a very small size without smoothing (effectively no anti-aliasing) through a custom in-house tool. This is what produces the pixel look.
  5. Export each frame as a PNG together with its normal map, so a basic toon shader can render the volume in game.
  — [Game Developer](https://www.gamedeveloper.com/production/art-design-deep-dive-using-a-3d-pipeline-for-2d-animation-in-i-dead-cells-i-); [Sudo Null](https://sudonull.com/post/14066-Dead-Cells-Using-3D-Pipeline-for-2D-Animation/)
- Sprite size and model detail: characters are about 50 px tall in game, so Vasseur considered spending lots of time on a detailed 3D model cost-inefficient. Models were kept simple. — [Game Developer (via search summary)](https://www.gamedeveloper.com/production/art-design-deep-dive-using-a-3d-pipeline-for-2d-animation-in-i-dead-cells-i-)
- Modularity: armour and other elements are added by attaching assets to the 3D model. Reusing one animation across different models was an explicit goal, though some issues had to be fixed before the workflow could be reused. — [Game Developer](https://www.gamedeveloper.com/production/art-design-deep-dive-using-a-3d-pipeline-for-2d-animation-in-i-dead-cells-i-)
- Frame rate and time: the workflow produced 30 FPS animations and "saved a lot of time". Vasseur jokes that a modification took less time than making a GIF for the article. No hours or percentages are given. — [Sudo Null](https://sudonull.com/post/14066)
- Why normal maps: on the studio's earlier game (ScarKrow) shadows were hand-drawn on every frame. For Dead Cells they built a lighting system instead, with normal maps lighting the sprites. — [Sudo Null](https://sudonull.com/post/14066)
- Backgrounds and decorations were hand-drawn in Photoshop and then redrawn as normal maps for the dynamic lighting. — [80.lv interview](https://80.lv/articles/interview-with-the-developers-of-dead-cells)
- Team: Vasseur was the only artist for roughly the first year, and the models and animation were done in 3ds Max by one person. — [80.lv](https://80.lv/articles/interview-with-the-developers-of-dead-cells)
- Quality trade-off: individual frames sometimes contain stray pixels that would be rejected in hand-drawn pixel art. Fluid motion usually hides them. — [FMP 3D-to-pixel research blog (third party)](https://faeparkinsongamesyr2.wordpress.com/2024/06/01/fmp-3d-to-pixel-art-pipeline/)
- Motion Twin's conversion tool was never released. Third parties have rebuilt the idea, for example as a Houdini pixel-art renderer. — [itch.io Houdini tool](https://fatalexit.itch.io/pixelart-renderer-for-sidefx-houdini); see also [Devpost recreation](https://devpost.com/software/the-dead-cells-animation-pipeline)

### Inferences
- Dead Cells is a side-on 2D platformer, so it only needs about one direction (mirrored). For an 8-direction top-down game the same pipeline multiplies render count by about 5 (with mirroring) to 8, but because rendering is automated, the extra cost is mostly storage and memory rather than artist time.
- The pipeline suits the knight well: a low-detail model built from the concept sheets, one skeleton shared across attacks, armour and wings as attached meshes, greatsword swings keyframed, then batch-rendered per direction with normal maps so in-game lighting stays dynamic.
- The "no smoothing at tiny size" step is what hides the 3D. At higher resolution (painterly HD rather than pixel art), that trick goes away and a different stylization is needed (see Q2 Supergiant and Q4 shaders).

### Gaps
- Exact frame counts per animation, hours per animation and number of animations were not visible in the snippets. The full article may contain them.
- Whether animators used stepped/held keys or full interpolation could not be confirmed.

## Q2. Supergiant Games (Bastion, Transistor, Pyre, Hades, Hades II)

### Takeaway
Through Hades (2020), Supergiant built key characters as 3D models from Jen Zee's painted concepts, animated them in 3D (Maya, with motion capture used as a base for much of Hades), and pre-rendered thousands of frames from many angles. The game displayed only those 2D frames. Environments were hand-painted 2D. Hades II switched to real-time 3D characters to cut memory, support twice as many characters and allow true turn and lean blending, while keeping the painterly look. For an 8-direction action RPG this is the closest analogue, and the studio itself moved away from pre-rendering once sprite memory and animation flexibility became limits.

### Cited Findings
- Hades: a Supergiant developer on Steam said the game does not use real-time 3D rendering. Characters such as Zagreus were modelled and animated in 3D, then rendered as "thousands upon thousands of frames" from many angles, and those frames are what players see. Environment art is mostly hand-painted 2D, with some 3D-animated effects that are technically 2D animations in their engine. — [Steam discussion](https://steamcommunity.com/app/1145360/discussions/0/1738883810796606862)
- Transistor: some characters (for example Red) were 3D-modelled and turned into "thousands and thousands of frames". Environment art was all hand-painted by Jen Zee in Photoshop. — [Steam discussion (Transistor)](https://steamcommunity.com/app/237930/discussions/0/540742579460699373)
- Hades tools (team interview): 2D assets were made entirely in Photoshop. 3D work was modelled and animated in Maya and post-processed in After Effects. The animator used mocap as the base for a large share of the animation. — [MCV/DEVELOP "Behind the art of Hades"](https://mcvuk.com/business-news/behind-the-art-of-hades-we-value-artistic-integrity-and-excellence-in-artistic-craft-at-supergiant-however-were-first-and-foremost-a-game-design-lead-team/)
- Concept to model: 3D artist Paige Carter works from Jen Zee's concept art and tries to carry the 2D designs into 3D as faithfully as possible. Almost all Hades NPCs start from one of two base models that are reshaped into new characters. 3D heads are usually made slightly larger, and characters look a bit shorter because of the orthographic camera. — [Game Developer on the Carter/Nyx video](https://gamedeveloper.com/art/learn-how-supergiant-brought-i-hades-i-hand-painted-characters-to-life); [DTF write-up (Russian)](https://dtf.ru/id64954/238431-sozdanie-materi-nochi-process-modelirovaniya-nikty-iz-hades); [GoNintendo](https://gonintendo.com/stories/371221-supergiant-games-shows-off-the-3d-modeling-rigging-process-for)
- Angles and frames, fan claims only: one Steam user says Zagreus's bow attack is 104 frames rendered at 32 angles (3,328 frames). Another says Hades animations were pre-rendered at high frame rates and Zagreus had about 9k frames in total. Neither is official. — [Steam thread](https://steamcommunity.com/app/1145360/discussions/0/1864993755183591660); [Steam (Hades II, "Is the game still 2d?")](https://steamcommunity.com/app/1145350/discussions/0/6369856944151829269/)
- Hades II: Supergiant graphics engineer Devansh Maheshwari describes it as one of the studio's first games with fully 3D character models rendered in real time, while keeping the painterly 2D look. He calls it a major shift from the entirely 2D workflow of Hades. The profile says the new pipeline supports twice as many characters with faster performance and less memory, and enables proper turn animations and subtle leaning blends, where in Hades the character turned in place. — [DigiPen profile](https://www.digipen.edu/showcase/news/hades-2-graphic-programmer)
- Hades II keeps hand-painted 2D environments and portraits with real-time 3D characters, and the store copy mentions "even smoother real-time 3D characters". — [Hyperlific article](https://www.hyperlific.com/articles/jen-zees-2d-defiance-and-the-hand-that-paints-hades-ii/); [Steam discussion](https://steamcommunity.com/app/1145350/discussions/0/6369856944151829269/)
- Art director Jen Zee discussed the visual differences between Hades and Hades II in a 2024 Game Informer video interview. The snippets had no technical detail. — [Game Informer](https://gameinformer.com/exclusive-video/2024/07/05/supergiant-games-art-director-jen-zee-on-the-making-of-hades-ii); [archive.org copy](https://archive.org/details/youtube-4r9vkQ7i3Fg)

### Inferences
- The Hades pre-render model (many angles, high frame counts) only works because rendering is automated. Its real cost is texture memory and disk, which is the stated reason Supergiant moved to real-time 3D in Hades II. A knight with wings, a greatsword and "many attacks" in 8 or more directions would hit the same wall quickly if rendered at HD resolution.
- The orthographic-camera notes (bigger heads, shorter-looking bodies) are directly relevant to a 45° top-down camera. Proportions need to be exaggerated on the 3D model so the character reads correctly from above, rather than matching the front-view concept sheet exactly.
- Two base meshes for almost all NPCs is a concrete way to keep modelling cost low.

### Gaps
- No official direction/angle count, sprite resolution or frame rate for Hades or Transistor was found. The 32-angle figure is a fan claim.
- Shader details of Hades II's real-time characters (outline method, painted textures, lighting) were not found in sources reachable here.
- Nothing specific was found on Bastion or Pyre character pipelines.

## Q3. Diablo II and classic pre-rendered isometric games

### Takeaway
Diablo II-era games pre-rendered 3D models into isometric sprite frames and saved work by layering separately rendered equipment pieces at runtime and limiting move-sets to a few weapon classes. Exact direction and frame counts could not be confirmed from developer sources here. Modding documentation shows the format supports 8 or 16 directions with frames split evenly per direction.

### Cited Findings
- Forum posters (not developers) report that Diablo II characters were modelled in 3D and pre-rendered to 2D. One recalls 3D Studio and a postmortem but was unsure. Another says Blizzard used the same high-res models as for cinematics and wallpapers. — [GameDev.net](https://gamedev.net/forums/topic/487300-question-about-diablo-2s-sprites/); [GameDev.net](https://gamedev.net/forums/topic/66646-diablo-2-characters-are-2d-or-3d/)
- Layering: each body part, armour piece and weapon was rendered separately in every position and rotation and composited at runtime. Characters had three movesets: one-hand weapon (with or without shield), dual wield and two-hand weapon. Forum sources, informal. — [GameDev.net](https://gamedev.net/forums/topic/556056-how-to-design-diablo-style-sprites/); [GameDev.net](https://www.gamedev.net/forums/topic/556056-how-to-design-diablo-style-sprites/4572946/)
- DCC format: an animation's total frame count is split evenly across directions. For example, 128 frames over 8 directions is 16 frames per direction. The format has 16 direction offset slots. — [d2mods tutorial](https://d2mods.info/forum/kb/viewarticle?a=171&amp); [Diablo 2 animation extraction PDF](https://tristram-archives.github.io/diablo2_infodump/2013/just%20hosting%20these,%20Downloaded%20from%20Internet/documentation/extracting_diablo_2_animations.pdf)
- Diablo II: Resurrected (2021) draws upgraded 3D models over the original 2D sprite game and can toggle between the two visuals at the press of a button. — [Wikipedia](https://en.wikipedia.org/wiki/Diablo_II:_Resurrected)
- The Infinity Engine (Baldur's Gate) uses pre-rendered backgrounds. — [Wikipedia: Infinity Engine](https://en.wikipedia.org/wiki/Infinity_Engine)

### Inferences
- The layering approach (body, armour and weapon rendered separately, composited at runtime) maps well onto a knight whose wings, armour and greatsword may change. It also shows the cost: every layer must be rendered for every direction and frame.
- One greatsword moveset (two-handed) is the Diablo II equivalent of the knight. That keeps the animation set bounded.

### Gaps
- Official direction counts (8 vs 16) and frames per animation for Diablo II, Baldur's Gate, StarCraft and Children of Morta were not found in primary sources. From memory, unverified: Diablo II player characters used 16 directions for some modes and 8 for others, and StarCraft units used 17 rendered facings mirrored to 32. Both need confirming.
- Readability techniques (silhouette, contrast against floor) in these games were not covered by any source found.

## Q4. Guilty Gear Xrd and Arc System Works (DBFZ, GBVS)

### Takeaway
Guilty Gear Xrd (GDC 2015, Junya C. Motomura) is the reference for making real-time 3D read as hand-drawn anime. The key techniques are:
- limited animation (hand-picked key poses, no smooth interpolation)
- hand-edited normals so cel shadows fall where an illustrator would put them
- a vertex-colour channel that biases where shadows fall, alongside a tint texture for the shadow colour
- inverted-hull outlines with per-vertex width (down to zero)
- mesh deformation at keyframes so the model never looks rigidly 3D

All of it is labour-intensive per animation.

### Cited Findings
- Talk: "GuiltyGearXrd's Art Style: The X Factor Between 2D and 3D", Junya C. Motomura (technical artist, Arc System Works), GDC 2015. Its goal was rebuilding a classic 2D fighter in full 3D while keeping its 2D charm. Video and English handout were published. — [GDC Vault](https://gdcvault.com/play/1022031/GuiltyGearXrd-s-Art-Style-The); [Arc System Works announcement](https://www.arcsystemworks.com/guilty-gear-xrds-art-style-the-x-factor-between-2d-and-3d-talk-from-gdc-2015-is-now-available-online/); [handout PDF](https://www.ggxrd.com/Motomura_Junya_GuiltyGearXrd.pdf); [Game Developer video](https://www.gamedeveloper.com/art/video-behind-the-scenes-of-i-guilty-gear-xrd-i-s-striking-2d-3d-art)
- Limited animation: full animation was tried and rejected because it made the visuals look more 3D. A side-by-side of one move in limited vs full animation appears around 33:55 in the talk. — [videohighlight summary](https://videohighlight.com/v/yhGjCzxJV3E); [BlenderNation](https://www.blendernation.com/2015/07/26/junya-c-motomura-behind-the-scenes-of-guilty-gear-xrd/)
- Game Watch (Japanese) describes motion built only from keyframes, the way sprite or cel multi-frame animation works. — [Game Watch](https://game.watch.impress.co.jp/docs/news/20150307_691725.html)
- Per-keyframe mesh deformation adds imperfections that stop the model from looking rigidly 3D. — [videohighlight summary](https://videohighlight.com/v/yhGjCzxJV3E)
- Labour: adjusting each animation this way is very time-consuming (commenter remark, not confirmed as a talk quote). — [BlenderNation](https://www.blendernation.com/2015/07/26/junya-c-motomura-behind-the-scenes-of-guilty-gear-xrd/)
- Cel shading: the shader tests whether the normal faces the light and picks the light colour (base texture) or the shadow colour (base texture multiplied by a tint texture). Lit areas are defined by normals alone. Shaded areas use normals plus one vertex-colour channel, giving hand-painted shadows that don't follow physical lighting. — [handout](https://www.ggxrd.com/Motomura_Junya_GuiltyGearXrd.pdf); [Unity forum: Maya CgFX shader based on the talk](https://forum.unity.com/threads/maya-cgfx-shader-inspired-by-guilty-gear-xrd-gdc-presentation.333355/)
- Normals: the team edited normals on major features to remove unwanted shading, because under cel shading "the smallest inconsistency in normals results in a very visible artifact". — [handout via search](https://www.ggxrd.com/Motomura_Junya_GuiltyGearXrd.pdf)
- Outlines: a traditional inverted hull, in which a second set of darker polygons is generated in the shader and expanded, with variable widths and the option to erase the line. A community reproduction drove outline thickness from another vertex-colour channel. — [handout](https://www.ggxrd.com/Motomura_Junya_GuiltyGearXrd.pdf); [Unity forum](https://forum.unity.com/threads/maya-cgfx-shader-inspired-by-guilty-gear-xrd-gdc-presentation.333355/)
- Later ASW talk "Guilty Gear Toon Line Control Techniques": custom shaders control outline width and colour, including turning outlines off per vertex. Outline width is scaled by camera distance multiplied by tan(FOV/2) to keep screen-space width constant. — [docswell slides (ENG)](https://www.docswell.com/s/ASW_Academy/5LVY67-GG-Toonline-Eng)
- Textures: drawing lines directly into textures hits resolution limits and pixelates in close-ups (summary). — [videohighlight](https://videohighlight.com/v/yhGjCzxJV3E)
- Additional primary material: a set of five Guilty Gear Xrd design and graphics documents, including "Modeling for Skinning". — [archive.org](https://archive.org/stream/GGXrd-design-docs/GuiltyGear%20Xrd%20Modeling%20for%20Skinning.pptx_djvu.txt)
- Dragon Ball FighterZ (2018) was directed by Junya C. Motomura and is described as being in the vein of Xrd, "3D on a 2D plane". — [Wikipedia](https://en.wikipedia.org/wiki/Dragon_Ball_FighterZ)
- An outside studio's animation team analysed the DBFZ trailer frame by frame and concluded that either every frame was lit by hand or ASW had found a way to make it look so. — [Edge via PressReader](https://www.pressreader.com/australia/edge/20170720/282630327693400)

### Inferences
- Fighting games have a fixed side camera, so ASW tunes shadows and outlines for essentially one view. A 45° top-down camera with 8 movement directions and a free light breaks the "one view" assumption. Hand-edited normals and vertex-colour shadow bias still work, but per-shot tweaks don't scale.
- Limited animation (held key poses) is cheap to adopt and is the single biggest "2D-ness" factor reported. It also improves attack readability, since each pose of a greatsword swing is held long enough to read.

### Gaps
- Specific Xrd numbers (frames per second of held poses, polygon counts, texture sizes, team size) were not in the snippets. Unverified from memory: Xrd characters used about 40k triangles and an internal frame-hold scheme of roughly 15 fps or less. Check the handout.
- Camera-specific model tweaks (adjusting the mesh per camera angle in supers) could not be confirmed here.
- No GDC 2018 DBFZ talk details or Granblue Fantasy Versus pipeline sources were found.

## Q5. Anime/toon and painterly real-time 3D (HoYoverse, Hi-Fi Rush, toon shaders, Arcane-style)

### Takeaway
Modern real-time anime rendering stacks several pieces:
- ramp or threshold cel shading with authored shadow colours
- special handling of faces, for example SDF or threshold face-shadow textures keyed to the light angle, instead of normal-based shading
- outlines
- controlled light (toon lights, colored shadows)

Hi-Fi Rush is the best-documented Western case (GDC 2024). HoYoverse's techniques are known mainly through community reverse-engineering. Painterly looks such as Arcane rely on hand-painted textures with painted light and shadow plus reduced frame rates.

### Cited Findings
- Hi-Fi Rush: GDC 2024 talk "3D Toon Rendering in Hi-Fi RUSH" by Kosuke Tanaka and Takashi Komada (Tango Gameworks), on a customised Unreal Engine 4 at 60 fps and native resolution. It covers:
  - toon shading for the entire world, characters and environments alike
  - a deferred toon renderer that stylises custom render passes and combines them in deferred post-process volumes, so artists can choose where toon shading applies
  - a comic shader with halftone dots in lit areas and hatching in shadows
  - coloured shadows, toon lights, dynamic and static shadow-map strategies, light-probe GI and a face-shadow implementation
  — [GDC Vault](https://gdcvault.com/play/1034251/3D-Toon-Rendering-in-Hi); [YouTube](https://www.youtube.com/watch?v=gdBACyIOCtc); [Class Central summary](https://www.classcentral.com/course/youtube-3d-toon-rendering-in-hi-fi-rush-298286); [Chinese talk notes](https://www.foth.top/article/gdc-2024-hifirush-toonrendering-notes/)
- Hi-Fi Rush animation is tied to the music: enemies and backgrounds bounce on the beat. — [PCWorld](https://www.pcworld.com/article/1485054/hi-fi-rush-is-a-colorful-beat-em-up-that-lacks-variety-but-not-personality.html)
- Genshin face shadows (community reverse-engineering, not official): a facial shadow texture stores shadow coverage for left-side light at angles from 0° to 180° on the xz plane. The shader compares the character's forward vector with the light direction to pick the coverage. — [URPSimpleGenshinShaders (GitHub)](https://github.com/NoiRC256/URPSimpleGenshinShaders)
- Other community toon shaders: HoyoToon replicates miHoYo/HoYoverse shading for Genshin Impact, Honkai Impact 3rd, Honkai Star Rail, Zenless Zone Zero and also Wuthering Waves, and exposes face-shadow softness. URP_Toon offers an SDF face shadow from a precomputed mask, but it needs symmetrical face UVs. — [HoyoToon](https://github.com/Hoyotoon/HoyoToon); [HoyoToon releases](https://github.com/Hoyotoon/HoyoToon/releases); [PrimoToon](https://github.com/festivities/PrimoToon); [URP_Toon](https://github.com/ChiliMilk/URP_Toon)
- Arcane (Fortiche, TV series, not a game) is cited as a painterly reference:
  - hand-painted textures, with light and shadow painted onto textures rather than generated by CG lighting
  - custom shaders that keep the painted texture consistent under different lighting
  - 2D effects (smoke, magic, water) layered over the 3D
  - hand-painted backgrounds
  - some elements animated at 12 fps
  — [RedShark News](https://www.redsharknews.com/why-netflixs-arcane-looks-so-good-how-fortiche-ramped-up-the-animation-pipeline); [8forty](https://8forty.ca/2022/01/19/arcane-3d-animation-with-hand-drawn-backgrounds/)

### Inferences
- What makes these read as 2D, synthesised across the sources:
  1. Shading is authored, not physical (threshold or ramp, painted or tinted shadow colours, edited normals, face-shadow masks).
  2. Lines are controlled.
  3. Motion is stepped or held.
  4. Effects are 2D.
  5. Lighting is art-directed.
  This is an inference from the techniques listed, not a stated thesis of any single source.
- For a 45° camera, face shading matters less than in close-up anime games, because faces are small. Body and armour shadow shapes, rim lights and outlines carry most of the 2D read. Armour (hard surfaces) cel-shades cleanly. Wings (feathers) need either clumped geometry with edited normals or painted cards.

### Gaps
- No official HoYoverse talk (Unite/CEDEC/GDC) content was reachable. Unity Toon Shader, lilToon, MToon and Blue Protocol were not researched in this pass.
- No primary source on the Zelda (Breath of the Wild / Tears of the Kingdom) painterly shader was found.

## Q6. HD-2D (Octopath Traveler): 2D sprites in a 3D world

### Takeaway
HD-2D keeps characters as hand-made 2D pixel sprites and puts them into fully 3D, Unreal-rendered environments with high-definition lighting and effects. It is an environment-side technique. Characters stay true 2D, so it shows a hybrid where the character art is the 2D asset and 3D is used for the world.

### Cited Findings
- HD-2D combines Super NES-style character sprites and textures with polygonal environments and high-definition effects. Backgrounds are fully 3D and often use complex camerawork. — [Wikipedia: HD-2D](https://en.wikipedia.org/wiki/HD-2D)
- Acquire's team decided that combining 2D pixels with 3D art would look new and fresh. The game was built in UE4 with at most six programmers at peak. — [Unreal Engine spotlight](https://www.unrealengine.com/spotlights/octopath-traveler-s-hd-2d-art-style-and-story-make-for-a-jrpg-dream-come-true)
- Octopath Traveler II staged scenes with Unreal features as in a 3D game rather than scripted events, built its day/night cycle with Sequencer, and aimed for images "picture-perfect" at any screenshot. — [Unreal Engine interview](https://www.unrealengine.com/en-US/developer-interviews/octopath-traveler-ii-builds-a-bigger-bolder-world-in-its-stunning-hd-2d-style); [Nintendo Life](https://www.nintendolife.com/news/2022/10/octopath-traveler-ii-devs-aimed-to-make-its-hd-2d-visuals-picture-perfect)

### Inferences
- For the knight, HD-2D is relevant on the environment side: sprite characters (pre-rendered à la Dead Cells, or hand-drawn) inside a lit 3D world, ideally with normal-mapped sprites so the 3D lights affect them.
- Octopath's sprites are small, low-frame-count and mostly 4-direction. A greatsword action RPG needs far more animation, which pushes toward a 3D-sourced pipeline for the frames themselves.

### Gaps
- No source on Octopath's sprite direction count, frame counts or how sprites receive 3D lighting was found.

## Q7. 45°/top-down camera specifics, attack readability and failure modes (cross-cutting)

### Takeaway
The sources say little about 45° cameras directly. The key evidence:
- Hades proportions are tweaked for an orthographic camera.
- Hades II moved to real-time 3D partly to get true turning and leaning instead of turning in place between pre-rendered angles.
- Diablo II limited move-sets and layered equipment.

Documented failure modes:
- "3D look" leaking through smooth full animation (Xrd)
- cel-shading artifacts from bad normals (Xrd)
- stray pixels in automated pixel renders (Dead Cells)
- memory and character-count limits with pre-rendered frames (Hades to Hades II)
- texture-line pixelation up close (Xrd)

### Cited Findings
- Orthographic camera: 3D heads are made slightly larger and characters look shorter in the orthographic view. — [DTF](https://dtf.ru/id64954/238431-sozdanie-materi-nochi-process-modelirovaniya-nikty-iz-hades)
- Pre-render limits: moving to real-time 3D characters doubled character capacity, cut memory and allowed proper turn animations and leaning blends, versus turning in place in Hades. — [DigiPen](https://www.digipen.edu/showcase/news/hades-2-graphic-programmer)
- Full animation looks too 3D, so limited animation was chosen. — [videohighlight](https://videohighlight.com/v/yhGjCzxJV3E)
- Normal inconsistencies become very visible under cel shading. — [ggxrd handout](https://www.ggxrd.com/Motomura_Junya_GuiltyGearXrd.pdf)
- Stray pixels appear in automated 3D-to-pixel frames. — [FMP blog](https://faeparkinsongamesyr2.wordpress.com/2024/06/01/fmp-3d-to-pixel-art-pipeline/)
- Lines in textures pixelate in close-ups. — [videohighlight](https://videohighlight.com/v/yhGjCzxJV3E)

### Inferences (for the winged knight, 45° camera, 8 directions, many attacks)
- **Option A, Dead Cells/Hades-style pre-render:** build a 3D model from the concept sheets, keyframe a limited set of attacks, and batch-render 8 directions (5 unique plus 3 mirrored, if the design is symmetric) with normal maps.
  - Pros: art-directable per frame, works in any 2D engine, and frames can be painted over.
  - Cons: memory grows as directions × frames × layers. Turns snap between directions, and the large, asymmetric wings and greatsword make mirroring unsafe. Hades went to 32 angles (fan figure) and then dropped the approach.
- **Option B, Hades II/Xrd-style real-time toon 3D:** one rig, any number of directions, smooth turns, and cheap re-use across many attacks.
  - Needs a stylised shader (threshold shading, tinted shadows, edited normals, inverted-hull outlines with per-vertex width), held-pose animation and possibly painted textures.
  - Risk: a "3D look" leaking through if motion is fully interpolated or shading is physical.
- Readability at 45°: exaggerated proportions (bigger head and shoulders, bigger sword), held key poses on the swing, 2D smear or slash VFX layered on top (as Arcane and Hades use 2D effects), and strong outlines.
- Because the only source art is AI-generated 2D sheets, a 3D model is needed in either option. The sheets serve as the Jen Zee-style concept reference, as at Supergiant.

### Gaps
- No developer source specifically on attack readability from a high camera angle was found.
- No sourced data on sprite-sheet memory budgets (MB per character) was found.
- Children of Morta's pipeline (hand-drawn pixel art vs 3D source) was not found in this pass.
