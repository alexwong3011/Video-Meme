# Engines & Runtimes for a Fully Animated 2D-Looking ARPG Character (web + mobile)

Context: hand-written HTML5 canvas prototype (2D skeletal rig cut from painted sheets plus drawn key poses). The character is a winged armoured knight with a greatsword, 8-direction movement and many attacks. Researched Nov 2026.

**Research environment caveat:** from this session, esotericsoftware.com, docs.godotengine.org, developer.mozilla.org, gamedeveloper.com and donmccurdy.com could not be fetched directly (network allowlist). Facts about those sites come from search-engine snippets of their pages (URLs still given), plus a direct fetch of the Spine LICENSE file on GitHub. Before making a decision on a claim that rests only on a snippet, re-check it on the live page.

## 1. Spine runtimes (web, Unity, Godot), mesh performance, licensing

### Takeaway
Spine is the most mature runtime family for skeletal 2D. It covers PixiJS v8, Phaser 4, raw WebGL/canvas/player, Unity, Godot (GDExtension) and C/C++. On the web the main cost is CPU-side mesh deformation and re-upload of vertices every frame, so keeping vertex counts low is the main way to stay fast on mobile. The runtimes are free to ship, but every developer who integrates them needs a paid Spine Editor licence (Essential below US$500k annual revenue, Enterprise above it). The Trial licence gives no runtime rights.

### Cited Findings
- **Licence text (GitHub LICENSE):** the Spine Runtimes may be integrated into products "provided that each user of the Products must obtain their own Spine Editor license". Also, "redistribution of the Products in any form must include this license and copyright notice". — [Spine Runtimes LICENSE (GitHub)](https://raw.githubusercontent.com/EsotericSoftware/spine-runtimes/4.2/LICENSE)
- **Editor licence required at integration time:** the Editor licence agreement requires that "You have a valid Spine Editor license at the time the Spine Runtimes are integrated into each Product." — [Spine Editor License Agreement](https://en.esotericsoftware.com/spine-editor-license)
- **Runtime-only use:** Esoteric staff say that including any Spine Runtimes code in an app or game requires a valid Spine Editor licence, even if you never use the editor. — [Spine forum: license for runtimes](https://en.esotericsoftware.com/forum/d/17246-license-for-runtimes)
- **Tiers:** per staff, Spine Essential is enough below US$500,000 annual revenue; above that, Enterprise is needed. The Trial licence "does not grant rights to integrate, distribute, or otherwise make use of the Spine Runtimes". — [Spine forum: runtime license question](https://ru.esotericsoftware.com/forum/d/24018-runtime-license-question); [Our new licensing explained](https://us.esotericsoftware.com/blog/Our-new-licensing-explained)
  - These are forum and blog statements, not binding text. Exact current prices were not verified.
- **spine-pixi-v8:**
  - Targets PixiJS 8 (minimum 8.4.0) and installs with `@esotericsoftware/spine-pixi-v8@~4.2.0`.
  - Can render through WebGL or WebGPU. Sources disagree on whether the Canvas API is supported.
  - — [spine-pixi docs](https://esotericsoftware.com/spine-pixi.md); [spine-pixi-v8 runtime released](https://esotericsoftware.com/blog/spine-pixi-v8-runtime-released)
- **PixiJS speed claim:** the PixiJS team says the v8 Spine implementation is "over 50% faster" than the v7 one. This is a vendor claim compared against v7, not against spine-webgl. — [PixiJS blog: Pixi.js hearts Spine](https://pixijs.com/blog/pixi-js-hearts-spine)
- **Mesh cost on the web:** in spine-pixi, meshes are generated and re-submitted to the GPU every frame, so real performance differs from synthetic sprite benchmarks. The recommended lever is reducing vertices; the editor's Metrics view shows vertex counts. — [spine-runtimes GitHub issue #2508](https://www.github.com/EsotericSoftware/spine-runtimes/issues/2508)
- **Phaser 4:**
  - Phaser 4.2 (July 2026) added a new Spine rendering backend plus Mesh2D, which batches textured triangles together with regular sprites.
  - The old spine-webgl backend is still available with `renderer: "spine-webgl"`.
  - spine-phaser-v4 4.3.11+ needs Phaser 4.2.1+.
  - The runtime's major.minor version must match the Spine Editor version you export from.
  - — [Phaser 4.2 news](https://phaser.io/news/2026/07/phaser-4-2-spine-renderer-mesh2d-stencil); [spine-phaser docs](https://esotericsoftware.com/spine-phaser); [spine-phaser-v4 released (2025)](https://phaser.io/news/2025/04/spine-phaser-v4-runtime-released)
- **Spine 4.3 exists:** a 4.3 branch and changelog are on GitHub (e.g. IK API renames in the C bindings), so check runtime and editor versions. — [spine-runtimes 4.3 CHANGELOG](https://raw.githubusercontent.com/EsotericSoftware/spine-runtimes/4.3/CHANGELOG.md)
- **Godot:**
  - spine-godot ships as a GDExtension that "brings all the power of Spine's animation system to Godot without requiring custom engine builds".
  - A Godot 4.5.1 Mono user reported .atlas/.skel import problems, so check version compatibility.
  - — [spine-godot GDExtension blog](https://esotericsoftware.com/blog/spine-godot-GDExtension); [Godot forum report](https://forum.godotengine.org/t/spine-gdextension-loads-but-godot-wont-recognize-atlas-or-skel-files-godot-4-5-1-mono/140830)
- **Spine 4.2 physics constraints:** these move bones automatically by simulating real-world physics, which suits wings, a cape or plumes. In Unity, Transform movement feeds into skeleton physics. — [Spine 4.2: The physics revolution](https://us.esotericsoftware.com/blog/Spine-4.2-The-physics-revolution)
- **Mixing and IK:**
  - AnimationState mixing (crossfade with mix duration, `setMixDuration` with a delay) is in the runtimes, including Godot.
  - A 4.2 forum thread reports IK constraint values from the next animation applying too early during a mix.
  - — [spine-core AnimationState.d.ts](https://cdn.jsdelivr.net/npm/@esotericsoftware/spine-core@4.2.110/dist/AnimationState.d.ts); [spine-runtimes 4.2 CHANGELOG](https://raw.githubusercontent.com/EsotericSoftware/spine-runtimes/4.2/CHANGELOG.md); [Spine forum: weird animation behavior](https://it.esotericsoftware.com/forum/d/26872-weird-animation-behavior)
- **Industry use:** a May 2026 article says Motion Twin's Windblown (Dead Cells successor, isometric) uses Spine for rigging and 2D skeletal animation. The article looks possibly machine-generated, so treat it as low confidence. — [Foro3D: Windblown technical evolution](https://foro3d.com/en/2026/mayo/windblown-la-evolucion-tecnica-del-motor-de-dead-cells-al-caos-isometr.html)

### Inferences
- The current prototype (cut-out rig plus drawn key poses) maps almost one-to-one onto Spine:
  - painted pieces become attachments;
  - drawn key poses become attachment swaps or skins;
  - deformations become meshes.
  - Spine is the lowest-friction way to move from a hand-written canvas runtime to production.
- **8 directions in Spine:** this usually means separate skeletons or animation sets per facing (often 5 drawn plus 3 mirrored). That multiplies animation authoring work, but texture memory stays small because the parts are shared.
- **Mobile browsers:** keep weighted-mesh vertex counts and clipping attachments low (both are CPU-heavy). Batch the character into one atlas page so it costs about one draw call.
- **Licence:** budget one Spine licence per animator/developer who integrates runtimes.

### Gaps
- No independent benchmark found comparing spine-pixi-v8, spine-webgl and spine-phaser-v4 on mobile Safari or Chrome. A team would need to profile its own skeleton.
- Current Spine prices (Essential/Professional/Enterprise) and the official runtime matrix were not fetched (esotericsoftware.com unreachable).
- Official Unity runtime (spine-unity) details for Unity 6 were not verified in this session.

## 2. Pre-rendered sprite approach: atlas sizes, texture memory, compression, normal maps

### Takeaway
Pre-rendered sprites (render 3D or a 2D rig to frames, pack into atlases) give the "Hades / Dead Cells look" and the cheapest runtime. Memory is the real cost: 8 directions × many attacks × high frame counts quickly reaches hundreds of MB uncompressed. Safe atlas page size on the web is 4096 (WebGL 1 near-universal; 8192 on about 78% of Android WebGL 2 and most iOS). To fit mobile budgets you need GPU-compressed textures (KTX2/Basis: ETC1S or UASTC), directional mirroring, and per-animation atlas streaming.

### Cited Findings
- **Hades:** characters are 3D models rendered out to 2D sprites. A Supergiant developer said the team generates "thousands upon thousands of frames of rendered animation from many different angles"; environments are mostly hand-painted 2D. — [Steam discussion (Supergiant dev post)](https://steamcommunity.com/app/1145360/discussions/0/1738883810796606862); [r/gamedev Hades effects breakdown](https://redlib.hbubli.cc/r/gamedev/comments/j7ve56/breakdown_of_the_effects_in_hades/g8eh0s3/?context=3)
- **Supergiant engine:**
  - Proprietary C/C++. A job posting covers maintaining a "proprietary cross-platform rendering pipeline, 3D and 2D animation systems, and 2D VFX system".
  - The Forge (ConfettiFX) lists Supergiant/Hades among its users. Exactly how Hades II uses The Forge is only secondarily sourced.
  - A claim that the engine is "built on MonoGame/XNA" is an unverified Reddit comment.
  - — [Supergiant blog/jobs](https://www.supergiantgames.com/blog/2); [The Forge GitHub](https://github.com/ConfettiFX/The-Forge)
- **Dead Cells:**
  - Motion Twin renders 3D models of the hero and monsters (animated in 3ds Max) to 2D sprites with a small homebrew tool.
  - Frames are produced as pixel art with normal maps, which allows dynamic lighting.
  - Animations are keyframed like 2D animation, with in-betweens added afterwards.
  - — [80.lv interview with Dead Cells devs](https://80.lv/articles/interview-with-the-developers-of-dead-cells); [80.lv Dead Cells character art pipeline](https://80.lv/articles/case-study-dead-cells-character-art-pipeline/?amp=1); [Game Developer / Gama archive deep dive (Thomas Vasseur, 2018)](https://www.jikguard.com/news/art-design-deep-dive-using-a-3d-pipeline-for-2d-animation-in-dead-cells); [Habr (secondary)](https://habr.com/post/416589)
  - These details date from 2018. The full Gamasutra article could not be fetched.
- **Normal-mapped sprites:** fan and indie recreations of the Dead Cells pipeline turn simple 3D models into pixel-art frames with normal maps for lit sprites. — [Devpost: The Dead Cells animation pipeline](https://devpost.com/software/the-dead-cells-animation-pipeline); [Blender Artists: pixel art game with Blender and Unity](https://blenderartists.org/t/so-i-did-a-pixel-art-game-with-blender-and-unity/1169165)
- **Maximum texture size (Web3DSurvey):**
  - WebGL 1 overall: 4096 ≈ 99.96%, 8192 ≈ 87.6%.
  - Android WebGL 1: 8192 ≈ 4.6% only.
  - iOS WebGL 1: 8192 ≈ 99%.
  - Android WebGL 2: ≥8192 ≈ 78%.
  - — [Web3DSurvey WebGL1 MAX_TEXTURE_SIZE](https://web3dsurvey.com/webgl/parameters/MAX_TEXTURE_SIZE); [preview mirror](https://preview.web3dsurvey.com/webgl/parameters/MAX_TEXTURE_SIZE); [Web3DSurvey WebGL2 MAX_TEXTURE_SIZE](https://web3dsurvey.com/webgl2/parameters/MAX_TEXTURE_SIZE)
  - MDN says effectively all systems support at least 4096. — [MDN WebGL best practices](https://developer.mozilla.org/docs/Web/API/WebGL_API/WebGL_best_practices)
  - The Android WebGL 1 and WebGL 2 figures conflict because the populations differ; treat 4096 as the safe page size.
- **Defold community:** 4096² support varies between devices. — [Defold forum: supporting 4096 textures](https://forum.defold.com/t/supporting-4096x4096-textures-on-different-devices/11683)
- **KTX2 / Basis Universal:**
  - PNG, JPEG and WebP are fully decompressed in GPU memory; KTX2/Basis "stays compressed on the GPU", giving faster upload and less GPU memory. — [Khronos KTX Artist Guide](https://github.com/KhronosGroup/3D-Formats-Guidelines/blob/main/KTXArtistGuide.md)
  - ETC1S is about 0.3–3 bpp (low to medium quality). UASTC is about 8 bpp, higher quality, and suits normal maps. — [Basis Universal README](https://skia.googlesource.com/external/github.com/BinomialLLC/basis_universal/+show/HEAD/README.md); [Khronos KTX2 press release](https://www.khronos.org/news/press/khronos-ktx-2-0-textures-enable-compact-visually-rich-gltf-3d-assets)
  - UASTC files with Zstandard can be 1–2× larger on disk than JPEG or ETC1S, but the GPU memory saving remains (about 4× smaller than RGBA). — [Khronos KTX Artist Guide](https://github.com/KhronosGroup/3D-Formats-Guidelines/blob/main/KTXArtistGuide.md)
  - The transcoder picks the native GPU format (ASTC, ETC2, BC7, etc.) at runtime per device. — [Vulkan sample: Basis Universal](https://docs.vulkan.org/samples/latest/samples/performance/texture_compression_basisu/README.html)
  - Basis Universal v2.x is current (Debian ships 2.0.2). — [Debian basis-universal 2.0.2 README](https://sources.debian.org/src/basis-universal/2.0.2-3/README.md)
- **Unreal Amid Evil:** an example of a 3D-to-2D sprite rendering workflow ("crafting 3D weapons into 2D sprites"), from 2019. — [Unreal Engine tech blog](https://www.unrealengine.com/tech-blog/amid-evil-crafting-3d-weapons-into-2d-sprites?lang=fr)

### Inferences
- **Memory per page:** a 4096×4096 RGBA8 page is 4096·4096·4 B = 64 MiB uncompressed (about 85 MiB with mipmaps, though 2D sprites usually skip mipmaps).
  - With ASTC 4×4 or BC7 (8 bpp) it is about 16 MiB.
  - With ETC1S transcoded to ETC1/ETC2 RGB (4 bpp) it is about 8 MiB, but alpha needs care.
  - A normal map doubles each figure.
- **Budget example:** 256×256 cells; 8 directions × 25 animations × 16 frames = 3,200 frames.
  - Uncompressed: 3,200 × 256 KiB ≈ 800 MiB.
  - Mirroring left/right (5 unique directions) cuts it to 2,000 frames ≈ 500 MiB.
  - Tight packing (TexturePacker-style trimming, often 40–60% empty space removed) gives about 200–300 MiB RGBA, or about 50–75 MiB with 8-bpp compression.
  - One 4096 page holds 256 cells of 256².
  - Hence per-animation pages loaded on demand (locomotion always resident, attacks streamed per weapon or moveset) are needed for mobile browsers, where tabs are often killed at a few hundred MB.
- **Large silhouette:** a winged knight with a greatsword has a big silhouette (wings and sword sweeps). Bounding-box cells are much larger than the body, so trim per frame plus pivot offsets (TexturePacker "trim" and "polygon" modes) matter more than for compact characters.
- **"Smooth" frame rates:** full-motion "smooth" at 24–30 fps needs about 2× the frame count of typical 12 fps pixel art. Memory scales linearly with that.
- **Dynamic lighting:** pre-rendering from 3D gives normal maps for free (render a normal pass). Hand-painted sheets need painted or generated normals (Laigter/SpriteIlluminator-type tools), which is less consistent.
- **Hybrid:** pre-render only effects-heavy attack smears or VFX, and keep the body skeletal.

### Gaps
- No primary Supergiant or Motion Twin numbers on atlas sizes or texture memory were found.
- TexturePacker official docs (trim, polygon packing, KTX2 export) were not fetched.
- Mobile-browser tab memory limits (iOS Safari about 1–1.5 GB per tab, per community reports) are unverified.

## 3. Real-time 3D toon/painterly (browser and engines)

### Takeaway
3D skinned characters (glTF) with a toon shader give 8 directions for free, true blending, IK and cancels, at the cost of a 3D modelling and rigging pipeline. In three.js the standard pieces are MeshToonMaterial with a gradientMap, OutlineEffect (inverted hull) or post-process outline passes, and AnimationMixer. Unity has the official Unity Toon Shader (URP/HDRP) and community lilToon. Skinned-mesh outlines in browser post-processing have known quirks.

### Cited Findings
- **three.js outlines:**
  - three.js provides `OutlineEffect`, an inverted-hull style addon that must be imported explicitly. — [three.js OutlineEffect docs](https://threejs.org/docs/pages/OutlineEffect.html)
  - It also provides the selection-highlight post-process `OutlinePass`. — [OutlinePass docs](https://threejs.org/docs/pages/OutlinePass.html)
  - For WebGPU/TSL it adds `ToonOutlinePassNode`, which outlines only objects with MeshToonMaterial / MeshToonNodeMaterial. — [ToonOutlinePassNode docs](https://threejs.org/docs/pages/ToonOutlinePassNode.html)
- **Skinned meshes and outline passes:** for OutlinePass the skinning flag must be set on the depth and mask materials. Older OutlinePass (~r121) was missing it, and skinned-mesh outline support was a known issue in pmndrs/postprocessing. This is older information (2020–2023). — [Stack Overflow mirror: outline on animated skinned mesh](https://kiwix.lema.org/stackoverflow.com_en_all_2023-11/questions/59786826/best-method-to-get-outline-effect-with-animated-skinned-mesh); [pmndrs OutlineEffect SkinnedMesh issue](https://lightrun.com/answers/pmndrs-postprocessing-outlineeffect-support-for-skinnedmesh); [three.js forum: OutlinePass for animated character](https://discourse.threejs.org/t/outlinepass-for-animated-character/10119/3)
- **Community recommendation:** OutlineEffect plus MeshToonMaterial is the practical cartoon look for skinned characters. — [three.js forum: smooth cartoon style with outlines](https://discourse.threejs.org/t/how-to-create-this-smooth-cartoon-style-with-outlines-in-three-js/60862)
- **Post-process outlines (depth/normal-based):** there is a tutorial for full post-process outlines. — [three.js forum tutorial](https://discourse.threejs.org/t/how-to-render-full-outlines-as-a-post-process-tutorial/22674)
- **Babylon.js:** outline problems are discussed on its forum. — [Babylon forum: a great outline thread](https://forum.babylonjs.com/t/a-great-outline-thread-problem/58082?page=2)
- **Unity Toon Shader (UTS):**
  - Official package `com.unity.toonshader`.
  - 0.11.x needs Unity 2021.3.19+.
  - 0.9.x added URP Forward+ compatibility; 0.10.0-preview added URP DOTS instancing (2022.3+).
  - Docs now reach 0.13, and from Unity 6.3 UTS partly supports rendering 3D objects inside 2D URP scenes. It is still a "preview"/0.x package.
  - — [UTS System Requirements](https://docs.unity3d.com/Packages/com.unity.toonshader@0.11/manual/System-Requirements.html); [UTS what's new 0.10.x](https://docs.unity3d.com/Packages/com.unity.toonshader@0.11/manual/whats-new-0.10.x.html); [UTS 0.13 manual](https://docs.unity3d.com/Packages/com.unity.toonshader@0.13/manual/index.html)
- **lilToon:** a feature-rich toon shader aimed at VRChat avatars and 3D models; supports URP Light Layers from 1.2.4. No official mobile statement was found. — [lilToon docs](https://docsearch.algolia.com/mcp/docs/repo/lilxyzw/liltoon)
- **Mobile-targeted URP toon shaders:** these exist on the Asset Store. Some premium packs (e.g. Daniel Ilett's) say "designed for desktop… support not guaranteed for mobile". — [Asset Store: URP Toon Shader mobile-ready](https://assetstore.unity.com/packages/vfx/shaders/urp-toon-shader-mobile-ready-173641); [Toon Shaders Pro for URP](https://danielilett.itch.io/toon-shaders-pro-for-unity-urp)
- **Death's Door:** a stylized 3D top-down action game built in Unity. — [Wikipedia: Death's Door](https://www.wikipedia.org/wiki/Death%27s_Door_(video_game)); [Gamepressure](https://gamepressure.com/editorials/15-indie-video-games-with-best-graphics/deaths-door/z65a0)

### Inferences
- For a 45° camera, a 3D toon knight with inverted-hull outlines and a painterly ramp can approach the look of the painted sheets, but it is a different art pipeline (sculpt/model, retopo, skin, rig). That means abandoning or only reusing the current painted cut-out parts as textures.
- Inverted hull is the most mobile-friendly outline: one extra draw of the mesh with front-face culling, and no full-screen pass. Post-process outlines cost fill-rate on high-DPI phones.
- Wings and cape can use spring bones or physics. In three.js that means custom or community code (no built-in secondary motion).

### Gaps
- No 2026 mobile benchmark of three.js, Babylon.js or PlayCanvas skinned toon characters was found.
- PlayCanvas and Babylon toon/cel examples were not researched in depth.
- Godot 4 toon shading (custom shader / ShaderMaterial) and Unreal stylized rendering (Substrate/post-process toon) docs were not fetched. Godot docs were unreachable.

## 4. Engines overall for a 2.5D ARPG (licensing, web export, who uses what)

### Takeaway
- **Unity:** the Runtime Fee is cancelled. Personal is free under US$200k revenue/funding; Pro is about US$2,310/yr after a 5% rise from 12 Jan 2026. It is strongest for mobile plus web with Spine or 3D toon.
- **Godot 4:** free (MIT). Its web export is single-threaded by default and **cannot export C# projects to web**, so GDScript is needed for browser builds.
- **Unreal:** 5% royalty over US$1M lifetime gross. It is poor for browser targets.
- **PixiJS v8 / Phaser 4:** best pure-web options with official Spine runtimes.

### Cited Findings
- **Unity licensing:**
  - The Runtime Fee was cancelled; the editor terms were updated to remove its language.
  - Personal: under US$200K revenue/funds in the last 12 months. The seat limit changed from 3 to unlimited.
  - Pro: required over US$200K; from US$2,310/yr or US$210/month.
  - Unity Pro and Enterprise rose 5% starting 12 Jan 2026.
  - Enterprise: required over US$25M.
  - From Unity 6.3 LTS, Havok Physics is no longer included in Pro.
  - — [Unity: Changes to subscription plans and pricing](https://unity.com/pricing-updates); [Unity runtime-fee page](https://unity.com/runtime-fee)
- **Godot web export:**
  - "Projects written in C# using Godot 4 currently cannot be exported to the web" (4.5 docs). The docs suggest Godot 3 for C# on the web.
  - Threaded builds need cross-origin isolation (SharedArrayBuffer headers), which many portals cannot provide.
  - Since 4.3 there is a single-threaded export (now the default). It is more compatible with itch.io, Poki and CrazyGames but less performant.
  - On mobile, audio latency rises without threads.
  - — [Godot docs 4.5: Exporting for the Web](https://docs.godotengine.org/en/4.5/tutorials/export/exporting_for_web.html); [Godot progress report: web export in 4.3](https://godotengine.org/article/progress-report-web-export-in-4-3/); [Godot docs 4.7 web export](https://docs.godotengine.org/en/4.7/tutorials/export/exporting_for_web.html)
  - Older docs said Godot 4 HTML5 exports could not run on macOS/iOS because of SharedArrayBuffer/WebGL 2 bugs. The 4.3 report says single-threaded builds remove these issues, so that claim is likely outdated.
  - A 4.5 user report says a Fire Tablet browser failed with threads disabled (anecdotal). — [Godot forum](https://forum.godotengine.org/t/issues-ro-run-itch-io-godot-web-builds-on-fire-tablet-using-built-in-browser/123025)
- **Unreal licensing:**
  - Royalty is 5% on projects over US$1,000,000 gross lifetime revenue.
  - Seat subscriptions are needed for non-game/other uses, except hobbyists, indies under US$1M/yr, education and non-commercial use.
  - Royalty products do not pay seat fees.
  - — [Unreal EULA](https://www.unrealengine.com/en-US/eula/unreal); [Meta developer docs on Unreal royalty (updated Apr 2026)](https://developers.meta.com/horizon/documentation/unreal/unreal-oculus-license/)
- **Phaser 4 / PixiJS v8 with Spine:**
  - Official spine-phaser-v4 and spine-pixi-v8 exist. Phaser 4.2 integrates Spine as "first-class" with Mesh2D batching.
  - PixiJS v8 supports WebGL and WebGPU for Spine.
  - — [Phaser 4.2 news](https://phaser.io/news/2026/07/phaser-4-2-spine-renderer-mesh2d-stencil); [spine-pixi docs](https://esotericsoftware.com/spine-pixi.md)
- **Commercial references:**
  - Hades / Hades II: proprietary C++ engine with pre-rendered 3D-to-sprite characters. — [Supergiant blog/jobs](https://www.supergiantgames.com/blog/2); [Steam dev post](https://steamcommunity.com/app/1145360/discussions/0/1738883810796606862)
  - Dead Cells: in-house tech with 3D-to-2D renders. — [80.lv](https://80.lv/articles/interview-with-the-developers-of-dead-cells)
  - Windblown: Spine skeletal (low-confidence source). — [Foro3D](https://foro3d.com/en/2026/mayo/windblown-la-evolucion-tecnica-del-motor-de-dead-cells-al-caos-isometr.html)
  - Death's Door: Unity, stylized 3D. — [Wikipedia](https://www.wikipedia.org/wiki/Death%27s_Door_(video_game))

### Inferences
- **Web first, 2D skeletal:** PixiJS v8 or Phaser 4 with Spine is the shortest path from the current canvas prototype. It is the same language (JS/TS) and adds WebGL/WebGPU batching. You must build your own animation state layer, which Spine AnimationState largely covers.
- **Mobile store builds plus web:**
  - Unity (Spine or 3D toon): richest tooling (Animator, Timeline, IK, Asset Store). Unity web builds are heavier and slower to load on mobile browsers.
  - Godot 4 with GDScript and spine-godot: free and light, but web builds are single-threaded and C# is not available for web.
- **Unreal:** fits only if the target is PC/console 3D stylized. It has no first-class browser target (see Gaps).

### Gaps
- Not fetched or confirmed in this session:
  - Defold: free licence; official Spine extension.
  - Cocos Creator: free, strong web and mobile export, Spine built in.
  - Unity 6 Web/WebGPU status and Unity's mobile-browser support statement.
  - Unreal HTML5 export removal (background knowledge: dropped around UE 4.24 and moved to community).
- Background knowledge only, not verified here:
  - Children of Morta (believed custom/Unity).
  - Tunic (Unity).
  - Hollow Knight / Sea of Stars (Unity).
  - Diablo IV and Path of Exile (proprietary engines).
- A sourced list of engines per 2.5D ARPG is incomplete.

## 5. Animation systems needed for full, smooth motion

### Takeaway
A greatsword ARPG character needs:
- a state machine (locomotion / attack / hit / dodge);
- 8-direction locomotion blending (2D blend space);
- animation events or markers for hit-frame windows and cancel windows;
- crossfades between attacks;
- optionally root motion for lunges;
- IK or a two-hand grip constraint for the greatsword.

Unity (Animator + 2D Freeform Directional blend trees, root motion, Animation Events) and Godot (AnimationTree + BlendSpace2D + state machine) give this natively for 3D or engine-native 2D. Spine gives crossfade mixing, events, IK and physics constraints but no directional blend space: 8-direction for 2D means a discrete facing switch. Sprite games emulate blending with higher frame counts, short transition clips, anticipation frames and smear frames.

### Cited Findings
- **Unity 2D Freeform Directional blend tree:**
  - Should include one motion at (0,0), e.g. idle, and can hold multiple motions per direction (walk forward and run forward).
  - Simple Directional suits forward/back/left/right.
  - Positions can be computed from clips' root motion.
  - — [Unity Manual: 2D Blending](https://docs.unity3d.com/Manual/BlendTree-2DBlending.html); [Unity 6.2 ScriptReference: FreeformDirectional2D](https://docs.unity3d.com/ScriptReference/Animations.BlendTreeType.FreeformDirectional2D.html)
- **Unity root motion:** enable "Apply Root Motion" on the Animator and leave Bake Into Pose unchecked. Animation events can mark hit frames. This comes from a third-party tutorial. — [Outlook Respawn: Unity Mecanim to blend trees](https://respawn.outlookindia.com/amp/story/gaming/gaming-guides/animation-in-unity-from-mecanim-basics-to-blend-trees); [Unity Learn: Blend Trees](https://learn.unity.com/tutorial/3-4-creating-and-configuring-blend-trees)
- **Godot:**
  - AnimationTree provides BlendSpace2D, which blends between the three adjacent points through triangulation, giving 8 points around a circle for 8 directions.
  - It also provides a state machine node.
  - The blend position is typically driven from velocity.
  - — [Godot docs: Using AnimationTree](https://docs.godotengine.org/en/stable/tutorials/animation/animation_tree.html); [Godot BlendSpace2D class](https://docs.godotengine.org/ko/stable/classes/class_animationnodeblendspace2d.html); [Godot forum: 8 directions 2D](https://forum.godotengine.org/t/how-to-best-do-movement-in-8-directions-in-2d/55205); [Godot article: new AnimationTree state machine](https://godotengine.org/article/godot-gets-new-animation-tree-state-machine)
  - The root motion docs found were for 3.2 (`get_root_motion_transform`), so the Godot 4 API needs checking. — [Godot 3.2 AnimationTree docs](https://docs.godotengine.org/en/3.2/tutorials/animation/animation_tree.html)
- **Spine AnimationState:**
  - Tracks, mix durations (crossfade), mixing to an empty animation to fade out layers, and events.
  - Event firing depends on mix thresholds.
  - Physics constraints arrived in 4.2; IK constraints exist, with a reported mix-timing quirk.
  - — [spine-core AnimationState.d.ts](https://cdn.jsdelivr.net/npm/@esotericsoftware/spine-core@4.2.110/dist/AnimationState.d.ts); [Spine 4.2 physics](https://us.esotericsoftware.com/blog/Spine-4.2-The-physics-revolution); [Spine forum IK mix issue](https://it.esotericsoftware.com/forum/d/26872-weird-animation-behavior)
- **Dead Cells:** keyframed poses, then in-betweens, rendered from 3D. — [Habr](https://habr.com/post/416589); [80.lv](https://80.lv/articles/interview-with-the-developers-of-dead-cells)

### Inferences
- **Recommended layering for the knight:**
  - Base track: locomotion (8-dir, facing quantized to 8 for sprites/Spine or continuous for 3D).
  - Upper or override track: attacks with events `hit_start`, `hit_end`, `cancel_open` and `vfx_smear`.
  - Additive track: breathing and wing flutter, or Spine physics for wings.
  - IK constraint: off hand to greatsword grip, so the sword can be re-timed without hand drift.
- **Cancelling:** implement it in game code. Gameplay checks the "cancel window" events, then calls a crossfade (Spine `setAnimation` with a short mix, Unity `CrossFade`, Godot `travel`).
- **Root motion for lunges:** extract the per-frame root displacement curve from the animation, or encode it as data or events, so hitboxes and collisions stay authoritative. This is simpler than full root motion in web runtimes.
- **Pre-rendered sprites:** there is no runtime blending, so smoothness comes from:
  - higher fps (24–30);
  - dedicated transition clips (run→stop, attack recovery→idle);
  - smear frames;
  - hit-stop (freezing 2–6 frames on impact);
  - interpolating position and VFX, not pixels.
  - Frame interpolation between pre-rendered frames is not practical at runtime.

### Gaps
- No primary GDC talk on Hades or Dead Cells animation cancelling or hit-frame tech was retrieved.
- Godot 4 root motion API and Unity Animation Events manual pages were not fetched directly.
- No source found on combining Spine with Unity Mecanim or Godot AnimationTree blend spaces.

## 6. Recommendation criteria (platform, team size, art pipeline fit)

### Takeaway
The deciding factor is the art pipeline:
- **Painted cut-out plus key poses (the current prototype):** Spine plus a web renderer (PixiJS v8 / Phaser 4), or Spine plus Unity/Godot if native mobile matters.
- **"Hades-like" pre-rendered look:** a 3D pipeline rendered to sprites, with heavy texture budgeting (KTX2, streaming).
- **3D toon in real time:** 8 directions and blending for free, but needs 3D artists and Unity/Godot, or three.js on the web.

### Cited Findings
- **Licensing cost floor:**
  - Godot: free.
  - Unity Personal: free under US$200k. — [Unity pricing updates](https://unity.com/pricing-updates)
  - Unreal: 5% over US$1M. — [Unreal EULA](https://www.unrealengine.com/en-US/eula/unreal)
  - Spine: an Editor licence per integrating user, Essential below US$500k. — [Spine LICENSE](https://raw.githubusercontent.com/EsotericSoftware/spine-runtimes/4.2/LICENSE); [Spine forum](https://ru.esotericsoftware.com/forum/d/24018-runtime-license-question)
- **Web constraints:**
  - Safe atlas page size is 4096. — [Web3DSurvey](https://web3dsurvey.com/webgl/parameters/MAX_TEXTURE_SIZE)
  - Godot web cannot use C# and is single-threaded by default. — [Godot 4.5 web export docs](https://docs.godotengine.org/en/4.5/tutorials/export/exporting_for_web.html)
  - spine-pixi mesh cost scales with vertex count. — [spine-runtimes #2508](https://www.github.com/EsotericSoftware/spine-runtimes/issues/2508)

### Inferences
- **Small team (1–3), web-first, painterly 2D:**
  - Spine Essential plus PixiJS v8 (or Phaser 4.2) with TypeScript.
  - Port the existing rig into Spine.
  - Wings get physics constraints; the sword grip gets IK.
  - Hit frames become Spine events.
  - Use 5 authored directions plus mirroring.
  - Ship atlases as KTX2/Basis with a PNG/WebP fallback.
- **Small team, mobile store plus web:**
  - Godot 4 (GDScript) with spine-godot, or Unity 6 with spine-unity.
  - Choose Unity if you need Asset Store tools or 3D toon later.
  - Choose Godot for zero licence cost (Spine licence still needed).
- **Larger team with 3D artists, Hades-like fidelity:**
  - Either use 3D toon in real time in Unity URP (UTS) or Godot, or pre-render 3D to sprites with normal maps (the Dead Cells/Hades approach).
  - Pre-rendering needs a texture-streaming plan and is least suitable for mobile web.
- **Avoid for browser targets:** Unreal. Also avoid Godot plus C# if the web is a must.

### Gaps
- No head-to-head cost or time comparison of these pipelines for a single character was found.
- Team-size guidance is synthesis, not sourced.
