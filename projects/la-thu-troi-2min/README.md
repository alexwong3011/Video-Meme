# Lá Thu Trôi — bản 2 phút

```bash
./build.sh <video-goc.mp4> <La_Thu_Troi.mp3>      # → out/la-thu-troi-2min.mp4 (1080×1608, 30 fps)
cd ../../remotion && npm run dev                   # xem/chỉnh trong Remotion Studio (composition "LaThuTroi")
```

**Nhạc:** giây 157.8 → 277.8 của bài: verse 4 ("Nghe Chiếu ân truyền…") → điệp khúc 2 → đoạn kết
("Hồng diệp nay se trọn kiếp…") → nửa điệp khúc, kết ở "…chẳng vẹn cho một kiếp người". Fade in/out, −14 LUFS.

**Hình (FFmpeg, `montage.py`):** video gốc 10s được nội suy lên 48 fps rồi dựng 14 shot slow-motion
(trời/liễu, toàn cảnh, ghềnh nước, gương mặt, cầu đá, hoa cúc, tà áo, lầu gác, bản lật gương…), mỗi shot có
chuyển động máy (push-in/pull-out/pan), crossfade 1.2s, chỉnh màu, vignette.

**Chữ (Remotion, `remotion/src/LaThuTroi/`):**
- `GoldWord.tsx` — chữ vàng ròng: lớp nổi khối màu đồng + bóng đổ, mặt chữ gradient vàng bóng gương có
  đường chân trời phản chiếu, viền sáng, vệt ánh kim lướt qua khi chữ được hát và lặp lại theo chu kỳ, glow,
  tia sao lóe sáng. Font Playfair Display (OFL).
- `Sparks.tsx` — khi biến mất, mỗi chữ bùng sáng rồi tan thành 12–24 tia sáng li ti + vài ngôi sao lấp lánh
  (có lực cản, trọng lực, nhấp nháy, nguội màu từ trắng → vàng → hổ phách). Tất cả xác định theo seed nên
  render từng khung độc lập vẫn ra đúng.
- `Dust.tsx` — bụi vàng lơ lửng. `timing.ts` — lịch xuất hiện/tan biến theo nhịp hát.

**Lời & thời gian:** `lyrics.txt` (lời gốc) + Whisper word timestamps → `align_lyrics.py` →
`remotion/src/LaThuTroi/lyrics.json` (đã commit; 215/215 âm tiết khớp).
