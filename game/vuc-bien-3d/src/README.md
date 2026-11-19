Các phần nguồn của `../index.html`. Ghép lại bằng:

    cat a_head.html b_body.html c_world.js d_heroes.js e_monsters.js f_logic.js f2_coop.js g_view.js > ../index.html

- a_head.html — CSS, b_body.html — HUD/panel/overlay
- c_world.js — renderer, đáy biển, đường đi, Thánh Thạch, hiệu ứng
- d_heroes.js — 5 anh hùng 3D (mannequin Quaternius CC0 + giáp dựng bằng code)
- e_monsters.js — quái và 5 boss 3D
- f_logic.js — luật chơi port từ bản 2D (giữ nguyên công thức)
- f2_coop.js — chế độ Liên minh 3 đội (AI đồng minh, chat, Thánh Vật)
- g_view.js — đồng bộ hình, camera, HUD, panel, lưu game, vòng lặp
