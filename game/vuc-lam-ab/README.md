# Vực Lam – A/B nhân vật (thử nghiệm)

Trang thử nghiệm độc lập, không phải bản game. Cùng một cảnh 3D thời gian thực được render 2 lần mỗi khung hình
(2 renderer, chung scene/camera): trái = nhân vật hiện tại (A), phải = bản nâng cấp đề xuất (B).

Bản B: giáp màu thép tối hơn nhưng phản chiếu mạnh hơn, rim light lạnh thay vì vàng, viền mực (inverted hull, chạy cả với
skinned mesh), đèn chiếu trung tính chỉ quanh nhân vật, bóng dưới chân đậm hơn, quầng tối mờ sau lưng nhân vật.

Dựng: `cat` các file trong `demo-day-bien/src` như bản game, rồi chèn `src/ab.js` ngay trước `</script>` cuối (xem lịch sử commit).
