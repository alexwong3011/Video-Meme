# Handoff: Nghiên cứu ban đầu — Game mobile 3D ARPG (offline)

> Cập nhật: 2026-11-19. File này dùng để tiếp tục công việc ở các phiên sau.
> Phiên sau: đọc file này trước, rồi hỏi người dùng đang ở bước nào.

## 1. Mục tiêu

Làm thử một game mobile 3D **offline**, thể loại ARPG góc nhìn chéo từ trên xuống,
đánh quái, nhân vật có cánh/aura phát sáng. Ảnh tham khảo có phong cách giống MU Online:
- Ảnh 1 và 3: phong cách Warcraft III, mô hình ít đa giác, texture vẽ tay, hiệu ứng phát sáng.
- Ảnh 2: bản đồ đáy biển, san hô, quái cá, bản đồ nhỏ, chất lượng tầm game PC khoảng 2015–2018.

**Bản quyền:** chỉ lấy cùng thể loại và cảm giác. Không dùng tên, nhân vật, bản đồ, thiết kế cánh
hay vật phẩm của MU (Devil Square, Atlans, Pouch of Blessing…). Thế giới và tên gọi phải là của riêng mình.

## 2. Điều kiện của người dùng (đã chốt)

| Câu hỏi | Trả lời |
|---|---|
| Offline hay online | **Offline** (chơi thử trước) |
| Đội | **Không có ai làm 3D**. Chỉ người dùng vibe code cùng Claude |
| Ngân sách | **£20**, thời gian không vội |
| Máy | **Windows**, nên làm **Android trước**. iOS cần máy Mac và phí $99/năm, để sau |

## 3. Kết luận nghiên cứu

- Riêng phần đồ họa ở mức ảnh mẫu thì không quá khó, điện thoại tầm trung chạy tốt.
  Góc camera cố định từ trên chéo xuống giúp giảm tải rất nhiều.
- Phần khó: khối lượng nội dung (mô hình, hoạt ảnh, hiệu ứng), cảm giác đánh, hiệu năng trên điện thoại.
  Chọn offline đã bỏ được phần khó nhất là máy chủ.
- Rủi ro hiệu năng chính: hiệu ứng phát sáng chồng lên nhau (overdraw), số lần vẽ (draw call), máy nóng.

### Mức quy mô

| Quy mô | Nội dung | Nhân sự | Thời gian |
|---|---|---|---|
| **A. Bản chơi thử** ← đang chọn | 1 bản đồ, 1 nhân vật có cánh, 3–5 quái, 3–4 chiêu | 1 người + AI | 1–3 tháng |
| B. ARPG offline đầy đủ | 3 lớp nhân vật, 5–10 bản đồ, trang bị, nâng cấp | 3–8 người (hoặc 1 người + AI, lâu hơn nhiều) | 9–18 tháng |
| C. MMORPG kiểu MU | Online, PK, bang hội, giao dịch | 20–50+ người | 2–3 năm, hàng triệu USD |

## 4. Bộ công cụ trong ngân sách £20

| Hạng mục | Công cụ | Giá |
|---|---|---|
| Engine | **Unity 6 Personal, pipeline URP** | Miễn phí (doanh thu < $200k/năm) |
| Viết code | Claude Code (C#) + VS Code hoặc Visual Studio Community | Miễn phí |
| Mô hình 3D | Blender | Miễn phí |
| Mô hình 3D bằng AI | Hunyuan3D (mã nguồn mở, có bản dùng thử trên Hugging Face), gói miễn phí của Tripo hoặc Meshy | Miễn phí, có giới hạn lượt |
| Gắn xương và hoạt ảnh | Mixamo, Reallusion AccuRIG | Miễn phí |
| Tài nguyên có sẵn | Gói miễn phí trên Unity Asset Store, Quaternius và Kenney (CC0), Poly Haven | Miễn phí |
| Hiệu ứng | Unity Particle System, Shader Graph, gói VFX miễn phí trên Asset Store | Miễn phí |
| Concept art | Gói miễn phí của các công cụ tạo ảnh AI | Miễn phí |
| Âm thanh | Freesound (xem kỹ giấy phép), bộ Sonniss GDC miễn phí | Miễn phí |
| Quản lý mã | Git và GitHub (repo này) | Miễn phí |
| Phát hành Android | Tài khoản Google Play Console | **$25 một lần (≈ £20)** — để dành ngân sách cho khoản này |

Lưu ý: tài nguyên miễn phí từ nhiều nguồn sẽ lệch phong cách. Nên chọn một phong cách thống nhất
(ví dụ ít đa giác, màu phẳng cộng hiệu ứng phát sáng) để dễ đồng bộ.

## 5. AI làm được gì

- **Làm tốt:** code C# cho Unity (chiến đấu, kỹ năng, AI quái, túi đồ, giao diện, shader, công cụ editor),
  tài liệu thiết kế, bảng chỉ số, cốt truyện, concept art, mô hình đồ vật và cảnh (đá, san hô, rương, vũ khí),
  hiệu ứng âm thanh, gắn xương tự động.
- **Cần người chỉnh:** mô hình nhân vật và quái (lưới đa giác và UV lộn xộn), giữ phong cách đồng nhất,
  tinh chỉnh hiệu ứng phát sáng bằng mắt.
- **Chưa thay được:** cảm giác đánh và độ vui (phải chơi thử), đo hiệu năng trên điện thoại thật,
  thao tác trực tiếp trong Unity Editor.

## 6. Cách làm việc giữa người dùng và Claude

- Phiên Claude trên cloud **không có Unity và không có GPU**. Claude viết code và tài liệu vào repo này rồi push.
  Người dùng pull về máy Windows, mở bằng Unity để chạy thử, sau đó báo lại lỗi, ảnh chụp hoặc cảm nhận.
- Cách khác: nối máy Windows vào phiên qua Remote Control để Claude chạy lệnh trực tiếp trên máy.
- Mã game Unity sẽ để trong một thư mục riêng của repo (ví dụ `game/`), kèm `.gitignore` cho Unity.

## 7. Kế hoạch bản chơi thử (mức A)

**Bước 0 — Chuẩn bị (người dùng làm trên Windows)**
1. Cài Unity Hub, Unity 6 LTS, kèm Android Build Support (gồm OpenJDK, Android SDK và NDK).
2. Cài Blender, Git, VS Code.
3. Tạo tài khoản Mixamo (dùng tài khoản Adobe miễn phí).
4. Bật Developer Options và USB debugging trên điện thoại Android.

**Bước 1 — Khung dự án**
- Tạo project Unity 3D URP trong `game/`, cấu hình cho mobile, thêm `.gitignore`.
- Camera góc chéo cố định đi theo nhân vật, joystick ảo, nút chiêu.

**Bước 2 — Lối chơi cốt lõi** (tạm dùng khối hộp thay cho mô hình)
- Di chuyển, đánh thường, 3 chiêu có thời gian hồi.
- 3 loại quái với AI đơn giản (đuổi, tấn công, chết, rơi đồ).
- Máu, năng lượng, kinh nghiệm, lên cấp.

**Bước 3 — Thay đồ họa thật**
- Bản đồ đáy biển (đá, san hô, ánh sáng xanh) từ tài nguyên miễn phí và AI.
- Nhân vật chính gắn xương bằng Mixamo, cánh phát sáng làm bằng particle và shader.
- Hiệu ứng chiêu thức, rung màn hình, số sát thương bay lên.

**Bước 4 — Chạy trên điện thoại**
- Build APK, thử trên máy thật, đo FPS, tối ưu overdraw và draw call.

## 8. Việc tiếp theo

- [ ] Người dùng cài đặt xong Bước 0 và báo phiên bản Unity đã cài.
- [ ] Đặt tên và ý tưởng thế giới riêng cho game (không dùng tên MU).
- [ ] Claude tạo khung dự án Unity trong `game/` (Bước 1).
