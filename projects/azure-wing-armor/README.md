# Bộ Giáp Cánh Lam (Azure Wing Armor Set)

Tách ba tấm thiết kế `source/azure-wing-sheet.jpg` (giáp mặt trước), `source/azure-wing-sheet-back.jpg` (giáp mặt sau)
và `source/azure-wing-weapon-sheet.jpg` (đại kiếm hai mặt) thành bộ sprite trong suốt để nhúng vào game.
Mọi pixel lấy trực tiếp từ ảnh gốc (không vẽ lại), nên độ giống bản vẽ là tối đa; chỉ phóng to bằng AI (ESRGAN).

Xem trước: mở `viewer.html` qua một web server tĩnh (`npx serve projects/azure-wing-armor`), vì trang `fetch` JSON.

Sân tập: `playground.html` (cùng cách mở). Nhân vật ráp từ sprite @1x theo `azure_wing_set.json`, đi 4 hướng
(xuống/ngang dùng mặt trước, lên dùng mặt sau, đi ngang thì nghiêng người theo hướng đi), menu trang bị mặc/tháo từng món
và chọn tay cầm kiếm, hình nộm có máu, số sát thương, chí mạng và DPS. Phím: WASD/mũi tên, J/Space/nhấp để chém,
I mở trang bị, H hiện hitbox. Điện thoại có cần điều khiển ảo và nút chém.

## Nội dung `assets/`

| Đường dẫn | Mô tả |
|---|---|
| `sprites/front/@4x/*.png`, `sprites/back/@4x/*.png` | 7 sprite mỗi mặt (mũ, giáp ngực, giáp chân, 2 găng, 2 giày), phóng 4× bằng ESRGAN-thick, nền trong suốt |
| `sprites/<mặt>/@2x/`, `@1x/` | Cùng sprite, thu nhỏ có premultiply alpha (không viền đen) |
| `atlas/azure_wing@2x.png/.json` | Atlas 14 frame tên `front/<mảnh>`, `back/<mảnh>`, định dạng TexturePacker JSON Hash, có `pivot` |
| `paperdoll/azure_wing_{front,back}@{4x,2x}.png` | Toàn bộ giáp đã ráp đúng vị trí bản vẽ, mỗi mặt một ảnh |
| `icons/<item>_{256,128,64}.png` | Icon túi đồ nền trong suốt; `icons/framed/` có khung ô đồ |
| `sprites/weapon/{front,back}[_mirrored]/@{4x,2x,1x}/greatsword.png` | Đại kiếm Cánh Lam: hai mặt từ tấm vũ khí, kèm bản lật gương để cầm tay còn lại |
| `atlas/azure_wing_weapon@2x.png/.json` | Atlas 4 frame kiếm `weapon/<biến thể>`, pivot đặt ở giữa chuôi cầm |
| `azure_wing_set.json` | 6 món (5 giáp + kiếm: ô, tên VI/EN, mô tả, chỉ số mẫu, hiệu ứng bộ) + dữ liệu ráp cho từng mặt |

Tên `*_left` / `*_right` theo vị trí **trên ảnh**. Trường `character_side` cho biết đó là tay/chân nào của nhân vật:
mặt trước thì găng bên trái ảnh là tay phải, mặt sau thì là tay trái.

### Dữ liệu ráp (`pieces.<mảnh>.views.<front|back>` trong JSON)

- Gốc nhân vật: giữa hai bàn chân, trên mặt sàn; trục y hướng xuống.
- `offset_1x`: vị trí góc trên-trái sprite so với gốc, đơn vị px @1x (nhân 2 hoặc 4 khi dùng @2x/@4x).
- `pivot`: điểm khớp chuẩn hóa 0..1 (cổ cho mũ, ngực, hông, cổ tay, đế giày) để gắn vào xương/slot.
- `z` (chung cho mọi mặt): thứ tự vẽ (chân 10 → giày 15 → ngực 20 → mũ 30 → găng 40).
- Hai tấm thiết kế có bố cục hơi khác nhau (mặt sau mũ nhỏ hơn, hai ống chân tách rời), nên mỗi mặt có offset riêng.

### Vũ khí (`weapon` trong JSON)

- `variants.<front|back|front_mirrored|back_mirrored>`: kích thước, `grip_pivot` (giữa chuôi cầm), `tip` (mũi kiếm), `pommel` (quả đấm), đều chuẩn hoá 0..1.
- Găng có thêm `grip_1x` / `grip_pivot` (lòng bàn tay) ở mỗi mặt. Đặt `grip_pivot` của kiếm trùng `grip_1x` của găng, vẽ kiếm ở `hold.z = 35` (ngay sau găng) để vuốt găng ôm chuôi.
- `hold.<front|back>.<gauntlet_left|gauntlet_right>` chọn biến thể cho từng tay để mũi cong hướng ra ngoài; cầm được tay trái, tay phải hoặc cả hai.
- `recommended_scale` = 0.45 so với giáp cùng độ phân giải: kiếm hạ mũi xuống vừa chạm gần mặt sàn. Ảnh gốc vẽ kiếm mũi hướng xuống; muốn giơ kiếm thì xoay quanh `grip_pivot`.

### Phaser 3

```js
this.load.atlas('azure', 'atlas/azure_wing@2x.png', 'atlas/azure_wing@2x.json');
// ...
const set = this.cache.json.get('azureSet'), k = 2, view = 'front';   // 'back' khi quay lưng
Object.entries(set.pieces).sort((a, b) => a[1].z - b[1].z).forEach(([name, piece]) => {
  const p = piece.views[view], [ox, oy] = p.offset_1x, [px, py] = p.pivot, [w, h] = p.size_1x;
  this.add.image(x + (ox + px * w) * k, y + (oy + py * h) * k, 'azure', `${view}/${name}`).setOrigin(px, py);
});
```

### Unity / Godot

Kéo `sprites/front/@4x/*.png` và `sprites/back/@4x/*.png` vào project (Unity: Texture Type = Sprite, Alpha Is Transparency; Godot: import mặc định).
Đặt pivot của từng sprite = `pivot` trong JSON (Unity: Custom Pivot, lưu ý Unity tính y từ dưới lên → `1 - pivot.y`;
Godot: `Sprite2D.offset = -pivot * size`). Vị trí con so với gốc nhân vật = `offset_1x + pivot * size_1x`.

## Góc camera 45° (`source/turntable/` → `assets/rig45/`)

`character-test.html` nhìn nhân vật từ trên xuống chéo 45°, đúng góc của các tấm turntable và tấm tư thế. Rig được dựng lại từ
ba ảnh turntable: view01 (trước), view04 (sau) và view02 (ba phần tư, quay sang trái, lật gương khi đi sang phải). `turntable.py`
bỏ bệ đá (điểm ảnh xám-lam xỉn trên elip bệ, mọi thứ dưới đường nối hai đế giày, bóng phản chiếu và bóng đổ cạnh giày) khỏi lớp
tách nền, ghép với ảnh phóng to 4× rồi `rig.py` cắt thành đầu, thân, tay trên/dưới, đùi, cẳng chân (cấu hình FRONT45, BACK45,
QUARTER45). Ở góc ba phần tư, tay gần (R) cầm vũ khí và vẽ đè lên thân. Vùng đùi bị bàn tay che được vá lại khi tay vung ra.
Sàn là các phiến đá vuông nén theo chiều sâu (DEP = 0,6, khớp tỉ lệ elip bệ trong ảnh gốc). Bóng, vùng sáng, đế hình nộm và nắp
cột là hình tròn nằm trên mặt sàn nên hiện thành elip. Rig ngang tầm mắt cũ vẫn giữ ở `assets/rig/` để tham khảo.

## Tư thế vẽ tay cho đòn đánh (`source/poses/pose01-05.jpg` → `assets/poses/`)

`poses.py` tách 5 tư thế chém hai tay (01 vác kiếm qua đầu, 02 giơ chéo, 03 quét ngang, 04 bổ xuống, 05 thu đòn) theo màu:
giữ giáp (tím), lông vũ (lam), kiếm (vàng, tím); bỏ cánh pha lê (sáng, nhạt), bệ (xỉn, dưới đường nối hai đế giày) và nền; lấp khe
tối bị giáp bao quanh. Mỗi tư thế có mốc đo tay: điểm giữa hai chân, điểm gắn cánh, chuôi, chắn kiếm và mũi kiếm; xuất WebP 0,6×.
`character-test.html` (bản 2,5D dựng từ tấm vẽ gốc) dùng chúng cho chuỗi hai tay (Bổ trời 01→04→05, Quét ngang 02→03, Chém xuyên
02→05), chiêu 3 (xoay bằng rig rồi 01 trên không → 04 khi đáp) và đà ném của chiêu 4 (01). Giữa hai tư thế là khung nhòe: lưỡi kiếm
quét quanh chuôi theo đúng chiều chém, va chạm tính theo lưỡi kiếm của tư thế đang hiện. Tư thế được lật để lưỡi kiếm kết thúc về
phía mục tiêu; khi quay lưng (đi lên) vẫn dùng rig. Bản sprite 3D trước đó giữ ở `sprite-test.html`.

## Mức 3: sprite 8 hướng render từ mô hình 3D

1. **Hoa văn từ 6 góc nhìn** (`source/turntable/view01-06.jpg`, camera 45°): `3d/mv_fit.py` tìm góc xoay, góc nghiêng và khoảng cách
   camera của từng ảnh bằng cách khớp bóng với mô hình (IoU 0,72–0,81; trước/sau chọn theo nội dung ảnh vì bóng giống nhau).
   `3d/mv_bake.py` chiếu từng ảnh (và bản lật gương, vì giáp đối xứng) lên từng texel của UV, có z-buffer cho phần bị che, mỗi texel
   lấy góc nhìn thẳng nhất; giữ texture cũ (sắc nét từ tấm thiết kế) ở mặt trước/sau, dùng góc mới cho hông, vai, mặt chéo (24% texel).
   `3d/swap_texture.py` thay texture trong glb đã gắn xương. Lưu ý: ảnh 01, 02, 06 thực tế gần cùng một góc dù nhãn ghi 0°/60°/300°.
2. **Render sprite**: `knight-3d.html#sprites` dựng camera trực giao 45°, nền trong suốt, và trả về từng khung cùng vị trí lưỡi kiếm,
   bàn tay, điểm gắn cánh. `sprites/render.js` render 5 hướng (s, se, e, ne, n; sw, w, nw là bản lật gương) × 4 cách cầm × các clip:
   idle 6, walk 8, run 6, mỗi đòn chém 8, castS/castA 2, chop 10, rain 8, fly 6, flym 6 khung (1.520 khung, ~0,2 s/khung trên CPU).
   `sprites/pack_sprites.py` cắt viền, xếp vào trang WebP 2048 px: `assets/sprites25/<cách cầm>/p*.webp` + `<cách cầm>.json`
   (khung, điểm gốc chân, lưỡi kiếm, bàn tay, điểm gắn cánh theo từng khung), tổng 7,9 MB, mỗi cách cầm ~2 MB, tải khi cần.
3. `character-test.html` (2,5D) vẽ nhân vật từ các sprite này: 8 hướng xoay mượt theo hướng đi, va chạm và vệt chém lấy từ lưỡi kiếm
   của đúng khung đang vẽ, cánh ảnh là lớp riêng gắn ở điểm lưng của từng khung (trước/sau/nghiêng). `knight-3d.html` dùng cùng mô hình,
   ba bộ cánh ảnh dạng tấm 3D vỗ theo nhịp bay, camera mặc định 45°.

## Bản 2,5D dựng bằng rig cắt từ tấm vẽ (phiên bản trước)

Ba tấm nhân vật (`source/azure-wing-body-{front,back,side}.jpg`) được cắt thành rig có khớp: mặt trước, mặt sau (10 phần mỗi mặt) và
góc nghiêng (6 phần; tay và chân phía xa vẽ lại từ phần phía gần, tối màu hơn; chỗ cánh tay và bàn tay che thân/đùi được lấp bằng hoa
văn giáp trong bóng tối để không lộ lỗ khi tay vung ra). Đi trái/phải dùng góc nghiêng (lật gương cho bên phải) với sải chân thật.
Ba bộ cánh (`source/wings-*.jpg` → `assets/wings/`, chạy `wings.py`): Cánh Dơi Pha Lê, Cánh Lông Vũ Pha Lê, Cánh Long Lam, mỗi cánh
có điểm gắn (root); cánh vỗ theo nhịp bay, gập khi đáp đất, xòe khi ra đòn. Mọi thứ của bản 3D có trong bản 2,5D: cầm kiếm bằng IK
hai đốt, bốn cách cầm và chuỗi đòn, bốn kỹ năng, 5 mục tiêu, nút tự động, bay.

## Nhân vật hoàn chỉnh có khớp (rig `assets/rig/`)

Từ hai tấm nhân vật đã ráp (`source/azure-wing-body-front.jpg`, `source/azure-wing-body-back.jpg`), `rig.py` cắt cơ thể thành
10 phần có khớp: đầu, thân, cánh tay trên, cẳng tay + bàn tay, đùi, cẳng chân + giày (trái/phải theo vị trí trên ảnh).
Phần nằm dưới giữ thêm vài px của phần phía trên để khớp không hở khi cử động.

| Đường dẫn | Mô tả |
|---|---|
| `assets/rig/body_front/@2x/*.png`, `@1x/` | 10 phần mặt trước |
| `assets/rig/body_back/@2x/*.png`, `@1x/` | 10 phần mặt sau |
| `assets/rig/<mặt>/rig.json` | Mỗi phần: `parent`, `z`, `joint` (khớp, px ảnh gốc), `pivot` (khớp trong sprite), `size`, `origin`; cẳng tay có `grip` (lòng bàn tay) |

Cách ráp: hông là gốc; thân, đùi con của hông; đầu và cánh tay trên con của thân; cẳng tay con của cánh tay trên; cẳng chân con
của đùi. Ma trận của một phần = ma trận cha × dịch(`joint` − `joint` cha) × xoay × co giãn; vẽ sprite tại −`pivot`.
Gốc nhân vật (giữa hai bàn chân trên sàn) là `origin` trong `rig.json`.

`character-test.html` dùng rig này: đi 8 hướng có gia tốc, giữ Shift để chạy, đi lên dùng mặt sau, đi ngang thì bước chéo chân;
hông nhún và dồn trọng tâm, gối nhấc, tay đánh ngược chân, thở khi đứng; vung kiếm 3 nhịp (lấy đà, chém, thu) với vệt sáng,
khựng hình khi trúng; va chạm kiếm tính theo đoạn thẳng của lưỡi kiếm. Có camera bám theo, cột đá, bụi chân và hình nộm.

## Kỵ sĩ 3D (`knight-3d.html`, `assets/3d/azure_knight.glb`)

`assets/3d/azure_knight.glb` là mô hình 3D có xương, dựng hoàn toàn trong môi trường này:

1. **TripoSR** (Stability AI, chạy CPU) dựng hình khối 3D từ ảnh nhân vật mặt trước (`3d/run_tsr.py`).
2. **Blender 5.3** (`pip install bpy`, chạy không giao diện) khớp bóng hai bản vẽ với mô hình (khớp 89% mặt trước, 78% mặt sau),
   chiếu hoa văn gốc mặt trước và mặt sau lên theo hướng bề mặt và độ che khuất, rồi nướng thành một texture 2048 (`3d/project_bake.py`).
3. Blender gắn 17 xương (`root, hips, spine, chest, head, upper_arm/forearm/hand, thigh/shin/foot` × `.L/.R`, theo nhân vật)
   và tự tính trọng lượng (`3d/rig3d.py`). 40.000 tam giác, texture JPEG, 7 MB, mở được trong Blender, Unity, Godot, Unreal.

Cầm vũ khí và tấn công: hai cánh tay giải bằng IK hai đốt tới vị trí nắm tay của từng tư thế; kiếm gắn vào nắm tay theo hướng lưỡi
riêng. Bốn cách cầm (phím Q): **một tay** (kiếm thấp bên hông, mũi chĩa xuống trước; chuỗi chém chéo → quét ngang → bổ dọc),
**song kiếm** (hai lưỡi dựng chéo lên; chém phải → chém trái → chém chữ X), **hai tay** (một đại kiếm ngang thân, hai nắm tay
trên chuôi; quét đại kiếm → bổ trời), **tay không** (đấm thẳng → đấm trái → móc hàm). Giữ J để đánh liên hoàn; mỗi đòn có lấy đà,
vặn thân, hạ trọng tâm và lao người tới. Cánh (phím F): cánh màng dựng bằng code (khung kim loại, màng tím than, vân lam phát sáng),
vỗ theo nhịp; khi bay nhân vật lơ lửng, một gối co cao, chân kia buông ra sau, chúi người theo hướng bay; cánh xòe khi ra đòn.

Kỹ năng (tầm 1 m, hồi chiêu 0,1 giây, giữ phím để tung 10 lần/giây): **1 · Lam Quang Kích** (đơn mục tiêu: tự quay về mục tiêu gần
nhất phía trước, phóng ngọn giáo ánh sáng lam, nổ vòng sáng và hạt), **2 · Vũ Cánh Phong Bạo** (diện rộng: sóng xung kích hai vòng,
cột sáng, lốc hạt xoáy và lông vũ bay ra, trúng mọi mục tiêu trong 1 m). Hiệu ứng dùng hạt, sprite, giáo sáng và vòng nova tái sử dụng
nên chạy đều ở 10 lần/giây. Sân có 1 hình nộm lớn và 4 bia đứng thành vòng để thử AoE. **3 · Thiên Lam Trảm** (hồi 1,2 giây): xoay người một vòng lấy đà, bật nhảy co gối, chém bổ từ trên xuống bằng cả thân rồi đáp đất;
vệt trăng khuyết, nứt sàn phát sáng, bụi đá, chớp sáng, rung màn hình; trúng mục tiêu sát người phía trước (1,3 m), sát thương 3,2×.
**4 · Kiếm Vũ Thiên Giáng** (hồi 4 giây): ném kiếm lên cao vừa bay vừa lộn vòng, kiếm khựng trên không, lật mũi rồi lao cắm xuống mục
tiêu (cụm bia hoặc mục tiêu gần nhất trong 6 m) theo một tia sáng; 6 kiếm ảnh rơi quanh; nổ diện rộng bán kính 1,8 m (4×, kiếm ảnh 0,7×),
nứt sàn lớn, đá văng; kiếm cắm lại một lúc rồi bay về tay. Tay không thì tung một thanh kiếm ảnh. Nút **Tự động** (phím P): nhân vật tự bay/đi
tới chỗ kỹ năng trúng nhiều mục tiêu nhất (giữa vòng bia khi còn từ 2 bia, nếu không thì hình nộm gần nhất), tự quay mặt, tự tung kỹ
năng và thỉnh thoảng chen một chuỗi chém; người chơi bấm di chuyển thì tay người chơi được ưu tiên.

`knight-3d.html` (three.js 0.147): đi theo hướng camera, Shift chạy, xoay người theo hướng đi, hoạt ảnh đi/chạy/thở/chém
tính theo khung xương mỗi khung hình, đại kiếm gắn vào lòng bàn tay (tay phải hoặc trái), vệt chém, tia lửa, khựng hình,
camera kéo để xoay, lăn để zoom. Kiếm là các tấm ảnh bắt chéo nhau (chưa có mô hình 3D của kiếm).

Mặt trước và mặt sau giống bản vẽ; hai bên hông chỉ có màu nội suy nên mờ hơn. Tay chạm đùi trong mô hình gốc nên khi vung
tay có thể thấy một dải lưới kéo giãn nhỏ ở hông. Dựng lại: `bash 3d/build3d.sh` (cần mạng tới huggingface.co và github.com).

## Tạo lại

```bash
bash projects/azure-wing-armor/build.sh
```

Toạ độ cắt của từng mặt nằm trong `views.py`. Quy trình: mô hình tách nền IS-Net (`@imgly/background-removal-node`) cho mặt nạ ngữ nghĩa → ước lượng nền
gradient của tấm thiết kế và tính khoảng cách màu tới nền (`matte.py`) → ESRGAN-thick 4× (`upscale.mjs`) →
cắt từng mảnh, xoá đường chỉ dẫn/khung chữ/bóng sàn, lấp mặt trong tối của giáp, khử viền màu nền (`pieces.py`)
→ đóng gói sprite, atlas, icon, JSON (`pack.py`).

Chỉ số và hiệu ứng bộ là giá trị mẫu để cân bằng; tấm thiết kế gốc không ghi chỉ số (chữ trên ảnh là chữ giả do AI tạo).
Chưa có góc nghiêng (nhìn ngang): cần thêm một tấm thiết kế góc nghiêng để chạy cùng quy trình.
