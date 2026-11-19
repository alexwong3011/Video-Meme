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

## 1b. Mục tiêu đã làm rõ (2026-11-19) — ƯU TIÊN HƠN mục 1

- Bản **đơn giản** so với MU. Không cần hành động và chuyển động chi tiết.
- **Tiêu chí số 1: hình ảnh có tính nghệ thuật cao và sắc nét** như ảnh mẫu.
- Chuyển động chỉ cần: **vung tay tấn công**, **lơ lửng khi đeo cánh**. Không cần animation đi bộ.
- Nội dung ban đầu: **1 map nhỏ, 1 bãi quái vài chục con**.
- Vòng lặp chơi: **đánh quái → lên cấp → rơi đồ → mặc đồ, nâng cấp → đánh quái mạnh hơn**.

### Phân tích lại theo mục tiêu mới

**Nhận định chính:** độ "nghệ thuật, sắc nét" trong ảnh mẫu không đến từ số đa giác, mà đến từ
màu sắc, ánh sáng, vật liệu phát sáng (emission), bloom, chỉnh màu và hiệu ứng hạt.
Đây là những thứ làm bằng **shader + hậu kỳ + VFX**, tức là phần code được, không cần họa sĩ 3D.

**Chiến thuật đồ họa:**
1. **Một shader phong cách chung** cho mọi mô hình (toon/hand-painted + rim light + emission).
   Mô hình lấy từ nhiều nguồn khác nhau sẽ nhìn đồng bộ.
2. **Hậu kỳ URP:** bloom, color grading (LUT), vignette, fog dưới nước, caustics ánh sáng đáy biển.
3. **Độ sắc nét trên điện thoại:** render scale 1.0, MSAA 4x, không dùng TAA, texture đủ độ phân giải,
   sharpen nhẹ, UI vẽ ở độ phân giải gốc.
4. **Map dưới đáy biển rất có lợi:** nhân vật lơ lửng và quái cá/sứa/cua đều "trôi",
   nên chuyển động làm bằng code (procedural) thay vì hoạt ảnh xương.

**Chuyển động — gần như không cần hoạt ảnh xương:**
| Đối tượng | Cách làm |
|---|---|
| Nhân vật lơ lửng | Code: nhấp nhô lên xuống, nghiêng theo hướng bay, cánh vỗ nhẹ (shader hoặc xương đơn giản) |
| Vung tay tấn công | 1 clip từ Mixamo + vệt chém (trail) + chớp sáng khi trúng |
| Quái bơi, trôi | Code: nhấp nhô, uốn thân bằng vertex shader (kiểu cá bơi) |
| Quái chết | Shader tan biến (dissolve) + hạt sáng + rơi đồ |
| Trúng đòn | Chớp trắng, lùi nhẹ, số sát thương bay lên |

**Hệ thống game (phần code, AI làm tốt nhất):**
- Chỉ số nhân vật, đường cong kinh nghiệm, lên cấp, cộng điểm.
- Spawner bãi quái: vài chục con, hồi sinh theo thời gian, vùng quái mạnh/yếu.
- AI quái: lang thang, phát hiện, đuổi, tấn công, quay về.
- Bảng rơi đồ theo độ hiếm (thường/hiếm/huyền thoại), đồ có chỉ số ngẫu nhiên.
- Túi đồ, trang bị (vũ khí, giáp, cánh), nâng cấp +1…+15 có hiệu ứng phát sáng tăng dần.
- **Tự động đánh (auto-hunt)** — rất hợp với game grinding trên điện thoại.
- Lưu game cục bộ (JSON), dữ liệu quái và đồ bằng ScriptableObject.

**Phần nhìn thấy của trang bị — giữ đơn giản:**
- Chỉ **vũ khí** và **cánh** đổi mô hình. Giáp chỉ đổi màu/độ phát sáng bằng shader.
- Icon đồ vật tạo bằng AI ảnh, xử lý cho đồng bộ khung và nền.

**Quy trình tài nguyên đồ họa (không có họa sĩ 3D):**
concept bằng AI ảnh → image-to-3D (Hunyuan3D/Tripo/Meshy) → Blender dọn dẹp
(Claude viết **script Python cho Blender** để giảm đa giác, đặt tâm, xuất FBX hàng loạt)
→ Unity với shader chung → hậu kỳ.

**Rủi ro lớn nhất:** mô hình **nhân vật chính** do AI tạo có thể không đủ đẹp.
Phương án: dùng £20 mua **một** gói nhân vật/giáp phong cách fantasy trên Asset Store (khi giảm giá)
thay vì trả phí Google Play — Play Console chỉ cần khi phát hành, còn thử trên máy thì cài APK miễn phí.

**Yêu cầu phần cứng và kỹ năng:**
- PC Windows: GPU tầm GTX 1060/RTX 2060 trở lên, RAM 16GB, SSD trống ~50GB.
- Điện thoại Android tầm trung để thử.
- Người dùng cần biết thao tác cơ bản: mở project Unity, bấm Play, kéo thả prefab, build APK;
  trong Blender chỉ cần chạy script Claude viết sẵn.

**Ước lượng:** bản chơi được (1 map, 3–4 loại quái, ~30 con, rơi đồ, lên cấp, auto-hunt)
khoảng 1–3 tháng làm bán thời gian.

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

## 7. Kế hoạch (cập nhật theo mục tiêu mới)

**Bước 0 — Chuẩn bị (người dùng, trên Windows):** Unity Hub + Unity 6 LTS (kèm Android Build Support),
Blender, Git, VS Code, tài khoản Mixamo, bật USB debugging trên Android.

**Bước 1 — Khung dự án + "góc nhìn đẹp" trước tiên:** project URP trong `game/`, camera chéo cố định,
shader phong cách chung, hậu kỳ (bloom, color grading, fog, caustics), map đáy biển nhỏ.
Mục tiêu: một ảnh chụp màn hình đạt cảm giác như ảnh mẫu trước khi làm gameplay.

**Bước 2 — Nhân vật:** mô hình + cánh phát sáng, lơ lửng bằng code, 1 clip vung tay, joystick ảo.

**Bước 3 — Bãi quái:** 3–4 loại quái trôi/bơi, spawner ~30 con, AI quái, trúng đòn, chết tan biến.

**Bước 4 — Vòng lặp grinding:** kinh nghiệm, lên cấp, rơi đồ theo độ hiếm, túi đồ, trang bị,
nâng cấp +1…+15 phát sáng, auto-hunt, lưu game.

**Bước 5 — Điện thoại:** build APK, đo FPS, tối ưu.

## 8. Việc tiếp theo

- [ ] Người dùng cài xong Bước 0 và báo phiên bản Unity.
- [ ] Đặt tên và ý tưởng thế giới riêng (không dùng tên MU).
- [ ] Quyết định dùng £20 cho gói nhân vật trên Asset Store hay thử AI trước.
- [ ] Claude tạo khung dự án Unity trong `game/` (Bước 1).

## 9. Đổi hướng: làm bằng web 3D (2026-11-19)

- Máy người dùng **không có card đồ họa** → bỏ Unity, chuyển sang **Three.js (WebGL)**, Claude viết toàn bộ bằng code.
- Phiên cloud render được WebGL2 qua headless Chromium (SwiftShader), nên Claude tự chụp màn hình để kiểm tra hình ảnh.
- Kiểm tra cục bộ: `npm i three@0.160.0` trong scratchpad, chạy `python3 -m http.server` trong thư mục demo,
  Playwright chặn URL jsdelivr và trả file từ `node_modules` (jsdelivr bị proxy chặn trong cloud).

### Demo đã làm: `game/demo-day-bien/index.html`
- Link chơi thử (artifact, riêng tư): https://claude.ai/artifact/3NUHdxYh66beQxqLDat1os
- Ảnh chụp: `game/demo-day-bien/screenshot.png`
- Nội dung: map đáy biển nhỏ (cát + caustics bằng shader, đá pha lê, san hô phát sáng, rong biển lay động,
  cổng đá cổ có cổng sáng), nhân vật "Hải Kỵ" dựng bằng khối cơ bản + giáp kim loại + cánh quạt lông vũ vẽ bằng shader,
  lơ lửng, vung kích; 29 quái (Sứa Lân Quang, Cá Gai Hỏa) có AI lang thang/đuổi đánh, hồi sinh;
  rơi đồ theo độ hiếm có cột sáng, nhặt đồ, vàng, kinh nghiệm, lên cấp; tự động đánh; kỹ năng "Lốc Triều";
  joystick + nút trên điện thoại, WASD/Space/Q/F trên máy tính; bloom, tone mapping, MSAA, tự hạ độ phân giải nếu FPS thấp.

### Điểm yếu đã biết / việc tiếp theo
- [ ] Nhân vật chính dựng bằng khối cơ bản, còn đơn giản → thử mô hình CC0 (Quaternius/KayKit) hoặc AI image-to-3D.
- [ ] Cánh bị mỏng khi nhìn ngang; cân nhắc thêm lớp cánh thứ hai hoặc billboard.
- [ ] Người dùng mở link trên điện thoại, báo FPS và cảm nhận.
- [ ] Túi đồ, trang bị, nâng cấp +1…+15, lưu game (localStorage).
