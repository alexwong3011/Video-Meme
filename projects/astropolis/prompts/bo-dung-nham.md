# Prompt Grok: Bộ Dung Nham

Mỗi lần tạo chỉ một ảnh, khung 16:9. Luôn tải ảnh mẫu lên cùng prompt. Ảnh mẫu là bộ Cánh Lam đã xóa chữ: Grok giữ đúng vị trí và kích thước từng món, nhờ đó các mảnh ghép khớp với hình nhân trong game.

## Mô tả bộ (dùng chung, giữ nguyên trong mọi prompt)

```
LAVA KNIGHT armor set: heavy overlapping plates of black obsidian and dark basalt with a rough, cooled-lava surface; glowing orange-yellow molten cracks and veins running through every plate; edges trimmed with dark bronze. Instead of feathers: short jagged flame-shaped spikes of cooled magma on both shoulder pauldrons, the outer forearms and the outer calves. Closed helmet with two swept-back curved obsidian horns and a narrow glowing ember visor slit. A molten core gem glowing in the middle of the chest. Clawed gauntlets, heavy boots with spiked toe caps. Palette: black, charcoal, dark bronze, glowing orange #ff7a1a with yellow-hot cracks. No blue, no feathers.
```

## 1 · Bộ giáp (tải lên: `ref-armor-layout.jpg`)

```
{MÔ TẢ BỘ}

Use the uploaded image only as a layout reference: the same exploded armor-set presentation with every piece in exactly the same position, size, angle and proportions — helmet floating at the top, chestplate with pauldrons in the middle, the leggings below it, one gauntlet standing on each side, the two boots at the bottom. Redesign every piece in the Lava Knight style described above; do not keep any of the reference's colors or feathers.
Front view, orthographic, camera straight on, no perspective distortion.
Plain flat dark charcoal background, no grid, no floor, no shadow, no reflection.
No text, no title, no labels, no panels, no leader lines, no watermark.
Every piece fully visible, not cropped, not overlapping another piece. Even studio light, crisp details.
```

## 2 · Đại kiếm (tải lên: `ref-weapon-layout.jpg`)

```
LAVA KNIGHT greatsword: a long curved blade of black obsidian with glowing orange-yellow molten cracks along it and a bright molten cutting edge; crossguard of dark bronze shaped like jagged flames and short curved horns, with a glowing molten gem in its center; grip wrapped in dark leather; spiked bronze pommel. Palette: black, dark bronze, glowing orange #ff7a1a. No blue, no feathers.

Use the uploaded image only as a layout reference: two views of the same sword side by side (front view on the left, back view on the right), each hanging point down, pommel at the top, in exactly the same position, size, curve and angle as the reference. Redesign the sword in the Lava Knight style; do not keep the reference's colors or feathers.
Orthographic, camera straight on. Plain flat dark charcoal background, no floor, no shadow, no reflection.
No text, no title, no labels, no leader lines, no watermark. Both swords fully visible, not cropped.
```

## Câu sửa lỗi (dán thêm vào cuối prompt rồi tạo lại)

| Lỗi | Câu thêm |
|---|---|
| Lệch vị trí hoặc kích thước món | `Match the reference layout exactly: same position and size for every piece, same pose of the gauntlets and boots.` |
| Còn lông vũ hoặc màu xanh | `Replace every feather with jagged flame-shaped magma spikes. No blue anywhere.` |
| Có chữ, khung, đường chỉ | `No text, no letters, no frames, no lines anywhere in the image. Only the armor pieces on a plain background.` |
| Lửa cháy, khói che mất món | `The glow stays inside the cracks of the plates. No fire, no smoke, no particles around the pieces.` |
| Các món dính vào nhau | `Keep a clear gap of background around every piece; no piece touches another.` |
| Bị cắt mép | `Show every piece entirely, with empty margin around the whole set.` |

Khi có ảnh, gửi lại cho Claude: tôi tách nền, cắt từng mảnh, khớp vị trí với hình nhân Cánh Lam, làm icon và đưa vào game làm hình thật cho Bộ Dung Nham.
