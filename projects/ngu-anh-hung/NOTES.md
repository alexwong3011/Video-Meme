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
