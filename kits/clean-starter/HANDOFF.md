# Chuyển giao: bộ khởi đầu sạch cho dự án game mới

Tệp này đủ để khởi động một dự án game mới trong một phiên Claude hoàn toàn mới. Đọc theo thứ tự từ trên xuống.

- **Nguồn:** kho `alexwong3011/Video-Meme`, nhánh `claude/sharp-goodall-ay56hb`, thư mục `kits/clean-starter/`
- **Ngày đóng gói:** 23/11/2026
- **Căn cứ rà soát:** Bộ quy chế chống đạo nhái và tuân thủ bản quyền v1.0

## 1. Lưu ý trước khi dùng

1. **Kho mã đang ở chế độ công khai.** Bộ khởi đầu không chứa bí mật, nhưng dự án mới phải dùng **kho riêng tư** ngay từ đầu (quy chế Điều 31).
2. **Nhánh có thể thay đổi.** Các liên kết dưới đây trỏ vào nhánh làm việc. Hãy chép cả thư mục sang kho mới ngay trong phiên đầu tiên, đừng phụ thuộc vào liên kết lâu dài.
3. **Không lấy gì từ `projects/astropolis/` hay `projects/azure-wing-armor/`** ngoài những thứ đã có trong bộ này. Danh sách bị loại: `QUARANTINE.md`.

## 2. Liên kết bộ khởi đầu

Gốc thư mục: https://github.com/alexwong3011/Video-Meme/tree/claude/sharp-goodall-ay56hb/kits/clean-starter

| Thành phần | Liên kết |
|---|---|
| Mục lục | https://github.com/alexwong3011/Video-Meme/blob/claude/sharp-goodall-ay56hb/kits/clean-starter/README.md |
| Quy trình phát triển | https://github.com/alexwong3011/Video-Meme/blob/claude/sharp-goodall-ay56hb/kits/clean-starter/PROCESS.md |
| Sổ nguồn gốc tài sản | https://github.com/alexwong3011/Video-Meme/blob/claude/sharp-goodall-ay56hb/kits/clean-starter/SNG.csv |
| Tài sản bị loại | https://github.com/alexwong3011/Video-Meme/blob/claude/sharp-goodall-ay56hb/kits/clean-starter/QUARANTINE.md |
| Giấy phép bên thứ ba | https://github.com/alexwong3011/Video-Meme/blob/claude/sharp-goodall-ay56hb/kits/clean-starter/NOTICE.md |
| Engine (mã sạch) | https://github.com/alexwong3011/Video-Meme/blob/claude/sharp-goodall-ay56hb/kits/clean-starter/engine/index.html |
| Hướng dẫn engine | https://github.com/alexwong3011/Video-Meme/blob/claude/sharp-goodall-ay56hb/kits/clean-starter/engine/README.md |
| Công cụ kiểm thử | https://github.com/alexwong3011/Video-Meme/tree/claude/sharp-goodall-ay56hb/kits/clean-starter/engine/tools |
| Boss 3D sạch (10 boss) | https://github.com/alexwong3011/Video-Meme/tree/claude/sharp-goodall-ay56hb/kits/clean-starter/engine/assets/meshy/boss |
| Nhân vật dự phòng (CC0) | https://github.com/alexwong3011/Video-Meme/blob/claude/sharp-goodall-ay56hb/kits/clean-starter/engine/assets/hero.json |
| Icon bình máu, mana | https://github.com/alexwong3011/Video-Meme/tree/claude/sharp-goodall-ay56hb/kits/clean-starter/engine/assets/equip/items |
| Dữ liệu cân bằng | https://github.com/alexwong3011/Video-Meme/blob/claude/sharp-goodall-ay56hb/kits/clean-starter/data/balance.json |
| Lớp nhân vật, kỹ năng | https://github.com/alexwong3011/Video-Meme/blob/claude/sharp-goodall-ay56hb/kits/clean-starter/data/classes.json |
| Vật phẩm, bộ đồ, thú | https://github.com/alexwong3011/Video-Meme/blob/claude/sharp-goodall-ay56hb/kits/clean-starter/data/items.json |
| Bản đồ, boss, tên bot | https://github.com/alexwong3011/Video-Meme/blob/claude/sharp-goodall-ay56hb/kits/clean-starter/data/world.json |
| Công cụ tách dữ liệu | https://github.com/alexwong3011/Video-Meme/blob/claude/sharp-goodall-ay56hb/kits/clean-starter/tools/extract_data.js |
| Catalog hệ thống | https://github.com/alexwong3011/Video-Meme/blob/claude/sharp-goodall-ay56hb/kits/clean-starter/docs/SYSTEMS.md |
| Prompt tạo tài sản | https://github.com/alexwong3011/Video-Meme/tree/claude/sharp-goodall-ay56hb/kits/clean-starter/prompts |
| Quy trình nhân vật 3D | https://github.com/alexwong3011/Video-Meme/tree/claude/sharp-goodall-ay56hb/kits/clean-starter/pipeline |
| Skill nhân vật 3D | https://github.com/alexwong3011/Video-Meme/blob/claude/sharp-goodall-ay56hb/kits/clean-starter/skills/character-3d-pipeline/SKILL.md |
| Báo cáo thị trường | https://github.com/alexwong3011/Video-Meme/blob/claude/sharp-goodall-ay56hb/kits/clean-starter/docs/market-research.html |

Tải nguyên thư mục: `git clone --branch claude/sharp-goodall-ay56hb --depth 1 https://github.com/alexwong3011/Video-Meme.git` rồi lấy `kits/clean-starter/`.

## 3. Tài liệu tham chiếu trên claude.ai

Các trang này ở chế độ riêng tư. Một phiên Claude đăng nhập cùng tài khoản đọc được bằng `Artifact` với `action: "read"`.

| Tài liệu | Liên kết | Dùng để |
|---|---|---|
| Bộ quy chế chống đạo nhái v1.0 | https://claude.ai/code/artifact/e4a1324c-665d-4921-9413-1b3b83c1c36e | Luật chơi về bản quyền cho mọi giai đoạn |
| Rà soát IP dự án cũ | https://claude.ai/artifact/TCQ53r1v34Pofin1k1CnP5 | Hiểu vì sao các tài sản bị loại; mẫu cho lần rà soát sau |
| Kế hoạch phát hành App Store và Google Play | https://claude.ai/artifact/LUMStt3eGxsGy3humXUDMi | Lộ trình 9 tuần, quyết định cần chốt, mốc của cửa hàng |
| Báo cáo thị trường | https://claude.ai/artifact/WjFtGqegFnh3oE8xmFB9r4 | Đối thủ, xếp hạng, định vị |

## 4. Khởi tạo dự án mới (A–Z)

1. **Tạo kho GitHub riêng tư** cho dự án mới.
2. **Mở phiên Claude mới** với kho mới, và cho phép đọc thêm kho `alexwong3011/Video-Meme`.
3. **Dán lời nhắn khởi động** ở mục 5.
4. Claude chép `kits/clean-starter/` vào kho mới theo bố cục sau:
   - `engine/` → `game/`
   - `pipeline/` → `scripts/character3d/` (giữ tên này để skill chạy đúng)
   - `skills/character-3d-pipeline/` → `.claude/skills/character-3d-pipeline/`
   - `data/`, `prompts/`, `docs/`, `tools/`, `SNG.csv`, `NOTICE.md`, `PROCESS.md`, `QUARANTINE.md` giữ nguyên tên ở gốc kho
5. **Khoá API Meshy:** Claude yêu cầu thêm khoá cho host `api.meshy.ai` qua biểu mẫu bảo mật của môi trường. Không dán khoá vào chat hay tệp.
6. **Cổng G0:** viết một trang pitch:
   - tên làm việc mới (đã kiểm tra trùng sơ bộ);
   - thể loại, người chơi mục tiêu;
   - 3 điểm khác biệt;
   - danh sách game tham khảo.
7. **Chọn lại các giá trị phải đổi:**
   - `MAXLV`;
   - tên game ở `<title>`, màn hình chọn nhân vật, câu chào;
   - nền giao diện (biến CSS `--wall`, `--band`, `--hiero`, `--sun`).
8. **Tài sản cốt lõi:** thuê họa sĩ cho logo, key art và concept nhân vật chính (hợp đồng chuyển nhượng quyền theo mẫu BM-05 của quy chế). Từ concept đó, dựng nhân vật 3D bằng `scripts/character3d/` và ghi `SNG.csv`.
9. **Bản chơi thử dọc → Cổng G1:**
   - sổ đầy đủ;
   - báo cáo phân tích đối thủ dạng trừu tượng;
   - tự đánh giá tương đồng lần 1;
   - danh sách giấy phép.
10. **Sản xuất** theo vòng tính năng trong `PROCESS.md` mục 3.
11. **Trước phát hành → Cổng G3:**
    - đơn nhãn hiệu đã nộp;
    - tệp NOTICE có trong game;
    - khai báo AI;
    - tự đánh giá lần 2 do người khác thực hiện;
    - hồ sơ giấy phép trò chơi tại Việt Nam.

## 5. Lời nhắn khởi động cho phiên mới

Dán nguyên khối dưới đây vào phiên Claude mới:

```
Tôi bắt đầu một dự án game mới từ bộ khởi đầu sạch.
Hãy thêm kho alexwong3011/Video-Meme (quyền đọc) và đọc kits/clean-starter/HANDOFF.md trên nhánh claude/sharp-goodall-ay56hb.
Sau đó:
1. Đọc README.md, PROCESS.md, QUARANTINE.md, SNG.csv và docs/SYSTEMS.md trong kits/clean-starter/.
2. Đọc Bộ quy chế chống đạo nhái tại https://claude.ai/code/artifact/e4a1324c-665d-4921-9413-1b3b83c1c36e
3. Chép bộ khởi đầu vào kho này theo mục 4 bước 4 của HANDOFF.md, chạy thử game/tools/check.js, rồi commit.
4. Không lấy bất cứ tài sản nào khác từ projects/astropolis hay projects/azure-wing-armor.
5. Trình bày cho tôi kế hoạch Cổng G0 (pitch, tên làm việc, điểm khác biệt) trước khi viết thêm mã.
Trả lời tôi bằng tiếng Việt.
```

## 6. Checklist chuyển giao

- [ ] Kho mới ở chế độ riêng tư
- [ ] Đã chép đủ thư mục bộ khởi đầu, chạy `game/tools/check.js` không lỗi
- [ ] Skill `character-3d-pipeline` có trong `.claude/skills/`
- [ ] Khoá Meshy đã thêm qua biểu mẫu bảo mật
- [ ] `SNG.csv` mang sang và tiếp tục cập nhật
- [ ] Đã đổi `MAXLV`, tên game, nền giao diện
- [ ] Đã chọn người làm tài sản cốt lõi (họa sĩ)
- [ ] Đã đọc quy chế và trang kế hoạch phát hành
