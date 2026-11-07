# Social Heat: đo sức nóng và mức độ nghiêm trọng của vấn đề trên mạng

Công cụ nội bộ để:
- thu thập bài viết, video, bình luận về các chủ đề bạn theo dõi trên **Facebook, TikTok, Threads** và **báo điện tử**;
- tính hai chỉ số **Sức nóng** và **Nghiêm trọng** (0–100) cho từng chủ đề;
- hiển thị kết quả trên **dashboard nội bộ**, gửi **cảnh báo Telegram** khi có khủng hoảng hoặc tăng đột biến.

---

## 1. Cài đặt (máy chạy công cụ: Windows/macOS/Linux, Python ≥ 3.11)

```bash
cd social-heat
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
playwright install chromium        # tải trình duyệt dùng để crawl
cp config.example.toml config.toml # rồi chỉnh config.toml
```

**Xem thử dashboard ngay bằng dữ liệu giả lập (chưa cần crawl):**
```bash
python -m socialheat demo --serve   # mở http://127.0.0.1:8800
```
Dữ liệu mẫu nằm riêng ở `data/demo/`, tên chủ đề có tiền tố `[MẪU]`.

## 2. Đăng nhập các mạng xã hội (bắt buộc với Facebook và Threads, nên có với TikTok)

Tìm kiếm bài viết trên Facebook và Threads đòi hỏi tài khoản đã đăng nhập. **Hãy dùng tài khoản phụ** dành riêng cho việc theo dõi,
không dùng tài khoản cá nhân chính, vì nền tảng có thể khóa tài khoản crawl nhiều.

Cách 1: trên máy có màn hình:
```bash
python -m socialheat login facebook   # cửa sổ trình duyệt mở ra → đăng nhập → quay lại terminal nhấn Enter
python -m socialheat login threads
python -m socialheat login tiktok
```

Cách 2: trên server không có màn hình: dùng extension **Cookie-Editor** trên trình duyệt của bạn,
vào facebook.com, chọn *Export → JSON*, lưu thành file rồi:
```bash
python -m socialheat import-cookies facebook fb_cookies.json
```

Phiên đăng nhập được lưu ở `data/sessions/*.json`. Hãy giữ kín thư mục này vì nó tương đương mật khẩu.

## 3. Khai báo chủ đề

Trên dashboard bấm **Quản lý chủ đề**, hoặc dùng dòng lệnh:
```bash
python -m socialheat topic "Ngộ độc trường học" -k "ngộ độc & trường học" "bếp ăn bán trú" -x "quảng cáo"
python -m socialheat topics
```
Cú pháp từ khóa:
- `a & b`: bài viết phải chứa **cả** a và b.
- Khớp được cả bài viết **không dấu** ("ngo doc") và **hashtag viết liền** (#bepanbantru).
- `-x`: từ loại trừ. Bài chứa từ này sẽ bị bỏ khỏi chủ đề.

## 4. Chạy

```bash
python -m socialheat crawl              # crawl 1 lượt mọi nền tảng, in bảng xếp hạng
python -m socialheat crawl -p tiktok    # chỉ 1 nền tảng
python -m socialheat crawl --debug      # hiện trình duyệt + lưu dữ liệu thô vào data/debug/ để sửa lỗi
python -m socialheat run                # dashboard + tự động crawl mỗi 30 phút (chạy lâu dài)
```
Dashboard: `http://<máy-chủ>:8800`. Nên đặt `username`/`password` trong `[server]` khi mở cho cả nhóm.

---

## 5. Công cụ crawl những gì

| Nguồn | Cách lấy | Dữ liệu |
|---|---|---|
| Facebook | Trang tìm kiếm *Bài viết, mới nhất* cho từng từ khóa và các fanpage/group trong `pages`; bắt response GraphQL và JSON nhúng trong trang | nội dung, tác giả, thời gian, reactions, bình luận, chia sẻ, lượt xem video, bình luận của top bài |
| TikTok | Trang tìm kiếm video, trang hashtag `/tag/...`, các kênh trong `pages`; bắt API `/api/search`, `/api/challenge`… | mô tả, hashtag, tác giả, thời gian, tim, bình luận, chia sẻ, lưu, lượt xem, bình luận của top video |
| Threads | Trang tìm kiếm (mới nhất) và các profile trong `pages`; bắt GraphQL và JSON nhúng | nội dung, tác giả, thời gian, like, trả lời, repost/quote, các trả lời của top bài |
| Báo chí | Google News RSS theo từ khóa (7 ngày) và RSS 10 báo lớn | tiêu đề, báo, thời gian |

Mỗi lượt crawl lưu lại **ảnh chụp số tương tác** (bảng `snapshots`), nên có thể theo dõi một bài tăng tương tác nhanh đến đâu.

## 6. Cách tính chỉ số

**Tương tác quy đổi** của một bài = like + 2×bình luận + 3×chia sẻ + 1×lưu + 0,01×lượt xem.

Mọi đại lượng được chuẩn hóa bằng log theo mức tham chiếu "rất nóng" của từng nền tảng (`score = log(1+x)/log(1+ref)`, trần 1).
Khi đã tích đủ lịch sử (từ 30 lần chấm điểm), công cụ tự lấy **P95 thực tế** làm mức tham chiếu.

**Sức nóng** = 100 × (0,30·Khối lượng + 0,35·Tương tác + 0,20·Tốc độ + 0,15·Lan rộng)

| Thành phần | Đo gì |
|---|---|
| Khối lượng | số bài trong khung thời gian, theo từng nền tảng, gộp theo trọng số FB 0,35 · TikTok 0,30 · Báo 0,20 · Threads 0,15 |
| Tương tác | tổng tương tác quy đổi trên mạng xã hội |
| Tốc độ | số bài 6h gần nhất so với trung bình mỗi 6h của 48h trước đó (gấp 8 lần = điểm tối đa; giảm điểm nếu còn dưới 10 bài) |
| Lan rộng | số tác giả khác nhau, số nền tảng có bàn tán, và việc báo chí đã đưa tin hay chưa |

**Nghiêm trọng** = 100 × (0,25·Tiêu cực + 0,15·Cảm xúc mạnh + 0,30·Loại rủi ro + 0,10·Từ khóa nguy hiểm + 0,10·Báo chí + 0,10·Cơ quan chức năng)

- Phân tích cảm xúc trên cả bài viết và bình luận; bài nhiều tương tác có trọng số lớn hơn.
- Loại rủi ro có trọng số riêng: Tính mạng 1,0 · Pháp lý 0,9 · An ninh 0,9 · Sức khỏe 0,85 · Lừa đảo 0,8 · Thương hiệu 0,6 · Giải trí 0,2.
- Từ điển tiếng Việt nằm trong `socialheat/analysis/text.py`. Nên bổ sung từ ngữ theo lĩnh vực bạn theo dõi.
- **Tùy chọn AI** (`[llm] enabled = true` + biến môi trường `ANTHROPIC_API_KEY`): Claude đọc 40 bài/bình luận nổi bật,
  chấm mức nghiêm trọng, phân loại rủi ro và viết tóm tắt. Điểm cuối = 50% theo luật + 50% theo AI.
  Mỗi chủ đề gọi tối đa một lần mỗi 3 giờ để kiểm soát chi phí. Tính năng dự phòng phía server (`fallbacks`) đang bật:
  nếu model chính từ chối yêu cầu, API tự chuyển sang model dự phòng.

**Phân loại theo ma trận** (ngưỡng 50/50, chỉnh được): Khủng hoảng (nóng và nghiêm trọng) · Tiềm ẩn (nghiêm trọng, chưa nóng) ·
Xu hướng (nóng, không nghiêm trọng) · Theo dõi.

**Giai đoạn vòng đời**: Khởi phát → Bùng nổ → Đỉnh → Thoái trào / Âm ỉ, tính từ chuỗi số bài theo giờ.

**Nội dung trùng lặp**: tỷ lệ bài có nội dung gần như giống hệt nhau do ít nhất 3 tác giả khác nhau đăng. Tỷ lệ cao là dấu hiệu seeding hoặc bot.

**Cảnh báo** (lưu trên dashboard và gửi Telegram): chủ đề vào góc Khủng hoảng, hoặc số bài 6h tăng gấp ≥ 4 lần mức nền (≥ 10 bài).
Cùng một loại cảnh báo không lặp lại trong 6 giờ.

---

## 7. Lưu ý vận hành (quan trọng)

- **Cấu trúc trang của Facebook, TikTok, Threads thay đổi thường xuyên.** Bộ bóc tách (`socialheat/crawlers/parsers.py`) đã được
  viết theo kiểu dò tìm trong toàn bộ dữ liệu thay vì bám một đường dẫn cố định, nên chịu được thay đổi nhỏ.
  Nếu một nền tảng bỗng trả về 0 bài, xem **Nhật ký crawl** trên dashboard, chạy `crawl -p <nền tảng> --debug`,
  mở các file trong `data/debug/` và chỉnh hàm `parse_*` tương ứng.
- **Bị chặn hoặc khóa tài khoản**: giữ `delay_seconds` và `max_scrolls` ở mức vừa phải, không đặt chu kỳ crawl quá dày,
  dùng tài khoản phụ. Nên chạy trên máy hoặc mạng ở Việt Nam, vì IP của trung tâm dữ liệu dễ bị chặn hơn.
  Có thể cấu hình `proxy`.
- **Pháp lý**: crawl tự động trái điều khoản sử dụng của Meta và TikTok, nên có rủi ro tài khoản bị khóa.
  Dữ liệu thu được có chứa thông tin cá nhân (tên, bình luận), vì vậy chỉ dùng nội bộ, giới hạn người truy cập dashboard,
  và định kỳ xóa dữ liệu cũ theo quy định về bảo vệ dữ liệu cá nhân.
- Công cụ chỉ thấy những gì **tài khoản đăng nhập nhìn thấy được** (bài công khai, group đã tham gia),
  nên đây là **mẫu đại diện**, không phải toàn bộ mạng xã hội. Hãy so sánh các chủ đề với nhau và theo thời gian thay vì đọc con số tuyệt đối.

## 8. Cấu trúc mã

```
socialheat/
  crawlers/browser.py   phiên Playwright: đăng nhập, cuộn trang, bắt response
  crawlers/social.py    Facebook / TikTok / Threads
  crawlers/news.py      RSS báo + Google News
  crawlers/parsers.py   bóc tách JSON → bài viết
  analysis/text.py      tiếng Việt: khớp từ khóa, cảm xúc, loại rủi ro
  analysis/metrics.py   Sức nóng, Nghiêm trọng, giai đoạn, seeding
  analysis/llm.py       (tùy chọn) Claude tóm tắt + chấm điểm
  pipeline.py           điều phối crawl → chấm điểm → cảnh báo
  api.py                API + dashboard (static/index.html)
  db.py                 SQLite (data/socialheat.db)
tests/                  pytest -q tests
```

## 9. Tự phát hiện vấn đề nóng (`discover`)

```bash
python -m socialheat discover -n 10            # gom tin Google News + RSS báo + Google Trends, thêm thành chủ đề [Tự động]
python -m socialheat discover -n 10 --crawl     # ...và crawl/chấm điểm ngay các chủ đề đó
```
Tiêu đề từ nhiều báo được gom cụm theo cụm từ đặc trưng; cụm được nhiều báo khác nhau cùng đưa tin là ứng viên.
Từ khóa tự sinh đôi khi quá rộng (ví dụ "dự án & đề xuất") – nên xem lại và sửa trong *Quản lý chủ đề*.
