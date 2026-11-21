# Bộ Giáp Cánh Lam (Azure Wing Armor Set)

Tách ba tấm thiết kế `source/azure-wing-sheet.jpg` (giáp mặt trước), `source/azure-wing-sheet-back.jpg` (giáp mặt sau)
và `source/azure-wing-weapon-sheet.jpg` (đại kiếm hai mặt) thành bộ sprite trong suốt để nhúng vào game.
Mọi pixel lấy trực tiếp từ ảnh gốc (không vẽ lại), nên độ giống bản vẽ là tối đa; chỉ phóng to bằng AI (ESRGAN).

Xem trước: mở `viewer.html` qua một web server tĩnh (`npx serve projects/azure-wing-armor`), vì trang `fetch` JSON.

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
