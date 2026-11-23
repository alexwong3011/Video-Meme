# Prompt tạo tài sản

Chỉ có phần chữ. Không có ảnh tham chiếu nào được đưa vào bộ sạch (xem `../QUARANTINE.md`).

| Thư mục | Nội dung | Ảnh đầu vào |
|---|---|---|
| `bosses/bosses.json` | Prompt 10 boss dùng với `pipeline/gen_boss.py` | Không (Text-to-Image) |
| `items/potions.prompt.json` | Bình máu, bình mana | Không |
| `items/*.txt` | Đá, bùa, ngọc, cánh, khiên | **Có**: các prompt này nói "dùng ảnh tham chiếu chỉ để lấy phong cách". Dự án mới phải dùng ảnh phong cách của chính mình, đã ghi sổ |
| `characters/*.prompt.json`, `set_*_armor.txt`, `set_*_weapon.txt` | Mô tả thân người cơ bản và 3 bộ giáp | **Có**: dùng ảnh khung tư thế của nhân vật gốc. Dự án mới phải dùng nhân vật gốc của mình |
| `characters/armor-set-example.md` | Hướng dẫn mẫu cho một lượt tạo bộ giáp | Như trên |

Khi viết prompt mới: chỉ mô tả bằng lời; không ghi tên họa sĩ, tên game, tên nhân vật hay thương hiệu (quy chế Điều 27.1).
