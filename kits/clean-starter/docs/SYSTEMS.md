# Catalog hệ thống của engine

Mỗi hệ thống ghi: nó làm gì, tìm ở đâu trong `engine/index.html`, tham số chính (đã tách ra `data/*.json`), lý do thiết kế, và điểm cần đổi khi dùng cho dự án mới. Mục "Lý do thiết kế" đáp ứng Điều 12.4 của quy chế. Dự án mới chỉnh lại theo mục tiêu riêng của mình.

Cách tìm trong mã: tìm theo tên hằng hoặc hàm, ví dụ `const SKD`, `function castSkill`.

## Chiến đấu và kỹ năng

| Hệ thống | Mã | Tham số | Lý do thiết kế | Khi dùng cho dự án mới |
|---|---|---|---|---|
| 5 lớp nhân vật theo nguyên tố (lửa, sét, băng, cung thủ, thánh) | `CLS`, `SKILLS` | `data/classes.json` | Mỗi lớp một nguyên tố để hiệu ứng, màu và cảm giác đánh khác nhau rõ | Đổi tên lớp, nguyên tố, câu chuyện |
| Xoay vòng chiêu tự động, nhịp chung | `SK_ROT`, `autoCast`, `S.skG`, `skRate()` | `SK_ROT` | Người chơi mobile không phải bấm liên tục; nhịp 0,5 chiêu/giây nhân theo tốc đánh | Giữ, chỉnh nhịp |
| Không hồi chiêu riêng từng chiêu | `skCd = 0` | | Chiêu ra đều, dễ đọc, hợp tự đánh | Tuỳ thiết kế |
| Nhịp sát thương theo cấp | `skDmgK`, `atkDmgK` | `SKD`, `SKP`, `BAK`, `BAP` | Công thức `hệ số / (1 + cấp/60)^mũ` giữ thời gian diệt một bầy 5 quái ở 4–6 giây suốt các cấp; hiệu chỉnh bằng `engine/tools/pack_dps.js` | Đặt mục tiêu thời gian riêng rồi chạy lại công cụ đo |
| Hiệu ứng chiêu 3D | `CFX`, `FX3`, `cfxCloud`, `cfxStrike`… | | Vẽ bằng shader và hình học dựng sẵn, không dùng ảnh ngoài | Đổi màu, hình theo chủ đề mới |
| Bình máu và mana | `POT`, `usePot`, `potHud` | `POT`, `MAT_MAX` | Hồi 50%, chờ 1,5 giây, tự uống dưới 25% máu, rơi từ quái | Giữ |

## Quái và boss

| Hệ thống | Mã | Tham số | Lý do thiết kế | Khi dùng cho dự án mới |
|---|---|---|---|---|
| Quái theo cấp người chơi | `MT`, `updateMobs` | `MOB_HP_K`, `MOB_FURY` | Máu ×8 để trận đánh kéo dài đủ thấy chiêu; quái hung hơn một chút | Chỉnh hệ số |
| Boss 3D, 2 boss mỗi vùng, xuất hiện theo giờ | `BOSS3D`, `bossLoad`, `makeBoss3D` | `BOSS_K`, `data/world.json` (`BOSS_LORE`) | Boss là điểm hẹn của người chơi; chuyển động giả bằng shader uốn đỉnh, không cần rig | Giữ 10 mô hình boss sạch hoặc tạo mới bằng `pipeline/gen_boss.py` |

## Trang bị và tiến trình

| Hệ thống | Mã | Tham số | Lý do thiết kế | Khi dùng cho dự án mới |
|---|---|---|---|---|
| Ô trang bị thân, vũ khí, khiên, nhẫn, dây chuyền | `SLOT_ORDER`, `knBodySlots`, `splitBySlot` | `data/items.json` | Ghép giáp từng phần trên một khung xương; mỗi món đổi hình nhân vật | Cân nhắc đổi số ô hoặc cách nhóm để khác các game cùng thể loại |
| Độ hiếm, cường hoá +1…+15, màu bậc | `RARITY`, `tier`, `TIER_COL` | `data/balance.json` | Chuẩn thể loại (quy chế, Điều 3) | Giữ hoặc đổi cách gọi |
| Bộ đồ có thưởng khi đủ món | `SETS` | `data/items.json` | Mục tiêu sưu tầm dài hạn | Đặt tên bộ mới |
| Dòng chỉ số theo % (chí mạng, hồi mana, hút mana) | `PCT`, `pctBase` | `PCT` | Nhẫn hồi mana, dây chuyền hút mana để giải bài toán thiếu mana | Giữ |
| Cánh nhiều bậc | `makeWing`, `SWING` | | Trang bị thể hiện tiến trình. **Lưu ý:** cánh là biểu tượng của một dòng game khác; ảnh cánh cũ không có trong bộ sạch | Thiết kế lại hình dáng, hoặc thay bằng trang bị biểu tượng khác hợp chủ đề mới |
| Thú cưng, thú cưỡi | `PETS`, `MOUNTS` | `data/items.json` | Chuẩn thể loại | Đổi tên, hình |
| Bùa (charm) | `CHARMS` | `data/items.json` | Chỉ số cộng dồn, rơi hiếm từ boss | Đã đổi "Soul of Ancient" thành "Hồn Cổ Thần" |
| EXP và cấp tối đa | `gainExp`, `expNeed`, `MAXLV` | `EXP_K`, `MAXLV` | EXP ×2 cho nhịp lên cấp nhanh | **Bắt buộc đổi `MAXLV`** (400 trùng số của game khác) |

## Thế giới và người chơi

| Hệ thống | Mã | Tham số | Lý do thiết kế | Khi dùng cho dự án mới |
|---|---|---|---|---|
| Vùng đất và thành phố | `MAPS`, `setMap`, `travel` | `data/world.json` | Mỗi vùng một bảng màu, cảnh vật dựng bằng code | Thiết kế vùng mới |
| Người chơi ảo (bot) | `newBots`, `updateBots`, `BOT_NAMES` | `data/world.json` | Thế giới đông người ngay từ ngày đầu, điểm khác biệt chính | Giữ; không quảng cáo bot là người thật |
| 5 nhân vật trên một tài khoản, thế giới chung | `ROSTER`, `readRoster`, `saveGame` | | Mỗi nhân vật lưu riêng; bot và thế giới giữ nguyên khi đổi nhân vật | Giữ |
| Lưu game | `localStorage` + kho dữ liệu artifact (`claude.use('db')`) | | Lưu cục bộ và lưu mây khi chạy trên claude.ai | Khi lên app: thay bằng backend riêng (xem kế hoạch phát hành) |

## Giao diện và đồ hoạ

| Hệ thống | Mã | Lý do thiết kế | Khi dùng cho dự án mới |
|---|---|---|---|
| HUD trong suốt 70%, viền đậm | khối CSS cuối stylesheet | Không che chiến trường | Giữ |
| Vòng hồi chiêu dạng nan quạt | `.sk .cd`, biến `--cd` | Không có ô đen khi hồi chiêu | Giữ |
| Thanh boss gọn, nhấp nháy cảnh báo | `@keyframes bossWarn` | Cảnh báo nhẹ, không che màn hình | Giữ |
| Cài đặt đồ hoạ Tự động / Cao / Thấp | `GFX`, `setGfx` | Máy yếu tự hạ độ phân giải khi FPS < 38 | Giữ |
| Nền giao diện | biến `--wall`, `--band`, `--hiero`, `--sun` | Bản sạch dùng nền CSS trung tính | Thay bằng mỹ thuật riêng của dự án mới (họa sĩ hoặc tạo mới có ghi sổ) |

## Kiểm thử

| Công cụ | Dùng để |
|---|---|
| `engine/tools/check.js` | Chạy game trong Chromium không giao diện, gắn móc `window.__T` và `window.__sim(giây)`, chụp màn hình |
| `engine/tools/pack_dps.js` | Đo thời gian diệt một bầy quái theo lớp và cấp, dùng khi chỉnh cân bằng |
| `tools/extract_data.js` | Xuất lại `data/*.json` sau khi sửa bảng trong engine |
