# Lá Thu Trôi — clip 30 giây

Kéo dài video gốc 10 giây thành 30 giây, lồng đoạn hook của bài "Lá Thu Trôi" và phụ đề karaoke.

```bash
./build.sh <video-goc.mp4> <La_Thu_Troi.mp3> [out.mp4]   # mặc định: ../../out/la-thu-troi-30s.mp4
HOOK_START=178.4 ./build.sh ...                         # đổi đoạn nhạc (giây trong bài)
```

- **Hình:** nội suy chuyển động 24→48 fps (minterpolate) để slow-motion mượt, rồi dựng 3 shot:
  toàn cảnh 0.8× → cận cảnh bám theo nhân vật 0.5× → cầu đá (lật gương) 0.5×, chuyển cảnh crossfade 1s,
  chỉnh màu nhẹ, vignette, fade in/out. Xuất 1080×1608 @30fps, H.264.
- **Nhạc:** 67.4s → 97.4s của bài = 5 câu đầu điệp khúc 1 ("Một chiếc lá nghiêng…" → "…rối tơi bời"),
  fade in/out, chuẩn hoá −14 LUFS, AAC 256k.
- **Phụ đề:** lời lấy từ metadata của file MP3; thời điểm từng âm tiết lấy bằng faster-whisper (small)
  → `lyrics.json` (giờ trong bài) → `make_ass.py` sinh `.ass` karaoke (chữ chuyển kem → vàng theo nhịp hát).
- **Font:** Cormorant Garamond (SIL OFL), trong `fonts/`.
