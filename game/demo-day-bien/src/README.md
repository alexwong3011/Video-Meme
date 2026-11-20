Nguồn của `../index.html` (game chính "Vực Lam"). Ghép lại bằng:

    cat a_head.html b_body.html c_engine.js d_hero_base.js e_mob_models.js f_data.js g_game.js h_ui.js > ../index.html

- a_head.html / b_body.html — CSS, HUD, túi đồ, bản đồ, màn hình bắt đầu, chọn lớp, menu
- c_engine.js — renderer, đáy biển, cảnh vật, hạt, vòng sáng, sét, chữ nổi (dùng chung với game phòng thủ)
- d_hero_base.js — 5 bộ giáp/vũ khí/cánh dựng bằng code trên mannequin Quaternius (CC0)
- e_mob_models.js — mô hình quái và boss 3D
- f_data.js — dữ liệu: lớp, kỹ năng, bản đồ, quái, đồ, bộ đồ, linh thạch, cánh, công thức
- g_game.js — logic: nhân vật, quái, boss, chiến đấu, kỹ năng, rơi đồ, tự động
- h_ui.js — HUD, điều khiển, các bảng, lưu (trình duyệt + đám mây), vòng lặp
