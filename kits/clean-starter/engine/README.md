# Engine

Bản sạch của engine game 3D (three.js 0.160) trong một tệp `index.html`. Bản này đã bỏ mọi tài sản chưa đủ hồ sơ nguồn gốc (xem `../QUARANTINE.md`).

## Chạy thử

Mở bằng một máy chủ tĩnh bất kỳ, ví dụ `npx http-server engine`, rồi vào `http://localhost:8080`. Hoặc đăng lên claude.ai làm artifact; khi đó lưu game trên mây qua `claude.use('db')`.

Kiểm thử không giao diện:
```
npm i three@0.160.0 --prefix /tmp/three160
node tools/check.js snippet.js /tmp/shots --class fire      # snippet.js: thân một hàm async (pg, shot); dùng __T và __sim
node tools/pack_dps.js                                         # đo thời gian diệt bầy quái
```

## Chạy được ngay với tài sản sạch

- **Nhân vật:** không có mô hình kỵ sĩ, nên engine dùng nhân vật dự phòng: người mẫu Quaternius (CC0) với giáp và kiếm dựng bằng code. Muốn dùng nhân vật 3D riêng: tạo bằng `../pipeline/` rồi đặt `assets/meshy/knight.gltf.json` (và `base_greek.gltf.json` cho thân trần).
- **Boss:** 10 boss 3D sạch nằm trong `assets/meshy/boss/`.
- **Ảnh thiếu:** icon trang bị, cánh, mảnh giáp đều không có trong bộ sạch. Ô ảnh thiếu tự ẩn; thay bằng tài sản mới của dự án.

## Phải đổi trước khi phát hành

- `const MAXLV` (đang đánh dấu `GAME_CONFIG`).
- Tên game ở `<title>`, thẻ `<h1>` màn hình chọn nhân vật, và câu chào trong `log(...)`.
- Nền giao diện: các biến CSS `--wall`, `--band`, `--hiero`, `--sun`.
