# Tài sản không đưa vào bộ sạch

Các tài sản dưới đây thuộc dự án cũ (`projects/astropolis`, `projects/azure-wing-armor`) nhưng **không được chép vào bộ khởi đầu**, vì chưa đủ hồ sơ nguồn gốc theo Bộ quy chế chống đạo nhái v1.0 (Điều 4.2: không có nguồn thì không vào sản phẩm). Dự án mới không được lấy chúng từ kho cũ, trừ khi mục "Điều kiện mở" đã được đáp ứng và ghi vào `SNG.csv`.

| Nhóm | Đường dẫn trong dự án cũ | Lý do | Điều kiện mở |
|---|---|---|---|
| Ảnh giao diện Ai Cập, nền giấy cói | `projects/astropolis/assets/ui/egy_*`, `parchment.jpg` | Cắt trực tiếp từ ảnh tham chiếu chưa rõ tác giả và giấy phép (Điều 9, 19, III.5) | Có giấy phép hoặc bằng chứng ảnh thuộc phạm vi công cộng |
| Tranh concept Cánh Lam và mọi thứ cắt từ nó | `projects/azure-wing-armor/source/*`, `projects/astropolis/assets/weapon/*`, `assets/equip/pieces/*`, `assets/equip/silhouette.png`, `assets/equip/wings/*`, `assets/wings/*` | Chưa xác minh ai vẽ hoặc công cụ nào tạo tranh gốc | Xác minh nguồn tranh concept gốc |
| Nhân vật chính 3D | `assets/meshy/knight*`, `base_greek*` | Đầu ra AI làm tài sản cốt lõi (Điều 29); dựng từ concept chưa xác minh; thân Hy Lạp dùng ảnh kỵ sĩ làm khung tư thế | Xác minh concept và chỉnh sửa đáng kể bằng tay có file trước–sau, hoặc làm lại từ concept của họa sĩ |
| Ba bộ giáp có mô hình riêng | `assets/meshy/knight_dung*`, `knight_olym*`, `knight_song*`, `assets/equip/sets/*` | Sinh bằng Image-to-Image từ ảnh bố cục của bộ Cánh Lam | Như trên |
| Icon trang bị, đá, bùa, khiên thường | `assets/equip/items/*` (trừ `mat_hpp`, `mat_mpp`) | Sinh với ảnh tham chiếu phong cách là các mảnh giáp Cánh Lam | Như trên, hoặc tạo lại bằng ảnh tham chiếu mới của dự án mới |
| Ảnh tham chiếu bố cục | `projects/astropolis/prompts/ref-*.jpg`, `source/items/*_ref.png`, `source/shields/ref_sets.jpg` | Phái sinh từ concept Cánh Lam | Như trên |
| Thư mục làm việc của quy trình 3D | `scripts/character3d/work/*` | Chứa ảnh trung gian của các tài sản ở trên | Không mang sang |

## Những thứ đã được làm sạch trong bản engine

- Ảnh giao diện cũ được thay bằng nền dựng bằng CSS (biến `--wall`, `--band`, `--hiero`, `--sun`).
- Bỏ các chú thích dùng tên game khác làm tên làm việc (dấu hiệu 12.3đ).
- Đổi vật phẩm "Soul of Ancient" thành "Hồn Cổ Thần".
- Gỡ tên game cũ và đổi khóa lưu (`starter-roster-v1`, `starter-gfx`).
- `MAXLV` vẫn là 400 nhưng được đánh dấu `GAME_CONFIG`. Dự án mới phải chọn số khác (400 trùng cấp tối đa của một game nổi tiếng).
- Khi không có mô hình kỵ sĩ, engine tự dùng nhân vật dự phòng (người mẫu Quaternius CC0 có giáp và kiếm dựng bằng code). Ảnh thiếu tự ẩn.
