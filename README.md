# Video-Meme

Bộ công cụ tạo, chỉnh sửa, làm hoạt ảnh và render video bằng code:

| Công cụ | Vai trò | Thư mục |
|---|---|---|
| [HyperFrames](https://hyperframes.heygen.com) `0.8.223` | Viết video bằng HTML/CSS + GSAP → MP4 | `hyperframes/` |
| [Remotion](https://www.remotion.dev) `4.0.539` | Viết video bằng React/TypeScript → MP4 | `remotion/` |
| [FFmpeg](https://ffmpeg.org) `≥ 6` | Ghép, chuyển cảnh, thêm nhạc, phụ đề, xuất dọc/GIF/WebM | `scripts/ffmpeg-tools.sh` |

## Yêu cầu

- Node.js **≥ 22** (HyperFrames yêu cầu)
- FFmpeg + FFprobe (có libx264, aac, libass, freetype)
- Chrome Headless Shell (cả HyperFrames và Remotion dùng để chụp khung hình)

## Cài đặt

```bash
npm run setup     # cài FFmpeg (apt/brew) nếu thiếu, deps Remotion, headless browser, HyperFrames CLI
npm run verify    # kiểm tra end-to-end: render cả 2 demo + toàn bộ pipeline FFmpeg
```

`verify` in ra danh sách ✓/✗ và để video mẫu trong `out/`
(`hyperframes-demo.mp4`, `remotion-demo.mp4`, `final.mp4`, `vertical.mp4`, `captioned.mp4`, `final.webm`, `preview.gif`).

> **Trình duyệt headless:** `scripts/env.sh` tự tìm Chrome Headless Shell có sẵn (ví dụ của Playwright tại
> `/opt/pw-browsers`) và đặt `HYPERFRAMES_BROWSER_PATH` / `REMOTION_BROWSER_EXECUTABLE`. Nếu không có,
> HyperFrames dùng Chrome hệ thống còn Remotion tự tải trình duyệt của nó.

## Sử dụng

### HyperFrames (HTML → video)

```bash
npm run hf:preview   # studio xem trước trong trình duyệt
npm run hf:check     # lint + runtime + layout + motion + contrast
npm run hf:render    # → out/hyperframes.mp4
```

Sửa `hyperframes/index.html`. Quy tắc chính có trong `hyperframes/CLAUDE.md`. GSAP được để sẵn tại
`hyperframes/assets/vendor/gsap.min.js` để render không cần mạng.

Để Claude Code dùng các skill của HyperFrames: `cd hyperframes && npx hyperframes skills update`, rồi khởi động lại phiên.

### Remotion (React → video)

```bash
npm run rm:studio    # Remotion Studio
npm run rm:render    # → out/remotion.mp4
```

Composition nằm ở `remotion/src/MemeIntro.tsx`, đăng ký trong `remotion/src/Root.tsx`.

### FFmpeg (hậu kỳ)

```bash
npm run ff -- concat    out.mp4 a.mp4 b.mp4 ...   # ghép nối (chuẩn hóa 1920x1080@30)
npm run ff -- xfade     out.mp4 a.mp4 b.mp4 0.5   # chuyển cảnh crossfade
npm run ff -- add-audio out.mp4 video.mp4 nhac.mp3  # thêm nhạc, chuẩn hóa -14 LUFS
npm run ff -- caption   out.mp4 in.mp4 "CHỮ MEME" # chữ meme phía trên
npm run ff -- subtitles out.mp4 in.mp4 sub.srt    # gắn phụ đề cứng
npm run ff -- vertical  out.mp4 in.mp4            # 9:16 cho TikTok/Reels/Shorts
npm run ff -- gif       out.gif in.mp4 480 12     # GIF chất lượng cao
npm run ff -- webm      out.webm in.mp4           # VP9/Opus cho web
npm run ff -- probe     in.mp4                    # thông tin file
```

## Dự án

- [`projects/la-thu-troi`](projects/la-thu-troi): clip nhạc 30s — kéo dài video, lồng hook, phụ đề karaoke.
- [`projects/la-thu-troi-2min`](projects/la-thu-troi-2min): bản 2 phút — 14 shot slow-motion, chữ vàng ròng tan thành tia sáng (Remotion).
- [`projects/la-thu-troi-mv`](projects/la-thu-troi-mv): MV đầy đủ 5:06 — 47 cảnh 2.5D từ 4 ảnh concept, cắt theo nhịp.

## Thành phần tùy chọn (chưa cài)

`npx hyperframes doctor` liệt kê thêm: **whisper.cpp** (tạo transcript/phụ đề tự động),
**Kokoro** (TTS cục bộ: `pip install kokoro-onnx soundfile`), **MusicGen** (nhạc nền:
`pip install transformers torch soundfile numpy`) và **Docker** (render đóng gói với `--docker`).
