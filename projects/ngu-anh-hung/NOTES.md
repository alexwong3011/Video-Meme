# Ngũ Anh Hùng — ghi chú bàn giao (đọc trước khi làm tiếp)

## Link và quy tắc xuất bản
- Dev: https://claude.ai/artifact/PBAE7ke18xyxBVu2Sente7 ← `index.html` (+ `assets/**`)
- Test: https://claude.ai/artifact/JytjwNgSMK18nigbrBf9Zc ← `test-build/index.html` (bản sao của index.html, chỉ đổi `<title>` thành "Ngũ Anh Hùng Test")
- Bảng phát triển: https://claude.ai/artifact/AQze3RX5putBzaumknY4ye ← `dashboard/index.html`. Dữ liệu nằm trong kho db của trang (comps, tasks, spend, meta/meshy); nạp ban đầu bằng `dashboard/seed.py`. **Khi xong hoặc mở việc mới, cập nhật bảng bằng ArtifactData** (đọc trước, ghi kèm if_version).
- **Mỗi lần cập nhật dev thì xuất bản luôn test** (chủ dự án yêu cầu). Asset mới: publish dev với `files` = đường dẫn tương đối; test lấy file server-side `{artifact: <dev url>, path}`.
- Capabilities (giữ nguyên khi publish, không truyền lại): db rules `[{path:"",read:"view",write:"owner"},{path:"data/users/{self}",write:"interact"}]` + `user`.
- Nhánh git: `claude/sharp-goodall-ay56hb`. Commit kèm 2 dòng attribution của phiên. Không mở PR nếu chưa được yêu cầu.

## Cấu trúc game (một file `index.html`, three.js 0.160 qua importmap, ES module)
- Gốc từ game mẫu "Vực Lam" của chủ dự án (`src-vuc-lam/`); 5 bản đồ + thành, MAXLV 400.
- **Kỵ sĩ 3D (lớp Hỏa Kiếm Sĩ)**: module `KN` (tìm `const KN =`). Mô hình Meshy `assets/meshy/knight.gltf.json` (glTF JSON base64 → GLB trong bộ nhớ, `loadGltfJson`). 14 clip thư viện, idle thở tự sinh (`knIdlePose`), IK tay, ngón tay nắm (`knCurl`, `knFist`), kiếm là 2 tấm ảnh chéo (`knMakeSword`, `SET_ART[set].sword`).
- **Ghép từng phần kiểu MU (3D)**: `splitBySlot` cắt lưới theo trọng số xương thành helm/armor/pants/gloves/boots (chồng mép 22%). Thân trần Hy Lạp `base_greek` và các bộ có mô hình riêng (`VARIANT_SETS`: dung, olym, song) gắn bằng `knAttachVariant`: mỗi khung xương biến thể lấy **độ xoay so với tư thế gốc trong không gian thế giới** của xương kỵ sĩ cùng tên (hai rig trùng tên nhưng khác trục xương — chép quaternion cục bộ sẽ lộn ngược). `knBodySlots` chọn phần hiện theo ô.
- **Bot**: `botKit` (trang bị ảo theo `BOT_PLAN`, tối thiểu +13 từ cấp 300, bộ yêu thích), `makeChar(..., asKnight, look)` dùng bản nhẹ (`*_lod.json`, ~12k tam giác) + `botDress` (bộ 3D riêng qua `charRetarget`, ánh giáp, vũ khí của bộ).
- **2D**: hình nhân `dollHtml` (mảnh `assets/equip/pieces` của Cánh Lam; bộ có tranh riêng ở `assets/equip/sets/<set>/` với `doll.json`), icon `itemArt`, đồ rơi `lootTex`. Nhẫn/dây chuyền/bùa/ngọc: `assets/equip/items/`. Cánh là vật phẩm (`makeWing`, ô `wings`), icon `assets/equip/wings/`.
- Hệ khác: FX3 (hiệu ứng kiểu MU), aura khói theo cấp + (`heroAuraTick`), tốc đánh 0,25–2,5/s với `hitK` giữ nguyên DPS, túi 300 ô (đồ xếp chồng không chiếm ô), bán nhanh theo độ hiếm (`sellable`, ô "Giữ đồ bộ/+7"), popup chi tiết `#ipop`.

## Pipeline làm bộ đồ mới bằng Meshy (~100 credit/bộ; số dư gần nhất 470)
Trong `scripts/character3d/` (khóa API do proxy tự chèn cho api.meshy.ai):
1. `gen_views.py work/base_greek/clean/white work/<k>/raw work/<k>/prompt.json` (prompt có `"armor": true`) → 3 ảnh A-pose (36 cr)
2. `gen_sheet.py <prompts/ref-armor-layout.jpg|ref-weapon-layout.jpg> <prompt.txt> <out.png> [--aspect 16:9]` → tấm giáp + tấm vũ khí (12 cr/ảnh)
3. `apose.py work/<k>/raw work/<k>/raw work/<k>/clean`, rồi `run_pipeline.py work/<k>/config.json` (chép config của dung, đổi name/web_name) → `assets/meshy/knight_<k>.*` (40 cr)
4. `set_pieces.py armor.png weapon.png ../../projects/ngu-anh-hung/prompts/ref-armor-layout.jpg ../../projects/ngu-anh-hung/assets/equip/sets/<k> [--pole]` → mảnh hình nhân, icon, `doll.json`, `weapon_front/back.png`, `weapon.json`
5. LOD cho bot: `node lod2.mjs <gltf.json> <out_lod.json> 0.2` (script trong scratchpad cũ; cần `npm i meshoptimizer@0.21.0`) — nên chép vào repo nếu dùng lại
6. Code: thêm vào `SET_ART` (doll + sword, `L: 1.7` cho vũ khí dài), `VARIANT_SETS`, tên món trong `SETS.<k>.names`.
- Phong cách: **sáng** (Lam, Bích, Tím, Vàng kim, Đỏ, Bạc, Lục Bích). Bộ Dung Nham bị tối — có thể làm lại.

## Kiểm tra
- `node tools/check.js snippet.js /tmp/shots [--page test-build/index.html]` (cần `npm i three@0.160.0 --prefix /tmp/three160`; Chromium/Playwright có sẵn).
- Trước khi publish: tách `<script type="module">` ra file rồi `node --check` (đã bắt nhiều lỗi ngoặc/chú thích nuốt code).
- **Bẫy hay gặp**: chú thích `//` chèn giữa dòng code nuốt phần sau — dùng `/* */` hoặc đặt chú thích riêng dòng.

## Việc đang làm / tiếp theo
- **Khiên (xong)**: 4 khiên bộ (azure `assets/equip/pieces/shield.png`, dung/olym/song `sets/<k>/pieces/shield.png`) + 4 khiên thường theo tên (`items/shield_N.png`). Code: `shieldSrc`, `makeShield`, `shieldPlace` (đeo cẳng tay trái, luôn dựng đứng, mặt hướng ra ngoài/trước), tư thế thủ `KN_IDLE.L3`, bot `botShield` + `charShield`, hình nhân `DOLL.p.shield`. Nguồn: `source/shields/`.
- Bộ còn thiếu tranh riêng: Vảy Rồng Biển (vay), Thần Ưng Sa Mạc (sa). 4 lớp nhân vật khác vẫn là người mẫu cũ.
- **Boss 3D (xong)**: 10 boss (2/map) làm bằng `scripts/character3d/gen_boss.py` (Text-to-Image gpt-image-2 9 cr → Image-to-3D 30 cr → glTF JSON). Prompt: `prompts/bosses.json`. Model + chân dung: `assets/meshy/boss/`. Code: `BOSS3D` (kind/H/L/yaw/fy/glow/sóng shader), `bossLoad`, `makeBoss3D` (rig thủ tục: phập phồng, bơi, uốn, lơ lửng), `bossPreload` khi vào map, `BOSS_LORE` + `bossChips`/`openBossLore` trong bảng Bản đồ. Số dư Meshy sau đợt này: 56.
- **Hiệu ứng chiêu 4 lớp (xong)**: `CFX` (theo id chiêu) + `cfxStrike/cfxSpike/cfxRainArrow/cfxSplash/cfxJudg` (móc vào updSkills), `cfxAttack` (đánh thường), `cfxProjFly/End/Hit` (vệt đạn + trúng đích), `prjMesh` (quầng sáng đạn). Thêm texture FX3: cross, crack, frost, spike. Lớp lửa vẫn dùng công thức chung.
- **Nút "Bắt đầu làm" trên bảng**: trang gửi bình luận kèm nội dung mục cho Claude (`comments.sendToClaude`). Phiên đang theo dõi bảng nhận được thì trả lời kế hoạch trong luồng đó (công cụ ArtifactComments), chờ chủ dự án xác nhận rồi mới làm.
- **Chọn nhân vật 5 ô (xong)**: `ROSTER` = { slots[5] (bản lưu riêng từng nhân vật), world.bots (thế giới chung), last }. Lưu máy: localStorage `nguanhhung-roster-v3`. Lưu mây: `data/users/<uid>/roster` (đầu mục + world) và `data/users/<uid>/char0..4`. Bản lưu cũ v2 (`save`) tự chuyển thành ô 1. `CUR` = ô đang chơi; `playSlot`, `deleteSlot`, `updateStartUI` vẽ danh sách; menu "Đổi nhân vật" (mHome). tools/check.js tự tạo nhân vật ở ô trống đầu tiên.
- **Cân bằng quái (xong)**: `EXP_K = 2` (exp nhân vật, trong gainExp), `BOSS_K.hp = 0.5`, `MOB_HP_K = 8`, `MOB_FURY` (aggro 1.25, chase 1.12, rate 0.8, atk 1.1), `BOSS_K` (atk x2, speed x2: tốc đánh và tốc chạy). Mana: nhẫn `mpr` (hồi %/giây), dây chuyền `mpl` (hút %/đòn); chỉ số phần trăm theo `PCT` + `pctBase`; `HS.mpCap` nâng trần hồi mana.
- **Nhịp chiêu (xong)**: mọi lớp `SK_ROT` → KHÔNG có hồi chiêu riêng (skCd = 0), chỉ nhịp chung 0,5 lần/giây; tự động luân phiên chiêu bằng `autoCast` (S.skRR). Nhịp chung × (aps/aps gốc), cổng chung `S.skG`, mana `skMp` giảm theo tốc. Sát thương: `skDmgK` = SKD/(1+lv/60)^SKP, `atkDmgK` = BAK/(1+lv/40)^BAP (đòn thường). Đo lại bằng `CLS=<lớp> node tools/check.js tools/pack_dps.js /tmp/x --class <lớp>` (dùng `__sim` chạy logic không vẽ; in tSk/tAtk/tBoth = giây diệt bầy 5 quái cùng cấp).
- **Mọi lớp dùng thân 3D kỵ sĩ (tạm thời)**: `knBuild` không còn giới hạn lớp lửa, nên đồ mặc hiện lên người ở mọi lớp. Lớp tầm xa đánh thường bằng động tác phóng phép; mỗi chiêu có động tác trong `KN_CLIP.skill`. Vệt vũ khí theo màu nguyên tố. Mô hình riêng từng lớp vẫn là bước 3 (đang treo).
- **Bình thuốc (xong)**: `S.mats.hpp` / `S.mats.mpp` (tối đa 99.999 mỗi loại qua `addMat`/`MAT_MAX`) (nguyên liệu xếp chồng, icon `items/mat_hpp|mpp.png`, nguồn `source/potions/`). `POT` (hồi 50%, chờ 1,5 giây, tự uống dưới 25%, tỉ lệ rơi), `usePot`, `potHud`, nút `#pothp/#potmp` (phím Q/E), bán ở Hermes (`potPrice`). Meshy còn 47 credit.
- **Cánh bậc 1 (xong)**: cánh cầu vồng 2D (`assets/wings/rainbow/L|R.png`, chép từ ảnh vật phẩm t1) thay cánh shader; `SWING[1]` cùng bố cục với bậc 2. Cánh shader cũ (`wings`) giờ không hiện nữa.
- **Giao diện mới (đã áp vào game)**: lớp CSS "UI theme Giấy cói & Lapis" ở cuối stylesheet chính (biến --pap/--lap/--gd…, ánh xạ màu chữ sáng → đậm trong .pnl/.ipop-card/.ocard bằng [style*="color:#…"]), tài nguyên `assets/ui/` (parchment.jpg, meander.svg, wave.svg, crest.svg).
- Bản mẫu cũ: phương án B (giấy cói nứt, lapis, vàng nổi, cartouche; huy hiệu cánh + ngọc thay chim ưng; meander và sóng thay chữ tượng hình). Bản mẫu: https://claude.ai/artifact/QQGGw9uWQm3jy2XSCNtR6o (nguồn `ui-mockup/`). Nền giấy cói cắt từ ảnh tham chiếu của chủ dự án: `assets/ui/parchment.jpg`. Font: Cormorant Garamond (tiêu đề) + Be Vietnam Pro.
- **Giao diện Ai Cập tông tối (phương án A, đang dùng)**: thay lớp giấy cói. Khối CSS "UI theme Lăng mộ Ai Cập" cuối stylesheet chính; ảnh cắt thẳng từ bức bích họa tham chiếu: `assets/ui/egy_wall.jpg` (tường tối), `egy_band.jpg` (dải chim ưng, đầu cửa sổ), `egy_hiero.jpg` (dải cartouche, chân cửa sổ), `egy_sun.png` (đĩa mặt trời: nút đóng, nút Đánh, huy hiệu đếm), `egy_head.jpg` (dải chim ưng + chim + cân, đầu màn hình chọn nhân vật). Màu chữ game giữ nguyên vì nền tối.
- **Đồ họa (xong)**: Menu có "Đồ họa: Tự động / Cao / Thấp" (`GFX`, lưu localStorage `nah-gfx`; chỉ Tự động mới tự hạ DPR khi FPS < 38). Bloom mềm hơn (0.28, ngưỡng 1.0, `bloomPass`). Bộ màu sáng (`PALE_SETS` olym, song: từ 3 món thân) giảm aura/khói/viền sáng còn 50% (`paleK`).
- **HUD trong suốt (xong)**: khối "HUD see-through" cuối theme: nền nút, thanh, bảng trạng thái còn ~30% đậm, viền vàng `--hudRing` dày hơn; icon/chữ có bóng đổ để đọc trên cảnh.
