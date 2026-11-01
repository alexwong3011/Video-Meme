# Lá Thu Trôi — MV đầy đủ (5:06, 1080×1920)

Dựng từ 4 ảnh concept (cung đình với thị nữ cầm đèn lồng, bờ suối thả lá phong đỏ, bến thuyền, cầu đá)
và clip 10s nhân vật đi qua cầu. Không phụ đề.

```bash
./build.sh <thu-muc-anh> <La_Thu_Troi.mp3> <walk-48fps.mp4>     # → out/la-thu-troi-mv.mp4
cd ../../remotion && npm run dev                                   # chỉnh trong Studio: composition "LaThuTroiMV"
```

## Cách tạo "cảnh mới" từ 4 ảnh
- **2.5D parallax:** tách nhân vật khỏi nền (`cutout.mjs`, IMG.LY), lấp nền phía sau bằng push-pull
  (`prep_assets.py`), rồi cho lớp nhân vật và lớp nền chuyển động khác nhau → có chiều sâu.
- **Nhiều khung hình từ một ảnh:** mỗi ảnh được dùng ở nhiều cỡ cảnh (toàn, trung, cận mặt, cận chiếc lá,
  đèn lồng, mái ngói, mặt nước…) với chuyển động máy riêng.
- **Thời điểm & thời tiết khác nhau** (`grades.ts`): bình minh, nắng vàng, hoàng hôn, đêm cung khuya (đèn lồng
  sáng lên), mưa, mộng ảo, chiều tà.
- **Không khí** (`Overlays.tsx`): lá phong/bạch quả rơi xoay 3D, mưa, tia nắng, sương, lấp lánh trên mặt nước,
  bụi vàng; tiêu đề vàng ròng tan thành tia sáng (dùng lại `GoldWord`).

## Kịch bản (`remotion/src/LaThuTroiMV/scenes.ts`, cắt cảnh theo nhịp — 86 BPM)
| Đoạn | Thời gian | Cảnh |
|---|---|---|
| Intro | 0:00 | Bình minh cung đình, tiêu đề |
| Verse 1 | 0:24 | Đêm cung khuya, đèn lồng · bờ suối thả lá |
| Verse 2 | 0:45 | Đèn thư phòng · bến thuyền hoàng hôn |
| Chorus 1 | 1:05 | Nắng vàng: qua cầu, suối, thuyền, cung đình |
| Bridge | 1:58 | Mộng ảo, bão lá vàng |
| Verse 3 | 2:15 | Mưa — "cách tầng mưa" |
| Verse 4 | 2:37 | Chiếu ân: ánh sáng trở lại, bước qua cầu, xuôi bến cũ |
| Chorus 2 | 3:02 | Cao trào |
| Outro 1 | 3:50 | "Chạm bàn tay… hồng diệp" — cận chiếc lá đỏ |
| Half chorus | 4:12 | Đêm thâm cung · tường hoa |
| Outro 2 | 4:37 | Chiều tà, lá trôi xa, tiêu đề kết |
