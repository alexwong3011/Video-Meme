# Bộ Giáp Cánh Lam (Azure Wing Armor Set)

Tách tấm thiết kế `source/azure-wing-sheet.jpg` thành bộ sprite trong suốt để nhúng vào game.
Mọi pixel lấy trực tiếp từ ảnh gốc (không vẽ lại), nên độ giống bản vẽ là tối đa; chỉ phóng to bằng AI (ESRGAN).

Xem trước: mở `viewer.html` qua một web server tĩnh (`npx serve projects/azure-wing-armor`), vì trang `fetch` JSON.

## Nội dung `assets/`

| Đường dẫn | Mô tả |
|---|---|
| `sprites/@4x/*.png` | 7 sprite (mũ, giáp ngực, giáp chân, 2 găng, 2 giày), phóng 4× bằng ESRGAN-thick, nền trong suốt |
| `sprites/@2x/`, `sprites/@1x/` | Cùng sprite, thu nhỏ có premultiply alpha (không viền đen) |
| `atlas/azure_wing@2x.png/.json` | Atlas 7 sprite, định dạng TexturePacker JSON Hash, có `pivot` |
| `paperdoll/azure_wing_full@{4x,2x}.png` | Toàn bộ giáp đã ráp đúng vị trí bản vẽ |
| `icons/<item>_{256,128,64}.png` | Icon túi đồ nền trong suốt; `icons/framed/` có khung ô đồ |
| `azure_wing_set.json` | 5 món trang bị (ô, tên VI/EN, mô tả, chỉ số mẫu, hiệu ứng bộ) + dữ liệu ráp |

Tên `*_left` / `*_right` theo vị trí **trên ảnh** (găng bên trái ảnh là tay phải nhân vật nhìn thẳng).

### Dữ liệu ráp (`pieces` trong JSON)

- Gốc nhân vật: giữa hai bàn chân, trên mặt sàn; trục y hướng xuống.
- `offset_1x`: vị trí góc trên-trái sprite so với gốc, đơn vị px @1x (nhân 2 hoặc 4 khi dùng @2x/@4x).
- `pivot`: điểm khớp chuẩn hóa 0..1 (cổ cho mũ, ngực, hông, cổ tay, đế giày) để gắn vào xương/slot.
- `z`: thứ tự vẽ (chân 10 → giày 15 → ngực 20 → mũ 30 → găng 40).

### Phaser 3

```js
this.load.atlas('azure', 'atlas/azure_wing@2x.png', 'atlas/azure_wing@2x.json');
// ...
const set = this.cache.json.get('azureSet'), k = 2;
Object.entries(set.pieces).sort((a, b) => a[1].z - b[1].z).forEach(([name, p]) => {
  const [ox, oy] = p.offset_1x, [px, py] = p.pivot, [w, h] = p.size_1x;
  this.add.image(x + (ox + px * w) * k, y + (oy + py * h) * k, 'azure', name).setOrigin(px, py);
});
```

### Unity / Godot

Kéo `sprites/@4x/*.png` vào project (Unity: Texture Type = Sprite, Alpha Is Transparency; Godot: import mặc định).
Đặt pivot của từng sprite = `pivot` trong JSON (Unity: Custom Pivot, lưu ý Unity tính y từ dưới lên → `1 - pivot.y`;
Godot: `Sprite2D.offset = -pivot * size`). Vị trí con so với gốc nhân vật = `offset_1x + pivot * size_1x`.

## Tạo lại

```bash
bash projects/azure-wing-armor/build.sh
```

Quy trình: mô hình tách nền IS-Net (`@imgly/background-removal-node`) cho mặt nạ ngữ nghĩa → ước lượng nền
gradient của tấm thiết kế và tính khoảng cách màu tới nền (`matte.py`) → ESRGAN-thick 4× (`upscale.mjs`) →
cắt từng mảnh, xoá đường chỉ dẫn/khung chữ/bóng sàn, lấp mặt trong tối của giáp, khử viền màu nền (`pieces.py`)
→ đóng gói sprite, atlas, icon, JSON (`pack.py`).

Chỉ số và hiệu ứng bộ là giá trị mẫu để cân bằng; tấm thiết kế gốc không ghi chỉ số (chữ trên ảnh là chữ giả do AI tạo).
Phần bị che khuất trong ảnh gốc (mặt sau, phần giáp chân nằm dưới giáp ngực) không có dữ liệu, nên sprite giữ đúng như góc nhìn chính diện.
