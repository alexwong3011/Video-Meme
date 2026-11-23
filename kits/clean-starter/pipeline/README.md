# Pipeline nhân vật 3D từ tranh concept

Quy trình đã dùng để làm kỵ sĩ Cánh Lam (`projects/azure-wing-armor`). Đầu vào là tranh concept 2D. Đầu ra là nhân vật 3D có xương, có ngón tay và 14 động tác, texture vẽ lại từ tranh gốc, chạy trong trình duyệt (three.js) trên sân 2,5D góc nhìn 45°.

## Tóm tắt các bước

| # | Bước | Ai làm | Công cụ | Đầu ra |
|---|---|---|---|---|
| 1 | Tạo 3 ảnh dang tay (A-pose): trước, nghiêng trái, sau | Người dùng | Grok (hoặc AI tạo ảnh có nhận ảnh tham chiếu), prompt ở `prompts.md` | `front.jpg`, `side.jpg`, `back.jpg` |
| 2 | Tách nền, làm sạch, căn chỉnh | Claude | `cutout.mjs`, `apose.py` | `clean/white/{front,left,back,right}.png`, `clean/transparent/...` |
| 3 | Dựng mô hình 3D | Tự động | Meshy API, `run_pipeline.py` bước `generate` | mô hình khoảng 80 nghìn tam giác, PBR 4K |
| 4 | Gắn xương có ngón tay | Tự động | bước `rig` | bộ xương Mixamo có ngón |
| 5 | Áp động tác từ thư viện | Tự động | bước `animate` | các file GLB có động tác |
| 6 | Tải về | Tự động | bước `download` | `model.glb`, `anim1.glb`, `anim2.glb`… |
| 7 | Chiếu ảnh gốc lên texture | Tự động | `apose_bake.py` (bước `bake`) | `albedo_painted.png` |
| 8 | Gộp thành mô hình web | Tự động | `meshy_merge.py` (bước `merge`) | `<tên>.gltf.json` và 3 ảnh texture JPEG |
| 9 | Đưa vào game | Claude | `character-test.html` (mục "3D knight") | nhân vật chơi được |

Chi phí Meshy cho một nhân vật với cấu hình mặc định: dựng mô hình khoảng 35 credit, gắn xương 5, mỗi động tác 3 (14 động tác là 42). Tổng khoảng 82 credit. Gói Pro khoảng 20 USD/tháng có khoảng 1.000 credit.

## Cài đặt một lần

```bash
pip install opencv-python-headless numpy trimesh
# tách nền (mô hình IS-Net qua npm, chạy CPU)
mkdir -p ~/char-tools/bgrm && cd ~/char-tools/bgrm && npm init -y && npm i @imgly/background-removal-node@1.4.5 && npm rebuild sharp
```

Mạng cần mở các máy chủ: `api.meshy.ai` (lưu API key ở đây), `assets.meshy.ai` (tải file kết quả), `docs.meshy.ai` (tra danh sách động tác).

API key Meshy: trong phiên Claude Code trên cloud, key được lưu bằng biểu mẫu bảo mật của môi trường và proxy tự gắn vào yêu cầu, script không cần biết key. Chạy ở nơi khác thì đặt biến `MESHY_API_KEY`. Không bao giờ ghi key vào file hay dán vào chat.

## Bước 1: ảnh dang tay

Dùng `prompts.md`. Ba điều quan trọng nhất:

- **Tư thế:** dang tay (A-pose), tay cách thân khoảng 35°, có khoảng trống dưới nách. Tay dính thân thì lúc gắn xương sẽ dính tay vào sườn.
- **Góc nhìn:** trực giao, ngang ngực, nền xám trơn, ánh sáng đều, không chữ, không bệ, không bóng đổ.
- **Thứ tự ảnh tham chiếu:** ảnh mặt trước tạo đầu tiên. Khi tạo ảnh nghiêng và ảnh sau, tải **ảnh mặt trước vừa tạo lên trước**, rồi mới đến tấm thiết kế gốc. Các góc phải khớp nhau hơn là khớp tấm gốc.

Kiểm tra sau khi có ảnh: các mốc cơ thể phải ở cùng độ cao trên ba ảnh (vai, đầu ngón tay, đầu gối, cổ giày). Nếu lật gương ảnh trước rồi chồng lên ảnh sau, hình bóng nên trùng khoảng 90%.

## Bước 2: làm sạch

```bash
BGRM_DIR=~/char-tools/bgrm node cutout.mjs CUT_DIR SRC_DIR/front.jpg SRC_DIR/side.jpg SRC_DIR/back.jpg
python3 apose.py SRC_DIR CUT_DIR CLEAN_DIR
```

`apose.py` làm các việc sau:
- lấp các lỗ kín mà công cụ tách nền để lại (khe mũ, khe tối giữa các mảnh giáp);
- bỏ vụn nhỏ;
- đưa ba ảnh về cùng tỉ lệ (lấy theo ảnh trước), đế giày trên một đường, căn giữa khung 2048 px;
- tạo ảnh phải bằng cách lật gương ảnh trái. Chỉ đúng khi thân không mang đồ lệch một bên; nếu lệch thì tạo riêng ảnh phải.

`side.jpg` phải là nhân vật nhìn sang **trái màn hình**, tức thấy sườn trái của nhân vật. Kết quả có một ảnh `preview.jpg` để xem nhanh.

## Bước 3–8: chạy tự động

```bash
cp config.example.json my_char.json     # sửa đường dẫn, tên, danh sách động tác
python3 run_pipeline.py my_char.json                 # chạy hết
python3 run_pipeline.py my_char.json --from animate  # chạy lại từ một bước
python3 run_pipeline.py my_char.json --only merge    # chỉ một bước
```

Mỗi bước lưu mã tác vụ vào `out_dir/state.json`. Chạy lại sẽ tiếp tục, không tạo lại (và không tốn thêm credit) những gì đã xong.

### Cấu hình Meshy đã chọn và lý do

| Tham số | Giá trị | Vì sao |
|---|---|---|
| `image_enhancement` | `false` | Mặc định Meshy "làm đẹp" ảnh đầu vào và làm mất vảy giáp, đường khắc. Đây là nguyên nhân chính khiến bản đầu "trơn như Spider-Man". |
| `geometry_resolution` | `2k` | Lưới chi tiết hơn; gờ giáp và lông vũ có khối thật. |
| `target_polycount` | 80.000 | Đủ chi tiết cho nhân vật cỡ toàn thân trên màn hình, vẫn nhẹ cho web. Bản 31.000 bị là phẳng gờ giáp. |
| `texture_resolution`, `enable_pbr` | `4k`, `true` | Có bản đồ độ nổi (normal), kim loại và độ nhám, để ánh sáng làm nổi vảy và ánh kim. |
| `pose_mode` | `a-pose` | Khớp ảnh đầu vào, dễ gắn xương. |
| `include_fingers` | `true` | Có xương ngón tay để nắm chuôi kiếm. Không có thì bàn tay luôn xoè. |
| `height_m` | 2,0 | Khớp chiều cao kể cả chỏm mũ. |

Thư viện động tác có 805 mục, xem bằng `GET https://api.meshy.ai/openapi/v1/animations/library`. Mỗi lần áp tối đa 10 động tác, nên script tự chia thành nhiều đợt. Tên clip trong file là tên động tác, ví dụ `Left_Slash`.

### Bước bake: chiếu ảnh gốc

`apose_bake.py` đặt từng ảnh dang tay khớp với mô hình bằng cách so hình bóng (tìm tỉ lệ và độ lệch). Sau đó, với mỗi điểm trên texture, nó tìm điểm 3D tương ứng, kiểm tra điểm đó có được góc nhìn thấy không (bộ đệm độ sâu), rồi lấy màu từ ảnh nhìn thẳng vào bề mặt nhất. Khoảng 65% bề mặt lấy nét vẽ gốc; phần còn lại (vùng chéo, mặt trong tay) giữ texture của Meshy, hoà dần ở chỗ giáp ranh. Bake 4K mất khoảng 10 phút trên CPU.

### Bước merge

`meshy_merge.py` lấy file động tác đầu tiên làm gốc (mô hình, xương, texture) và nối các clip từ các file sau, khớp xương theo tên. Nó thay màu nền bằng ảnh đã bake, giảm texture về 2048 px JPEG và ghi chúng thành file riêng cạnh mô hình. Kết quả là glTF JSON có buffer base64, vì trang artifact không phục vụ file `.glb`; trang tự dựng lại GLB trong bộ nhớ. Nhân vật 80 nghìn tam giác với 14 động tác nặng khoảng 11 MB JSON cộng 3,7 MB ảnh.

## Bước 9: đưa vào game (three.js)

Mã nằm trong `projects/azure-wing-armor/character-test.html`, các mục `3D knight`, `idle stance`, `hands` và `armour level`. Những điểm cần nhớ khi làm nhân vật mới:

- **Hiển thị trong sân 2,5D:** mô hình được render vào một canvas WebGL phụ bằng camera trực giao chúc xuống (góc `asin(DEP)`), M điểm ảnh mỗi mét, rồi vẽ vào cảnh 2D như một sprite. Sàn, bóng, hiệu ứng, số sát thương và va chạm dùng chung với bản 2D.
- **Kích thước:** xương Meshy tính bằng centimet dưới armature 0,01, nên lấy chiều cao theo xương (chân đến đầu), không theo hộp bao của lưới.
- **Đi tại chỗ:** xoá độ trôi ngang và trôi tới của xương hông trong mọi clip, vì game tự di chuyển nhân vật.
- **Thời điểm trúng đòn:** đọc từ chính clip, là đoạn tay cầm kiếm di chuyển nhanh nhất.
- **Tư thế chờ:** tự dựng bằng code trên tư thế gốc của file, không dùng `skeleton.pose()`. Gồm: IK hai khớp cho tay và chân, hông nhún, ngực thở, chu kỳ 3 giây; được trộn qua lại với các clip.
- **Nắm kiếm:** mỗi khung hình đưa ngón tay về tư thế gốc rồi gập lại (chiều gập chọn sao cho đầu ngón tiến về phía ngón cái). Kiếm đặt ở giữa nắm tay, chạy dọc đường khớp ngón (từ ngón út sang ngón trỏ).
- **Cánh:** khung ngực dựng từ xương sống, cổ và hai khớp vai. Gốc cánh ở giữa hai bả vai.
- **Cấp giáp (+0..+15):** bảng `ARMOR_KEYS` gồm màu phủ, độ bóng, viền sáng theo góc nhìn, luồng sáng chạy theo đường khắc, khói hào quang mỏng bay lên từ mép thân.
- **Viền và vỏ hào quang:** phải đẩy theo pháp tuyến trong không gian camera (đơn vị mét). Đẩy trong không gian lưới thì gần như không thấy, vì đơn vị centimet của rig.
- **Tốc độ đánh:** `setRate`, mặc định 1 đòn/giây. **Thu phóng:** `equip.zoom`, mặc định 0,5×.

## Những lỗi đã gặp và cách tránh

| Triệu chứng | Nguyên nhân | Cách xử lý |
|---|---|---|
| Mô hình 3D xấu, mềm nhũn | TripoSR dựng từ một ảnh, độ phân giải 256 | Dùng Meshy với nhiều ảnh |
| Giáp trơn, mất chi tiết | `image_enhancement` mặc định bật; lưới thấp; không PBR | Cấu hình ở bảng trên, kèm bước bake |
| Nhân vật không hiện | Lấy tỉ lệ theo lưới, bị phóng ×100 | Lấy theo xương |
| Thân biến mất ở tư thế chờ | `skeleton.pose()` lệch với tỉ lệ của mô hình | Dùng tư thế gốc đã lưu lúc tải |
| Kiếm lơ lửng cạnh tay | Gắn vào cổ tay, bàn tay xoè | Rig có ngón, gắn ở nắm tay |
| Cánh rủ như váy khi nhìn từ sau | Cánh gập ra sau, camera nhìn từ trên | Gắn ở bả vai, gập cánh hướng lên |
| Hào quang như lớp keo | Vỏ dày và quá sáng | Viền mờ cộng khói mỏng ở mép thân |

## Danh sách file

- `run_pipeline.py`: chạy các bước Meshy, bake, merge, có lưu trạng thái để chạy tiếp.
- `config.example.json`: cấu hình mẫu (kỵ sĩ Cánh Lam).
- `apose.py`: làm sạch và căn ba ảnh dang tay.
- `cutout.mjs`: tách nền (cần `BGRM_DIR`).
- `apose_bake.py`: chiếu ảnh gốc lên texture.
- `meshy_merge.py`: gộp các clip, thay texture, xuất mô hình web.
- `prompts.md`: prompt mẫu cho bước 1.
