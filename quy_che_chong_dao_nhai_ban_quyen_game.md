# BỘ QUY CHẾ CHỐNG ĐẠO NHÁI VÀ TUÂN THỦ BẢN QUYỀN TRONG PHÁT TRIỂN GAME

**Phiên bản:** 1.0 – 23/11/2026
**Áp dụng cho:** [Tên studio] – toàn bộ dự án game, ở mọi giai đoạn từ ý tưởng đến vận hành
**Tài liệu căn cứ:** *Nghiên cứu: Sự tương đồng về lớp nhân vật, trang phục, set đồ, vũ khí và hệ thống trong game MMORPG*, phiên bản 2.1 (sau đây gọi là **NC**; trích dẫn theo mục, ví dụ **[NC §5.6]**)

> **Cách đọc bộ tài liệu**
>
> | Phần | Nội dung | Tính chất |
> |---|---|---|
> | **I. Quy chế** | Các Điều bắt buộc, chia theo Chương | Bắt buộc. Vi phạm bị xử lý theo Điều 37 |
> | **II. Cơ chế vận hành** | Cổng kiểm soát IP, Sổ nguồn gốc tài sản, quy trình xử lý khiếu nại, ma trận trách nhiệm | Bắt buộc về kết quả; studio được điều chỉnh công cụ |
> | **III. Hướng dẫn thực hành** | Hướng dẫn theo từng bộ môn | Khuyến nghị mạnh; trưởng bộ môn có thể bổ sung |
> | **IV. Biểu mẫu** | Mẫu sổ, phiếu, checklist, điều khoản hợp đồng | Mẫu tham khảo; điều khoản hợp đồng phải được luật sư rà soát trước khi dùng |
> | **Phụ lục** | Ma trận căn cứ, mức áp dụng theo quy mô studio, nguồn | Tham chiếu |
>
> Mỗi Điều trong Phần I có dòng **Căn cứ** chỉ ra cơ sở pháp lý và bài học thực tế trong NC. Phụ lục A tổng hợp toàn bộ.

> **Lưu ý pháp lý:** Bộ tài liệu là khung quản trị nội bộ, không phải ý kiến pháp lý. Tuân thủ bộ quy chế giúp giảm đáng kể rủi ro và tạo chứng cứ sáng tạo độc lập, nhưng không bảo đảm studio không bị khiếu nại. Các tranh chấp cụ thể cần luật sư sở hữu trí tuệ.

---

## Tóm tắt điều hành

Nghiên cứu căn cứ (NC) rút ra ba kết luận quyết định cách thiết kế bộ quy chế này:

1. **Chứng cứ sáng tạo độc lập là lá chắn mạnh nhất.** Khi bị cáo buộc, studio cần chứng minh mình tự làm – bằng file gốc, lịch sử phiên bản, tài liệu thiết kế có ngày tháng [NC §2]. Bộ quy chế vì vậy yêu cầu **lưu vết** ở mọi bước.
2. **Rủi ro thực tế nằm ở chuỗi cung ứng tài sản**, không ở ý đồ của lãnh đạo: nhân viên cũ, nhà cung cấp, chợ asset, tài liệu tham khảo truyền tay, công cụ AI [NC §5.6]. Bộ quy chế vì vậy kiểm soát **nguồn gốc của từng tài sản** qua **Sổ nguồn gốc tài sản (SNG)**.
3. **Bản quyền không phải tuyến pháp lý duy nhất.** Các vụ MMORPG lớn gần đây được quyết định bằng cạnh tranh không lành mạnh và bí mật kinh doanh [NC §5.3]; game "thay da" bị xử lý ở Trung Quốc [NC §5.2]; studio Việt Nam có thể bị kiện ở nước ngoài [NC §5.5]. Bộ quy chế vì vậy kiểm soát cả **hệ thống gameplay, tên gọi, dữ liệu nội bộ** chứ không chỉ đồ họa.

Bộ quy chế có **bốn trụ cột**:

| Trụ cột | Công cụ chính | Điều |
|---|---|---|
| Sáng tạo có kỷ luật | Phân loại tài liệu tham khảo; quy trình phân tích đối thủ tách biệt; lưu chứng cứ sáng tạo | 9–13 |
| Nguồn gốc minh bạch | Sổ nguồn gốc tài sản; kiểm soát asset bên thứ ba, font, nhạc, mã nguồn mở, AI | 14–19, 26–29 |
| Con người và đối tác | Hợp đồng, tiếp nhận, nghỉ việc, freelancer, outsource, nhà phát hành | 20–25 |
| Phát hiện và phản ứng | Cổng IP theo giai đoạn; bảo vệ tài sản của studio; xử lý khiếu nại và sự cố | 30–37, Phần II |

---

# PHẦN I. QUY CHẾ

## Chương I. Quy định chung

### Điều 1. Mục đích

1. Bảo đảm mọi sản phẩm của studio được tạo ra bằng sáng tạo độc lập hoặc sử dụng tài sản có quyền hợp pháp.
2. Phòng ngừa hành vi sao chép, đạo nhái, rip tài sản, "thay da" game của người khác.
3. Lưu giữ chứng cứ đủ để chứng minh quyền và nguồn gốc khi có tranh chấp.
4. Bảo vệ tài sản trí tuệ, bí mật kinh doanh và uy tín của studio.

### Điều 2. Phạm vi và đối tượng áp dụng

1. Áp dụng cho: nhân viên chính thức, thực tập sinh, cộng tác viên, freelancer, nhà cung cấp dịch vụ (outsource, co-development), đối tác mà studio phát hành sản phẩm.
2. Áp dụng cho mọi loại tài sản: mã nguồn, mỹ thuật 2D/3D, animation, hiệu ứng, giao diện, âm thanh, âm nhạc, văn bản, tên gọi, dữ liệu thiết kế (bảng chỉ số, công thức), tài liệu marketing.
3. Áp dụng cho cả sản phẩm thương mại, bản thử nghiệm, bản demo, tài liệu gọi vốn và tài liệu nội bộ có khả năng công bố.

### Điều 3. Giải thích từ ngữ

| Thuật ngữ | Nghĩa trong bộ quy chế |
|---|---|
| **Tài sản** | Mọi thành phần được đưa vào sản phẩm hoặc tài liệu công bố: file mỹ thuật, mã, âm thanh, văn bản, tên, dữ liệu |
| **Tài sản bên thứ ba** | Tài sản không do studio hoặc người làm việc cho studio tạo ra: asset mua, miễn phí, mã nguồn mở, font, nhạc bản quyền, nội dung hợp tác (collab) |
| **Tài liệu tham khảo** | Hình ảnh, video, game, tài liệu được xem để lấy cảm hứng hoặc hiểu kỹ thuật, **không** được đưa vào sản phẩm |
| **Sao chép** | Tái tạo toàn bộ hoặc phần đáng kể biểu đạt của người khác, kể cả khi đổi màu, đổi tỷ lệ, vẽ lại bằng tay, chuyển từ 2D sang 3D [NC §3] |
| **Rip** | Trích xuất tài sản từ file game, ứng dụng hoặc sản phẩm của người khác |
| **Thay da** | Giữ tổ hợp hệ thống gameplay, giao diện, dữ liệu số đặc thù của một game cụ thể và chỉ thay mỹ thuật, âm thanh [NC §1, §5.2] |
| **Chuẩn thể loại** | Yếu tố phổ biến của thể loại mà không ai độc quyền: lớp nhân vật kiếm sĩ/pháp sư, cường hóa +1…+15, bang hội, auto-hunt, thanh HP/MP [NC §4, §5.3] |
| **Sổ nguồn gốc tài sản (SNG)** | Sổ ghi nguồn gốc, tác giả, quyền sử dụng của từng tài sản (Biểu mẫu BM-01) |
| **Cổng IP** | Điểm kiểm soát bắt buộc trong vòng đời dự án, phải đạt mới được chuyển giai đoạn (Phần II, mục II.1) |
| **Người phụ trách IP** | Người được giao điều phối việc tuân thủ bộ quy chế (Điều 5) |
| **Tài sản cốt lõi** | Tài sản định danh sản phẩm: logo, tên game, nhân vật chính, key art, nhạc chủ đề |

### Điều 4. Nguyên tắc

1. **Tự sáng tạo và chứng minh được.** Mọi tài sản do studio tạo ra phải có dấu vết quá trình sáng tạo.
2. **Không có nguồn thì không vào sản phẩm.** Tài sản chưa có dòng trong SNG không được đưa vào bản build phát hành.
3. **Tham khảo khác sao chép.** Được học ý tưởng, phong cách, chuẩn thể loại; không được lấy biểu đạt cụ thể [NC §4.1–4.2].
4. **Trách nhiệm theo chuỗi.** Studio chịu trách nhiệm với sản phẩm mình công bố, kể cả phần do đối tác làm [NC §5.6 – *Stellaris: Galaxy Command*].
5. **Phòng ngừa trước, minh bạch khi có sự cố.** Báo cáo sớm sai sót không bị xử lý kỷ luật nếu không có lỗi cố ý (Điều 35).
6. **Tôn trọng người sáng tạo.** Đối xử với tác phẩm của người khác – kể cả fan art, họa sĩ độc lập – như cách studio muốn tác phẩm của mình được đối xử.

---

## Chương II. Tổ chức và trách nhiệm

### Điều 5. Người phụ trách IP

1. Giám đốc studio chỉ định một **Người phụ trách IP**. Ở studio dưới 20 người, vai trò này có thể do Producer hoặc Giám đốc kiêm nhiệm.
2. Nhiệm vụ:
   a) Quản lý SNG và danh mục giấy phép;
   b) Chủ trì Cổng IP (Phần II, mục II.1);
   c) Phê duyệt danh sách nguồn asset, công cụ AI, giấy phép mã nguồn mở được phép;
   d) Tiếp nhận và điều phối xử lý khiếu nại, sự cố (Chương VIII);
   đ) Tổ chức đào tạo (Điều 38);
   e) Đề xuất khi nào cần luật sư (Điều 8).
3. Người phụ trách IP có quyền **tạm dừng** đưa một tài sản hoặc bản build vào phát hành khi có nghi vấn chưa được làm rõ.

### Điều 6. Trách nhiệm của trưởng bộ môn

| Vai trò | Trách nhiệm chính |
|---|---|
| **Art Director** | Duyệt tài liệu tham khảo cấp 2; kiểm tra tài sản mỹ thuật trước khi vào SNG; giám sát nhà cung cấp mỹ thuật |
| **Lead Game Designer** | Bảo đảm tài liệu thiết kế giải thích được lý do thiết kế; kiểm soát rủi ro "thay da" (Điều 12) |
| **Tech Lead** | Quản lý giấy phép mã nguồn mở, SDK, plugin; duy trì tệp ghi chú giấy phép (NOTICE) |
| **Audio Lead** | Quản lý giấy phép nhạc, SFX, giọng đọc |
| **Narrative/Writing Lead** | Kiểm tra trùng tên nhân vật, tên kỹ năng, tên game (mục III.6) |
| **Producer** | Đưa Cổng IP vào lịch dự án; bảo đảm hợp đồng với đối tác có điều khoản IP (Điều 23–24) |
| **Marketing Lead** | Kiểm tra quyền với mọi tài sản trong trailer, ảnh quảng cáo, nội dung mạng xã hội |

### Điều 7. Trách nhiệm cá nhân

Mỗi người áp dụng bộ quy chế phải:
1. Chỉ đưa vào dự án tài sản do mình tạo ra hoặc tài sản đã có trong danh sách nguồn được phép;
2. Ghi nguồn cho tài liệu tham khảo và tài sản bên thứ ba;
3. Không mang tài liệu, mã, tài sản của chủ cũ hoặc của khách hàng khác vào dự án;
4. Báo cáo ngay khi phát hiện tài sản nghi có vấn đề.

### Điều 8. Khi nào bắt buộc hỏi ý kiến luật sư

1. Nhận thư khiếu nại, thư yêu cầu chấm dứt (cease-and-desist), thông báo gỡ bỏ từ nền tảng.
2. Dự định khởi kiện, gửi thư yêu cầu chấm dứt hoặc yêu cầu gỡ bỏ đối với bên khác.
3. Ký hợp đồng cấp phép IP, hợp tác (collab), phát hành, co-development có giá trị lớn hoặc ở thị trường mới.
4. Kết quả tự đánh giá tương đồng (mục II.4) ở mức "đỏ".
5. Tuyển nhân sự chủ chốt từ đối thủ trực tiếp đang phát triển sản phẩm cùng thể loại [NC §5.3 – Nexon v. Ironmace].

---

## Chương III. Sáng tạo và sử dụng tài liệu tham khảo

### Điều 9. Phân loại tài liệu tham khảo

| Cấp | Mục đích | Ví dụ | Điều kiện |
|---|---|---|---|
| **Cấp 1 – Cảm hứng** | Định hướng không khí, phong cách, chủ đề | Moodboard nhiều nguồn, ảnh thiên nhiên, kiến trúc, lịch sử, nhiều game cùng thể loại | Ghi nguồn trong công cụ moodboard. Không cần duyệt |
| **Cấp 2 – Kỹ thuật** | Hiểu giải phẫu, vật liệu, cơ chế, cấu trúc | Ảnh giáp lịch sử, ảnh giải phẫu, video chuyển động thật, ảnh chụp chi tiết vật liệu | Ghi nguồn; Art Director duyệt khi tài liệu là **tác phẩm của người khác** (tranh, concept, game) |
| **Cấp 3 – Đầu vào trực tiếp** | Được dùng làm một phần sản phẩm | Ảnh stock có giấy phép, scan có giấy phép, asset mua | **Bắt buộc** có giấy phép phù hợp và ghi vào SNG như tài sản bên thứ ba |

**Quy tắc đa nguồn:** Một thiết kế mới không được dựa chủ yếu vào một tác phẩm duy nhất của người khác. Moodboard cho một tài sản cốt lõi nên có **ít nhất 5 nguồn** khác nhau, trong đó có nguồn ngoài thể loại game.

**Căn cứ:** Nguyên tắc ý tưởng – biểu đạt, Điều 15 khoản 3 Luật SHTT [NC §4.1]; sự cố *Pokémon TCG Pocket* do chuỗi bàn giao tài liệu tham khảo không ghi nguồn [NC §5.6].

### Điều 10. Hành vi bị cấm

1. **Vẽ đè (tracing), vẽ phủ (paint-over)** lên tác phẩm của người khác mà không có quyền.
2. **Photobash** bằng ảnh không có giấy phép sử dụng thương mại.
3. **Rip** tài sản từ game, ứng dụng, video của người khác; dùng tài sản đã rip từ bất kỳ nguồn nào.
4. **Dựng lại** (2D sang 3D, 3D sang 2D, đổi màu, đổi tỷ lệ) một thiết kế cụ thể của người khác [NC §3, Atari v. Philips].
5. Dùng **tên, mô tả, lời thoại** của nhân vật, kỹ năng, vật phẩm của game khác, kể cả biến thể gần giống [NC §5.5 – "Tomee" và "Teemo"].
6. Sao chép **bảng chỉ số, công thức, dữ liệu cân bằng** của game khác [NC §5.2 – *太极熊猫*: 24 thuộc tính của 47 trang bị].
7. Dùng logo, watermark, chữ ký, biểu tượng nhận diện của bên thứ ba.
8. Dịch ngược (decompile), trích xuất file client của game đối thủ, trừ khi Người phụ trách IP và luật sư phê duyệt bằng văn bản cho mục đích cụ thể.
9. Đưa tài liệu, mã nguồn, dữ liệu của chủ cũ, của khách hàng khác hoặc tài liệu rò rỉ vào dự án [NC §5.3 – Nexon v. Ironmace].

### Điều 11. Phân tích đối thủ theo quy trình tách biệt

1. Phân tích game đối thủ là hoạt động hợp pháp và cần thiết. Để tránh "nhiễm" biểu đạt cụ thể sang sản phẩm, studio áp dụng quy trình tách biệt (dựa trên phương pháp *clean room*):
   a) **Người phân tích** chơi, ghi chép, viết **báo cáo trừu tượng**: mô tả mục tiêu thiết kế, vòng lặp, cảm nhận người chơi, điểm mạnh/yếu;
   b) Báo cáo **không** chứa ảnh chụp màn hình nguyên vẹn, bảng số liệu sao chép, sơ đồ UI chép lại, văn bản trích nguyên văn – trừ khi được đánh dấu "chỉ để phân tích" và lưu ở thư mục tách biệt mà đội sản xuất tài sản không truy cập;
   c) **Đội thực hiện** thiết kế từ báo cáo trừu tượng và mục tiêu riêng của sản phẩm.
2. Studio nhỏ không đủ người tách vai trò: cùng một người có thể phân tích và thiết kế, nhưng phải tuân thủ điểm b và ghi rõ trong tài liệu thiết kế **điểm khác biệt có chủ đích** so với game được phân tích.
3. Lưu báo cáo phân tích có ngày tháng – đây là chứng cứ cho thấy studio phân tích **ý tưởng**, không sao chép **biểu đạt**.

**Căn cứ:** Clean room là thực tiễn tốt (không bắt buộc theo luật) dựa trên lý lẽ sáng tạo độc lập [NC §2]; Capcom v. Data East – có tiếp cận và cố ý mô phỏng phong cách nhưng không vi phạm vì không lấy biểu đạt được bảo hộ [NC §5.1].

### Điều 12. Thiết kế hệ thống gameplay

1. Được sử dụng **chuẩn thể loại** [NC §4.2, §5.3 – ArcheAge War, ROM].
2. **Cấm thay da:** không được ánh xạ một-một **tổ hợp** gồm hệ thống gameplay + bố cục giao diện + dữ liệu số + mạch nội dung của **một game cụ thể**.
3. Dấu hiệu cảnh báo (Lead Game Designer phải xem xét lại khi có **từ 2 dấu hiệu** trở lên):
   a) Trên 30% hệ thống chính có thể ghép đôi một-một với hệ thống của cùng một game;
   b) Thứ tự mở khóa tính năng trùng với cùng một game;
   c) Bố cục màn hình chính, cửa hàng, túi đồ trùng vị trí và cách nhóm;
   d) Đường cong cấp độ, bảng giá, tỷ lệ rơi đồ trùng hoặc tỷ lệ thuận;
   đ) Tài liệu thiết kế dùng tên hệ thống của game khác làm tên làm việc.
4. Tài liệu thiết kế cho mỗi hệ thống chính phải có mục **"Lý do thiết kế"**: mục tiêu với người chơi, phương án đã cân nhắc, điểm khác biệt.

**Căn cứ:** King.com v. Avocado (Hàn Quốc 2019), *太极熊猫* v. *花千骨*, Lilith v. *圣树唤歌* (Trung Quốc) – lựa chọn, sắp xếp, kết hợp hệ thống có thể được bảo hộ; NCSoft v. Webzen – mô phỏng tổ hợp hệ thống là cạnh tranh không lành mạnh [NC §4.5, §5.2, §5.3]. Ngưỡng 30% là ngưỡng quản trị nội bộ để kích hoạt xem xét, **không phải** ngưỡng pháp lý.

### Điều 13. Lưu giữ chứng cứ sáng tạo

1. Mọi tài sản do studio tạo phải được lưu trong hệ thống quản lý phiên bản (Git, Perforce, Plastic hoặc tương đương) **từ phiên bản đầu tiên**, kể cả phác thảo.
2. Concept art lưu kèm file làm việc có lớp (PSD, Procreate, Krita…), không chỉ ảnh xuất.
3. Mô hình 3D lưu kèm file nguồn (Blender, Maya, ZBrush…), texture nguồn (Substance…), không chỉ file đã xuất.
4. Tài liệu thiết kế lưu lịch sử chỉnh sửa.
5. Thời gian lưu: tối thiểu **trong suốt thời gian vận hành sản phẩm và 5 năm sau khi ngừng vận hành**.
6. Không xóa lịch sử phiên bản của dự án khi nhân sự nghỉ việc.

**Căn cứ:** Sáng tạo độc lập là lý do miễn trừ hoàn toàn và phải được chứng minh [NC §2]; Điều 14 khoản 3 Luật SHTT; quy trình điều tra cần ngày tạo file và tài liệu gốc [NC §10].

---

## Chương IV. Tài sản của bên thứ ba

### Điều 14. Điều kiện chung

Tài sản bên thứ ba chỉ được đưa vào dự án khi:
1. Lấy từ **nguồn được phê duyệt** (danh sách do Người phụ trách IP duy trì);
2. **Giấy phép** cho phép: sử dụng thương mại, chỉnh sửa (nếu cần), phân phối trong sản phẩm, trên các nền tảng và thị trường dự kiến;
3. Giấy phép được mua đúng **pháp nhân**, đúng **số người dùng (seat)** theo điều khoản;
4. Bản sao giấy phép, hóa đơn, trang sản phẩm (ảnh chụp có ngày) được lưu;
5. Đã ghi vào SNG.

**Căn cứ:** Hai game dùng chung asset không phải sao chép lẫn nhau, nhưng phải tuân thủ giấy phép [NC §7].

### Điều 15. Asset từ chợ (Unity Asset Store, Fab, và tương đương)

1. **Mua trên chợ không đồng nghĩa nguồn gốc sạch.** Trước khi dùng asset cho nội dung người chơi nhìn thấy, người đề xuất phải:
   a) Kiểm tra hồ sơ người bán (lịch sử, đánh giá, sản phẩm khác);
   b) **Tìm ngược hình ảnh** (reverse image search) với ảnh giới thiệu;
   c) Đặc biệt nghi ngờ asset có kiểu dáng, animation, hiệu ứng **giống một game nổi tiếng**.
2. Điều khoản cần kiểm tra (tóm tắt, phải đọc điều khoản hiện hành):
   - **Unity Asset Store (EULA chuẩn):** được đưa vào sản phẩm, **không** được phân phối hoặc bán asset như sản phẩm riêng; asset dạng *Extension* tính theo **từng người dùng**; chọn *single entity* hay *multi-entity* khi có cộng tác viên/đơn vị liên kết; làm cho khách hàng thì thường phải mua giấy phép đứng tên khách hàng; asset "Restricted" chỉ dùng phi thương mại; asset có EULA riêng của người bán thì theo EULA đó.
   - **Fab (Epic):** giấy phép Standard có hai mức giá Personal/Professional theo doanh thu; điều khoản giống nhau cho asset miễn phí và trả phí; một số asset có thẻ **NoAI** (cấm dùng cho thu thập dữ liệu AI tạo sinh).
3. Nếu phát hiện asset đã dùng có dấu hiệu bị rip: gỡ ngay khỏi bản build đang phát triển, báo Người phụ trách IP, lưu chứng cứ mua hàng.

**Căn cứ:** *Bleak Faith: Forsaken* – studio mua animation trên Unreal Marketplace, sau đó bị phát hiện giống *Elden Ring*; Epic không có khả năng xác minh asset của bên thứ ba [NC §5.6].

### Điều 16. Font chữ

1. Font phải có giấy phép cho phép **nhúng vào phần mềm/game** và phân phối file font cùng sản phẩm. Giấy phép "desktop", "personal use" thường **không** đủ.
2. Một số nhà cung cấp tách riêng giấy phép game (ví dụ Monotype yêu cầu tùy chọn riêng cho game trong gói LETS).
3. Font cho ngôn ngữ CJK và tiếng Việt cần kiểm tra riêng vì giá và điều khoản khác biệt lớn.
4. Ưu tiên font có giấy phép mở cho phép nhúng (ví dụ SIL Open Font License), vẫn phải ghi vào SNG.

### Điều 17. Âm nhạc, hiệu ứng âm thanh, giọng đọc

1. Nhạc đặt sáng tác: hợp đồng phải chuyển nhượng quyền tài sản phù hợp (Điều 23) và quy định rõ quyền dùng trong trailer, livestream, nhạc nền phát hành riêng.
2. Nhạc thư viện: kiểm tra phạm vi (game, trailer, quảng cáo trả phí, nền tảng phát trực tuyến), thời hạn, lãnh thổ.
3. Không dùng nhạc thương mại phổ biến trong trailer hoặc video quảng cáo nếu không có giấy phép đồng bộ (sync).
4. Giọng đọc: hợp đồng với diễn viên phải có điều khoản về **sử dụng giọng nói cho AI** (cho phép hoặc cấm, và phạm vi).

### Điều 18. Mã nguồn mở, SDK, plugin

1. Tech Lead duy trì **danh sách giấy phép**:
   - **Được phép:** MIT, BSD, Apache 2.0, zlib, giấy phép tương đương;
   - **Cần duyệt:** LGPL (điều kiện liên kết động, thông báo giấy phép), MPL;
   - **Hạn chế:** GPL, AGPL – chỉ dùng khi đã đánh giá nghĩa vụ công bố mã nguồn và xung đột với điều khoản nền tảng (console, cửa hàng ứng dụng).
2. Mọi bản phát hành phải kèm **tệp thông báo giấy phép** (NOTICE / màn hình "Giấy phép bên thứ ba").
3. Không sao chép mã từ diễn đàn, kho mã công khai mà không xác định giấy phép.

**Căn cứ:** Các vụ tranh chấp GPL trong ngành game thường do thiếu thông báo giấy phép, thiếu cung cấp mã nguồn, hoặc điều khoản nền tảng xung đột với GPL (*Game Dev Tycoon*, ScummVM trên Wii, *Tomba! Special Edition*) – xem Phụ lục C.

### Điều 19. Tài nguyên miễn phí và giấy phép Creative Commons

| Giấy phép | Dùng trong game thương mại? | Điều kiện |
|---|---|---|
| CC0 / Public domain | Có | Vẫn ghi vào SNG; xác minh người đăng thật sự có quyền |
| CC BY | Có | **Bắt buộc ghi công** đúng cách |
| CC BY-SA | Có điều kiện | Tác phẩm phái sinh phải cùng giấy phép – thường **không phù hợp** cho tài sản cốt lõi |
| CC BY-NC (mọi biến thể) | **Không** | Cấm sử dụng thương mại |
| CC BY-ND | Hạn chế | Không được chỉnh sửa |
| "Miễn phí" không ghi giấy phép | **Không** | Coi như chưa có quyền |

---

## Chương V. Nhân sự, cộng tác viên và đối tác

### Điều 20. Hợp đồng lao động

Hợp đồng hoặc phụ lục hợp đồng lao động phải có:
1. Xác nhận **studio là chủ sở hữu quyền tài sản** đối với tác phẩm nhân viên tạo ra trong khuôn khổ công việc được giao (Điều 39 Luật SHTT). Quyền nhân thân (đứng tên, v.v.) vẫn thuộc tác giả theo Điều 19 Luật SHTT; hợp đồng quy định cách ghi công;
2. **Thỏa thuận bảo vệ bí mật kinh doanh, bí mật công nghệ** theo Điều 21 khoản 2 Bộ luật Lao động 2019 và Thông tư 10/2020/TT-BLĐTBXH: danh mục bí mật, phạm vi sử dụng, thời hạn, phương thức bảo vệ, xử lý vi phạm;
3. Cam kết **không đưa** tài liệu, mã, tài sản của chủ cũ hoặc bên thứ ba vào công việc;
4. Cam kết tuân thủ bộ quy chế này.

**Căn cứ:** Điều 39 Luật SHTT; Điều 21 BLLĐ 2019 [NC §6.2]; Nexon v. Ironmace [NC §5.3].

### Điều 21. Tiếp nhận nhân sự mới

1. Nhân sự mới ký **Cam kết của nhân sự mới** (BM-06) trước khi được cấp quyền truy cập dự án.
2. Không yêu cầu, không khuyến khích, không chấp nhận nhân sự mới chia sẻ tài liệu, mã, dữ liệu, kế hoạch sản phẩm của chủ cũ.
3. Nhân sự đến từ **đối thủ trực tiếp** đang làm sản phẩm cùng thể loại: Người phụ trách IP ghi nhận và áp dụng Điều 8 khoản 5; trong 6 tháng đầu, tài liệu thiết kế do người này chủ trì được Lead rà soát thêm về nguồn gốc.

**Căn cứ:** Nexon v. Ironmace – cựu nhân viên mang dữ liệu dự án sang công ty mới; công ty mới bị buộc bồi thường 5,76 tỷ won vì xâm phạm bí mật kinh doanh dù không vi phạm bản quyền [NC §5.3]. Điều này bảo vệ **cả hai chiều**: studio không bị kiện vì nhân sự mới, và studio có căn cứ khi nhân sự của mình rời đi.

### Điều 22. Nhân sự nghỉ việc

1. Trước ngày nghỉ, lập **Biên bản bàn giao IP** (BM-07):
   a) Danh sách tài sản người đó tạo ra hoặc đưa vào dự án;
   b) Xác nhận **nguồn gốc** của từng tài sản bên thứ ba người đó đưa vào (đối chiếu SNG);
   c) Xác nhận đã trả và xóa dữ liệu của studio trên thiết bị cá nhân;
   d) Nhắc lại nghĩa vụ bảo mật còn hiệu lực.
2. Thu hồi quyền truy cập trong ngày làm việc cuối cùng.
3. Thư viện cá nhân (brush, texture sheet, kitbash, preset) người đó đưa vào dự án phải có dòng SNG; nếu không xác định được nguồn thì đánh dấu "cần thay thế".

**Căn cứ:** Bungie *Marathon* – decal không được phép nằm trong **texture sheet do một cựu họa sĩ tạo** [NC §5.6].

### Điều 23. Cộng tác viên và freelancer

Hợp đồng phải có (xem điều khoản mẫu BM-05):
1. **Chuyển nhượng quyền tài sản** đối với sản phẩm bàn giao (Điều 45–47 Luật SHTT), nêu rõ phạm vi: toàn bộ quyền tài sản, mọi lãnh thổ, thời hạn bảo hộ, quyền làm tác phẩm phái sinh;
2. **Bảo đảm nguyên gốc:** sản phẩm do cộng tác viên tự tạo, không xâm phạm quyền của bên thứ ba;
3. **Khai báo tài sản bên thứ ba và AI** đã dùng (kèm giấy phép);
4. **Bàn giao file nguồn** và **danh sách tài liệu tham khảo** đã dùng;
5. Quy định về **quyền nhân thân**: cách ghi công, đồng ý cho studio chỉnh sửa;
6. Trách nhiệm bồi hoàn khi vi phạm bảo đảm.

**Căn cứ:** Không có văn bản chuyển nhượng rõ ràng, studio có thể chỉ có quyền sử dụng hạn chế; Điều 39, 45–47 Luật SHTT [NC §6.2].

### Điều 24. Nhà cung cấp outsource và đối tác co-development

Ngoài các nội dung ở Điều 23, hợp đồng phải có:
1. Nghĩa vụ nhà cung cấp áp dụng quy trình tương đương Chương III, IV của bộ quy chế;
2. Cấm dùng lại tài sản đã làm cho khách hàng khác, và cấm dùng lại tài sản làm cho studio cho khách hàng khác;
3. **Quyền kiểm tra** file nguồn, nhật ký tham khảo, giấy phép;
4. Nghĩa vụ **thông báo** trong thời hạn ngắn (ví dụ 48 giờ) khi phát hiện vấn đề IP;
5. Điều khoản **bồi hoàn** (indemnity) cho khiếu nại IP phát sinh từ phần việc của nhà cung cấp;
6. Kiểm tra mẫu khi nghiệm thu: Art Director kiểm tra ngẫu nhiên tối thiểu 10% tài sản mỗi đợt bàn giao bằng tìm ngược hình ảnh và đối chiếu tài liệu tham khảo.

**Căn cứ:** Bungie – cutscene 2023 do nhà cung cấp bên ngoài dùng ảnh tưởng là chính thức; *Stellaris: Galaxy Command* – nhà phát hành chịu hậu quả vì lỗi của studio phát triển theo hợp đồng [NC §5.6].

### Điều 25. Khi studio là nhà phát hành

1. **Thẩm định IP trước khi ký** với game của đối tác:
   a) Tự đánh giá tương đồng (mục II.4) với các game dẫn đầu cùng thể loại;
   b) Yêu cầu SNG hoặc tài liệu tương đương của đối tác;
   c) Yêu cầu bảo đảm và bồi hoàn IP trong hợp đồng phát hành.
2. Game nước ngoài phát hành tại Việt Nam: chuẩn bị **văn bản thỏa thuận cho phép phát hành tại Việt Nam**, hợp pháp hóa lãnh sự, dịch và chứng thực – là thành phần hồ sơ xin **Quyết định phát hành trò chơi G1** theo Điều 44 Nghị định 147/2024/NĐ-CP (đối chiếu sửa đổi mới nhất).
3. Game do studio sở hữu: chuẩn bị **tài liệu chứng minh quyền sở hữu trí tuệ** (Giấy chứng nhận đăng ký quyền tác giả, hợp đồng chuyển nhượng với tác giả, SNG) cho hồ sơ G1.

**Căn cứ:** Bản sao *Unpacking* – nhà phát hành gỡ game và xin lỗi vì "thiếu nghiên cứu"; Nghị định 147/2024/NĐ-CP [NC §5.6, §6.1].

---

## Chương VI. Sử dụng AI tạo sinh

### Điều 26. Công cụ được phê duyệt

1. Chỉ dùng công cụ AI có trong **danh sách được phê duyệt** cho tài sản đưa vào sản phẩm.
2. Tiêu chí phê duyệt:
   a) Điều khoản cho phép sử dụng thương mại đầu ra;
   b) Không dùng dữ liệu của studio để huấn luyện mô hình (hoặc có tùy chọn tắt);
   c) Ưu tiên nhà cung cấp có cam kết bồi hoàn IP cho đầu ra;
   d) Ưu tiên mô hình công bố nguồn dữ liệu huấn luyện được cấp phép.
3. Công cụ hỗ trợ nội bộ (gợi ý code, dịch tài liệu nội bộ, tóm tắt) được dùng theo chính sách bảo mật thông tin chung của studio.

### Điều 27. Quy tắc sử dụng

1. **Cấm** prompt yêu cầu mô phỏng: tên họa sĩ còn sống, tên game, tên nhân vật, thương hiệu cụ thể.
2. **Cấm** dùng tác phẩm của người khác làm đầu vào (image-to-image, style reference, fine-tune) khi studio không có quyền với tác phẩm đó.
3. **Kiểm tra đầu ra:** tìm ngược hình ảnh; loại bỏ đầu ra có watermark, logo, chữ ký, chi tiết nhận diện của bên thứ ba.
4. Đầu ra AI dùng trong sản phẩm phải được con người **chỉnh sửa, lựa chọn, sắp xếp đáng kể** và lưu file trước–sau chỉnh sửa.

**Căn cứ:** Getty v. Stability AI – rủi ro nhãn hiệu từ watermark trong ảnh do AI tạo [NC §6.3].

### Điều 28. Ghi nhận và khai báo

1. Mọi tài sản có dùng AI được đánh dấu trong SNG (cột "AI"), kèm công cụ, phiên bản, mô tả mức độ can thiệp của con người, và **Phiếu khai báo sử dụng AI** (BM-09) cho tài sản cốt lõi.
2. Khai báo theo yêu cầu nền tảng: **Steam** yêu cầu khai báo nội dung AI người chơi tiếp xúc và tài liệu marketing (cập nhật 1/2026).
3. Tuân thủ nghĩa vụ minh bạch, gắn nhãn nội dung AI theo **Luật Trí tuệ nhân tạo 134/2025/QH15** (hiệu lực 01/3/2026) khi áp dụng, theo nghị định hướng dẫn.
4. Khai báo trung thực việc dùng AI trong hợp đồng với nhà phát hành, nhà đầu tư; **không** che giấu trong điều khoản bảo đảm IP.

### Điều 29. Tài sản cốt lõi

1. Logo, tên game, nhân vật chính, key art, nhạc chủ đề **không dùng đầu ra AI làm sản phẩm cuối cùng**. AI chỉ được dùng ở giai đoạn khám phá ý tưởng nội bộ.
2. Lý do: tài sản thuần AI có thể không được bảo hộ quyền tác giả, khiến studio **không ngăn được người khác sao chép** tài sản định danh của chính mình.

**Căn cứ:** Cục Bản quyền Mỹ – prompt tự nó không đủ để có quyền tác giả (2025); Thaler v. Perlmutter; Luật SHTT sửa đổi 2025 giao Chính phủ quy định quyền với đối tượng tạo bằng AI [NC §5.1, §6.3].

---

## Chương VII. Bảo vệ tài sản trí tuệ của studio

### Điều 30. Đăng ký quyền

1. **Quyền tác giả:** đăng ký cho tài sản cốt lõi và các bộ tài sản giá trị cao (bộ nhân vật chính, bộ trang bị biểu tượng). Giấy chứng nhận đăng ký giúp studio **không phải chứng minh quyền** khi tranh chấp, trừ khi có chứng cứ ngược lại (Điều 49 Luật SHTT).
2. **Nhãn hiệu:** nộp đơn đăng ký **tên game, logo** tại Việt Nam và các thị trường mục tiêu **trước khi công bố** công khai. Việt Nam áp dụng nguyên tắc nộp đơn đầu tiên. Có thể dùng hệ thống Madrid cho nhiều nước.
3. Kiểm tra trùng trước khi chọn tên (mục III.6).

**Căn cứ:** Điều 49 Luật SHTT; nguyên tắc nộp đơn đầu tiên đối với nhãn hiệu [NC §3, §6.2].

### Điều 31. Bảo mật

1. Thông tin là bí mật kinh doanh chỉ được bảo hộ khi studio **áp dụng biện pháp bảo mật cần thiết**. Studio phải:
   a) Phân loại tài liệu (Công khai / Nội bộ / Mật);
   b) Phân quyền truy cập theo vai trò;
   c) Ký thỏa thuận bảo mật với nhân sự, đối tác, playtester trước khi tiếp cận tài liệu mật;
   d) Ghi nhật ký truy cập kho mã, kho tài sản.
2. Đánh dấu watermark ẩn hoặc mã nhận diện trên bản build thử nghiệm phát cho bên ngoài.

**Căn cứ:** Điều 84, 127 Luật SHTT; Nexon v. Ironmace [NC §3, §5.3].

### Điều 32. Giám sát và thực thi

1. Giám sát định kỳ: cửa hàng ứng dụng, Steam, mạng xã hội, diễn đàn server lậu.
2. Thực thi theo **nhiều lớp**, từ nhẹ đến nặng:
   a) Liên hệ trực tiếp;
   b) Yêu cầu gỡ bỏ qua nền tảng (cơ chế thông báo – gỡ bỏ; Điều 202 Luật SHTT bổ sung 2025);
   c) Đề nghị xử phạt hành chính (Nghị định 341/2025/NĐ-CP);
   d) Khởi kiện dân sự (quyền tác giả, bí mật kinh doanh, cạnh tranh không lành mạnh, nhãn hiệu);
   đ) Tố giác hình sự với server lậu có quy mô thương mại (Điều 225 BLHS).
3. Trước bước d và đ: áp dụng Điều 8; đánh giá chi phí – lợi ích và **nơi khởi kiện**.

**Căn cứ:** Nghiên cứu QMUL/WIPO 2022 khuyến nghị chiến lược thực thi nhiều lớp và coi tranh tụng là biện pháp cuối cùng; vụ server lậu "Con đường tơ lụa" bị khởi tố hình sự; Riot v. Moonton bị tòa Mỹ bác vì nơi khởi kiện không phù hợp [NC §5.2, §5.5, §6.1].

---

## Chương VIII. Xử lý khiếu nại và sự cố

### Điều 33. Tiếp nhận khiếu nại từ bên ngoài

1. Mọi khiếu nại (email, thư luật sư, thông báo nền tảng, bài đăng công khai) được chuyển cho Người phụ trách IP **trong ngày**.
2. Thời hạn nội bộ:
   - Xác nhận đã nhận với bên khiếu nại: **2 ngày làm việc**;
   - Đánh giá sơ bộ: **5 ngày làm việc**;
   - Quyết định xử lý: **10 ngày làm việc** (trừ khi thời hạn nền tảng ngắn hơn).
3. Không ai được tranh luận công khai, xóa hoặc sửa tài sản bị khiếu nại trước khi đánh giá sơ bộ xong – để **giữ nguyên chứng cứ**.

### Điều 34. Quy trình xử lý

Theo sơ đồ ở Phần II, mục II.5. Các bước chính:
1. **Lưu trữ chứng cứ:** khóa phiên bản tài sản, lưu SNG, file nguồn, lịch sử phiên bản.
2. **Đánh giá** theo khung *Cổng → Lọc → So sánh* [NC §9].
3. **Quyết định:**
   a) Khiếu nại có cơ sở: gỡ hoặc thay tài sản, liên hệ bồi thường/ghi công, **rà soát toàn bộ** tài sản cùng nguồn (cùng người tạo, cùng nhà cung cấp, cùng thư viện);
   b) Khiếu nại không có cơ sở: phản hồi kèm chứng cứ sáng tạo độc lập;
   c) Chưa rõ: áp dụng Điều 8.
4. **Bài học:** cập nhật bộ quy chế hoặc danh sách nguồn nếu sự cố do lỗ hổng quy trình.

**Căn cứ:** *Pokémon TCG Pocket* và Bungie *Marathon* đều mở **rà soát rộng hơn** sau sự cố đầu tiên [NC §5.6].

### Điều 35. Báo cáo nội bộ

1. Mọi người có quyền và trách nhiệm báo cáo tài sản nghi có vấn đề qua kênh do Người phụ trách IP thiết lập (có thể ẩn danh).
2. Người báo cáo trung thực không bị xử lý bất lợi.
3. Người **tự báo cáo** sai sót không cố ý của mình được miễn kỷ luật.

### Điều 36. Truyền thông khi có sự cố công khai

1. Chỉ người được Giám đốc chỉ định phát ngôn.
2. Nội dung: thừa nhận sự việc đã xác minh, **studio nhận trách nhiệm ở cấp tổ chức**, nêu biện pháp khắc phục và rà soát.
3. **Không** công khai đổ lỗi cho cá nhân nhân viên, họa sĩ, nhà cung cấp.
4. Bảo vệ nhân viên, họa sĩ khỏi bị quấy rối trên mạng.

**Căn cứ:** *Pokémon TCG Pocket* – công ty nhận toàn bộ trách nhiệm và đề nghị cộng đồng ngừng quấy rối họa sĩ; Bungie *Marathon* bị chỉ trích khi đổ lỗi cho một cựu nhân viên [NC §5.6].

### Điều 37. Xử lý vi phạm

1. Vi phạm được xử lý theo nội quy lao động và hợp đồng.
2. Phân biệt:
   - **Sơ suất** (quên ghi nguồn, nhầm giấy phép): nhắc nhở, đào tạo lại, khắc phục;
   - **Cố ý** (tracing, rip, mang tài liệu của chủ cũ, che giấu nguồn): kỷ luật theo mức nặng, có thể chấm dứt hợp đồng và yêu cầu bồi thường.
3. Với đối tác: áp dụng chế tài hợp đồng.

---

## Chương IX. Điều khoản thi hành

### Điều 38. Đào tạo

1. Nhân sự mới: học bộ quy chế trong **tuần làm việc đầu tiên**.
2. Toàn studio: cập nhật **hằng năm** và khi bộ quy chế thay đổi.
3. Nội dung tối thiểu: Chương III, IV, VI; cách ghi SNG; nghiên cứu tình huống ở [NC §5.6].

### Điều 39. Rà soát bộ quy chế

Người phụ trách IP rà soát bộ quy chế **mỗi 12 tháng**, hoặc ngay khi:
1. Pháp luật Việt Nam hoặc thị trường mục tiêu thay đổi (ví dụ nghị định hướng dẫn Luật Trí tuệ nhân tạo);
2. Có bản án hoặc sự cố đáng kể trong ngành;
3. Studio xảy ra sự cố IP.

### Điều 40. Hiệu lực

Bộ quy chế có hiệu lực từ ngày Giám đốc ký ban hành. Dự án đang thực hiện áp dụng từ Cổng IP kế tiếp; tài sản đã có phải được bổ sung vào SNG trước Cổng G3.

---

# PHẦN II. CƠ CHẾ VẬN HÀNH

## II.1. Cổng IP theo vòng đời dự án

| Cổng | Thời điểm | Điều kiện để qua cổng | Người ký |
|---|---|---|---|
| **G0 – Ý tưởng** | Trước khi duyệt pitch | Danh sách game tham khảo chính; **tuyên bố điểm khác biệt** của sản phẩm; kiểm tra sơ bộ tên làm việc (không dùng tên game khác) | Giám đốc + Người phụ trách IP |
| **G1 – Tiền sản xuất** | Kết thúc vertical slice | SNG đã thiết lập và cập nhật; báo cáo phân tích đối thủ theo Điều 11; tự đánh giá tương đồng lần 1 (mục II.4) cho nhân vật chính và hệ thống chính; danh sách giấy phép mã nguồn mở | Người phụ trách IP + Art Director + Lead Designer |
| **G2 – Sản xuất** | Mỗi milestone | SNG cập nhật 100% tài sản trong build; kiểm tra mẫu tài sản nhà cung cấp (Điều 24 khoản 6); không có mục "chưa rõ nguồn" quá 30 ngày | Người phụ trách IP |
| **G3 – Trước phát hành** | Trước soft launch, gửi cửa hàng, nộp hồ sơ G1 | Tự đánh giá tương đồng lần 2 cho toàn bộ tài sản cốt lõi; tệp thông báo giấy phép; khai báo AI theo nền tảng; nhãn hiệu đã nộp đơn; hồ sơ chứng minh quyền cho G1; rà soát tài sản marketing | Giám đốc + Người phụ trách IP (+ luật sư nếu có mục "đỏ") |
| **G4 – Vận hành** | Mỗi bản cập nhật lớn, sự kiện, collab | SNG cho nội dung mới; hợp đồng collab còn hiệu lực và quy định xử lý khi hết hạn; rà soát tài sản do nhân sự đã nghỉ việc tạo | Người phụ trách IP |

**Quy tắc:** Không qua cổng thì không chuyển giai đoạn. Ngoại lệ phải được Giám đốc phê duyệt bằng văn bản, kèm thời hạn khắc phục.

## II.2. Sổ nguồn gốc tài sản (SNG)

1. **Hình thức:** bảng tính dùng chung, cơ sở dữ liệu, hoặc tệp manifest trong kho mã. Studio lớn nên tích hợp vào pipeline (mỗi file trong thư mục tài sản phát hành phải có mã SNG trong metadata; công cụ build cảnh báo nếu thiếu).
2. **Đơn vị ghi:** một dòng cho mỗi tài sản hoặc mỗi gói tài sản cùng nguồn.
3. **Trường bắt buộc:** xem BM-01.
4. **Trạng thái:** `Đã xác minh` / `Chờ xác minh` / `Cần thay thế` / `Đã gỡ`.
5. **Quy tắc vàng:** tài sản không có dòng SNG ở trạng thái `Đã xác minh` thì **không vào bản build phát hành**.

## II.3. Quy trình tham khảo an toàn

```
Thu thập tài liệu tham khảo
  → Lưu vào công cụ moodboard CÓ trường "nguồn" (URL, tác giả, ngày)
  → Gắn cấp (1 / 2 / 3) theo Điều 9
  → Cấp 2 là tác phẩm của người khác? → Art Director duyệt
  → Cấp 3? → Kiểm tra giấy phép → Ghi SNG như tài sản bên thứ ba
  → Bàn giao cho họa sĩ / nhà cung cấp: KÈM nguồn và cấp, không gửi ảnh
    rời không nguồn; ghi rõ "chỉ tham khảo – không sao chép"
  → Họa sĩ nộp sản phẩm KÈM danh sách tài liệu tham khảo đã dùng
  → Art Director so sánh sản phẩm với tài liệu tham khảo trước khi duyệt
```

Mục tiêu của quy trình: không bao giờ xảy ra tình huống họa sĩ nhận một ảnh không nguồn và tưởng đó là tài liệu chính thức [NC §5.6 – *Pokémon TCG Pocket*].

## II.4. Tự đánh giá tương đồng trước khi phát hành

Áp dụng khung *Cổng → Lọc → So sánh* của [NC §9] cho **sản phẩm của chính studio**, nhằm phát hiện rủi ro trước khi người khác phát hiện.

1. **Phạm vi so sánh:** 5–10 game dẫn đầu cùng thể loại tại thị trường mục tiêu, cộng các game mà đội đã dùng làm tham khảo chính (theo báo cáo ở Điều 11).
2. **Đối tượng:** tài sản cốt lõi; bộ nhân vật/lớp nhân vật; bộ trang bị biểu tượng; màn hình chính và các giao diện chính; tổ hợp hệ thống chính; tên gọi.
3. **Thực hiện:** người **không** trực tiếp làm tài sản đó.
4. **Kết quả:**

| Mức | Điều kiện | Hành động |
|---|---|---|
| **Xanh** | Tương đồng chỉ ở phần đã lọc (chuẩn thể loại, chức năng, nguồn chung) | Ghi nhận, qua cổng |
| **Vàng** | Có điểm tương đồng ở biểu đạt cụ thể nhưng có chứng cứ sáng tạo độc lập rõ | Ghi nhận lý do; cân nhắc điều chỉnh để tăng khác biệt |
| **Đỏ** | Tương đồng đáng kể ở biểu đạt cụ thể, **hoặc** tổ hợp hệ thống trùng với một game cụ thể (Điều 12), **hoặc** không có chứng cứ sáng tạo độc lập | Bắt buộc điều chỉnh hoặc thay thế; hỏi ý kiến luật sư (Điều 8) trước khi phát hành |

## II.5. Quy trình xử lý khiếu nại

```
Nhận khiếu nại
  → Chuyển Người phụ trách IP trong ngày
  → Xác nhận đã nhận (≤ 2 ngày làm việc)
  → Khóa chứng cứ: phiên bản tài sản, SNG, file nguồn, lịch sử
  → Đánh giá sơ bộ theo [NC §9] (≤ 5 ngày làm việc)
       ├─ Có cơ sở   → Gỡ/thay tài sản → Liên hệ bồi thường/ghi công
       │               → Rà soát toàn bộ tài sản cùng nguồn
       │               → Truyền thông theo Điều 36
       ├─ Không có cơ sở → Phản hồi kèm chứng cứ sáng tạo độc lập
       └─ Chưa rõ    → Luật sư (Điều 8)
  → Quyết định (≤ 10 ngày làm việc)
  → Ghi bài học; cập nhật quy chế / danh sách nguồn nếu cần
```

## II.6. Ma trận trách nhiệm (RACI)

R = thực hiện; A = chịu trách nhiệm cuối cùng; C = được hỏi ý kiến; I = được thông báo

| Hoạt động | Giám đốc | Người phụ trách IP | Art Director | Lead Designer | Tech Lead | Producer | Nhân viên |
|---|---|---|---|---|---|---|---|
| Duy trì SNG | I | A | R | R | R | C | R |
| Duyệt tài liệu tham khảo cấp 2 | – | I | A/R | C | – | – | R |
| Phân tích đối thủ (Điều 11) | I | C | C | A/R | – | I | R |
| Giấy phép mã nguồn mở | – | C | – | – | A/R | I | R |
| Hợp đồng freelancer/outsource | A | C | C | – | C | R | – |
| Cổng IP G0–G4 | A (G0, G3) | A/R | R | R | R | R | I |
| Tự đánh giá tương đồng | I | A | R | R | – | C | – |
| Xử lý khiếu nại | A | R | C | C | C | I | I |
| Đăng ký quyền tác giả, nhãn hiệu | A | R | C | – | – | C | – |
| Đào tạo | A | R | C | C | C | C | I |

---

# PHẦN III. HƯỚNG DẪN THỰC HÀNH THEO BỘ MÔN

## III.1. Game design và hệ thống

- **Nên:** học vòng lặp, động lực người chơi, cấu trúc kinh tế của nhiều game; viết mục "Lý do thiết kế"; đặt tên làm việc riêng cho hệ thống.
- **Nên:** xây bảng số liệu từ mô hình riêng (công thức, mục tiêu thời gian chơi, mục tiêu doanh thu), lưu file mô hình.
- **Không:** chụp UI của game khác làm wireframe; dùng bảng chỉ số của game khác làm điểm xuất phát rồi "chỉnh một chút".
- **Lưu ý MMORPG:** cường hóa, auto-hunt, bang hội, PK, boss thế giới, VIP là chuẩn thể loại; rủi ro nằm ở việc ghép **cùng lúc** nhiều hệ thống theo đúng cách của một game cụ thể [NC §5.3].

## III.2. Concept art và mỹ thuật 2D

- **Quy tắc đa nguồn** (Điều 9): tối thiểu 5 nguồn cho tài sản cốt lõi, có nguồn ngoài game.
- **Kiểm tra silhouette:** đặt silhouette thiết kế mới cạnh các thiết kế nổi tiếng cùng vai trò; nếu silhouette **bộ trang phục cụ thể** (không phải lớp nhân vật) trùng, cần thiết kế lại [NC §4.4].
- **Ba điểm đặc trưng:** mỗi bộ trang phục/vũ khí cốt lõi nên có ít nhất 3 chi tiết đặc trưng do đội tự thiết kế (họa tiết, cấu trúc lớp giáp, phụ kiện) và ghi lại trong tài liệu thiết kế.
- **Không** vẽ đè, vẽ phủ, photobash ảnh không có giấy phép.
- **Fan art và tác phẩm của họa sĩ độc lập:** không dùng làm tài liệu tham khảo cấp 2 cho tài sản sẽ phát hành [NC §5.6 – Bungie, Pokémon].

## III.3. 3D, texture, kitbash

- Thư viện kitbash, texture sheet, decal, brush: mỗi gói phải có dòng SNG; **không** dùng gói không rõ nguồn từ nhân sự đã nghỉ (Điều 22).
- Scan và photogrammetry: chỉ từ nguồn có giấy phép hoặc tự chụp; ghi địa điểm, người chụp.
- Không dựng mô hình 3D theo concept của game khác (đây là tác phẩm phái sinh) [NC §3].
- Kiểm tra decal, chữ, biểu tượng trên texture – đây là nơi tài sản không được phép dễ lọt vào nhất.

## III.4. Animation và VFX

- Motion capture tự quay hoặc thư viện có giấy phép; ghi nguồn.
- Animation mua trên chợ: áp dụng Điều 15 – đặc biệt nghi ngờ animation giống game nổi tiếng [NC §5.6 – *Bleak Faith*].
- Chiêu thức dựa trên võ thuật, thần thoại phổ biến là chuẩn thể loại [NC §5.1 – Capcom v. Data East], nhưng **chuỗi** hiệu ứng, màu sắc, nhịp độ đặc trưng của một kỹ năng nổi tiếng thì không nên sao chép.

## III.5. UI/UX

- Bố cục chức năng (thanh máu, minimap, ô kỹ năng) là yếu tố chức năng [NC §4.3].
- Không sao chép: icon, khung trang trí, hoa văn viền, bảng màu đặc trưng, animation chuyển cảnh đặc trưng của game khác.
- Icon pack mua: áp dụng Điều 14, 15.

## III.6. Narrative, tên gọi, văn bản

- **Kiểm tra trùng tên** trước khi chốt tên game, tên nhân vật chính, tên phe phái:
  - Tìm kiếm trên cửa hàng ứng dụng, Steam;
  - Tra cứu nhãn hiệu: cơ sở dữ liệu của Cục Sở hữu trí tuệ Việt Nam, WIPO Global Brand Database;
  - Tìm kiếm web chung.
- **Không** dùng tên biến thể gần giống tên nhân vật/game nổi tiếng, kể cả đổi một vài ký tự [NC §5.5 – Riot v. Imba].
- Văn bản mô tả kỹ năng, vật phẩm phải tự viết, không dịch lại từ game khác.

## III.7. Âm thanh

- Áp dụng Điều 17.
- SFX thư viện: lưu số giấy phép, tên gói.
- Không dùng âm thanh đặc trưng nhận diện của thương hiệu khác (âm thanh khởi động, âm báo đặc trưng).

## III.8. Lập trình

- Áp dụng Điều 18.
- Chạy công cụ quét giấy phép phụ thuộc (dependency license scanner) trong CI trước mỗi bản phát hành.
- Không dùng mã từ dự án cũ của chủ cũ, kể cả "đoạn nhỏ tự viết".
- Không dịch ngược client đối thủ (Điều 10 khoản 8).

## III.9. Marketing

- Trailer, ảnh quảng cáo, video mạng xã hội: chỉ dùng tài sản đã có trong SNG; nhạc có giấy phép sync.
- Không dùng hình ảnh, tên game khác trong quảng cáo so sánh khi chưa có ý kiến luật sư.
- Không dùng fan art khi chưa có sự đồng ý bằng văn bản của tác giả.
- Tài liệu marketing có AI: khai báo theo Điều 28.

## III.10. Vận hành và hợp tác (collab)

- Hợp đồng collab với IP bên ngoài: phạm vi tài sản, thời hạn, lãnh thổ, xử lý vật phẩm người chơi đã sở hữu khi hợp đồng hết hạn, quyền phê duyệt của bên cấp phép.
- Nội dung do người chơi tạo (UGC): điều khoản sử dụng phải có cơ chế gỡ nội dung vi phạm và cấp phép cho studio.

---

# PHẦN IV. BIỂU MẪU

> Các biểu mẫu là mẫu tham khảo. **Điều khoản hợp đồng (BM-04, BM-05, BM-06) phải được luật sư rà soát** trước khi sử dụng, phù hợp với pháp luật áp dụng của từng hợp đồng.

## BM-01. Sổ nguồn gốc tài sản – các trường

| Trường | Mô tả | Ví dụ |
|---|---|---|
| Mã SNG | Mã duy nhất | `CHR-WAR-0012` |
| Tên tài sản / gói | | Bộ giáp "Hắc Long" – Chiến binh |
| Loại | Concept / 3D / texture / animation / VFX / UI / âm thanh / nhạc / font / mã / văn bản / tên | 3D |
| Đường dẫn trong kho | | `Art/Characters/Warrior/BlackDragon/` |
| Nguồn | Tự tạo / freelancer / outsource / chợ asset / mã nguồn mở / CC / AI hỗ trợ | Tự tạo |
| Tác giả / nhà cung cấp | | Nguyễn A (nhân viên) |
| Căn cứ quyền | HĐLĐ / HĐ chuyển nhượng số… / giấy phép số… | HĐLĐ số…, Điều 39 Luật SHTT |
| Loại giấy phép (nếu bên thứ ba) | | — |
| Giới hạn giấy phép | Seat, pháp nhân, nền tảng, lãnh thổ, thời hạn, ghi công | — |
| Tài liệu tham khảo đã dùng | Liên kết phiếu BM-02 | BM-02-0045 |
| AI | Không / hỗ trợ khám phá / có trong sản phẩm (kèm BM-09) | Không |
| Người xác minh, ngày | | Art Director, 12/11/2026 |
| Trạng thái | Đã xác minh / Chờ xác minh / Cần thay thế / Đã gỡ | Đã xác minh |
| Ghi chú | | |

## BM-02. Phiếu tài liệu tham khảo

| Trường | Nội dung |
|---|---|
| Mã phiếu | |
| Tài sản liên quan (mã SNG) | |
| Danh sách nguồn | URL / tác giả / ngày truy cập / cấp (1, 2, 3) |
| Nguồn cấp 2 là tác phẩm của người khác | Có / Không – nếu có: người duyệt, ngày |
| Điểm khác biệt có chủ đích | Mô tả ít nhất 3 điểm |
| Người lập, ngày | |

## BM-03. Checklist Cổng IP

**G1 – Tiền sản xuất**
- [ ] SNG đã thiết lập, mọi tài sản trong vertical slice có dòng
- [ ] Báo cáo phân tích đối thủ theo Điều 11, có ngày
- [ ] Tự đánh giá tương đồng lần 1: nhân vật chính, hệ thống chính
- [ ] Danh sách giấy phép mã nguồn mở và SDK
- [ ] Hợp đồng với freelancer/outsource đã có điều khoản Điều 23–24
- [ ] Tên làm việc đã kiểm tra trùng sơ bộ

**G3 – Trước phát hành**
- [ ] 100% tài sản trong build có SNG trạng thái "Đã xác minh"
- [ ] Không còn mục "Cần thay thế"
- [ ] Tự đánh giá tương đồng lần 2: không có mục "Đỏ" chưa xử lý
- [ ] Tệp thông báo giấy phép bên thứ ba có trong build
- [ ] Font có giấy phép nhúng game
- [ ] Nhạc trong game và trailer có giấy phép đúng phạm vi
- [ ] Khai báo AI theo nền tảng (Steam…) và theo Luật Trí tuệ nhân tạo (nếu áp dụng)
- [ ] Đơn đăng ký nhãn hiệu tên game, logo đã nộp ở thị trường mục tiêu
- [ ] Hồ sơ chứng minh quyền SHTT cho Quyết định phát hành G1 (nếu phát hành tại VN)
- [ ] Tài sản marketing đã rà soát

## BM-04. Điều khoản mẫu – Hợp đồng lao động / Phụ lục IP

> **Điều X. Quyền sở hữu trí tuệ.** (1) Mọi tác phẩm, phần mềm, thiết kế, dữ liệu và kết quả lao động khác do Người lao động tạo ra trong khi thực hiện công việc được giao thuộc quyền sở hữu của Công ty theo Điều 39 Luật Sở hữu trí tuệ. (2) Người lao động giữ các quyền nhân thân theo Điều 19 Luật Sở hữu trí tuệ; Công ty ghi tên Người lao động theo [chính sách ghi công]. Người lao động đồng ý để Công ty sửa đổi, nâng cấp tác phẩm phục vụ sản phẩm. (3) Người lao động cam kết không sử dụng tài liệu, mã nguồn, tài sản thuộc quyền của người sử dụng lao động cũ hoặc bên thứ ba khi thực hiện công việc, trừ khi Công ty có quyền hợp pháp.
>
> **Điều Y. Bảo vệ bí mật kinh doanh, bí mật công nghệ.** Thực hiện theo khoản 2 Điều 21 Bộ luật Lao động và Thông tư 10/2020/TT-BLĐTBXH, gồm: (a) danh mục bí mật: mã nguồn, tài liệu thiết kế, dữ liệu cân bằng, kế hoạch sản phẩm, dữ liệu người chơi, [bổ sung]; (b) phạm vi sử dụng; (c) thời hạn bảo vệ: [trong thời gian làm việc và … năm sau khi chấm dứt]; (d) phương thức bảo vệ; (đ) xử lý vi phạm và bồi thường.

## BM-05. Điều khoản mẫu – Hợp đồng freelancer / outsource

> **1. Chuyển nhượng quyền.** Bên B chuyển nhượng cho Bên A toàn bộ quyền tài sản đối với Sản phẩm bàn giao, bao gồm quyền làm tác phẩm phái sinh, sao chép, phân phối, truyền đạt đến công chúng, trên mọi lãnh thổ, trong suốt thời hạn bảo hộ, kể từ thời điểm [thanh toán / nghiệm thu]. Bên B đồng ý để Bên A sửa đổi Sản phẩm và ghi công theo [cách thức].
>
> **2. Bảo đảm.** Bên B bảo đảm Sản phẩm do Bên B tự sáng tạo; không sao chép, vẽ đè, rip hoặc làm phái sinh từ tác phẩm của bên thứ ba khi không có quyền; không xâm phạm quyền của bất kỳ bên thứ ba nào.
>
> **3. Khai báo.** Khi bàn giao, Bên B cung cấp: (a) file nguồn; (b) danh sách tài liệu tham khảo đã dùng; (c) danh sách tài sản bên thứ ba kèm giấy phép; (d) mô tả việc sử dụng công cụ AI (công cụ, phạm vi), hoặc xác nhận không sử dụng.
>
> **4. Không tái sử dụng.** Bên B không dùng Sản phẩm, hoặc tài sản tạo cho khách hàng khác, theo cách vi phạm Điều 2 và Điều này.
>
> **5. Kiểm tra và thông báo.** Bên A có quyền kiểm tra file nguồn, nhật ký tham khảo, giấy phép. Bên B thông báo cho Bên A trong vòng [48 giờ] khi phát hiện vấn đề sở hữu trí tuệ liên quan đến Sản phẩm.
>
> **6. Bồi hoàn.** Bên B bồi hoàn cho Bên A mọi thiệt hại, chi phí hợp lý (kể cả chi phí luật sư, chi phí thay thế tài sản) phát sinh từ việc vi phạm Điều 2, [trong giới hạn …].

## BM-06. Cam kết của nhân sự mới

> Tôi, [họ tên], cam kết:
> 1. Không mang theo, không lưu trữ trên thiết bị làm việc, không chia sẻ với Công ty bất kỳ tài liệu, mã nguồn, dữ liệu, tài sản, kế hoạch sản phẩm nào thuộc về người sử dụng lao động cũ hoặc khách hàng cũ của tôi.
> 2. Đã đọc và sẽ tuân thủ Bộ quy chế chống đạo nhái và tuân thủ bản quyền.
> 3. Đã khai báo dưới đây các nghĩa vụ bảo mật, không cạnh tranh còn hiệu lực với bên khác (nếu có): […]
> 4. Đã khai báo dưới đây các tài sản cá nhân (brush, thư viện, công cụ tự viết) mà tôi muốn dùng trong công việc, kèm nguồn gốc: […]

## BM-07. Biên bản bàn giao IP khi nghỉ việc

| Mục | Nội dung | Xác nhận |
|---|---|---|
| Danh sách tài sản đã tạo / đưa vào dự án | Đối chiếu SNG | ☐ |
| Tài sản bên thứ ba do người này đưa vào | Nguồn và giấy phép đã có trong SNG | ☐ |
| Thư viện cá nhân đã dùng | Có nguồn / đánh dấu "Cần thay thế" | ☐ |
| Dữ liệu của Công ty trên thiết bị cá nhân | Đã trả và xóa | ☐ |
| Quyền truy cập | Đã thu hồi (ngày, giờ) | ☐ |
| Nghĩa vụ bảo mật còn hiệu lực | Đã nhắc lại, người lao động ký nhận | ☐ |

## BM-08. Phiếu tiếp nhận và đánh giá khiếu nại

| Trường | Nội dung |
|---|---|
| Mã vụ việc, ngày nhận, kênh nhận | |
| Bên khiếu nại, tác phẩm được cho là bị xâm phạm | |
| Tài sản bị khiếu nại (mã SNG) | |
| Chứng cứ đã khóa (phiên bản, file nguồn, lịch sử) | |
| Đánh giá theo [NC §9]: Cổng loại trừ / Sao chép thực tế / Lọc / So sánh | |
| Kết luận sơ bộ: Có cơ sở / Không có cơ sở / Chưa rõ | |
| Quyết định và hành động | |
| Phạm vi rà soát mở rộng | |
| Bài học / cập nhật quy chế | |

## BM-09. Phiếu khai báo sử dụng AI

| Trường | Nội dung |
|---|---|
| Tài sản (mã SNG) | |
| Công cụ, phiên bản, điều khoản thương mại | |
| Đầu vào: prompt, ảnh đầu vào (nguồn và quyền) | |
| Đã kiểm tra: không có tên họa sĩ/game/thương hiệu trong prompt | ☐ |
| Đã kiểm tra: tìm ngược hình ảnh, không có watermark/logo | ☐ |
| Mức độ can thiệp của con người (mô tả, file trước–sau) | |
| Khai báo nền tảng (Steam…) / gắn nhãn theo Luật Trí tuệ nhân tạo | ☐ |
| Người duyệt, ngày | |

---

# PHỤ LỤC

## Phụ lục A. Ma trận căn cứ

| Điều | Căn cứ pháp lý | Căn cứ trong NC | Bài học thực tế |
|---|---|---|---|
| 9 – Phân loại tham khảo | Điều 15 khoản 3 Luật SHTT; Điều 9.2 TRIPS | §4.1, §4.2 | *Pokémon TCG Pocket* |
| 10 – Hành vi bị cấm | Điều 20, 28 Luật SHTT | §3, §5.1, §5.2, §5.5 | Atari v. Philips; Riot v. Imba; *Stellaris* |
| 11 – Phân tích đối thủ tách biệt | Sáng tạo độc lập (Điều 14 khoản 3) | §2, §5.1 | Capcom v. Data East |
| 12 – Cấm thay da | Điều 15; Luật Cạnh tranh 2018 | §4.5, §5.2, §5.3 | King v. Avocado; *太极熊猫*; Lilith v. *圣树唤歌*; NCSoft v. Webzen; ArcheAge War |
| 13 – Lưu chứng cứ | Điều 14 khoản 3; Điều 203 | §2, §10 | — |
| 14–15 – Asset bên thứ ba | Giấy phép (hợp đồng) | §7 | *Bleak Faith: Forsaken* |
| 16–19 – Font, nhạc, OSS, CC | Giấy phép (hợp đồng) | §7 | Phụ lục C |
| 20–22 – Nhân sự | Điều 19, 39, 84, 127 Luật SHTT; Điều 21 BLLĐ | §5.3, §6.2 | Nexon v. Ironmace; Bungie *Marathon* |
| 23–24 – Freelancer, outsource | Điều 39, 45–47 Luật SHTT | §6.2, §5.6 | Bungie (nhà cung cấp, 2023); *Stellaris* |
| 25 – Nhà phát hành | Nghị định 147/2024 Điều 44 | §5.6, §6.1 | Bản sao *Unpacking* |
| 26–29 – AI | Luật SHTT sửa đổi 2025; Luật Trí tuệ nhân tạo 2025 | §6.3 | Thaler v. Perlmutter; Getty v. Stability; Steam |
| 30 – Đăng ký | Điều 6, 49 Luật SHTT; nộp đơn đầu tiên | §3, §6.2 | — |
| 31 – Bảo mật | Điều 84, 127 Luật SHTT | §5.3 | Nexon v. Ironmace |
| 32 – Thực thi | Điều 202 Luật SHTT; NĐ 341/2025; Điều 225 BLHS | §5.5, §6.1 | "Con đường tơ lụa"; Riot v. Moonton; QMUL/WIPO |
| 33–36 – Khiếu nại, sự cố | — | §9, §10, §5.6 | *Pokémon TCG Pocket*; Bungie *Marathon* |

## Phụ lục B. Mức áp dụng theo quy mô studio

| Nội dung | Indie (1–10 người) | Vừa (10–100 người) | Lớn (trên 100 người) |
|---|---|---|---|
| Người phụ trách IP | Giám đốc/Producer kiêm nhiệm | Kiêm nhiệm có thời gian dành riêng | Vị trí chuyên trách hoặc bộ phận pháp chế |
| SNG | Bảng tính dùng chung | Bảng tính + quy ước đặt tên file | Tích hợp pipeline, kiểm tra tự động khi build |
| Phân tích đối thủ (Điều 11) | Một người, áp dụng khoản 2 | Tách vai trò khi có thể | Tách đội, thư mục phân tích riêng |
| Cổng IP | G1 và G3 bắt buộc; G2, G4 rút gọn | Đủ G0–G4 | Đủ G0–G4 + kiểm toán định kỳ |
| Tự đánh giá tương đồng | Tài sản cốt lõi | Tài sản cốt lõi + hệ thống chính | Toàn bộ, có người đánh giá độc lập |
| Kiểm tra mẫu nhà cung cấp | Mọi tài sản cốt lõi | ≥ 10% mỗi đợt | ≥ 10% + kiểm toán file nguồn |
| Đăng ký quyền tác giả | Logo, nhân vật chính | Tài sản cốt lõi | Tài sản cốt lõi + bộ tài sản giá trị cao |
| Nhãn hiệu | Việt Nam + thị trường chính | Các thị trường phát hành | Hệ thống Madrid, giám sát nhãn hiệu |
| Luật sư | Theo vụ việc (Điều 8) | Hợp đồng tư vấn thường xuyên | Pháp chế nội bộ + luật sư bên ngoài |

## Phụ lục C. Nguồn kinh nghiệm thực tế và tài liệu bổ sung

Các nguồn án lệ, sự cố và pháp luật chính được liệt kê đầy đủ trong **NC mục 12**. Dưới đây là các nguồn chỉ dùng trong bộ quy chế:

**Giấy phép asset, font, mã nguồn mở**
1. Unity – Asset Store Terms of Service and EULA: https://unity.com/legal/as-terms
2. Unity – EULA FAQ (seat, single/multi-entity, contractor): https://assetstore.unity.com/browse/eula-faq
3. Unity – Dùng asset trong game thương mại: https://support.unity.com/hc/en-us/articles/205623589-Can-I-use-assets-from-the-Asset-Store-in-my-commercial-game
4. Epic – Licenses and pricing in Fab: https://dev.epicgames.com/documentation/en-us/fab/licenses-and-pricing-in-fab
5. Monotype – Understanding game licensing: https://www.monotype.com/resources/expertise/understanding-game-licensing-monotype
6. Reed Smith (qua MCV/Develop) – rủi ro font trong game: https://mcvuk.com/business-news/publishing/the-typeface-trap-protecting-your-game-from-font-related-lawsuits
7. *Game Dev Tycoon* và thông báo giấy phép glibc: https://gamingonlinux.com/2013/09/game-dev-tycoon-fsf-terminated-their-license-to-use-glibc
8. ScummVM – GPL và xung đột với điều khoản nền tảng: https://blogs.scummvm.org/sev/?p=86
9. Limited Run Games – *Tomba! Special Edition* và GPL (2025): https://www.timeextension.com/news/2025/04/limited-run-refutes-accusation-it-violated-gpl-in-tomba-special-edition

**Quy trình và thực tiễn ngành**
10. Clean room design – tổng quan: https://en.wikipedia.org/wiki/Clean_room_design
11. Epic không xác minh được asset bên thứ ba sau vụ *Bleak Faith*: https://www.pushsquare.com/news/2023/03/epic-not-in-a-position-to-verify-assets-after-elden-ring-animation-scandal-engulfs-bleak-faith-forsaken
12. *Pokémon TCG Pocket* – công ty nhận trách nhiệm, bảo vệ họa sĩ: https://www.videogameschronicle.com/news/the-pokemon-company-asks-fans-to-stop-harassing-tcg-pocket-plagiarism-illustrator-stresses-its-to-blame
13. Bungie – chuỗi sự cố 2021–2025: https://www.pcgamer.com/games/fps/whoops-they-did-it-again-bungie-admits-fan-art-was-used-in-an-official-destiny-2-collectible-says-the-artist-will-be-compensated-and-credited-for-their-incredible-artwork
14. Rủi ro hợp đồng contractor khi không có văn bản chuyển nhượng: https://legalmoveslawfirm.com/work-for-hire-agreement/
15. Rủi ro bảo đảm IP và AI trong hợp đồng phát hành: https://blog.promise.legal/ai-generated-assets-games-copyright/
16. QMUL/WIPO – chiến lược thực thi nhiều lớp (WIPO/ACE/15/4): https://Wipo.Int/edocs/mdocs/enforcement/en/wipo_ace_15/wipo_ace_15_4.pdf
17. WIPO – *Mastering the Game* (2022): https://tind.wipo.int/record/45851/files/wipo-pub-2022-en-mastering-the-game.pdf

**Pháp luật Việt Nam bổ sung**
18. Thỏa thuận bảo mật theo BLLĐ 2019 và Thông tư 10/2020: https://thuvienphapluat.vn/lao-dong-tien-luong/co-duoc-lam-cho-cong-ty-doi-thu-sau-khi-nghi-viec-hay-khong-17687.html
19. Thủ tục cấp Quyết định phát hành trò chơi G1: https://dichvucong.gov.vn/p/home/dvc-chi-tiet-thu-tuc-hanh-chinh.html?ma_thu_tuc=2.001677
20. Luật Trí tuệ nhân tạo – yêu cầu đối với nội dung tạo bởi AI: https://luatminhkhue.vn/yeu-cau-bat-buoc-doi-voi-noi-dung-tao-boi-ai-tu-1-3-2026.aspx

---

**Ghi chú phương pháp:** Bộ quy chế được xây dựng từ (1) nghiên cứu căn cứ NC v2.1; (2) điều khoản hiện hành của các chợ asset, nhà cung cấp font, nền tảng phát hành; (3) các sự cố thực tế được báo chí ngành ghi nhận; (4) thực tiễn quản trị IP phổ biến (clean room, sổ nguồn gốc, cổng kiểm soát). Các ngưỡng định lượng (30% hệ thống, 5 nguồn tham khảo, 10% kiểm tra mẫu, thời hạn xử lý) là **ngưỡng quản trị do studio tự đặt**, không phải ngưỡng pháp lý; studio nên điều chỉnh theo thực tế. Điều khoản của chợ asset, nền tảng và pháp luật thay đổi thường xuyên – kiểm tra phiên bản hiện hành khi áp dụng.
