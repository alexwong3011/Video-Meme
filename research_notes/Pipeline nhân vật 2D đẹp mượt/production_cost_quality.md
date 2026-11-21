# Production economics and quality standards for ARPG hero character animation (top-down / 45° hero: armoured winged knight with greatsword, 8 directions)

> Method note: in this session WebFetch could not reach gamedeveloper.com, juegostudio.com, slynyrd.com, or other hosts (DNS blocked by the session network policy). All findings below come from search-result snippets and summaries returned by WebSearch, not from full-page reads. Exact wording and numbers should be spot-checked against the original pages before they are quoted as fact. Where a figure comes from a forum, a user post, or a vendor marketing page, it is flagged.

---

## 1. Typical animation set and frame counts for an ARPG playable character (with game examples)

### Takeaway
No source in this pass gave a complete, official per-game animation list for a top-down ARPG hero. The hard numbers available are totals: Cuphead's ~1,200 frames per playable character, Hades shipping "thousands upon thousands" of pre-rendered frames from many angles (a user-reported 104-frame bow attack × 32 angles = 3,328 frames), and Cuphead animating at 24 fps "on ones" over a 60 fps game. Multiplying by direction count is the dominant cost driver: 8 directions multiply every hand-drawn frame by 8, or by 5 if left/right mirroring is used.

### Cited Findings
- **Hades (2020), pre-rendered 3D to sprites:** a Supergiant developer reply on Steam says "During development, we 3D render and animate many of our characters, such as the player character Zagreus. We then generate thousands upon thousands of frames of rendered animation from many different angles", and that the game does not use real-time 3D rendering — [Steam discussion, Hades](https://steamcommunity.com/app/1145360/discussions/0/1738883810796606862)
- **Hades, per-animation scale (UNVERIFIED, player post):** a Steam user states that Zagreus's bow attack is "a 104-frame animation rendered at 32 angles", i.e. 3,328 frames for one attack. Another user recalled about 9k total frames for Zagreus, from memory only — [Steam discussion, Hades](https://steamcommunity.com/app/1145360/discussions/0/3071992488484250867/); see also [Steam discussion](https://steamcommunity.com/app/1145360/discussions/0/1864993755183591660)
- **Hades, why costumes were not offered:** players relay a developer explanation that every animation frame is a 2D sprite, so a costume change would mean re-rendering all of those sprites — [GameFAQs thread](https://gamefaqs.gamespot.com/boards/298295-hades/79011162)
- **Hades, total frame volume:** art director Jen Zee reportedly cited 942,489 character and enemy animation frames shipped, and animator Thinh used mocap as the basis for a large part of the animation. This came from a search summary of the MCV/Develop "Behind the art of Hades" piece. A second search could not confirm the exact figure, so verify before quoting — [MCV/Develop](https://mcvuk.com/business-news/behind-the-art-of-hades-we-value-artistic-integrity-and-excellence-in-artistic-craft-at-supergiant-however-were-first-and-foremost-a-game-design-lead-team/)
- **Hades, 3D model pipeline:** Supergiant 3D artist Paige Carter models characters (e.g. Nyx) from Jen Zee's concept art. Proportions shift slightly (heads larger, characters a bit shorter) because of the orthographic camera, and the rig is built with mGear — [Game Developer](https://gamedeveloper.com/art/learn-how-supergiant-brought-i-hades-i-hand-painted-characters-to-life); [DTF (RU)](https://dtf.ru/id64954/238431-sozdanie-materi-nochi-process-modelirovaniya-nikty-iz-hades)
- **Hades II, switch to real-time 3D:** the Hades II Steam page advertises "even smoother real-time 3D characters" — [Steam store, Hades II](https://store.steampowered.com/app/1145350/Hades_II/). A reviewer infers the switch was made so characters look smooth at higher frame rates. That is the reviewer's reading, not a studio statement — [GamingTrend review](https://gamingtrend.com/reviews/hades-2-review/)
- **Cuphead, frame rate:** animation runs at 24 fps while gameplay runs at 60 fps. Maja Moldenhauer said it was animated "on the ones" (a unique drawing every frame) — [Game Developer](https://gamedeveloper.com/art/animating-i-cuphead-i-the-verve-of-the-1930s-with-the-tech-of-now); [Windows Central](https://www.windowscentral.com/check-out-how-cuphead-team-makes-its-cool-looking-2d-animations)
- **Cuphead, frames per character:** boss characters run about 800–1,400 frames depending on stage complexity, and Cuphead and Mugman about 1,200 frames each. The original 2015 estimate was about 15,000 frames total — [Intel Gaming Access](https://game.info.intel.com/gaming-access/you-wont-believe-how-many-hand-drawn-frames-of-animation-went-into-cuphead)
- **Cuphead, total frames (sources conflict):** about 45,000 ([Guinness World Records](https://www.guinnessworldrecords.de/world-records/508061-most-hand-drawn-frames-of-animation-in-a-videogame)); 50,000 ([Unity case study](https://unity.com/madewith/cuphead)); "north of 60,000" ([Game Developer](https://gamedeveloper.com/design/the-unique-development-constraints-of-i-cuphead-i-s-painstakingly-hand-drawn-art)); some outlets claim more than 120,000. Guinness is the most authoritative of these.
- **Children of Morta (Dead Mage):** the developers say adding characters is hard because "you have to animate all directions" and a lot of frames are needed — [Game Developer](https://gamedeveloper.com/design/making-family-matter-in-i-children-of-morta-i-). Process: key frames are drawn in animation software, anatomy is corrected against a reference frame to keep proportions, then in-betweens are added according to the smoothness wanted. Each character's unique combat abilities needed many sprites — [TechRaptor](https://techraptor.net/content/how-dead-mage-created-the-art-for-children-of-morta). No per-character frame count was found.
- **Indie 8-direction example (not a commercial ARPG):** the devlog for "raid30" describes characters with 18 frames of animation across 8 directions, which is 144 frames per weapon type. Even with custom tooling and a simple style, "all of these sprites still took a very long time" — [itch.io devlog, raid30](https://dralketh.itch.io/raid30/devlog/404181/easily-creating-lots-of-character-animations)
- **Death's Door (real-time 3D, toon shader):** most of the crow's animations are functional or combat-based, apart from the idle and some cutscene expressions. Reviewers single out the walk and roll animations — [Byteside](https://byteside.com/2021/08/deaths-door-developer-acid-nerve-on-how-it-made-its-sword-wielding-crow-game)
- **Hyper Light Drifter:** the team said it "could push the amount of enemies and frames of animation as much as we pleased". No numbers were given — [Game Developer, Road to the IGF](https://gamedeveloper.com/design/road-to-the-igf-heart-machine-s-i-hyper-light-drifter-i-)
- **Top-down pixel character animation guide:** Raymond Schlitter (SLYNYRD) Pixelblog 55, "Top Down Character Animation" (March 2025), is the main practitioner reference on frame counts and directions for top-down sprites. Its content could not be fetched this session — [SLYNYRD Pixelblog 55](https://www.slynyrd.com/blog/2025/3/24/pixelblog-55-top-down-character-animation)

### Inferences
- **Proposed minimum animation list for the winged greatsword knight.** This is a synthesis from genre convention, not taken from one source. Frame counts assume 12 fps drawn animation, or "on twos" at 24 fps:
  - Idle (loop) 6–8 frames
  - Walk or run (loop) 8 frames, possibly with a run-start/stop or skid of 3–4 frames
  - Dash/dodge (roll, or wing-dash for a winged knight) 6–8 frames
  - Light attack combo, 3 hits at 6–10 frames each (anticipation 2–3, strike/smear 1–2, follow-through/recovery 3–4)
  - Heavy/charged attack: charge loop 4 frames plus release 10–14 frames
  - 2–4 skills at 10–20 frames each
  - Hit reaction (flinch) 3–4 frames
  - Knockback/stagger 6 frames
  - Death 10–16 frames
  - Spawn/respawn 10–16 frames
  - Optional: interact, emote/victory, wings-idle overlay
  - Total: roughly 14–18 actions and 120–200 unique frames per direction.
- **Direction count multiplies cost.** At 8 directions, mirror left/right so 5 are unique (N, NE, E, SE, S). That gives about 600–1,000 unique frames per hero for hand-drawn work. Without mirroring (asymmetric greatsword or shield), the figure is 960–1,600.
- **Hades sits at the opposite extreme.** With 3D pre-rendering, frame count is nearly free (104 frames × 32 angles), so the constraint becomes texture memory, not labour.
- **For 2D pre-rendered or hand-drawn output, the greatsword's handedness is a key decision.** Mirroring flips the sword to the other hand. Hades and Diablo-era games commonly accepted this for some directions, and this is worth checking against the reference games.

### Gaps
- No primary-source per-action frame counts were found for Hades, Diablo, Children of Morta, Hyper Light Drifter, Tunic, Moonlighter, Eastward, or Vampire Survivors-likes. The Eastward ([Game Developer](https://www.gamedeveloper.com/art/eastward-s-creators-share-insights-on-making-pixel-art-adventures)) and Moonlighter ([80.lv](https://80.lv/articles/moonlighter-building-pixel-art-preparing-for-switch/)) interviews exist but could not be read in full.
- No source confirmed Hyper Light Drifter's direction count or frames per animation.
- No data was found on Diablo (I/II pre-rendered 8/16 directions, or Diablo IV real-time) animation counts.

---

## 2. Labour estimates and outsourcing prices (2024–2026)

### Takeaway
Outsourcing prices span two orders of magnitude. Low-end Fiverr Spine sellers charge $10–20 per animation. Vendor studio guides quote $150–500 for a simple rigged cycle and $500–1,500 for a complex combat animation, and $5–25 per frame for frame-by-frame work. A rigged PC/console-quality 3D character costs $4,000–12,000, and a 3D rig alone $500–3,000+. Regional hourly rates run $12–40/h for Vietnam and $20–60/h for most Chinese studios, rising to $100+/h at the top end. For in-house 3D keyframe work, a polished combat clip takes 1–3 animator-days, and typical throughput is 5–10 seconds of animation per day. Nearly all of these figures come from vendors with an interest in the numbers, so treat them as ranges, not quotes.

### Cited Findings
**2D rigged/Spine and frame-by-frame (per-animation and per-frame)**
- Juego Studio's 2026 pricing guide: simple rigged idle or walk cycle $150–500 per animation; complex combat or spell rigged animation $500–1,500 per animation — [Juego Studio (2026)](https://www.juegostudio.com/blog/2d-animation-budget-for-video-games)
- RocketBrush gives the same $500–1,500 range for complex rigged combat animation, and quotes its own rate at $35–39/h — [RocketBrush, 2D animation cost](https://rocketbrush.com/blog/how-much-does-2d-animation-cost-a-solid-guide-for-game-developers); [RocketBrush, game art outsourcing prices 2025](https://rocketbrush.com/blog/game-art-outsourcing-prices-complete-pricing-breakdown)
- Twine (freelancer marketplace): basic idle/walk $25–100 per animation; complex animations $100–500+; frame-by-frame typically $5–25 per frame. Hourly: junior $25–50, mid-level $50–100, senior $100–200+ — [Twine](https://www.twine.net/blog/cost-of-2d-game-animation-and-how-to-budget-smartly)
- Game-Ace: complete character animation set in Spine from €3,500. Dedicated animator per month: mid-level from €2,800, senior Spine specialist €4,000–5,500 — [Game-Ace, hire 2D animators](https://game-ace.com/hire-2d-animators/)
- Low end on Fiverr: one Spine seller charges $10 per simple animation (idle/attack), $15 per walk/run cycle, $20 per cycle for 4+ legs, and $10 extra for Spine rigging — [Fiverr seller listing](https://www.fiverr.com/hossenshovon1/do-2d-character-rig-and-animation-in-unity). Other Spine package listings show $800–1,000 (6 weeks) and $1,500–2,000 (8 days), scope unclear — [Fiverr Spine listing](https://www.fiverr.com/gomettaart/animate-your-2d-game-characters-in-spine-2d)
- Informal quote on the Esoteric (Spine) forum: rig plus all animations for one character at ₹25,000 (about US$300) from an Indian freelancer. This is a single data point — [Esoteric Software forum](https://esotericsoftware.com/forum/d/23220-looking-for-spine-animators)
- Upwork Spine sellers mostly quote case by case. Price is driven by whether the artwork is layered for rigging and by character complexity — [Upwork Spine rig service](https://www.upwork.com/services/product/video-audio-a-game-ready-spine-2d-rig-with-smooth-character-animations-2096884678878542260)

**3D (model, rig, animation)**
- Vendor guide figures: 3D character/prop rig $500–2,000 for basic/mid-poly and $3,000+ for high-poly; rigged PC/console-quality 3D character $4,000–12,000; rigged mobile character $1,500–4,000; 3D rigged animation clip $400–1,500 — from search summaries of [Pixune](https://pixune.com/blog/game-art-outsourcing-price/), [RocketBrush](https://rocketbrush.com/blog/game-art-outsourcing-prices-complete-pricing-breakdown) and [Whimsy Games](https://whimsygames.co/blog/the-complete-guide-to-game-art-outsourcing-costs-timelines-and-how-to-choose-a-studio/). The summary did not specify which vendor gave which figure.
- MoCap Online per-clip comparison (vendor): custom mocap $200–800 per clip; hand-keyed $150–500 per clip; pre-made mocap packs $2–10 per clip. A 2-day mocap session yields 50–80 game-ready clips for $15,000–40,000 all-in, with 6–14 weeks from booking to game-ready — [MoCap Online, production timeline](https://mocaponline.com/blogs/mocap-news/game-animation-production-timeline)
- MoCap Online: a polished 3-second locomotion cycle takes 1–3 days, and a single high-quality keyframe clip (combat attack, cinematic walk) takes a professional animator 1–3 days — [MoCap Online](https://mocaponline.com/blogs/mocap-news/motion-capture-vs-keyframe-animation)
- Animator Island: "normal" game animation throughput is 5–10 seconds per day (25–50 s per week), dropping to 2–4 s/day under some conditions and rising to 10–20 s/day in crunch — [Animator Island](https://www.animatorisland.com/how-fast-should-you-animate/)

**Regional hourly rates (Asia)**
- Vietnam: $15–35/h per one source; another gives $20–40/h for top-tier Vietnamese/Philippine studios and $12–25/h for mid-tier; a market report cites $18–35/h for a Vietnam or Ukraine 3D modelling pipeline — [GameDevOutsourcing rates benchmark (2026)](https://www.gamedevoutsourcing.com/game-development-outsourcing-rates); [Game Art Services, Eastern Europe vs Southeast Asia](https://gameartservices.com/blog/eastern-europe-vs-southeast-asia-game-art-outsourcing); [Best countries 2026](https://www.gamedevoutsourcing.com/blog/best-countries-game-development-outsourcing)
- China: $20–60/h per one source; another gives mid-range 3D art at about $50–100/h, with senior AAA talent at $100–200/h. These conflict — [GameDevOutsourcing China (2026)](https://www.gamedevoutsourcing.com/outsourcing/china)

**Hand-drawn time per sprite (anecdotal)**
- Pixel art forum anecdotes: sprite sheets take "several hours" each depending on animation count; about 6–8 h for a base character plus one alternate set with a few animations (not timed); "most of a week" for a full near-identical sheet by a professional — [Pixel Joint forum](https://pixeljoint.com/Forum/forum_posts.asp?TID=16438); [OpenGameArt LPC thread](https://lpc.opengameart.org/node/17135)

### Inferences
Rough hero cost model. These are derived calculations, not sourced figures.
- **(1) Hand-drawn frame-by-frame, 8 directions mirrored to 5 unique:**
  - ~600–1,000 unique frames at $5–25 per frame gives about $3,000–25,000 for the animation alone. Cleanup, colour and VFX layers are extra.
  - At a mid-range 0.5–1.5 h per mid-res frame, that is about 300–1,500 artist-hours.
  - This is the most expensive option, and every design change means a redraw. Dead Cells adopted 3D for exactly this reason (section 5).
- **(2) Spine/skeletal 2D:**
  - Cost is roughly one rig plus about 15 animations. At studio rates that is about $150–1,500 per animation, or about $3,500+ per character set (the Game-Ace floor).
  - For 8 directions, Spine needs separate art and rigs per direction, typically 3–5 unique views. That multiplies the rig cost and part of the animation cost by 3–5.
  - Skeletal 2D is weakest for 8-direction top-down views. It is strongest for side-view or 2–4 directions.
- **(3) 3D pre-rendered to sprites (Dead Cells, Hades 1):**
  - Model plus texture plus rig at about $4,000–12,000 (PC quality), plus about 15–20 clips at $400–1,500 each, gives about $10,000–40,000 outsourced.
  - Directions are nearly free (render 8, 16 or 32 angles), and changes need only a re-render.
  - Hidden costs: the render/pixelisation tool, cleanup (Dead Cells could not fully fix pixel flicker), and sprite-sheet memory.
- **(4) Real-time 3D with toon/painterly shading (Death's Door, Hades II):**
  - Same asset cost as (3), minus sprite memory, plus a shader/technical-art cost.
  - Gains: animation blending, root motion, variable frame rate, and costume swaps.
  - Hades II's move to real-time 3D suggests that at high frame rates the pre-render approach stopped scaling.
- **In-house throughput:** at 1–3 days per polished combat clip, a hero set of 15–20 clips is roughly 4–10 animator-weeks in 3D, independent of direction count.

### Gaps
- No credible, dated 2024–2026 rate card from a named Vietnamese or Chinese studio gave per-animation or per-character prices. Only regional hourly bands were found.
- No ArtStation or Polycount thread with professional per-animation rates was retrieved.
- No measured hours-per-animation-per-direction benchmark for frame-by-frame vs Spine vs 3D was found. The comparisons above are calculations.

---

## 3. Team roles and what a 1–3 person indie team can realistically do

### Takeaway
Successful small ARPG teams concentrate animation in one person: Dead Cells had one artist modelling and animating in 3ds Max, and on Death's Door one co-founder animated everything in Blender. They outsource concept, UI and 3D asset creation. The full AAA role list (concept, modeller, texture, rigger, animator, technical artist, VFX) collapses to 1–2 generalists plus contractors.

### Cited Findings
- **Dead Cells:** Thomas Vasseur was the only artist for the first year. Models and animation were done in 3ds Max "by one person" and rendered to 2D sprites with an in-house tool — [Game Developer (Vasseur, Jan 2018)](https://www.gamedeveloper.com/production/art-design-deep-dive-using-a-3d-pipeline-for-2d-animation-in-i-dead-cells-i-); [80.lv interview](https://80.lv/articles/interview-with-the-developers-of-dead-cells)
- **Death's Door:** "a very small team of just two core developers". The credits list 8 people. Mark Foster and David Fenn covered design, programming, animation, level design, writing, music and sound. Concept art, UI art and 3D asset creation were outsourced. Foster animated in Blender with little prior 3D experience — [Unity blog](https://blog.unity.com/games/crafting-intricate-environments-deaths-door); [Byteside](https://byteside.com/2021/08/deaths-door-developer-acid-nerve-on-how-it-made-its-sword-wielding-crow-game); [NME](https://www.nme.com/features/gaming-features/acid-nerve-developers-david-fenn-and-mark-foster-on-making-deaths-door-3203321)
- **Death's Door, the switch to 3D:** moving from pixel art (Titan Souls) to 3D was "quite a challenge because our workflow and team size needed to change" — [Press Start](https://press-start.com.au/features/2021/03/27/we-spoke-to-the-team-at-acid-nerve-about-the-stylish-looking-deaths-door/)
- **Hyper Light Drifter:** Alx Preston was Lead Designer, Animator and Secondary Programmer, as well as Art Lead and Team Lead — [GamingBolt](https://gamingbolt.com/hyper-light-drifter-interview-everything-you-need-to-know-about-heart-machines-2d-action-rpg); [MobyGames credits](https://www.mobygames.com/game/81597/hyper-light-drifter-collectors-edition/credits/)
- **Hades (larger studio, about 20 people):** the roles were split. Art director Jen Zee did concept; Paige Carter did 3D modelling and rigging (mGear); animators used mocap as a base — [Game Developer](https://gamedeveloper.com/art/learn-how-supergiant-brought-i-hades-i-hand-painted-characters-to-life); [MCV/Develop](https://mcvuk.com/business-news/behind-the-art-of-hades-we-value-artistic-integrity-and-excellence-in-artistic-craft-at-supergiant-however-were-first-and-foremost-a-game-design-lead-team/). Hades VFX was a dedicated discipline — [80.lv, Hades effects](https://80.lv/articles/a-behind-the-scenes-look-at-the-effects-in-hades)
- **Cuphead:** a large hand-drawn team was required to reach 45k–60k+ frames, and the frame estimate grew from 15k (2015) as scope expanded — [Intel](https://game.info.intel.com/gaming-access/you-wont-believe-how-many-hand-drawn-frames-of-animation-went-into-cuphead)

### Inferences
- A 1–3 person team can realistically ship one high-quality 8-direction hero via (3) or (4). One person handles model, rig and animation, and outsourcing a $4k–12k model plus rig is optional.
- Frame-by-frame at 8 directions with the full move list is unrealistic for a single artist unless the sprite is low-res and the frame count is small. The raid30 devlog ("a very long time" for 144 frames per weapon type) supports this.
- A minimal team mapping:
  - Concept: contract.
  - Model, texture and rig: one 3D generalist, or contract.
  - Animation plus technical art (render tool or toon shader): the core team member.
  - VFX (slashes, smears, wing feathers): a core member or a contractor.
  - Mocap packs at $2–10 per clip can seed locomotion.

### Gaps
- No headcount breakdown for Children of Morta's or Eastward's animation teams was retrieved.

---

## 4. Quality criteria: principles, melee game feel, readability, frame rate, blending

### Takeaway
Professionals judge melee animation by frame data and feel, not by smoothness alone. The checks are startup/active/recovery frame counts, hit-stop (freeze frames scaled to hit weight and capped), a 1-frame flash, sound and particles on impact, short blends so anticipation is not lost, and the 12 principles adapted for responsiveness. On-ones animation at 24 fps (Cuphead) or real-time 3D at high fps (Hades II) is used for smoothness. Readability at small size from a high camera remains the top-down priority.

### Cited Findings
- **Frame data as the measure of feel:** Derek Daniels (former God of War combat designer) argues that "one of the easiest ways to measure things is the amount of frames that they take up", meaning startup, hit window and recovery — [Derek Daniels, Game Feel Part 1](https://derek-daniels.squarespace.com/blog/2013/2/21/game-feel-part-1) (2013, older but foundational)
- **Hit pause recipe:** pair a sound and a one-frame white flash with particles and a brief freeze of the whole game, to make an impact feel harder than it is — [Derek Daniels, Game Feel Part 3](https://derek-daniels.squarespace.com/blog/2013/2/27/game-feel-part-3)
- **Academic support:** a University of Washington paper on "impact feel" finds that hit stop, sound coherence and camera control may strongly influence players' sense of impact, and credits Daniels — [Lin et al. 2022, UW](https://faculty.washington.edu/zkwen/articles/lin22features.pdf)
- **Hit-stop caps (Smash/Sakurai):** hitlag scales with damage and is capped at 30 frames, or 20 for a victim crouch-cancelling, from Brawl onward — [SSBWiki, Hitlag](https://ssbwiki.com/Hitlag). Sakurai's Famitsu column says hitstop never exceeds that cap regardless of damage, and describes using 4 frames to transition from the initial flinch to the hurt animation — [Source Gaming translation, Famitsu vol. 490](https://sourcegaming.info/2015/11/11/thoughts-on-hitstop-sakurais-famitsu-column-vol-490-1/)
- **Sakurai's videos:** "Masahiro Sakurai on Creating Games" (2022–) has episodes on hit stop, including one covering 8 hit-stop techniques and one on fine-tuning hitstop (December 2022) — [GoNintendo](https://www.gonintendo.com/contents/13581-sakurai-s-latest-game-dev-video-features-8-hit-stop-techniques); [Nintendo Wire](https://nintendowire.com/news/2022/12/12/this-week-in-sakurai-12-5-12-11-fine-tuning-hit-stop-and-cheating-the-system/). There is also a "How to Animate a Smash Bros Attack" episode — [Amara subtitles](https://amara.org/subtitles/I8Bnr4dEmv1u/en/1/download/How%20to%20Animate%20a%20Smash%20Bros%20Attack%20%20LINK.en.txt)
- **Hit-stop duration (low-authority guide):** scale the freeze to impact weight. Beyond about 20 frames it starts to feel like a bug. Freezes on player-damage should be shorter so the player does not lose control — [Game Juice article](https://gamejuice.pages.dev/articles/hit-stop-frame-trick) (unverified blog)
- **12 principles in games:** Jonathan Cooper's "Game Anim: Video Game Animation Explained" adapts the 12 principles to games, using examples such as Cuphead and Shadow of the Colossus — [Game Developer excerpt](https://www.gamedeveloper.com/production/the-12-principles-of-animation-in-video-games). The book argues that "many animations blending together creates a better and more fluid game character than a single beautifully animated animation" — [Game Anim preview](https://vdoc.pub/documents/game-anim-video-game-animation-explained-8qgjc5vgf4c0)
- **Blending pitfall:** if the crossfade blend is too long, players do not see the anticipation in the animation — [Game Developer, Common mistakes in game animation](https://www.gamedeveloper.com/programming/common-mistakes-in-game-animation)
- **Responsiveness vs fluidity:** Unity's case study on balancing animation fluidity with player input (Bye Sweet Carole, hand-drawn 2D) is a recent (2024–25) reference — [Unity blog](https://unity.com/blog/bye-sweet-carole-animation-fluidity-player-inputs)
- **Frame rate choice:** Cuphead animates at 24 fps on ones over 60 fps gameplay — [Windows Central](https://www.windowscentral.com/check-out-how-cuphead-team-makes-its-cool-looking-2d-animations). Hades II markets "even smoother" real-time 3D — [Steam](https://store.steampowered.com/app/1145350/Hades_II/)
- **Dead Cells keyframe discipline:** the animation is made convincing "with as few frames as possible" on key poses first, and interpolation frames are added only afterwards. Exported frame sequences allowed blend-mode effects, and one animation could drive several models — [Sudo Null translation of Vasseur's article](https://sudonull.com/post/14066-Dead-Cells-Using-3D-Pipeline-for-2D-Animation/); [Game Developer original](https://www.gamedeveloper.com/production/art-design-deep-dive-using-a-3d-pipeline-for-2d-animation-in-i-dead-cells-i-)
- **Orthographic camera affects proportions:** Hades models get larger heads and slightly shorter bodies to read correctly under the orthographic high camera — [Game Developer](https://gamedeveloper.com/art/learn-how-supergiant-brought-i-hades-i-hand-painted-characters-to-life)
- **"Juice it or lose it"** (Jonasson and Purho, 2012) is the standard talk on screen shake, particles and tweening. It was not retrieved this session, so no URL-verified claims are listed here.

### Inferences
A quality checklist for the knight hero, synthesised from the findings above:
1. **Startup frames.** Keep light-attack startup to about 2–4 game frames at 60 fps (about 33–67 ms) for responsiveness. Heavy attacks may run 10–20.
2. **Impact.** Use a smear or slash frame on the active frame, plus hit-stop of about 3–8 frames for light hits and 8–15 for heavy hits, below a cap of about 20. Add a one-frame flash, particles, sound and a small camera shake.
3. **Recovery and cancelling.** Allow cancel windows into dodge or the next combo hit, and keep blends short so anticipation still reads.
4. **Silhouette at small size.** The greatsword and wings must read in all 8 directions from a 45° camera. Exaggerate the sword length and the wing silhouette, and consider larger heads, as Hades did.
5. **Direction consistency.** 3D-driven pipelines guarantee this, while hand-drawn work needs per-direction model sheets. Children of Morta corrected anatomy against a reference frame.
6. **Frame rate.** Drawn 2D at 12 fps (on twos) looks snappy and cheap, while 24 on ones looks premium and costs about 2×. Real-time 3D runs at the display rate.

### Gaps
- No GDC Vault talk was retrieved with specific numbers on God of War, Hades or Dead Cells combat feel. Daniels' blog is the closest primary source.
- No source was found with a specific input-latency budget (ms) for ARPG melee.
- No sourced root-motion guidance for top-down ARPGs was found.

---

## 5. Case postmortems with actual numbers

### Takeaway
The strongest numeric cases are these:
- **Cuphead:** 24 fps on ones, about 1,200 frames per playable character, 800–1,400 per boss, and 45k–60k+ frames total.
- **Hades:** pre-rendered 3D, "thousands upon thousands" of frames from many angles. One user-reported attack is 104 frames × 32 angles, and reportedly about 942k frames shipped (unverified).
- **Dead Cells:** a one-person 3D-to-pixel pipeline adopted explicitly to avoid hand-redrawing retakes. No measured time saving has been published.

### Cited Findings
- **Dead Cells:** "To make up for the lack of bandwidth and still deliver on quality, we had to find a pipeline that could give us great looking pixel art, without having to hand draw each and every retake" (Thomas Vasseur).
  - The workflow is 3ds Max → FBX → frames exported as PNG with normal maps → toon shader → low-resolution render without anti-aliasing.
  - Pixel flicker remained an unsolved problem.
  - Stated advantages: easy adjustment, multiple angles "for free", and easy addition of armour or other elements.
  - Sources: [Game Developer (Jan 2018)](https://www.gamedeveloper.com/production/art-design-deep-dive-using-a-3d-pipeline-for-2d-animation-in-i-dead-cells-i-); [WN Hub summary](https://wnhub.io/news/art/item-13775); [Sudo Null translation](https://sudonull.com/post/14066-Dead-Cells-Using-3D-Pipeline-for-2D-Animation/); [80.lv case study](https://80.lv/articles/case-study-dead-cells-character-art-pipeline)
- **Dead Cells, no measured time saving.** None of the sources quantify hours saved. One hobbyist who copied the method reported an "insane amount of time saved", which is anecdotal — [Blender Artists](https://blenderartists.org/t/so-i-did-a-pixel-art-game-with-blender-and-unity/1169165)
- **Cuphead:** 24 fps on ones; about 1,200 frames per playable character; 800–1,400 per boss; the 2015 estimate of 15,000 frames was exceeded; about 45,000 frames per Guinness — [Intel](https://game.info.intel.com/gaming-access/you-wont-believe-how-many-hand-drawn-frames-of-animation-went-into-cuphead); [Guinness](https://www.guinnessworldrecords.de/world-records/508061-most-hand-drawn-frames-of-animation-in-a-videogame)
- **Hades:** see section 1, including the 104 × 32 = 3,328 frames user-reported example and the reported 942,489 frames. The pre-render approach made costume changes impractical, and Hades II moved to real-time 3D — [Steam](https://steamcommunity.com/app/1145360/discussions/0/1738883810796606862); [Steam Hades II](https://store.steampowered.com/app/1145350/Hades_II/)
- **Death's Door:** two core developers did all the animation in Blender, while concept, UI and 3D assets were outsourced; the game had a subtle toon shader (art direction by Frits Olsen) — [Byteside](https://byteside.com/2021/08/deaths-door-developer-acid-nerve-on-how-it-made-its-sword-wielding-crow-game); [Unity blog](https://blog.unity.com/games/crafting-intricate-environments-deaths-door)
- **Children of Morta:** the "all directions" burden and per-character skill sprites made adding characters hard — [Game Developer](https://gamedeveloper.com/design/making-family-matter-in-i-children-of-morta-i-); [TechRaptor](https://techraptor.net/content/how-dead-mage-created-the-art-for-children-of-morta)
- **Eastward:** the pixel art and animation "probably took a ton of time for such a small team". The interview's answer on the animation process could not be read — [Game Developer](https://www.gamedeveloper.com/art/eastward-s-creators-share-insights-on-making-pixel-art-adventures)

### Inferences
- The pattern across cases:
  - Teams with a hand-drawn ambition and many directions either grow large (Cuphead, which is side-view only) or switch to 3D-driven pipelines (Dead Cells, Hades, Death's Door).
  - For an 8-direction top-down hero built by a small team, (3) pre-rendered 3D or (4) real-time toon 3D is the economically proven route.
  - Hand-drawn (1) is best kept for VFX overlays such as slash smears and wing-feather bursts, or for portraits and key art, which is the Hades split.

### Gaps
- No published Children of Morta, Moonlighter, Tunic or Hyper Light Drifter frame or animation-count numbers were found.
- No measured Dead Cells time saving has been published.
- The Hades 942,489 figure needs verification against the MCV article.
