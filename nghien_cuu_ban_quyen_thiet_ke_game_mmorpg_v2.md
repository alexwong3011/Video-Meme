# Nghiên cứu: Sự tương đồng về lớp nhân vật, trang phục, set đồ, vũ khí và hệ thống trong game MMORPG – khi nào là đạo nhái, khi nào là vi phạm pháp luật?

**Phiên bản:** 2.1 – 23/11/2026 (đã đối chứng án lệ và văn bản pháp luật đến tháng 11/2026)
**Tài liệu liên quan:** *Bộ quy chế chống đạo nhái và tuân thủ bản quyền trong phát triển game* (`quy_che_chong_dao_nhai_ban_quyen_game.md`) dùng tài liệu này làm căn cứ.
**Phạm vi:** Game online MMORPG/RPG; lớp nhân vật, trang phục, giáp, set đồ, vũ khí, cánh, thú cưỡi, hiệu ứng, tài nguyên đồ họa **và hệ thống gameplay/giao diện**.

> **Kết luận tóm tắt**
>
> 1. Hai game giống nhau **không** tự động có nghĩa một bên vi phạm. Cùng chủ đề cũng **không** cho phép chép biểu đạt sáng tạo cụ thể.
> 2. Để kết luận xâm phạm quyền tác giả phải chứng minh **cả hai**: (a) có **sao chép thực tế** (không phải sáng tạo độc lập), và (b) phần bị lấy là **biểu đạt được bảo hộ**, với mức tương đồng đáng kể sau khi đã lọc bỏ mô-típ thể loại và yếu tố chức năng.
> 3. Án lệ thực tế cho thấy: trong tranh chấp MMORPG, **bản quyền thường không phải con đường thắng kiện chính**. Các vụ lớn gần đây ở Hàn Quốc được quyết định bằng **cạnh tranh không lành mạnh** hoặc **bí mật kinh doanh**, còn yêu cầu về bản quyền bị bác. Ngược lại, Trung Quốc và Hàn Quốc đã bảo hộ cả **sự lựa chọn, sắp xếp hệ thống/luật chơi** khi được thể hiện cụ thể – tức game "thay da" (giữ hệ thống, đổi hình) vẫn có thể vi phạm.
> 4. Tại Việt Nam, vi phạm rõ ràng và bị xử lý nhiều nhất là **server lậu** (sao chép mã nguồn và tài nguyên client). Tranh chấp về "tương đồng thiết kế" giữa hai game độc lập chưa có thực tiễn xét xử đáng kể.

---

## Những thay đổi so với phiên bản 1

| Nội dung | Phiên bản 1 | Phiên bản 2 |
|---|---|---|
| Cấu trúc pháp lý | Sáu tiêu chí ngang hàng | Hai điều kiện bắt buộc: sao chép thực tế + tương đồng đáng kể phần được bảo hộ |
| Án lệ | Chỉ Tetris v. Xio | 17 vụ việc tại Mỹ, Trung Quốc, Hàn Quốc, Nhật Bản, Việt Nam và 5 sự cố ngoài tòa án, kèm trạng thái kiểm chứng (v2.1) |
| Luật chơi/hệ thống | "Thông thường không được bảo hộ" | Bổ sung án lệ bảo hộ sự lựa chọn – sắp xếp hệ thống (Hàn Quốc 2019, Trung Quốc 2018) |
| Pháp luật Việt Nam | Điều 20, 22, 28 | Bổ sung Điều 6, 14, 15, 19, 39, 49, 127, 130, 201, 203; Luật 131/2025/QH15; Nghị định 341/2025/NĐ-CP; BLHS Điều 225 |
| Bảng chấm điểm | Cộng điểm có trọng số | Khung **Cổng → Lọc → So sánh** |
| Dạng tranh chấp | Chỉ tương đồng đồ họa | Bốn dạng: server lậu, rip asset, "thay da", rò rỉ bí mật kinh doanh |
| AI | Không đề cập | Bổ sung tư cách tác giả và quy định huấn luyện AI |
| Hình ảnh | Hotlink ảnh game, có link hỏng | Bỏ ảnh minh họa không phục vụ lập luận; hướng dẫn dùng ảnh so sánh đối chiếu |
| *(v2.1)* Án lệ bổ sung | — | Lilith (*AFK Arena*) v. *圣树唤歌*; Chỉ dẫn xét xử game của Tòa Cấp cao Quảng Đông; Riot v. Imba (studio Việt Nam bị kiện tại Mỹ); Tencent/Riot v. Moonton; Krafton v. NetEase |
| *(v2.1)* Sự cố ngoài tòa án | — | Mục 5.6 mới: Bungie *Marathon*, *Pokémon TCG Pocket*, *Stellaris: Galaxy Command*, *Bleak Faith: Forsaken* |
| *(v2.1)* Pháp luật | — | Luật Trí tuệ nhân tạo 134/2025/QH15; Nghị định 147/2024/NĐ-CP (hồ sơ chứng minh quyền SHTT khi phát hành game G1); Bộ luật Lao động 2019 Điều 21; báo cáo của Cục Bản quyền Mỹ về AI (2025); Getty v. Stability AI (Anh, 2025) |

---

## 1. Bốn dạng tranh chấp MMORPG cần phân biệt ngay từ đầu

Phần lớn tranh luận "game A đạo game B" trộn lẫn bốn tình huống có bản chất pháp lý rất khác nhau:

| Dạng | Mô tả | Cơ chế pháp lý thường áp dụng | Mức độ dễ chứng minh |
|---|---|---|---|
| **1. Server lậu / game lậu** | Vận hành game bằng mã nguồn server và client bị rò rỉ hoặc bẻ khóa | Quyền tác giả đối với chương trình máy tính và tài nguyên; hình sự (BLHS Điều 225) | Cao – sao chép nguyên vẹn |
| **2. Rip asset** | Trích xuất mô hình 3D, texture, hiệu ứng, âm thanh từ client game khác để dùng | Quyền sao chép, làm tác phẩm phái sinh | Cao nếu có phân tích kỹ thuật file |
| **3. Game "thay da" (换皮 / reskin)** | Giữ nguyên hệ thống, chỉ số, giao diện, vòng lặp nạp tiền; thay đồ họa | Tùy nước: bản quyền (TQ, HQ theo hướng tổng thể), cạnh tranh không lành mạnh (HQ) | Trung bình – phụ thuộc pháp luật nước xét xử |
| **4. Tương đồng thiết kế** | Hai game độc lập có lớp nhân vật, trang phục, vũ khí giống nhau | Quyền tác giả đối với tác phẩm mỹ thuật | Thấp – vướng scènes à faire, phải chứng minh sao chép |
| *(Kèm theo)* **Rò rỉ nội bộ** | Cựu nhân viên mang tài liệu, mã nguồn, dữ liệu dự án sang công ty mới | Bí mật kinh doanh, hợp đồng lao động | Trung bình – cần chứng cứ về việc mang dữ liệu |

Tài liệu này phân tích chủ yếu dạng 4 (như phiên bản 1), nhưng đặt nó cạnh ba dạng còn lại vì trong thực tế, **dạng 4 là dạng khó thắng kiện nhất**.

---

## 2. Cấu trúc pháp lý của một vụ xâm phạm quyền tác giả

Dù khác nhau về thuật ngữ giữa các nước, phân tích xâm phạm luôn gồm các bước sau:

**Bước A – Nguyên đơn có quyền không?**
Tác phẩm có tính nguyên gốc (Điều 14 khoản 3 Luật SHTT: tác phẩm phải do tác giả "trực tiếp sáng tạo bằng lao động trí tuệ của mình mà không sao chép từ tác phẩm của người khác"), và nguyên đơn là chủ sở hữu hợp pháp (Điều 39 – tác phẩm do nhân viên hoặc bên nhận hợp đồng tạo ra).

**Bước B – Có sao chép thực tế không?**
Bị đơn đã tiếp cận tác phẩm gốc và thực sự lấy từ đó. Chứng cứ có thể là: tiếp cận (game gốc phát hành trước, nhân sự chuyển việc, đã từng xin cấp phép), sự tương đồng khó giải thích bằng trùng hợp, chi tiết thừa hoặc lỗi bị chép lại, file trùng.

> **Sáng tạo độc lập là lý do miễn trừ hoàn toàn.** Khác với sáng chế, hai thiết kế giống hệt nhau mà cả hai đều tự làm thì không bên nào xâm phạm quyền tác giả.

**Bước C – Phần bị lấy có phải biểu đạt được bảo hộ, và tương đồng có đáng kể không?**
Phải lọc bỏ trước: ý tưởng, luật chơi trừu tượng, mô-típ thể loại, yếu tố chức năng, yếu tố từ nguồn chung. Chỉ so sánh phần còn lại.

**Bước D – Có ngoại lệ hoặc giấy phép không?**
Giấy phép asset, hợp đồng thuê studio, các ngoại lệ luật định.

Hai bước B và C liên hệ với nhau: khi mức tương đồng cực kỳ cao, chính sự tương đồng có thể là chứng cứ suy ra việc sao chép. Nhưng chúng **không thay thế** nhau – vụ Capcom v. Data East (mục 5.1) là ví dụ tòa xác định có tiếp cận và cố ý mô phỏng, nhưng vẫn không có xâm phạm vì phần bị mô phỏng không được bảo hộ.

---

## 3. Thành phần nào trong game có thể được bảo hộ?

| Thành phần | Cơ chế bảo hộ | Ghi chú |
|---|---|---|
| Mã nguồn, mã máy | Quyền tác giả – chương trình máy tính (Điều 22) | Đối tượng của hầu hết vụ server lậu |
| Concept art, hình nhân vật, trang phục | Quyền tác giả – tác phẩm mỹ thuật | Bảo hộ cách thể hiện cụ thể, không bảo hộ phong cách |
| Mô hình 3D, texture | Quyền tác giả – tác phẩm mỹ thuật | Dựng 3D theo concept 2D của người khác là **làm tác phẩm phái sinh** (Điều 20 khoản 1 điểm a) – đổi chiều không gian không làm mất tính sao chép |
| Hiệu ứng kỹ năng, animation | Quyền tác giả nếu có tính sáng tạo cụ thể | Chiêu thức bắt nguồn từ võ thuật/thần thoại phổ biến thường bị lọc (Capcom v. Data East) |
| Toàn bộ hình ảnh động của game | Tại TQ: "tác phẩm tương tự điện ảnh" (nay là tác phẩm nghe nhìn) | Tại VN **chưa có thực tiễn** coi game là tác phẩm điện ảnh/nghe nhìn |
| Nhạc nền, âm thanh | Quyền tác giả, quyền liên quan | |
| Cốt truyện, lời thoại, tên kỹ năng dài | Quyền tác giả – tác phẩm văn học | Tên ngắn, khẩu hiệu thường không được bảo hộ |
| Tên game, logo, tên nhân vật đặc trưng | **Nhãn hiệu** – phải đăng ký (VN theo nguyên tắc nộp đơn đầu tiên), trừ nhãn hiệu nổi tiếng | Có thể kết hợp chỉ dẫn thương mại gây nhầm lẫn (Điều 130) |
| Luật chơi, cơ chế, hệ thống cấp độ (trừu tượng) | **Không** được bảo hộ (Điều 15 khoản 3: quy trình, hệ thống, phương pháp hoạt động, khái niệm…) | Nhưng **sự lựa chọn, sắp xếp, thể hiện cụ thể** có thể được bảo hộ ở một số nước (xem 5.2, 5.3) |
| Cơ chế kỹ thuật mới | Có thể là **sáng chế** | Ví dụ: Nintendo kiện Palworld bằng bằng sáng chế, không bằng bản quyền (xem 5.4) |
| Tài liệu thiết kế, dữ liệu dự án, bảng cân bằng chỉ số chưa công bố | **Bí mật kinh doanh** (Điều 84, 127 Luật SHTT) | Phải có biện pháp bảo mật thì mới được bảo hộ |
| Tên, quyền đứng tên, sự toàn vẹn tác phẩm | Quyền nhân thân (Điều 19) | Không chuyển nhượng được (trừ quyền công bố) |
| Vật phẩm ảo | Kiểu dáng công nghiệp **hầu như không áp dụng** tại VN vì kiểu dáng gắn với sản phẩm vật lý | Chỉ đáng xét khi có figure, đồ cosplay thương mại |

---

## 4. Ý tưởng – biểu đạt và các học thuyết lọc

### 4.1. Nguyên tắc ý tưởng – biểu đạt

Điều 9.2 Hiệp định TRIPS (Việt Nam là thành viên WTO từ 2007): *"Bảo hộ quyền tác giả được áp dụng cho các biểu đạt, không áp dụng cho ý tưởng, quy trình, phương pháp hoạt động hoặc khái niệm toán học."* Trong luật Việt Nam, nguyên tắc này thể hiện qua **Điều 15 khoản 3 Luật SHTT**.

### 4.2. Scènes à faire

Yếu tố quen thuộc hoặc gần như tất yếu của một thể loại không bị ai độc quyền: kiếm sĩ giáp nặng, pháp sư áo choàng và trượng, sát thủ đồ tối màu song đao, cánh thiên thần, giáp rồng, hào quang vũ khí cường hóa.

### 4.3. Học thuyết hợp nhất (merger)

Khi một ý tưởng chỉ có rất ít cách thể hiện, cách thể hiện "hợp nhất" với ý tưởng và không được bảo hộ. Ví dụ: thanh máu/mana, ô kỹ năng dưới màn hình, minimap góc phải.

### 4.4. Yếu tố chức năng – trường hợp silhouette lớp nhân vật

Trong MMORPG, mỗi lớp nhân vật cần **silhouette dễ nhận diện từ xa** để người chơi PvP phân biệt ngay đối thủ. Silhouette ở cấp lớp nhân vật vì vậy **tự nhiên hội tụ** (đấu sĩ vai to, pháp sư thân dài đội mũ chóp) và có giá trị chứng minh thấp. Silhouette chỉ có giá trị ở cấp **bộ trang phục cụ thể**, nơi các lựa chọn không bị chức năng chi phối.

### 4.5. Lựa chọn và sắp xếp

Các yếu tố riêng lẻ không được bảo hộ vẫn có thể tạo thành biểu đạt được bảo hộ thông qua **cách lựa chọn, sắp xếp, kết hợp** chúng. Đây là căn cứ của các án "thay da" ở Trung Quốc và Hàn Quốc (mục 5.2, 5.3), và cũng là lý do tương đồng **có hệ thống** quan trọng hơn tương đồng đơn lẻ.

---

## 5. Đối chứng án lệ thực tế

> **Trạng thái kiểm chứng:** ✅ đã đối chiếu với nguồn báo chí/pháp lý (liệt kê ở mục 12); ⚠️ cần đối chiếu bản án gốc cho chi tiết số liệu.

### 5.1. Hoa Kỳ

| Vụ việc | Kết quả | Bài học | Trạng thái |
|---|---|---|---|
| **Tetris Holding v. Xio Interactive**, 863 F. Supp. 2d 394 (D.N.J. 2012) | Mino xâm phạm Tetris | Luật chơi không được bảo hộ, nhưng "không có nghĩa mọi biểu đạt liên quan đến luật chơi đều không được bảo hộ". Xio đã xin cấp phép bị từ chối, rồi nghiên cứu luật để thiết kế "né" – tức yếu tố tiếp cận gần như không tranh cãi; vụ án xoay quanh phạm vi bảo hộ. Đây là phán quyết sơ thẩm (summary judgment), giá trị án lệ hạn chế | ✅ |
| **Capcom U.S.A. v. Data East** (N.D. Cal. 1994) – *Street Fighter II* vs *Fighter's History* | Capcom thua yêu cầu lệnh cấm sơ bộ | Tòa xác định Data East **có tiếp cận và cố ý mô phỏng phong cách tổng thể**, nhưng phần lớn chiêu thức, nguyên mẫu nhân vật là scènes à faire. **Rất sát với câu hỏi "lớp nhân vật, kỹ năng giống nhau"** | ✅ (⚠️ chi tiết số nhân vật/chiêu thức tương đồng cần đọc bản án) |
| **Data East v. Epyx**, 862 F.2d 204 (9th Cir. 1988) – hai game karate | Không xâm phạm | Tương đồng xuất phát từ bản thân môn võ | ✅ |
| **Atari v. North American Philips**, 672 F.2d 607 (7th Cir. 1982) – *Pac-Man* vs *K.C. Munchkin* | Xâm phạm | Thay đổi nhiều chi tiết nhưng giữ "cảm nhận tổng thể" của nhân vật vẫn có thể vi phạm | ✅ |
| **Thaler v. Perlmutter**, 130 F.4th 1039 (D.C. Cir. 2025); Tòa Tối cao từ chối thụ lý 02/3/2026 | Tác phẩm do AI tự tạo không được đăng ký | Asset AI không có đóng góp sáng tạo của con người khó được bảo hộ tại Mỹ | ✅ |

### 5.2. Trung Quốc

| Vụ việc | Kết quả | Bài học | Trạng thái |
|---|---|---|---|
| **《奇迹MU》 v. 《奇迹神话》** – Tòa án Phố Đông, Thượng Hải, (2015)浦民三(知)初字第529号, sơ thẩm 2016; phúc thẩm tại Tòa SHTT Thượng Hải 2017. Nguyên đơn: Thượng Hải Tráng Du (đơn vị độc quyền vận hành MU tại TQ); bị đơn: Thạc Tinh (phát triển) và Duy Động (vận hành) | Xâm phạm; bồi thường 5 triệu NDT (mức cao nhất cho game online thời điểm đó); một số quảng cáo bị xác định là tuyên truyền sai sự thật | **Lần đầu** coi toàn bộ hình ảnh của game nhập vai online là "tác phẩm tương tự điện ảnh". Bị đơn **biết rõ** MU nổi tiếng, ra đời trước, vẫn làm game có "tổng thể hình ảnh tương tự về bản chất". Trực tiếp liên quan đến MU Online – game mà phiên bản 1 dùng làm ảnh minh họa | ✅ (⚠️ kết quả chi tiết phúc thẩm cần đối chiếu bản án) |
| **《太极熊猫》 v. 《花千骨》** – Tòa án Trung cấp Tô Châu, sơ thẩm 30/3/2018; phúc thẩm Tòa án Cấp cao Giang Tô | Xâm phạm quyền cải biên; sơ thẩm buộc bồi thường 30 triệu NDT | Án "thay da" tiêu biểu: 29 lối chơi giống về giao diện và luật, 24 thuộc tính chỉ số của 47 trang bị có quan hệ tương ứng. Tòa cho rằng **cách thể hiện, lựa chọn, sắp xếp, kết hợp luật chơi** được bảo hộ | ✅ (⚠️ mức bồi thường phúc thẩm cần đối chiếu) |
| **Lilith (《剑与远征》/*AFK Arena*) v. 歆瑷网络 (《圣树唤歌》)** – sơ thẩm Tòa án quận Gia Định, Thượng Hải; phúc thẩm; được chọn vào *Án điển hình bảo hộ SHTT của tòa án Thượng Hải năm 2025* | Sơ thẩm: xâm phạm quyền tác giả (luật chơi có tính nguyên gốc, game là tác phẩm nghe nhìn). Phúc thẩm: **điều chỉnh định tính sang cạnh tranh không lành mạnh**; báo chí đưa tin bồi thường 10 triệu NDT | Bị đơn giữ nguyên hệ thống lối chơi, giao diện, mạch chính và hệ thống nhân vật, chỉ thay mỹ thuật và âm thanh. Tòa phúc thẩm coi **toàn bộ hệ thống lối chơi đã thành thục và nổi tiếng** là lợi ích cạnh tranh được bảo vệ; bị đơn có ý đồ chiếm dụng thành quả nghiên cứu phát triển để né chi phí | ✅ (⚠️ số tiền bồi thường cần đối chiếu bản án) |
| **Chỉ dẫn xét xử tranh chấp SHTT game online (thí điểm)** – Tòa án Nhân dân Cấp cao Quảng Đông, 12/4/2020; và án **(2023)粤民终4326号** | Văn bản hướng dẫn của tòa cấp tỉnh; án phúc thẩm buộc bồi thường 10 triệu NDT + 0,5 triệu chi phí | Chủ thể quyền có thể yêu cầu bảo hộ **toàn bộ game** hoặc **từng yếu tố riêng**. Luật chơi tự thân không được bảo hộ, chỉ biểu đạt nguyên gốc của nó. Bắt chước lối chơi **không đương nhiên** là cạnh tranh không lành mạnh; chỉ chặn hành vi bắt chước làm tổn hại cạnh tranh công bằng (ví dụ: lối chơi gần như y hệt **kèm** dùng lượng lớn tài nguyên mỹ thuật của game trước) | ✅ (văn bản có hiệu lực tham khảo trong phạm vi tòa án Quảng Đông) |
| **Tencent (công ty mẹ Riot) v. Moonton** (*League of Legends* vs *Mobile Legends*) – Thượng Hải, 2018 | Tencent thắng; báo chí đưa tin khoảng 19,4 triệu NDT | Song song, Riot kiện tại Mỹ nhưng bị bác hai lần (2017, 2022) vì tòa Mỹ cho rằng tranh chấp nên giải quyết tại Trung Quốc. Các bên sau đó **hòa giải toàn cầu**. Bài học: chọn **nơi khởi kiện** quan trọng không kém nội dung | ✅ (⚠️ bị đơn và số tiền cần đối chiếu) |

### 5.3. Hàn Quốc – nhóm án quan trọng nhất cho MMORPG

| Vụ việc | Kết quả | Bài học | Trạng thái |
|---|---|---|---|
| **King.com v. Avocado** – Tòa án Tối cao, 27/6/2019, 2017Da212095 (*Farm Heroes Saga* vs *Forest Mania*) | Xâm phạm; hủy án phúc thẩm, trả về xét lại | Tòa Tối cao lần đầu công nhận game sao chép xâm phạm bản quyền dựa trên **sự lựa chọn, sắp xếp, kết hợp** các yếu tố game | ✅ |
| **NCSoft v. Webzen** – *Lineage M* vs *R2M*. Sơ thẩm Tòa Trung tâm Seoul 8/2023 (1 tỷ won, ngừng dịch vụ); phúc thẩm Tòa Cấp cao Seoul 27/3/2025 (khoảng 16,9 tỷ won); đang chờ Tòa Tối cao (2025Da212342) | **Bác yêu cầu về bản quyền** ở cả hai cấp, nhưng **chấp nhận cạnh tranh không lành mạnh** (chiếm dụng thành quả) | Từng hệ thống riêng lẻ không đủ là xâm phạm bản quyền; **việc mô phỏng tổng hợp các hệ thống** bị xử lý theo luật cạnh tranh. Mức bồi thường game cao nhất tại Hàn Quốc | ✅ (trạng thái Tòa Tối cao: còn chờ theo báo chí tháng 8/2026) |
| **NCSoft v. Kakao Games, XL Games** – *Lineage 2M* vs *ArcheAge War*. Sơ thẩm thua (1/2025); Tòa Cấp cao Seoul bác kháng cáo 12/3/2026 | Không xâm phạm | Tòa cho rằng khó coi game nguyên đơn đã đạt tới mức tác phẩm có tính sáng tạo, cá biệt **phân biệt với các game trước** – tức nhiều hệ thống "kiểu Lineage" đã trở thành chuẩn thể loại | ✅ |
| **NCSoft v. Kakao Games, Redlab Games** – *Lineage W* vs *ROM* (sơ thẩm 7/2026) | Không xâm phạm | Tương đồng có tồn tại nhưng "không đáng kể" | ✅ |
| **Nexon v. Ironmace** – *Dark and Darker*. Sơ thẩm 2/2025 (8,5 tỷ won); phúc thẩm giảm; **Tòa Tối cao giữ nguyên 30/4/2026: 5,76 tỷ won** | **Không xâm phạm bản quyền**; **xâm phạm bí mật kinh doanh** | Cựu nhân viên mang dữ liệu dự án P3 sang công ty mới. Game bị kiện thuộc thể loại khác (extraction vs battle royale) nên không tương đồng về biểu đạt, nhưng việc dùng dữ liệu mật vẫn bị xử lý. Vụ hình sự còn tiếp diễn | ✅ |

**Nhận xét rút ra từ nhóm án Hàn Quốc:**

1. Hai vụ NCSoft thắng/thua cho thấy ranh giới: chép **tổ hợp hệ thống đặc thù** (R2M) có thể bị xử lý; dùng các hệ thống **đã thành chuẩn thể loại** (ArcheAge War, ROM) thì không.
2. Bản quyền thất bại trong cả ba vụ MMORPG/game lớn gần đây (R2M, ArcheAge War, Dark and Darker). Bên kiện thắng nhờ **cạnh tranh không lành mạnh** hoặc **bí mật kinh doanh**.
3. Lưu ý khi áp dụng cho Việt Nam: Luật Cạnh tranh 2018 (Điều 45) và Điều 130 Luật SHTT **không có điều khoản "chiếm dụng thành quả" tổng quát** như luật Hàn Quốc. Hướng lập luận của vụ R2M vì vậy khó áp dụng nguyên vẹn tại Việt Nam. Hướng bí mật kinh doanh (vụ Nexon) thì có căn cứ (Điều 84, 127 Luật SHTT; Điều 45 khoản 1 Luật Cạnh tranh).

### 5.4. Nhật Bản – ví dụ về lựa chọn cơ chế pháp lý

**Nintendo, The Pokémon Company v. Pocketpair** (*Palworld*, kiện tại Tokyo từ 9/2024): dù dư luận chủ yếu cáo buộc **thiết kế sinh vật** giống Pokémon, Nintendo khởi kiện bằng **bằng sáng chế** về cơ chế bắt quái vật, không bằng bản quyền thiết kế. Trong quá trình tố tụng, một số bằng sáng chế liên quan bị thu hồi hoặc từ chối (tại Mỹ, Nhật). Vụ việc minh họa rằng ngay cả chủ thể quyền lớn nhất cũng đánh giá bản quyền thiết kế nhân vật là con đường **khó** khi không có sao chép trực tiếp. *(Kết quả cuối cùng tại thời điểm biên soạn chưa được xác nhận.)*

### 5.5. Việt Nam

| Vụ việc | Nội dung | Bài học |
|---|---|---|
| **Game "Con đường tơ lụa" (Silkroad Online)** – Công an tỉnh Bắc Ninh khởi tố 3 bị can, 2026 | Sao chép trái phép mã nguồn và hình ảnh của game do VTC phát hành độc quyền để vận hành server lậu "Sro Thổ quỷ", tổ chức nạp tiền qua website, mạng xã hội | Dạng tranh chấp 1 (server lậu) được xử lý **hình sự** theo Điều 225 BLHS |
| Vụ án đầu tiên về xâm phạm quyền tác giả đối với phần mềm máy tính – Công an Phú Thọ | Khởi tố theo Điều 225 | Cơ quan điều tra đã có tiền lệ xử lý hình sự với phần mềm |

| **Riot Games v. Imba Technology** (studio Việt Nam) – Tòa án Liên bang Quận Trung California, khởi kiện 1/2022 | Riot cáo buộc *I Am Hero: AFK Tactical Teamfight* sao chép nhân vật, cốt truyện, lối chơi, tên gọi của *Teamfight Tactics*/*League of Legends* (ví dụ: "Tomee the Hasty Scout" so với "Teemo the Swift Scout"; "Vy" so với "Vi"). Riot đã gửi thư yêu cầu chấm dứt trước khi kiện; Imba phủ nhận. Năm 2023 tòa xác định các bị đơn **phải ra tòa tại Mỹ** | **Studio Việt Nam phát hành game ra quốc tế có thể bị kiện tại tòa nước ngoài**, nơi game được phân phối, theo luật nước đó. Sao chép tên và mô tả nhân vật là chứng cứ rất dễ đưa ra tòa. *(Kết quả cuối cùng chưa được xác nhận.)* |

**Nhận xét:** Chưa tìm thấy bản án Việt Nam công khai nào về tranh chấp **tương đồng thiết kế** (dạng 4) hay **"thay da"** (dạng 3) giữa hai game độc lập. Đây là khoảng trống thực tiễn; các lập luận ở mục 4 và 5.2–5.3 chỉ có giá trị tham khảo khi áp dụng tại Việt Nam. Tuy nhiên, vụ Riot v. Imba cho thấy rủi ro của studio Việt Nam **không chỉ nằm ở luật Việt Nam**.

### 5.6. Sự cố thực tế ngoài tòa án – bài học vận hành cho studio

Phần lớn sự cố bản quyền trong ngành **không ra tòa**. Chúng được xử lý bằng gỡ nội dung, xin lỗi, bồi thường – nhưng vẫn gây thiệt hại lớn về uy tín và tiến độ. Các sự cố dưới đây cho thấy lỗ hổng thường nằm ở **quy trình**, không ở ý đồ của lãnh đạo studio.

| Sự cố | Chuyện gì xảy ra | Lỗ hổng quy trình | Trạng thái |
|---|---|---|---|
| **Bungie – *Marathon*** (5/2025) | Decal của họa sĩ độc lập Antireal xuất hiện trong game mà không được phép. Bungie xác nhận nguồn là **texture sheet do một cựu họa sĩ tạo**, cam kết rà soát toàn bộ tài sản. Báo chí ghi nhận đây là **lần thứ tư trong bốn năm** Bungie gặp sự cố tương tự (trailer *Witch Queen* 2021 dùng fan art; cutscene 2023 do **nhà cung cấp bên ngoài** dùng ảnh tưởng là ảnh chính thức; súng Nerf 2024) | Thư viện texture/kitbash nội bộ không có hồ sơ nguồn gốc; nhân sự nghỉ việc để lại tài sản không truy được nguồn; nhà cung cấp không được kiểm soát nguồn tham khảo | ✅ |
| **The Pokémon Company – *Pokémon TCG Pocket*** (7/2025) | Tranh Ho-Oh trên thẻ bài có đường nét gần như trùng 1:1 với tranh của họa sĩ fan lanjiujiu (2021). Công ty thừa nhận **đội sản xuất đã đưa nhầm tài liệu tham khảo cho họa sĩ như thể là tài liệu chính thức**, gỡ hai thẻ, nhận toàn bộ trách nhiệm và mở điều tra rộng hơn | Chuỗi bàn giao tài liệu tham khảo không ghi nguồn; họa sĩ không phân biệt được tài liệu chính thức và ảnh nhặt trên mạng | ✅ |
| **Paradox – *Stellaris: Galaxy Command*** (10/2019) | Game di động bị gỡ ngay ngày ra mắt vì chứa tranh *Halo 4* chỉ chỉnh sửa nhẹ. Game do **studio Gamebear (Hồng Kông) phát triển theo hợp đồng**, Paradox phát hành | Nhà phát hành chịu toàn bộ hậu quả uy tín vì lỗi của đối tác phát triển; không có kiểm tra tài sản trước khi phát hành | ✅ |
| ***Bleak Faith: Forsaken*** (2023) | Studio indie bị phát hiện dùng animation giống *Elden Ring*; studio cho biết đã **mua trên Unreal Engine Marketplace**. Epic gỡ các listing nhưng nói **không có khả năng xác minh** tài sản của bên thứ ba | Mua trên chợ asset **không đồng nghĩa** nguồn gốc sạch; người bán có thể đã rip tài sản | ✅ |
| **Bản sao *Unpacking* trên Google Play** | Nhà phát hành gỡ game sau khi nhà phát triển gốc lên tiếng, xin lỗi vì "thiếu nghiên cứu" về sản phẩm được gửi tới | Nhà phát hành không thẩm định sản phẩm trước khi ký | ✅ |

**Rút ra:** (1) Rủi ro lớn nhất đến từ **chuỗi cung ứng tài sản** – nhân viên cũ, nhà cung cấp, chợ asset, tài liệu tham khảo. (2) Bên công bố sản phẩm chịu hậu quả bất kể lỗi do ai. (3) Phản ứng nhanh, minh bạch, bồi thường và **rà soát toàn diện** là cách xử lý được cộng đồng chấp nhận nhất.

---

## 6. Khung pháp luật Việt Nam (cập nhật đến 11/2026)

### 6.1. Văn bản

- Luật Sở hữu trí tuệ số 50/2005/QH11, sửa đổi bởi Luật 36/2009/QH12, Luật 42/2019/QH14, Luật 07/2022/QH15 và **Luật 131/2025/QH15** (thông qua 10/12/2025, **hiệu lực 01/4/2026**).
- Nghị định 17/2023/NĐ-CP hướng dẫn về quyền tác giả, quyền liên quan, sửa đổi bởi **Nghị định 134/2026/NĐ-CP**.
- **Nghị định 341/2025/NĐ-CP** về xử phạt vi phạm hành chính về quyền tác giả, quyền liên quan, **hiệu lực 15/02/2026**, thay thế Nghị định 131/2013/NĐ-CP. Mức phạt tối đa 250 triệu đồng với cá nhân, 500 triệu đồng với tổ chức.
- **Luật Trí tuệ nhân tạo số 134/2025/QH15** (thông qua 10/12/2025, **hiệu lực 01/3/2026**): có nghĩa vụ minh bạch, gắn nhãn đối với nội dung do AI tạo ra (theo các bài phân tích, quy định tại Điều 11; chi tiết kỹ thuật chờ nghị định hướng dẫn).
- **Nghị định 147/2024/NĐ-CP** về quản lý dịch vụ Internet và thông tin trên mạng (hiệu lực 25/12/2024): hồ sơ xin **Quyết định phát hành trò chơi G1** (Điều 44) phải có **tài liệu chứng minh quyền sở hữu trí tuệ đối với trò chơi**, hoặc với game nước ngoài là **văn bản thỏa thuận cho phép phát hành tại Việt Nam** (hợp pháp hóa lãnh sự, dịch và chứng thực). Một số điểm của Điều 44 đã được sửa đổi bởi Nghị định 116/2026/NĐ-CP – cần đối chiếu.
- **Bộ luật Lao động 2019, Điều 21 khoản 2** và **Thông tư 10/2020/TT-BLĐTBXH**: người sử dụng lao động được thỏa thuận bằng văn bản với người lao động về bảo vệ bí mật kinh doanh, bí mật công nghệ (danh mục bí mật, phạm vi, thời hạn, phương thức bảo vệ, xử lý vi phạm).
- Luật Cạnh tranh 2018 (23/2018/QH14).
- Bộ luật Hình sự 2015 (sửa đổi), **Điều 225** – Tội xâm phạm quyền tác giả, quyền liên quan.
- Công ước Berne (Việt Nam là thành viên từ 2004) và Hiệp định TRIPS.

> ⚠️ Sau Luật 131/2025/QH15, một số khoản/điều có thể đã được đánh số lại. Cần đối chiếu **văn bản hợp nhất mới nhất** trước khi trích dẫn chính thức.

### 6.2. Các điều khoản trọng tâm

| Điều | Nội dung | Ý nghĩa cho tranh chấp game |
|---|---|---|
| **Điều 6 khoản 1** | Quyền tác giả phát sinh khi tác phẩm được sáng tạo và định hình, không phụ thuộc đăng ký | Game Hàn Quốc, Trung Quốc, Mỹ được bảo hộ **tự động** tại VN qua Công ước Berne |
| **Điều 7 khoản 5** (mới, Luật 131/2025) | Cho phép sử dụng văn bản, dữ liệu đã công bố hợp pháp để huấn luyện AI nếu không gây thiệt hại bất hợp lý cho chủ thể quyền | Liên quan đến game dùng AI tạo asset; chi tiết tại Nghị định 134/2026 |
| **Điều 14 khoản 3** | Tác phẩm phải do tác giả trực tiếp sáng tạo, không sao chép | Căn cứ tính nguyên gốc **và** lập luận sáng tạo độc lập |
| **Điều 15 khoản 3** | Quy trình, hệ thống, phương pháp hoạt động, khái niệm, nguyên lý không được bảo hộ | **Căn cứ VN cho nguyên tắc ý tưởng – biểu đạt** |
| **Điều 19** | Quyền nhân thân | Đứng tên, bảo vệ sự toàn vẹn của tác phẩm |
| **Điều 20** | Quyền tài sản: làm tác phẩm phái sinh, sao chép, phân phối, truyền đạt đến công chúng… | Nhà phát hành game nhập khẩu cũng thực hiện quyền phân phối/truyền đạt nên có thể chịu trách nhiệm |
| **Điều 22** | Chương trình máy tính được bảo hộ như tác phẩm văn học | |
| **Điều 28** | Hành vi xâm phạm quyền tác giả | |
| **Điều 39** | Chủ sở hữu tác phẩm do nhân viên/bên nhận hợp đồng tạo ra | Concept artist freelance không có hợp đồng chuyển quyền là lỗ hổng chứng minh quyền phổ biến |
| **Điều 49** (khoản 3 theo văn bản hợp nhất 11/VBHN-VPQH 2022) | Người đã được cấp Giấy chứng nhận đăng ký **không có nghĩa vụ chứng minh** quyền thuộc về mình khi có tranh chấp, trừ khi có chứng cứ ngược lại | Đăng ký **chuyển gánh nặng chứng minh**, không chỉ "có thể hữu ích" |
| **Điều 84, 127** | Bí mật kinh doanh và hành vi xâm phạm | Căn cứ cho tình huống cựu nhân viên mang dữ liệu đi |
| **Điều 130** | Cạnh tranh không lành mạnh: chỉ dẫn gây nhầm lẫn | Áp dụng khi game dùng tên, logo, quảng cáo gây nhầm với game nổi tiếng |
| **Điều 201** | Giám định sở hữu trí tuệ | |
| **Điều 202** (bổ sung bởi Luật 131/2025) | Biện pháp dân sự, có cơ chế gỡ bỏ nội dung vi phạm trên môi trường số | Hữu ích với game phát hành qua kho ứng dụng, website |
| **Điều 203** | Nghĩa vụ chứng minh của đương sự | |

### 6.3. Tác phẩm tạo bằng AI

Luật 131/2025/QH15 giao Chính phủ quy định việc phát sinh, xác lập quyền đối với đối tượng được tạo ra có sử dụng hệ thống AI (Nghị định 134/2026/NĐ-CP). Cách tiếp cận của Mỹ (Thaler v. Perlmutter) là: không có đóng góp sáng tạo của con người thì không có quyền tác giả. Hệ quả thực tiễn cho studio:

- Asset do AI tạo gần như hoàn toàn có thể **không được bảo hộ** hoặc được bảo hộ hạn chế – khó kiện người khác chép lại.
- Asset AI tạo ra giống tác phẩm của người khác **vẫn có thể là bản sao** nếu chứng minh được mô hình tái tạo tác phẩm gốc.
- Cần lưu hồ sơ về phần đóng góp của con người (prompt, chỉnh sửa, phác thảo) để chứng minh quyền.

Các mốc quốc tế bổ sung:

- **Cục Bản quyền Mỹ – Báo cáo "Copyright and Artificial Intelligence, Part 2: Copyrightability"** (29/01/2025): đầu ra AI chỉ được bảo hộ khi con người quyết định đủ các yếu tố biểu đạt; **prompt tự nó không đủ**, dù phức tạp đến đâu; việc con người **lựa chọn, sắp xếp, chỉnh sửa** đầu ra AI có thể được bảo hộ (nhưng phần AI tạo ra thì không); dùng AI hỗ trợ không làm mất bảo hộ của tác phẩm lớn hơn do con người tạo.
- **Getty Images v. Stability AI** (Tòa Thượng thẩm Anh, 04/11/2025): yêu cầu xâm phạm gián tiếp về bản quyền thất bại vì mô hình không lưu trữ bản sao tác phẩm; Getty chỉ thắng một phần hẹp về **nhãn hiệu** (watermark xuất hiện trong ảnh tạo ra). Bài học cho studio: đầu ra AI mang **dấu vết nhận diện của bên thứ ba** (watermark, logo, chữ ký) là rủi ro thực.
- **Steam** (Valve): từ 1/2024 yêu cầu khai báo nội dung AI (tạo sẵn và tạo trong lúc chạy); từ 1/2026 làm rõ chỉ áp dụng cho nội dung **người chơi tiếp xúc** và tài liệu marketing, không áp dụng cho công cụ hỗ trợ nội bộ (ví dụ trợ lý viết code). Nhà phát triển chịu trách nhiệm bảo đảm nội dung AI không vi phạm bản quyền.

---

## 7. Tài nguyên của bên thứ ba

Hai nhà phát triển có thể mua cùng một bộ asset trên Unity Asset Store, Fab (Unreal), hoặc thuê cùng một studio thuê ngoài, dẫn đến vật phẩm gần như giống hệt nhau mà **không ai chép ai**.

Những điểm cần nắm:

1. Giấy phép asset thường là **không độc quyền** và người bán vẫn giữ quyền tác giả. Vì vậy **không game nào có tư cách kiện game kia** về asset dùng chung; chỉ người bán mới có quyền, và chỉ khi bên kia vi phạm điều khoản giấy phép.
2. Phải kiểm tra điều khoản: sử dụng thương mại, chỉnh sửa, phân phối trong sản phẩm, cấm phân phối asset như sản phẩm độc lập.
3. Studio thuê ngoài có thể **tái sử dụng** thiết kế cho nhiều khách hàng nếu hợp đồng không cấm – cần kiểm tra hợp đồng.
4. Đây là **cổng loại trừ đầu tiên** trước khi cáo buộc đạo nhái (xem mục 9).

---

## 8. Phân biệt các mức độ

| Mức | Đặc điểm | Hệ quả pháp lý có thể có |
|---|---|---|
| **1. Lấy cảm hứng** | Cùng thể loại, chủ đề, mô-típ; tự phát triển thiết kế | Hợp pháp |
| **2. Bắt chước phong cách** | Mô phỏng ngôn ngữ thiết kế, phong cách mỹ thuật của đối thủ | Thường không vi phạm bản quyền (phong cách không được bảo hộ). Có thể là vấn đề đạo đức nghề nghiệp, uy tín; vi phạm nhãn hiệu/chỉ dẫn thương mại nếu gây nhầm lẫn |
| **3. Chép có hệ thống hệ thống game, giao diện, nội dung ("thay da")** | Giữ tổ hợp hệ thống, chỉ số, giao diện đặc thù; đổi đồ họa | Tùy nước: xâm phạm bản quyền (TQ – 太极熊猫; HQ – King v. Avocado), cạnh tranh không lành mạnh (HQ – R2M). Tại VN **chưa có thực tiễn rõ ràng** |
| **4. Sao chép biểu đạt / rip asset / dùng mã nguồn hoặc dữ liệu rò rỉ** | Sao chép mô hình, hình ảnh, mã nguồn, dữ liệu dự án | Xâm phạm quyền tác giả và/hoặc bí mật kinh doanh; có thể bị xử lý hành chính (Nghị định 341/2025) hoặc hình sự (BLHS Điều 225) |

---

## 9. Khung sàng lọc: Cổng → Lọc → So sánh

Phiên bản 1 dùng bảng cộng điểm có trọng số. Mô hình đó có ba lỗi: (1) chấm cả các yếu tố không được bảo hộ; (2) coi bằng chứng nguồn gốc – vốn là điều kiện bắt buộc – như điểm cộng 5%; (3) cộng tuyến tính, trong khi một chi tiết độc đáo bị chép y nguyên có giá trị chứng minh hơn nhiều điểm giống chung chung. Khung dưới đây dựa trên phương pháp trừu tượng hóa – lọc – so sánh (Computer Associates v. Altai, 2d Cir. 1992) và thực tiễn các án ở mục 5.

```
BƯỚC 0 – CỔNG LOẠI TRỪ (có/không, không chấm điểm)
  □ Hai bên có dùng chung asset thương mại hoặc cùng studio thuê ngoài?
  □ Bên bị nghi có chứng cứ sáng tạo độc lập: file gốc, lịch sử commit,
    concept có ngày tháng, hợp đồng với họa sĩ?
  □ Có giấy phép, hợp đồng hợp tác giữa hai bên?
  → Nếu "có" ở bất kỳ mục nào: xác minh trước khi so sánh.

BƯỚC 1 – SAO CHÉP THỰC TẾ (yếu / trung bình / mạnh)
  • Tiếp cận: game gốc công bố trước? nhân sự chuyển việc? từng xin cấp phép?
  • Kỹ thuật: hash file; cấu trúc mesh; số đỉnh; bố cục UV; tên file texture;
    tên biến, bảng dữ liệu; chỉ số trùng đến từng số lẻ
  • Chi tiết "bẫy": lỗi, ký hiệu ẩn, chi tiết thừa vô nghĩa bị chép lại
  • Thời gian: sản phẩm bị nghi phát triển trong thời gian ngắn bất thường?

BƯỚC 2 – LỌC (loại khỏi phạm vi so sánh)
  • Mô-típ thể loại: giáp rồng, cánh thiên thần, trượng phát sáng, hào quang
  • Yếu tố chức năng: silhouette lớp, thanh HP/MP, bố cục UI chuẩn
  • Chuẩn thể loại MMORPG đã phổ biến: auto-hunt, cường hóa +1..+15,
    bảng xếp hạng, hệ thống bang hội (xem vụ ArcheAge War, ROM)
  • Yếu tố từ nguồn chung: thần thoại, lịch sử, võ thuật, asset thương mại
  • Ý tưởng, luật chơi trừu tượng (Điều 15 khoản 3 Luật SHTT)

BƯỚC 3 – SO SÁNH PHẦN CÒN LẠI (định tính)
  • Từng tài sản: các lựa chọn sáng tạo đặc thù có trùng không?
    (tỷ lệ, cấu trúc lớp giáp, hoa văn, bố cục chi tiết, chuỗi animation)
  • Tổng thể: sự lựa chọn và sắp xếp các yếu tố có trùng không?
  • Tính hệ thống: bao nhiêu tài sản trùng? có đi theo bộ, theo hệ thống
    (ví dụ: cả bộ trang bị + bảng chỉ số + tên gọi cùng tương ứng)?

KẾT LUẬN SÀNG LỌC
  • Bước 1 "mạnh" + Bước 3 trùng đáng kể  → đủ cơ sở giám định, tư vấn luật sư
  • Bước 1 "yếu"  + Bước 3 trùng đáng kể  → điều tra thêm nguồn gốc trước
  • Bước 3 chỉ trùng phần đã lọc ở Bước 2 → khả năng cao là cùng thể loại
  • Có chứng cứ rò rỉ dữ liệu nội bộ      → xem xét bí mật kinh doanh
                                            dù đồ họa không giống
```

> **Cảnh báo:** Đây là khung sàng lọc phục vụ nghiên cứu, không phải tiêu chuẩn pháp lý, không thay thế giám định hoặc đánh giá của luật sư/tòa án.

---

## 10. Quy trình điều tra tại Việt Nam

1. **Xác định đối tượng:** game gốc, game bị nghi; ngày phát hành, ngày công bố thiết kế, lịch sử cập nhật; đơn vị phát triển và đơn vị phát hành tại Việt Nam.
2. **Cố định chứng cứ:**
   - Lập **vi bằng** qua Thừa phát lại đối với nội dung game, website, trang mạng xã hội trước khi bên kia sửa đổi.
   - Lưu bản client có ngày tháng, patch notes, ảnh chụp lưu trữ web (Wayback Machine).
   - Chụp/quay tài sản ở cùng góc nhìn, cùng điều kiện ánh sáng.
3. **Phân tích kỹ thuật:** trích xuất và so sánh file tài nguyên (hash, mesh, UV, texture); so sánh bảng dữ liệu chỉ số. Đây là chứng cứ có giá trị cao hơn so sánh bằng mắt.
4. **Rà soát nguồn và chuỗi quyền:** giấy phép asset, hợp đồng với họa sĩ/studio thuê ngoài (Điều 39), hợp đồng cấp phép phát hành tại Việt Nam.
5. **Áp dụng khung sàng lọc** ở mục 9.
6. **Trưng cầu giám định** quyền tác giả theo Điều 201 Luật SHTT.
7. **Lựa chọn cơ chế xử lý:**
   - Gỡ bỏ nội dung trên nền tảng số (Điều 202, bổ sung 2025).
   - Xử phạt hành chính (Nghị định 341/2025/NĐ-CP).
   - Khởi kiện dân sự: quyền tác giả, bí mật kinh doanh, cạnh tranh không lành mạnh, nhãn hiệu – có thể kết hợp.
   - Tố giác hình sự (BLHS Điều 225) với server lậu có quy mô thương mại.
8. **Đánh giá pháp luật áp dụng:** quyền tác giả có tính lãnh thổ; vi phạm tại Việt Nam áp dụng pháp luật Việt Nam, kể cả với game nước ngoài.

---

## 11. Kết luận

1. **Không ai độc quyền được** lớp nhân vật, mô-típ hay phong cách mỹ thuật.
2. **Thiết kế cụ thể có tính nguyên gốc được bảo hộ tự động**, kể cả tác phẩm nước ngoài (qua Công ước Berne). Giấy chứng nhận đăng ký tạo suy đoán quyền có lợi cho người đăng ký (Điều 49).
3. **Không cần chép file mới vi phạm.** Dựng lại bằng tay, chuyển 2D sang 3D vẫn có thể là sao chép hoặc làm tác phẩm phái sinh (Atari v. Philips; 奇迹MU).
4. **Tương đồng có hệ thống là chứng cứ gián tiếp mạnh** của việc sao chép, nhưng phải chứng minh **cả** sao chép thực tế **và** tương đồng ở phần được bảo hộ, sau khi đã lọc mô-típ thể loại và yếu tố chức năng. Sáng tạo độc lập là lý do miễn trừ hoàn toàn. Có tiếp cận và cố ý mô phỏng cũng chưa đủ (Capcom v. Data East).
5. **Không vi phạm bản quyền chưa có nghĩa là hợp pháp.** Trong thực tiễn MMORPG gần đây, bên kiện thường thắng bằng **cạnh tranh không lành mạnh** (R2M) hoặc **bí mật kinh doanh** (Dark and Darker), còn yêu cầu bản quyền bị bác. Ngược lại, chép hệ thống rồi "thay da" có thể bị coi là xâm phạm bản quyền tại Trung Quốc và Hàn Quốc.
6. **Các hệ thống đã thành chuẩn thể loại không còn được bảo hộ** như sáng tạo riêng của người đi đầu (ArcheAge War, ROM). Người đi trước càng thành công, thiết kế của họ càng dễ trở thành "chuẩn" mà người khác được dùng.
7. **Tại Việt Nam**, thực tiễn xử lý tập trung ở server lậu và sao chép trực tiếp. Tranh chấp tương đồng thiết kế giữa hai game độc lập vẫn là khoảng trống; các án nước ngoài chỉ có giá trị tham khảo. Nhưng studio Việt Nam phát hành ra quốc tế **có thể bị kiện tại tòa nước ngoài** (Riot v. Imba).
8. **Rủi ro thực tế lớn nhất nằm ở chuỗi cung ứng tài sản**: tài liệu tham khảo không rõ nguồn, nhân viên cũ, nhà cung cấp, chợ asset, công cụ AI (mục 5.6). Phòng ngừa bằng quy trình hiệu quả hơn nhiều so với tranh tụng sau khi sự cố đã xảy ra.

**Phân biệt luật hiện hành và quan điểm:** Các kết luận 1–7 mô tả pháp luật và thực tiễn hiện hành. Quan điểm của người nghiên cứu – rằng một game "không nên được phép lấy toàn bộ thành quả thiết kế đặc trưng của game khác rồi chỉ đổi màu sắc và tên gọi" – là quan điểm về việc pháp luật **nên** như thế nào. Theo pháp luật hiện hành, hành vi đó chỉ bị xử lý khi đáp ứng các điều kiện ở mục 2; nếu phần bị lấy chủ yếu là yếu tố không được bảo hộ, hành vi có thể đáng chê trách về mặt nghề nghiệp nhưng vẫn hợp pháp.

---

## 12. Nguồn tham khảo

### Văn bản pháp luật

1. Luật Sở hữu trí tuệ – Văn bản hợp nhất 11/VBHN-VPQH 2022: https://thuvienphapluat.vn/van-ban/So-huu-tri-tue/Van-ban-hop-nhat-11-VBHN-VPQH-2022-Luat-So-huu-tri-tue-556862.aspx
2. Luật 131/2025/QH15 sửa đổi Luật SHTT: https://thuvienphapluat.vn/van-ban/So-huu-tri-tue/Luat-So-huu-tri-tue-sua-doi-2025-so-131-2025-QH15-675267.aspx
3. Bộ Tư pháp – Điểm mới Luật SHTT sửa đổi 2025: https://moj.gov.vn/portal/tin-tuc/infographic/luat-sua-oi-bo-sung-mot-so-ieu-cua-luat-so-huu-tri-tue-chinh-thuc-co-hieu-luc-voi-nhieu-iem-moi-ang-chu-y-tfql690cfa.html
4. VTC News – Quy định về AI trong Luật SHTT sửa đổi: https://vtcnews.vn/nhung-quy-dinh-ve-ai-trong-luat-so-huu-tri-tue-sua-doi-co-hieu-luc-tu-ngay-1-4-ar1010602.html
5. Nghị định 134/2026/NĐ-CP sửa đổi Nghị định 17/2023/NĐ-CP: https://thuvienphapluat.vn/van-ban/So-huu-tri-tue/Decree-134-2026-ND-CP-amendment-to-Decree-17-2023-ND-CP-elaborating-Law-on-Intellectual-Property-704845.aspx
6. Nghị định 341/2025/NĐ-CP về xử phạt vi phạm hành chính về quyền tác giả: https://thuvienphapluat.vn/van-ban/So-huu-tri-tue/Nghi-dinh-341-2025-ND-CP-xu-phat-vi-pham-hanh-chinh-quyen-tac-gia-quyen-lien-quan-578605.aspx
7. Cục Bản quyền tác giả – Giới thiệu Nghị định 341/2025: https://cov.gov.vn/tin-tuc/gioi-thieu-nghi-dinh-so-3412025ndcp-quy-dinh-xu-phat-vi-pham-hanh-chinh-ve-quyen-tac-gia-quyen-lien-quan-168844.html
8. Cục Bản quyền tác giả – Không đăng ký quyền tác giả có được khởi kiện không: https://cov.gov.vn/quyen-tac-gia-quyen-lien-quan/khong-dang-ky-quyen-tac-gia-co-duoc-khoi-kien-khong-168731.html

### Án lệ Hoa Kỳ

9. Tetris Holding v. Xio Interactive – toàn văn (có ảnh so sánh đối chiếu): https://cases.justia.com/federal/district-courts/new-jersey/njdce/3:2009cv06115/235418/61/0.pdf
10. Capcom U.S.A. v. Data East – tổng quan và tài liệu: https://en.wikipedia.org/wiki/Capcom_U.S.A._Inc._v._Data_East_Corp.
11. Data East USA v. Epyx: https://en.wikipedia.org/wiki/Data_East_USA,_Inc._v._Epyx,_Inc.
12. Thaler v. Perlmutter – Tòa Tối cao từ chối thụ lý: https://www.hklaw.com/en/insights/publications/2026/03/the-final-word-supreme-court-refuses-to-hear-case-on-ai-authorship

### Án lệ Trung Quốc

13. 奇迹MU v. 奇迹神话 – Nhân dân Nhật báo: http://ip.people.com.cn/n1/2016/0513/c136655-28348719.html
14. 奇迹MU v. 奇迹神话 – Mạng SHTT Trung Quốc: http://www.cnipr.com/sj/zx/201707/t20170718_212777.html
15. 太极熊猫 v. 花千骨 – Mỗi ngày Kinh tế (2018): https://www.nbd.com.cn/articles/2018-04-12/1207462.html
16. 太极熊猫 v. 花千骨 – Tòa án Nhân dân Tối cao (tin địa phương): https://www.court.gov.cn/zixun/xiangqing/227431.html

### Án lệ Hàn Quốc

17. King.com v. Avocado – JETRO (tóm tắt án): https://www.jetro.go.jp/world/asia/kr/ip/case/2017/3bb7ad70d7d41964.html
18. King.com v. Avocado – Tòa án Tối cao Hàn Quốc: https://www.scourt.go.kr/eng/supreme/decisions/NewDecisionsView.work?pageIndex=1&seq=389
19. NCSoft v. Webzen – phúc thẩm 2025: https://www.asiae.co.kr/en/article/2025033111124932991
20. NCSoft v. Webzen – sơ thẩm 2023: https://www.koreajoongangdaily.com/business/claws-out-for-koreas-copycat-game-industry-after-lineage-m-ruling/11883574
21. NCSoft v. Kakao Games – ArcheAge War phúc thẩm 2026: https://www.gamemeca.com/en/view.php?gid=1772599
22. NCSoft v. Kakao Games – ROM 2026: https://view.asiae.co.kr/en/article/2026071317020325335
23. Nexon v. Ironmace – Tòa Tối cao 2026: https://www.koreatimes.co.kr/business/companies/20260430/supreme-court-sides-with-nexon-in-trade-secret-dispute-with-ironmace
24. Nexon v. Ironmace – sơ thẩm 2025: https://www.pcgamer.com/gaming-industry/dark-and-darker-developer-did-not-commit-copyright-infringement-court-rules-but-has-to-pay-nexon-nearly-usd6-million-anyway

### Nhật Bản và Việt Nam

25. Nintendo v. Pocketpair – diễn biến: https://www.gamesradar.com/games/survival/as-palworld-lawsuit-drags-on-nintendo-tries-and-fails-to-secure-another-patent-on-monster-capturing-mechanics/
26. Khởi tố vụ server lậu "Con đường tơ lụa": https://vtcnews.vn/khoi-to-3-bi-can-sao-chep-trai-phep-game-con-duong-to-lua-ar1034867.html
27. Khởi tố vụ server lậu "Con đường tơ lụa" – VietnamPlus: https://www.vietnamplus.vn/khoi-to-3-bi-can-xam-pham-quyen-tac-gia-tro-choi-con-duong-to-lua-post1130741.amp

### Bổ sung v2.1 – án lệ và sự cố

28. Lilith v. 圣树唤歌 – Nam Đô (2026): https://m.mp.oeeee.com/a/BAAFRD0000202608121642479.html
29. Chỉ dẫn xét xử game online của Tòa Cấp cao Quảng Đông (2020): https://www.court.gov.cn/zixun/xiangqing/225471.html
30. Án (2023)粤民终4326号 – phân tích: https://m.163.com/dy/article/L3AQCHPL0514DT7M.html
31. Tencent v. Moonton – Dot Esports: https://dotesports.com/league-of-legends/news/source-riot-games-parent-tencent-wins-lawsuit-mobile-legends-3
32. Riot v. Moonton bị bác tại Mỹ – PC Gamer: https://www.pcgamer.com/us-judge-tells-riot-to-take-league-of-legends-lawsuit-to-china
33. Riot v. Imba Technology – Pocket Gamer.biz: https://www.pocketgamer.biz/riot-games-sues-imba/
34. Riot v. Imba – WSGR (2023): https://www.wsgr.com/en/insights/league-of-legends-copycat-companies-must-face-ip-lawsuit-in-the-us.html
35. Krafton v. NetEase – Game Developer: https://www.gamedeveloper.com/business/krafton-and-netease-settle-over-i-pubg-i-i-knives-out-i-copyright-quarrel
36. Bungie *Marathon* – PC Gamer: https://www.pcgamer.com/games/fps/artist-accuses-bungie-of-stealing-her-designs-for-marathons-art-i-am-tired-of-designers-from-huge-companies-moodboarding-and-parasitising-my-designs-while-i-struggle-to-make-a-living
37. Bungie *Marathon* – Windows Central: https://www.windowscentral.com/gaming/bungie-responds-to-marathon-art-theft-controversy-admitting-it-stole-assets-and-blaming-a-former-developer
38. *Pokémon TCG Pocket* – GamesRadar: https://www.gamesradar.com/games/pokemon/pokemon-tcg-pocket-owns-up-to-art-blunder-after-providing-incorrect-reference-materials-as-official-documents-when-commissioning-new-cards
39. *Stellaris: Galaxy Command* – Game Developer: https://gamedeveloper.com/production/paradox-takes-i-stellaris-galaxy-command-i-offline-over-stolen-i-halo-4-i-artwork
40. *Bleak Faith: Forsaken* – PC Gamer: https://pcgamer.com/indie-dev-accused-of-using-stolen-fromsoftware-animations-removes-them-warns-others-against-trusting-marketplace-assets
41. Bản sao *Unpacking* – PC Gamer: https://www.pcgamer.com/uk/publisher-apologizes-for-lack-of-research-after-releasing-an-obvious-unpacking-clone

### Bổ sung v2.1 – pháp luật, chính sách nền tảng, AI

42. Luật Trí tuệ nhân tạo 134/2025/QH15: https://thuvienphapluat.vn/van-ban/Cong-nghe-thong-tin/Luat-Tri-tue-nhan-tao-2025-so-134-2025-QH15-679013.aspx
43. Nghị định 147/2024/NĐ-CP: https://thuvienphapluat.vn/van-ban/Cong-nghe-thong-tin/Nghi-dinh-147-2024-ND-CP-quan-ly-cung-cap-su-dung-dich-vu-Internet-thong-tin-tren-mang-480755.aspx
44. Thủ tục cấp Quyết định phát hành G1 – Cổng Dịch vụ công: https://dichvucong.gov.vn/p/home/dvc-chi-tiet-thu-tuc-hanh-chinh.html?ma_thu_tuc=2.001677
45. Thỏa thuận bảo vệ bí mật kinh doanh theo BLLĐ 2019 – Tạp chí Luật sư Việt Nam: https://lsvn.vn/mot-so-van-de-ve-thoa-thuan-bao-ve-bi-mat-kinh-doanh-bi-mat-cong-nghe-giua-nguoi-lao-dong-va-nguoi-su-dung-lao-dong-theo-quy-dinh-cua-bo-luat-lao-dong-nam-20191624369973-a105439.html
46. Cục Bản quyền Mỹ – Báo cáo AI Part 2: https://www.copyright.gov/newsnet/2025/1060.html
47. Getty Images v. Stability AI – CMS case tracker: https://cms.law/en/int/publication/artificial-intelligence-and-copyright-case-tracker/united-kingdom-getty-images-us-inc-ors-v-stability-ai-ltd
48. Steam – cập nhật khai báo AI (1/2026): https://www.gamingonlinux.com/2026/01/valve-tweak-steam-ai-disclosure-form-for-developers-to-clarify-its-for-content-consumed-by-players
49. Unity Asset Store Terms of Service and EULA: https://unity.com/legal/as-terms ; FAQ: https://assetstore.unity.com/browse/eula-faq
50. Fab – Licenses and pricing: https://dev.epicgames.com/documentation/en-us/fab/licenses-and-pricing-in-fab
51. Monotype – giấy phép font cho game: https://www.monotype.com/resources/expertise/understanding-game-licensing-monotype
52. QMUL/WIPO – Nghiên cứu toàn cầu về xâm phạm bản quyền và chiến lược thực thi trong ngành game (2022), tài liệu WIPO/ACE/15/4: https://www.qmul.ac.uk/news/latest-news/2022/pr/ip-is-the-name-of-the-game-first-global-study-into-copyright-infringement-and-enforcement-strategies-in-the-video-game-industry-reveals-key-threats-and-recommendations.html

### Tài liệu chuyên khảo

53. WIPO – *Mastering the Game: Business and Legal Issues for Video Game Developers* (2022): https://tind.wipo.int/record/45851/files/wipo-pub-2022-en-mastering-the-game.pdf

### Về hình ảnh

Phiên bản 1 nhúng ảnh từ MU Online, Black Desert, World of Warcraft, Behance, GGAC. Phiên bản 2 **bỏ các ảnh này** vì: (1) một ảnh đơn lẻ không minh họa được "sao chép"; (2) có link hỏng (Getty Images trỏ về trang chủ); (3) một ảnh dùng lại ba lần cho ba mục đích; (4) nguồn ảnh WoW là bài đăng cá nhân. Nếu cần minh họa, nên dùng **ảnh so sánh đối chiếu có trong bản án** (ví dụ bản án Tetris v. Xio, nguồn 9) hoặc tự dựng ảnh so sánh từ tài sản có quyền sử dụng.

---

**Ghi chú phương pháp:** Tài liệu là nghiên cứu định hướng và khung sàng lọc ban đầu, không phải ý kiến pháp lý cho một tranh chấp cụ thể. Các vụ án nước ngoài được đối chiếu qua báo chí và tài liệu pháp lý thứ cấp; số liệu bồi thường và kết quả phúc thẩm được đánh dấu ⚠️ cần đối chiếu bản án gốc. Trạng thái các vụ còn đang xét xử (NCSoft v. Webzen tại Tòa Tối cao Hàn Quốc, Nintendo v. Pocketpair) được cập nhật đến thời điểm biên soạn.
