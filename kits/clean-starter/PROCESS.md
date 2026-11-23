# Quy trình phát triển game

Quy trình dùng cho mọi dự án dựng từ bộ khởi đầu này. Nó nối ba nguồn: **bộ dữ liệu sạch** (thư mục này), **bộ kỹ năng làm game** (skill, công cụ, quy trình tạo tài sản) và **Bộ quy chế chống đạo nhái v1.0** (Cổng IP, Sổ nguồn gốc). Áp dụng mức "indie" của Phụ lục B quy chế.

## 1. Vai trò

| Vai trò | Ai | Trách nhiệm |
|---|---|---|
| Giám đốc dự án, Người phụ trách IP | Chủ dự án | Duyệt ý tưởng, ký Cổng IP, giữ tài khoản (GitHub, Meshy, cửa hàng), quyết định khi có rủi ro |
| Kỹ sư, kỹ thuật mỹ thuật, QA tự động | Claude | Viết mã, chạy quy trình tạo tài sản, kiểm thử không giao diện, cập nhật sổ và tài liệu |
| Họa sĩ (thuê ngoài) | Freelancer | Tài sản cốt lõi: logo, key art, concept nhân vật chính, nhạc chủ đề (Điều 29) |
| Người tự đánh giá tương đồng | Người không làm ra tài sản đó | Rà soát lần 2 trước phát hành (mục II.4) |
| Luật sư | Theo vụ việc | Các trường hợp ở Điều 8; rà soát hợp đồng mẫu BM-04/05 |

## 2. Các giai đoạn và Cổng IP

| Giai đoạn | Đầu ra | Cổng | Điều kiện qua cổng |
|---|---|---|---|
| **0. Ý tưởng** | Một trang pitch: thể loại, người chơi mục tiêu, 3 điểm khác biệt, danh sách game tham khảo | G0 | Tên làm việc riêng (không dùng tên game khác); kiểm tra trùng tên sơ bộ |
| **1. Tiền sản xuất** | Bản chơi thử dọc (vertical slice) từ engine sạch: 1 vùng, 1–2 lớp, quái, 1 boss | **G1** (bắt buộc) | `SNG.csv` có mọi tài sản của bản thử; báo cáo phân tích đối thủ dạng trừu tượng (Điều 11); tự đánh giá tương đồng lần 1; danh sách giấy phép mã nguồn mở |
| **2. Sản xuất** | Từng tính năng theo bảng công việc | G2 (rút gọn) | Mỗi mốc: sổ cập nhật 100%; không có mục "chưa rõ nguồn" quá 30 ngày |
| **3. Trước phát hành** | Bản app (Capacitor), hồ sơ cửa hàng, giấy phép tại Việt Nam | **G3** (bắt buộc) | Checklist BM-03 G3: sổ "Đã xác minh" 100%, tự đánh giá lần 2 không còn mục đỏ, tệp NOTICE, khai báo AI, đơn nhãn hiệu đã nộp |
| **4. Vận hành** | Bản cập nhật, sự kiện | G4 (rút gọn) | Sổ cho nội dung mới |

Không qua cổng thì không chuyển giai đoạn. Ngoại lệ phải được Giám đốc duyệt bằng văn bản, kèm hạn khắc phục.

## 3. Vòng làm một tính năng

1. **Ghi việc** vào bảng công việc (dashboard), kèm tài nguyên cần (credit Meshy, ảnh concept…).
2. **Bắt đầu**: bấm "Bắt đầu làm" hoặc nhắn Claude. Claude trình bày kế hoạch; Giám đốc duyệt.
3. **Làm** trên nhánh làm việc. Bảng số liệu mới phải xây từ mô hình riêng, không chép bảng của game khác (Điều 10.6).
4. **Kiểm thử tự động**: chạy `engine/tools/check.js` với đoạn kịch bản cho tính năng, xem ảnh chụp, đọc lỗi console. Thay đổi cân bằng thì chạy thêm `engine/tools/pack_dps.js`.
5. **Đăng bản dev**, rồi bản test (bản sao có tiêu đề "… Test").
6. **Cập nhật hồ sơ**: `SNG.csv` cho tài sản mới, `NOTES.md` cho cách làm, bảng công việc cho trạng thái.
7. **Commit và push.** Mỗi commit mô tả vì sao thay đổi. Lịch sử Git là chứng cứ sáng tạo độc lập (Điều 13), không được viết lại hay xoá.

**Xong** nghĩa là: chạy được trên trình duyệt điện thoại, không có lỗi console, có ảnh chụp kiểm tra, sổ và ghi chú đã cập nhật, đã push.

## 4. Quy trình tạo tài sản

```
Ý tưởng tài sản
  → Có phải tài sản cốt lõi (logo, tên, nhân vật chính, key art, nhạc chủ đề)?
       Có  → họa sĩ làm (hợp đồng chuyển nhượng quyền, BM-05); AI chỉ dùng để phác ý tưởng nội bộ
       Không → được dùng AI (Meshy) theo các bước dưới
  → Viết prompt: chỉ mô tả bằng lời; KHÔNG có tên họa sĩ, tên game, tên nhân vật, thương hiệu (Điều 27.1)
  → Ảnh tham chiếu (nếu Image-to-Image): chỉ dùng ảnh của chính dự án, đã có trong sổ (Điều 27.2)
  → Tạo bằng script trong pipeline/ (gen_boss.py, gen_sheet.py, gen_views.py, run_pipeline.py)
  → Kiểm tra: tìm ngược ảnh, không watermark/logo/chữ ký; so silhouette với game nổi tiếng nếu là trang bị biểu tượng
  → Chỉnh sửa của con người (cắt, gắn xương, vẽ lại texture…): lưu file trước và sau
  → Ghi SNG.csv: nguồn "AI hỗ trợ", công cụ, prompt, trạng thái; BM-09 nếu là tài sản quan trọng
  → Mới được đưa vào bản build
```

Quy trình nhân vật 3D chi tiết: `pipeline/README.md` và skill `skills/character-3d-pipeline/SKILL.md`.

Tài sản bên thứ ba (asset mua, CC, mã nguồn mở) theo Điều 14–19:
- Chỉ dùng CC0, CC BY (có ghi công), MIT, BSD, Apache, OFL.
- Không dùng CC BY-NC, và không dùng tài nguyên "miễn phí" không ghi giấy phép.

## 5. Cân bằng

- Đặt mục tiêu bằng con số trước: thời gian diệt một bầy quái, số phút để lên một cấp, số lần chết mỗi giờ.
- Viết công thức trong engine và giữ tham số ở dạng hằng có tên. Sau đó xuất lại `data/*.json` bằng `tools/extract_data.js`.
- Đo bằng `engine/tools/pack_dps.js`. Ghi kết quả đo vào ghi chú, kèm ngày.

## 6. Phát hành

Lộ trình 9 tuần lên App Store và Google Play (Capacitor bọc engine web): xem trang kế hoạch phát hành trong `HANDOFF.md`. Hai điều phải làm sớm vì cần chờ:
- nộp đơn nhãn hiệu tên game;
- hồ sơ giấy phép trò chơi tại Việt Nam (G1 hoặc G2 theo Nghị định 147/2024).

## 7. Quy tắc nhanh

**Được:**
- dùng chuẩn thể loại (cường hoá +1…+15, set đồ, tự đánh, boss thế giới, thanh máu…);
- học vòng lặp và động lực người chơi của nhiều game;
- lấy mỹ thuật từ thần thoại, lịch sử, thiên nhiên.

**Không được:**
- dùng tên game khác làm tên làm việc trong mã hay tài liệu;
- chép con số đặc trưng của game khác (cấp tối đa, bảng giá, tỉ lệ rơi);
- cắt ảnh không rõ nguồn đưa vào game;
- dùng chữ "MU" hay tên game khác trong quảng cáo và từ khoá cửa hàng;
- giới thiệu bot như người chơi thật;
- để kho mã ở chế độ công khai khi đã có bí mật kinh doanh.
