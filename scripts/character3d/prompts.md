# Prompt mẫu: ảnh dang tay cho mô hình 3D

Thay `{CHARACTER}` bằng một đoạn mô tả nhân vật cố định (dùng đúng một đoạn cho mọi ảnh). Luôn tải ảnh tham chiếu lên cùng prompt, và mỗi lần chỉ tạo một góc nhìn. Chọn khung ảnh dọc (2:3 hoặc 9:16).

## Mô tả nhân vật (ví dụ kỵ sĩ Cánh Lam)

```
A fantasy knight in full plate armor made of overlapping dark violet scale-like plates with fine silver-lilac engraved lines; large tufts of deep blue feathers on both shoulder pauldrons, smaller blue feather tufts on the outer forearms and outer calves; a sleek closed helmet with swept-back fin crests and small blue feathers at the temples, narrow dark visor; slim heroic proportions. Keep every design detail exactly as in the reference image.
```

## A1 · Mặt trước (tạo đầu tiên; tải lên: tấm thiết kế mặt trước)

```
{CHARACTER}

3D modeling reference, front view, facing the camera, orthographic, camera at chest height, no perspective distortion.
Neutral A-pose: arms straight and held 35 degrees away from the body with a clear gap under the armpits, hands open and relaxed, legs straight and shoulder-width apart.
No weapon, no wings, no cape.
Full body from helmet crest to boots, centered, with empty margin around.
Flat even studio lighting, no strong shadows, no glow, no floor, no pedestal, no cast shadow.
Plain light grey background. No text, no labels, no lines, no watermark.
```

## A2 · Nghiêng trái (tải lên: ① front vừa tạo, ② tấm thiết kế nghiêng)

```
{CHARACTER}

3D modeling reference, left side view, exact profile facing left, orthographic, camera at chest height, no perspective distortion.
Neutral A-pose seen from the side: arms straight and slightly away from the body so the torso is not hidden, hands open and relaxed, legs straight.
No weapon, no wings, no cape.
Full body from helmet crest to boots, centered, with empty margin around.
Flat even studio lighting, no strong shadows, no glow, no floor, no pedestal, no cast shadow.
Plain light grey background. No text, no labels, no lines, no watermark.
Same character as the first reference image (the front A-pose view): identical armor plates, helmet, feather placement, proportions and pose. Only the camera angle changes.
```

## A3 · Mặt sau (tải lên: ① front vừa tạo, ② tấm thiết kế mặt sau)

```
{CHARACTER}

3D modeling reference, back view, seen from directly behind, orthographic, camera at chest height, no perspective distortion.
Neutral A-pose: arms straight and held 35 degrees away from the body with a clear gap under the armpits, hands open and relaxed, legs straight and shoulder-width apart.
No weapon, no wings, no cape.
Full body from helmet crest to boots, centered, with empty margin around.
Flat even studio lighting, no strong shadows, no glow, no floor, no pedestal, no cast shadow.
Plain light grey background. No text, no labels, no lines, no watermark.
Same character as the first reference image (the front A-pose view): identical armor plates, helmet, feather placement, proportions and pose. Only the camera angle changes.
```

## Câu sửa lỗi (dán thêm vào cuối prompt rồi tạo lại)

| Lỗi | Câu thêm |
|---|---|
| Thiết kế bị đổi | `Use the uploaded image as the exact design reference. Do not change the armor shapes, colors, helmet crests or the placement of the blue feathers.` |
| Tay dính thân | `The arms must hang 35 degrees away from the torso, with a clear empty gap between each arm and the body from the armpit to the hip.` |
| Nhìn từ trên, méo | `Camera exactly at chest height, orthographic, no perspective, not seen from above, feet and head the same scale.` |
| Bóng, phát sáng | `Flat shadowless lighting like a texture reference sheet. No glow, no bloom, no particles, no smoke, no dramatic light.` |
| Có chữ | `No text, no letters, no numbers, no logos, no labels, no frames anywhere in the image.` |
| Bị cắt đầu hoặc chân | `Show the entire body including the tip of the helmet crests and both boots, with empty space above and below.` |

Vũ khí và cánh không cần tạo lại nếu đã có tấm nhìn thẳng, nền trơn. Trong game chúng được dán thành tấm phẳng gắn vào xương (cách của MU).
