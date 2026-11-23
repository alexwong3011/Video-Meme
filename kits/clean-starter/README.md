# Bộ khởi đầu sạch

Nguyên liệu đã lọc từ dự án ASTROPOLIS để dựng một game mới: engine 3D chạy được, dữ liệu cân bằng, boss 3D, prompt, quy trình tạo nhân vật 3D, quy trình phát triển và Sổ nguồn gốc tài sản.

Mọi thứ ở đây đã qua rà soát theo **Bộ quy chế chống đạo nhái v1.0**. Những gì chưa đủ hồ sơ nguồn gốc đều bị loại và liệt kê trong `QUARANTINE.md`.

Bắt đầu đọc từ **`HANDOFF.md`**.

## Nội dung

| Đường dẫn | Là gì |
|---|---|
| `HANDOFF.md` | Tệp chuyển giao A–Z cho dự án mới, kèm liên kết |
| `PROCESS.md` | Quy trình phát triển: vai trò, giai đoạn, Cổng IP, vòng làm tính năng, tạo tài sản, cân bằng, phát hành |
| `SNG.csv` | Sổ nguồn gốc tài sản (mẫu BM-01) cho mọi thứ trong bộ này |
| `QUARANTINE.md` | Tài sản của dự án cũ không được mang sang, lý do và điều kiện mở |
| `NOTICE.md` | Giấy phép bên thứ ba để đưa vào game |
| `engine/` | Engine game một tệp (`index.html`), công cụ kiểm thử (`tools/check.js`, `tools/pack_dps.js`), tài sản sạch (`assets/`) |
| `data/` | Bảng dữ liệu tách từ engine: `balance.json`, `classes.json`, `items.json`, `world.json` |
| `tools/extract_data.js` | Xuất lại `data/` từ engine |
| `prompts/` | Prompt tạo tài sản (chỉ chữ) |
| `pipeline/` | Quy trình concept 2D → nhân vật 3D có xương, ngón tay, hoạt ảnh (Meshy API) |
| `skills/character-3d-pipeline/` | Skill Claude cho quy trình trên (chép vào `.claude/skills/` của dự án mới) |
| `docs/SYSTEMS.md` | Catalog hệ thống của engine kèm lý do thiết kế |
| `docs/market-research.html` | Báo cáo thị trường ngày 22/11/2026 |
