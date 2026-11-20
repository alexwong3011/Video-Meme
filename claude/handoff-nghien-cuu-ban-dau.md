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
- [x] Đã thay nhân vật bằng **KayKit Adventurers – Knight (CC0, Kay Lousberg)**, lấy từ GitHub `KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0`.
  Đã cắt còn 7 động tác (Jump_Idle để lơ lửng, 2H_Melee_Attack_Slice/Chop, 2H_Melee_Attack_Spin, 2H_Melee_Idle, Cheer, Hit_A) bằng `@gltf-transform`.
  Lưu dạng base64 trong `assets/knight.json` vì artifact không phục vụ file `.glb`. Áo choàng đỏ đổi sang xanh, giáp thép tối hơn bằng shader.
  Xem cận cảnh nhân vật: thêm `#nhan-vat` vào cuối link.
  Hạn chế: phong cách chibi (đầu to) khác tỷ lệ người thật như MU. Quaternius (tỷ lệ thật hơn) không tải được từ cloud.
- [ ] Cánh bị mỏng khi nhìn ngang; cân nhắc thêm lớp cánh thứ hai hoặc billboard.
- [ ] Người dùng mở link trên điện thoại, báo FPS và cảm nhận.
- [ ] Túi đồ, trang bị, nâng cấp +1…+15, lưu game (localStorage).

## 10. Nhân vật tỷ lệ thật + hệ thống đồ (2026-11-19)

- **Nhân vật:** thay KayKit chibi bằng **Quaternius Universal Animation Library (UAL1) mannequin, CC0**,
  tải từ bản sao LFS `media.githubusercontent.com/media/dragon-fish/parkour-game/HEAD/assets/animations/ual1_standard.glb`
  (quaternius.com không truy cập được từ cloud). Giữ 7 động tác: Sword_Idle, Sword_Attack, Spell_Simple_Shoot, Hit_Chest,
  Swim_Idle_Loop, Jump_Loop, Idle_Loop. File gốc có ~6700 accessor thừa, xóa đi còn 870 KB → `assets/hero.json` (base64).
- **Bộ giáp tự dựng bằng code** (`buildArmor`), gắn vào xương nên chạy theo động tác: mũ có mào và hai cánh vàng,
  khe mắt phát sáng, giáp vai 3 lớp có gai, giáp ngực + ngọc, đai, váy giáp, ống tay/chân, áo choàng, đại kiếm có rãnh rune phát sáng.
  Thiết kế là của riêng mình, không chép MU.
- **Kích thước:** người dùng yêu cầu nhỏ đi 4 lần → `HERO_SCALE = 0.25` (cao ~0.58 đơn vị). Trên màn hình nhân vật khá nhỏ
  so với quái; đổi `HERO_SCALE` nếu muốn to hơn.
- **Túi đồ / trang bị / cường hóa / lưu game:** 5 ô trang bị (vũ khí, mũ, giáp, nhẫn, cánh), túi 40 ô, 4 độ hiếm,
  quái rơi vàng / Đá Cường Hóa / trang bị. Cường hóa +1…+15 (tỉ lệ 100% đến +6, giảm dần còn 30%, từ +9 thất bại thì giảm 1 cấp).
  Phát sáng theo cấp: +7 xanh, +10 vàng, +13 tím (vũ khí, giáp, hạt sáng quanh kiếm); màu cánh theo độ hiếm.
  Nút "Mặc đồ tốt nhất", bán đồ, túi đầy thì tự bán. Lưu bằng localStorage (`vuclam-save-v1`) mỗi 5 giây.
  Phím I mở túi. Ảnh: `screenshot-tui-do.png`, `screenshot-nhan-vat.png`.
- **Cập nhật kích thước:** người dùng xem xong yêu cầu x2 → `HERO_SCALE = 0.5` (cao ~1,15 đơn vị). Quái đồng bộ theo
  bằng `size` trong `MOB_TYPES` (sứa 0.5, cá gai 0.65); độ cao bay, tầm đánh (1.7), tầm kỹ năng (3.0), khoảng cách
  quái tấn công (1.0), vệt chém, vòng kỹ năng, hào quang và bóng cũng thu nhỏ tương ứng.

## 11. Game chính: Huyền Thoại Vực Biển 3D (wave defense) — 2026-11-19

- Người dùng hài lòng với template demo, yêu cầu làm lại game 2D của họ
  (artifact "Huyền Thoại Vực Biển II – Ngũ Anh Hùng", https://claude.ai/artifact/AaobrjiRdMF1MYPhafNxPz) bằng nền 3D.
- **Bản 3D:** `game/vuc-bien-3d/index.html` — link: https://claude.ai/artifact/KFavMyLHwiW4NeuNQKqhg8
  Nguồn tách phần ở `game/vuc-bien-3d/src/` (xem README trong đó), ảnh ở `screenshots/`.
- **Cách port:** logic chạy trong hệ tọa độ 2D gốc (540×960 px) với **công thức giữ nguyên** (hstats, rates, roll,
  hpMult, buildWave, need, drop rate, kỹ năng, nguyên tố, tiến hóa); chỉ phần vẽ chuyển sang 3D qua `V(x,y,h)` (1/60 đơn vị/px).
- **Đã có:** 5 anh hùng 3D (giáp/vũ khí/mũ/cánh riêng, cánh 5 cấp, tiến hóa có hào quang vàng), 4 loại quái + 5 boss 3D,
  3 bản đồ (Vực Biển Cổ / Rừng Tảo U Linh / Hố Thẳm Dung Nham, đổi mỗi 10 đợt), boss mỗi 5 đợt, 10 kỹ năng có hiệu ứng 3D,
  5 tầng sát thương, 11 loại vật phẩm, panel anh hùng, lò cường hóa, tự động, tốc độ x1–x3, tạm dừng, lưu/tải (localStorage `htvb3d_save`).
- **Chưa làm:** chế độ "Đấu 3 đội (AI)" và "Liên minh 3 đội (AI)"; lưu đám mây (bản gốc dùng capability `db` + `user`);
  ảnh minh họa anh hùng/quái trên màn hình bắt đầu (bản 3D dùng chấm màu).

### Cập nhật: Liên minh 3 đội + lưu đám mây
- **Lưu đám mây:** artifact khai báo `db` (rules: gốc read view/write owner; `data/users/{self}` write interact) + `user`.
  Mỗi người lưu ở `data/users/<id>/save`, bản mới nhất (theo `ts`) thắng giữa đám mây và localStorage — y như bản 2D.
  Người chỉ có quyền xem không ghi được lên đám mây, chỉ lưu trên máy.
- **Liên minh 3 đội (AI):** `src/f2_coop.js`. Sân "Liên Minh Tam Hải" (2 làn nhập vào Thánh Vật), chọn tối đa 3 anh hùng,
  bắt đầu theo tiến độ / +5 / +10 đợt; 2 đội AI Hồng Liên (xông xáo) và Thanh Phong (chi viện) với bot cùng sức mạnh trung bình;
  chat nhanh + chiến thuật (Chặn đầu / Săn boss); EXP chia đều ×0.3; đội nào hạ quái thì nhặt đồ; Thánh Vật bắn hỏa pháo,
  hấp thu linh hồn lên cấp, hồi 10%/đợt; bảng tổng kết MVP. Hệ số COOP* giữ nguyên bản gốc.
- **Chưa làm:** chế độ "Đấu 3 đội (AI)" đối kháng.

## 12. Quyết định hướng đi (2026-11-20)

Sau khi chơi thử cả hai, người dùng chọn **game demo ARPG cày cuốc** (`game/demo-day-bien/`,
https://claude.ai/artifact/3NUHdxYh66beQxqLDat1os) làm hướng phát triển chính, vì tiềm năng hơn về đồ họa và nội dung.
Game phòng thủ 3D (`game/vuc-bien-3d/`) giữ lại để tham khảo; có thể tái dùng: 5 bộ giáp anh hùng, quái/boss 3D,
hệ thống kỹ năng nguyên tố, tầng sát thương, lưu đám mây.

## 13. Vực Lam bản lớn (2026-11-20) — game chính

`game/demo-day-bien/index.html` (link https://claude.ai/artifact/3NUHdxYh66beQxqLDat1os), nguồn ở `game/demo-day-bien/src/`
(xem README; engine, giáp anh hùng và mô hình quái lấy từ game phòng thủ).
- **5 lớp nhân vật** chọn khi chơi mới (giáp/vũ khí/cánh riêng), mỗi lớp **3 kỹ năng** mở ở Lv 1/10/25, tốn Mana, có hồi chiêu;
  trạng thái Băng/Sét/Lửa/Ướt/Chậm. Phím 1/2/3; tự động đánh tự dùng kỹ năng khi quái đông/boss.
- **3 bản đồ** (Bãi San Hô Lân Quang Lv1, Rừng Tảo U Linh Lv15, Hố Thẳm Dung Nham Lv30), 4 bãi quái mỗi map xếp cấp tăng dần từ điểm xuất hiện (0, 8);
  **boss** mỗi map (Sứa Mẫu Hậu / Hải Long Xà / Cự Quy Dung Nham) hồi sinh 3–4 phút tại trận đồ phía bắc. Nút Bản đồ để dịch chuyển (cần đủ cấp).
- **Cánh**: chế từ Lông Vũ Thần (5/10/18/30/50), ×1.3→×2.5 sát thương + phòng thủ + máu + tốc chạy, nhân vật bay khi có cánh.
- **Linh thạch**: 5 tầng sát thương như bản phòng thủ (×1.5/×2/×2/×3/×10, tối đa ×180), khảm vào nhân vật, lò hợp 3→1.
- **Bộ đồ**: Sóng Bạc / Vảy Rồng Biển / Dung Nham (mỗi map một bộ), hiệu ứng 2 và 4 món; cường hóa +15 giữ nguyên.
- **Lưu**: localStorage `vuclam-save-v2` + đám mây `data/users/<id>/save` (bản mới nhất thắng). Bản lưu cũ v1 được chuyển sang (chọn lớp, giữ cấp/vàng/đồ; cánh cũ đổi thành lông vũ).
- Tự động: chỉ đánh quái ≤ cấp+4 (trừ quái đang đánh mình), né boss nếu máu quá thấp. Chết: hồi sinh sau 3 giây, mất 3% EXP.

## 14. Vực Lam – làm lại đồ họa theo template gốc (artifact 3NUHdxYh66beQxqLDat1os, v6)

- Lý do: bản 13 dựng trên engine game phòng thủ → mất vẻ đẹp của template (commit 4d5125b). Người dùng muốn đồ họa **hoàn toàn theo template**, không liên quan game kia.
- Làm lại: toàn bộ renderer, nền đáy biển (caustics, ánh sáng quanh hero), đá/san hô/rong/cổng, tia sáng, bụi phát sáng, hero (CC0 + giáp code, cánh shader), sứa/cá, hiệu ứng chém/skill đều lấy nguyên code template; mỗi map chỉ đổi bảng màu (`MAPS[i].pal`) và tham số.
- Giữ nguyên nội dung: 5 lớp × 3 kỹ năng, 3 map + boss, cánh từ lông vũ, linh thạch, bộ đồ, cường hóa, lưu đám mây.
- Thay đổi gameplay hình ảnh: luôn có cánh (Cánh Sơ Khai) để bay lơ lửng như template; vàng/nguyên liệu/đồ rơi xuống đất, đi qua để nhặt.
- Nguồn: `game/demo-day-bien/src/` (ghép `cat a_head.html b_body.html c_engine.js d_hero.js e_mobs.js f_data.js g_game.js h_ui.js > ../index.html`). Bản cũ lưu ở `src_v1/`.
- Đã test headless (lớp Băng mới chơi, Cung Thủ lv32 map 2 + boss): không lỗi. Chưa đo FPS trên điện thoại thật, chưa cân bằng chi tiết.
- Sửa: game "đứng" sau khi hồi sinh (bộ đếm `S.dead` âm vẫn bị coi là chết).
- Điều khiển: bỏ joystick → chạm/nhấp nền để đi (giữ & kéo để lái), chạm quái để đánh; vòng sáng đánh dấu điểm chạm. WASD vẫn dùng được trên PC.
- Tìm đường: lưới A* 0,5m (`buildNav/findPath/navDir` trong g_game.js) dựng lại mỗi map, rút gọn đường bằng kiểm tra tầm nhìn; tự động và chạm-để-đi đều đi vòng đá/san hô. Mục tiêu không tới được bị bỏ qua 6 giây.

## 15. Vực Lam – hướng grind/farm: tốc đánh, cấp 800, thú cưng & thú cưỡi

### Sát thương & tốc đánh
- Mọi đòn của nhân vật chỉ còn **30%** sát thương cũ (`DMG_SCALE`), tốc đánh gốc **×2** (`CLS.aps = 2 / rate`: Lôi 3.3, Hỏa 3.2, Băng 2.8, Cung 5.6, Thánh 2.6 đòn/giây).
- Chỉ số **Tốc đánh (AS)**: đòn/giây = gốc + (15 − gốc) × AS/400, tối đa **15 đòn/giây** khi AS = 400.
- Kỹ năng: hồi chiêu = hệ số ÷ đòn/giây, tối thiểu **0,1 giây**; kỹ năng dùng chung nhịp với đòn thường. Mana (tính theo % mana tối đa) là giới hạn thực sự. Kỹ năng vùng (bão, mưa tên, thiên thạch…) tối đa 3 vùng cùng lúc.

### Lộ trình tốc đánh (mục tiêu: ½ tối đa ở Lv100, tối đa ở Lv400)
| Nguồn AS | Công thức | Lv100 (đồ Hiếm +7) | Lv400 (đồ Sử thi +11) |
|---|---|---|---|
| Cấp nhân vật | 0,1 × cấp | 10 | 40 |
| Vũ khí | (10 + 0,3 × cấp đồ) × độ hiếm (1/1,15/1,3/1,45) + 1/cấp cường hóa | 46 + 7 | 169 + 11 |
| Dây chuyền (ô mới) | như vũ khí | 46 + 7 | 169 + 11 |
| Cánh | 8 × bậc cánh | 16 (bậc 2) | 40 (bậc 5) |
| Thú cưng | 0 / 15 / 25 / 40 | 15 | 40 |
| **Tổng** | | **≈147 → 7,5 đòn/giây** | **≈480 → chạm trần 15** |
- Đồ tốt hơn/cường hóa cao hơn thì chạm trần sớm hơn (khoảng Lv300–350); đồ kém hơn thì muộn hơn.

### EXP & cấp (tối đa 800)
- Thời gian mỗi cấp = 2,158 × e^(0,006 × cấp) giây (Lv1 ≈ 2 giây, Lv100 ≈ 4 giây, Lv400 ≈ 24 giây, Lv800 ≈ 4,4 phút).
- Cộng dồn: Lv100 ≈ 5 phút, Lv200 ≈ 14 phút, Lv300 ≈ 30 phút, **Lv400 ≈ 1 giờ**, Lv600 ≈ 3,5 giờ, **Lv800 ≈ 12 giờ**.
- EXP cần = thời gian × tốc độ giết tham chiếu (0,25 × đòn/giây tham chiếu) × EXP mỗi quái (10 + 3 × cấp). Quái cao cấp hơn bạn cho thêm 5% mỗi cấp (tối đa ×1,5), thấp hơn bị giảm (tối thiểu ×0,3).
- Thời gian thực phụ thuộc trang bị và cách chơi → Menu hiện "đã chơi" và "cấp/giờ" 10 phút gần nhất để đối chiếu và chỉnh `LVT_A`.

### Quái
- Map có khoảng cấp (Bãi San Hô 1–220, Rừng Tảo 110–520, Dung Nham 330–800); 4 khu quái tự theo cấp bạn (−3 / 0 / +3 / +6), boss +8.
- 40 quái mỗi map, hồi sinh 2,5 giây, tự lao vào khi bạn đến gần 4,5m, đánh mỗi 1–1,5 giây. Phòng thủ giảm sát thương theo %: def / (def + 10 × cấp quái + 100).

### Hồi máu / mana khi đánh
- Mỗi đòn trúng: +0,25% máu, +0,5% mana; mỗi quái chết: +1% máu, +1,5% mana.
- Giới hạn mỗi giây: 5% máu (thú cưng +1–2%), 12% mana → không bất tử khi đứng giữa bầy quái.

### Thú cưng & thú cưỡi (tab "Thú" trong túi đồ, mua bằng vàng)
- Thú cưng: Cá Lân Tinh (1.000), Sứa Ngọc Bích (30.000, Lv60), Cá Gai Hoàng Kim (250.000, Lv150, tự bắn), Sứa Thần Hỏa (2 triệu, Lv300). Hút đồ rơi 4–7m, +EXP, +vàng, +tốc đánh.
- Thú cưỡi: Ó Biển Lam (5.000, Lv20), Cá Kình Bạc (80.000, Lv120), Ó Hoàng Kim (1,5 triệu, Lv280). +35–70% tốc chạy, phòng thủ, máu. Ó biển dựng bằng code (vây gợn sóng), cá kình dùng mô hình cá template.

### Rơi đồ
- Giảm tỉ lệ rơi vì giết nhanh hơn nhiều (đồ 4,5%, đá cường hóa 6%…); 30% đồ rơi là vũ khí/dây chuyền. Đồ rơi biến mất sau 40 giây.

## 16. Vực Lam – 10 vùng đất thần thoại, quái mới, mini boss

- **10 map** (`MAPS` trong f_data.js, mỗi map có `env`, `culture`, khoảng cấp, set đồ riêng, `mini`, `exposure`, màu nền/sương/ánh sáng/bụi/tia sáng):
  1 Bãi San Hô (1–90) · 2 Rừng Tảo (70–170) · 3 Hố Dung Nham (150–250) · 4 Sa Mạc Hoàng Kim – Ai Cập (230–330) · 5 Thánh Địa Olympus – Hy Lạp (310–410) · 6 Rừng Trúc Linh Hồ – Đông Á (390–490) · 7 Đầm Lầy U Minh – Đông Âu (470–570) · 8 Băng Nguyên Bắc Âu (550–650) · 9 Cực Băng Vĩnh Hằng (630–730) · 10 Thiên Giới Kim Quang (710–800).
- **Phong cảnh** (`e2_myth.js`, `REALM[env]`): cây cọ đung đưa, cột tháp khắc chữ phát sáng nhấp nháy, kim tự tháp; cột cẩm thạch, lò lửa bốc cháy, cây bách và ô liu; bụi tre, cổng torii, đèn đá, hoa anh đào rơi; cây chết rêu rủ, nấm phát sáng, ma trơi trôi; thông phủ tuyết, đá rune, cực quang; tháp băng pha lê; đảo bay, mây, cột vàng với vòng hào quang xoay. Vật liệu "windy" cho cây lá đung đưa theo gió.
- **Quái thần thoại** (6 mẫu mới, mỗi mẫu nhiều biến thể màu/sừng/vương miện): rắn thần (Apep, Gorgon, Long Xà, Zmey, Jörmungandr, Kim Long), oan hồn áo choàng bay (xác ướp, vong hồn Hades, Yūrei, Rusalka, Draugr, Sedna), người đá có nắm đấm bay và vòng rune (Hộ vệ sa thạch, Cyclops, Titan, Leshy cây, Jötunn, Thiên binh), chim thần cánh lông vũ phát sáng (Harpy, Điểu sư, Tengu, Quạ Odin, Tuyết điểu, Phượng hoàng), bọ thánh giáp (Bọ hung, Bọ độc, Bọ pha lê), linh hồn (Hồ hỏa, Mặt quỷ Oni, Ma trơi, Tinh linh cực quang, Thiên nhãn Seraph).
- **Mini boss (★ Tinh anh)**: mỗi map 1 loại, xuất hiện mỗi 1/3 thời gian hồi boss (~70 giây), máu 10× quái thường (boss 30×), EXP/vàng/nguyên liệu/đồ = 1/3 boss.
- **Tự lượm đồ** bật/tắt (nút "Tự lượm" trên HUD, phím L): khi tắt, nhân vật không tự chạy tới đồ và thú cưng không hút đồ; vẫn nhặt khi đi qua.
- **Tốc chạy** còn 60% (4,6 → 2,76 cơ bản; cánh và thú cưỡi vẫn cộng theo %).

## 17. Vực Lam – thế giới chung: bot AI, nhóm, Thành Cổ, giao dịch, bùa

- **Bot AI** (`i_world.js`): 18 người chơi ảo (tên, lớp, cấp, vàng, túi đồ riêng; lưu trong save). Mỗi bot dùng cùng mô hình giáp + cánh như hero nhưng màu riêng. Bot ở cùng map với bạn được dựng 3D (tối đa 6 ở map đánh, 9 ở thành): tìm quái, đi vòng chướng ngại, đánh thường/bắn, dùng kỹ năng, bị quái đánh, chết và hồi sinh, nói chuyện bong bóng. Bot ở map khác vẫn "cày" ngầm mỗi giây (EXP, vàng, đồ) và luân phiên về thành nghỉ / ra map hợp cấp.
- **Nhóm** (nút "Nhóm" bên trái): lập nhóm, mời bot ở gần (có thể bị từ chối), mời ra, giải tán; bot cũng tự mời bạn (hộp mời 15 giây). Tối đa 5 người. Thành viên trong 15m chia 50% EXP khi hạ quái, đồ rơi chung, cả nhóm +10% EXP. **Theo sát**: trưởng nhóm là bạn → bot giữ trong vòng ~1,2–2m quanh bạn và chỉ đánh quái trong tầm; bạn là thành viên → nhân vật tự bám trưởng nhóm trong 2m và vẫn tự đánh quái trong tầm.
- **Thành Cổ Hy Lạp** (`TOWN`, map cuối trong `MAPS`, đứng đầu danh sách bản đồ): không quái; đài phun nước, đền cột, sạp chợ có mái sọc bay, cây, lò lửa. Vào game và hồi sinh đều ở thành. NPC: Hermes (bán đá cường hóa, lông vũ, linh thạch), Hephaestus (mở cường hóa), Artemis (thú), Iris (bản đồ), Agora (chợ: xem bot đang rao bán).
- **Giao dịch** bằng vàng: mua đồ trong túi bot, bán đồ của bạn cho bot (giá tốt hơn bán thường, bot cần đủ vàng).
- **Bùa** (siêu hiếm, 1% mỗi quái): Bùa Chiến Thần +1% sát thương, Bùa Sinh Mệnh +1% máu, Bùa Linh Lực +1% mana; có tác dụng khi nằm trong túi, cộng dồn (giới hạn bởi 40 ô túi). Bot cũng nhặt và bán bùa.
- **Bỏ giới hạn cấp** vào map; bản đồ ghi "nguy hiểm" nếu cấp bạn thấp hơn quái quá 20.

## 18. Vực Lam – túi 120 ô, xếp chồng, 20 bot

- `BAG_MAX = 120`. Vật phẩm cùng loại không phải trang bị (hiện là bùa) xếp chồng trong 1 ô với số lượng `n` (`stackKey`, `stackInto`, `takeOne` trong g_game.js); bán 1 hoặc cả chồng; giao dịch mua/bán từng lá. Bản lưu cũ tự gộp bùa rời. Hiệu lực bùa tối đa `CHARM_CAP = 100` lá mỗi loại (+100%).
- 20 bot (thêm ThầnPhong, VôSong; bản lưu cũ tự bổ sung). Tối đa 8 bot cùng map đánh quái, 10 ở thành. Bot tự mua bán với nhau (`botMarket`, ~1 giao dịch mỗi 5 giây khắp thế giới); ở thành có thông báo 🛒 khi giao dịch diễn ra.
- Sửa: nhặt bùa giờ cập nhật chỉ số ngay.

## 19. Vực Lam – bảng xếp hạng

- Nút "BXH" (trên nút Nhóm) mở bảng xếp hạng cả 20 bot + người chơi, 3 tab:
  - **Cấp độ** (cùng cấp xếp theo % EXP).
  - **Lực chiến** = sát thương/giây ước tính (tấn công × 30% × đòn/giây × siêu đòn trung bình × hệ số cánh/bộ/bùa) + máu × 0,05 + phòng thủ × 2. Bot dùng cùng công thức trên chỉ số của bot (`botPower`, `myPower` trong h_ui.js).
  - **Kinh tế** = vàng + giá trị đồ trong túi (và đồ đang mặc với người chơi); kèm tổng vàng đã giao dịch (`traded`, cộng khi mua/bán với bot và khi bot giao dịch với nhau).
- Mỗi dòng hiện hạng, lớp, cấp, map đang ở; hàng của bạn được tô vàng, top 3 màu vàng/bạc/đồng.

## 20. Vực Lam – HUD mới và chỉnh độ khó

- **HUD v2** (cuối `<style>` trong a_head.html, khối "HUD v2"): header 2 tầng (khung cấp/tên/máu/mana bên trái + 3 huy hiệu Túi/Bản đồ/Menu bên phải; tầng dưới: viên vàng bên trái, giờ boss bên phải). Nút dạng huy hiệu tròn viền kim loại kép (`.orb`) với icon SVG vẽ riêng. Cột trái: BXH, Nhóm, Tự lượm, Tự động. Cụm phải: Đánh (huy hiệu lớn có kiếm chéo) + 3 kỹ năng. Chat xuống góc dưới trái. Trung tâm màn hình để trống.
- **Độ khó**:
  - Áp chế cấp: đánh quái cao hơn mình `gap` cấp chỉ gây `1/(1+0,012·gap)` sát thương và nhận `1+0,012·gap` lần sát thương (áp dụng cả bot).
  - Quái cao cấp hơn phát hiện bạn từ xa hơn (tới +4m).
  - Máu quái `60·(1+0,3(L−1))·(1+L/180)`, công `16+2,4L+L²/400`.
  - Boss ×60 máu / ×4 công (cũ ×30/×3), tinh anh ×15 / ×2,5.
  - Bot yếu hơn (hệ số trang bị `1,4+0,004·lv` thay vì `1,7+0,012·lv`).

## 21. A/B nhân vật nổi bật hơn (chưa đưa vào game)

- Trang thử: https://claude.ai/artifact/NYw5oHX5TEa1k8D98st4QF (`game/vuc-lam-ab/`, mã ở `game/demo-day-bien/src/ab.js`).
- Màn hình chia đôi, cùng cảnh thật, chọn map / lớp, bật cận cảnh, bật ra chiêu.
- Bản B: thép tối (×0,62) + envMap ×1,7, rim trắng-xanh lạnh, suit/dark tối hơn, áo choàng bão hòa hơn, viền phát sáng chọn được (xanh lam mặc định, tím, đen, tắt; dày 0,02 skinned / 0,013 giáp, nhịp sáng nhẹ), đèn điểm trắng quanh nhân vật, bóng chân đậm, quầng tối sau lưng.
- Thanh trượt real time: độ dày viền 0–100% (100% = 0,04; uniform `OUT_TH`), cỡ nhân vật 0–100% (0% = cỡ hiện tại, 100% = gấp đôi; áp cho cả A và B).
- Chờ người dùng chọn trước khi áp vào game (có thể áp thêm cho bot/NPC).
