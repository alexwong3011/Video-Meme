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
