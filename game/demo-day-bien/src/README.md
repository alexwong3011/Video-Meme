Nguồn của `../index.html` (game chính "Vực Lam"). Ghép lại bằng:

    cat a_head.html b_body.html c_engine.js d_hero.js e_mobs.js f_data.js g_game.js h_ui.js > ../index.html

Phần hình (c_engine, d_hero, e_mobs) lấy nguyên từ bản template đẹp (commit 4d5125b) — chỉ thêm tham số màu cho từng vùng biển
và vũ khí theo lớp. Không dùng code hình của game phòng thủ. Thư mục `../src_v1/` giữ bản trước (hình theo game phòng thủ) để tham khảo.

- a_head.html / b_body.html — CSS (theo template), HUD, túi đồ, bản đồ, màn hình bắt đầu, chọn lớp, menu
- c_engine.js — renderer, đáy biển, đá, san hô, rong, cổng đá, cột sáng, hạt (template)
- d_hero.js — nhân vật giáp + cánh + vệt chém + vòng kỹ năng (template) và vũ khí theo lớp
- e_mobs.js — sứa và cá gai (template), đổi màu theo vùng, boss có vương miện
- f_data.js — dữ liệu: lớp, kỹ năng, bản đồ, quái, đồ, bộ đồ, linh thạch, cánh, công thức
- g_game.js — logic + hiệu ứng kiểu template: chiến đấu, kỹ năng, rơi đồ trên đất, tự động
- h_ui.js — HUD, điều khiển, các bảng, lưu (trình duyệt + đám mây), vòng lặp
