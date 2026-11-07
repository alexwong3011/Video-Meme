"""Sinh dữ liệu MẪU (giả lập, không phải dữ liệu thật) để xem thử dashboard khi chưa crawl."""
from __future__ import annotations

import math
import random
import time

from .db import DB, Post

# (tên, từ khóa, hồ sơ diễn biến, mẫu bài, mẫu bình luận, hệ số tương tác)
SCENARIOS = [
    ("[MẪU] Ngộ độc bếp ăn trường học", ["ngộ độc & trường", "bếp ăn bán trú"], "burst",
     ["Hơn 50 học sinh nhập viện nghi ngộ độc sau bữa trưa bán trú, phụ huynh bức xúc",
      "Phẫn nộ: bếp ăn trường dùng thực phẩm bẩn, công an vào cuộc điều tra",
      "Sở Y tế lấy mẫu xét nghiệm vụ ngộ độc tập thể tại trường tiểu học",
      "Con tôi bị cấp cứu vì ngộ độc, nhà trường vô trách nhiệm quá"],
     ["Không thể chấp nhận được, phải khởi tố ngay", "Đau lòng quá, mong các cháu sớm khỏe",
      "Bức xúc thật sự, ai chịu trách nhiệm đây", "Kinh hoàng, thực phẩm bẩn tràn lan"], 3.0),
    ("[MẪU] App vay tiền lừa đảo", ["app vay & lừa đảo", "tín dụng đen"], "rising",
     ["Cảnh báo app vay tiền lừa đảo chiếm đoạt hàng trăm triệu",
      "Nhiều người mất tiền vì app vay online, lãi suất cắt cổ",
      "Bóc phốt app vay đòi nợ kiểu khủng bố, đe dọa người thân"],
     ["Tôi cũng bị lừa mất 20 triệu", "Lo sợ quá, nó gọi cho cả nhà tôi", "Công an nên vào cuộc"], 0.5),
    ("[MẪU] MV mới của ca sĩ X", ["mv mới & ca sĩ x"], "peak",
     ["MV mới của ca sĩ X đạt top 1 trending, fan tự hào",
      "Cảnh quay trong MV đẹp tuyệt vời, giai điệu cực ấn tượng",
      "Trend nhảy theo MV ca sĩ X phủ sóng TikTok"],
     ["Hay quá, nghe cả ngày", "Tuyệt vời, ủng hộ ca sĩ X", "Đáng yêu thật sự"], 6.0),
    ("[MẪU] Tăng giá vé gửi xe", ["giá gửi xe"], "fading",
     ["Phố đi bộ thu giá gửi xe 50 nghìn, du khách phản ánh chặt chém",
      "Quận yêu cầu xử lý bãi xe tự phát thu giá cao"],
     ["Chặt chém quá đáng", "Phải xử phạt mạnh tay"], 0.4),
    ("[MẪU] Sự cố sập web ngân hàng", ["ngân hàng & sập", "lỗi app ngân hàng"], "new",
     ["Ứng dụng ngân hàng Y lỗi từ sáng, khách không chuyển được tiền",
      "Khách hàng hoang mang vì app ngân hàng báo lỗi giao dịch"],
     ["Mất cả buổi sáng không chuyển được tiền", "Thiếu minh bạch, cần xin lỗi khách hàng"], 0.8),
]

AUTHORS = ["Nguyễn Văn An", "Trần Thị Bình", "Lê Hoàng", "Phạm Minh", "Hoàng Yến", "Vũ Đức", "Đặng Thu", "Bùi Lan",
           "Tin Nóng 24h", "Hóng Biến", "Góc Phụ Huynh", "Review Sài Gòn", "Hà Nội Phố", "Kênh Tin Nhanh"]
OUTLETS = ["vnexpress.net", "tuoitre.vn", "thanhnien.vn", "dantri.com.vn", "vietnamnet.vn", "laodong.vn"]


def _rate(profile: str, h_ago: float) -> float:
    """Số bài/giờ ở thời điểm cách đây h_ago giờ."""
    if profile == "burst":
        return 0.5 if h_ago > 20 else 2 + 18 * math.exp(-((h_ago - 3) ** 2) / 30)
    if profile == "rising":
        return 0.6 + 6 * math.exp(-h_ago / 10)
    if profile == "peak":
        return 1 + 10 * math.exp(-((h_ago - 14) ** 2) / 120)
    if profile == "fading":
        return 0.3 + 5 * math.exp(-((h_ago - 60) ** 2) / 300)
    if profile == "new":
        return 0 if h_ago > 8 else 2.5
    return 0.5


def seed_demo(db: DB, seed: int = 7) -> None:
    rnd = random.Random(seed)
    now = int(time.time())
    plat_mix = [("facebook", 0.45), ("tiktok", 0.3), ("threads", 0.1), ("news", 0.15)]
    for name, kws, profile, texts, cmts, mult in SCENARIOS:
        tid = db.upsert_topic(name, kws, [])
        posts: list[Post] = []
        for h in range(7 * 24, 0, -1):
            n = int(rnd.gauss(_rate(profile, h), 0.8) + 0.5)
            for _ in range(max(0, n)):
                plat = rnd.choices([p for p, _ in plat_mix], [w for _, w in plat_mix])[0]
                created = now - h * 3600 + rnd.randint(0, 3599)
                pid = f"demo{tid}_{len(posts)}"
                base = rnd.lognormvariate(5.5, 1.3) * mult
                text = rnd.choice(texts)
                if plat != "news" and rnd.random() < 0.8:  # mỗi người viết một kiểu
                    text = rnd.choice(["Mọi người xem đi", "Nóng:", "Chia sẻ:", "Ai biết thêm thông tin không?", ""]) \
                        + " " + text + " " + rnd.choice(["", "!!!", "...", f"#{rnd.randint(1, 999)}", "thật không thể tin"])
                p = Post(platform=plat, post_id=pid, text=text.strip(), created_at=created,
                         author=rnd.choice(OUTLETS if plat == "news" else AUTHORS) + ("" if plat == "news" else f" {rnd.randint(1, 60)}"),
                         url=f"https://example.com/{plat}/{pid}", source="demo",
                         kind={"news": "article", "tiktok": "video"}.get(plat, "post"))
                p.author_id = p.author
                if plat != "news":
                    p.reactions = int(base)
                    p.comments = int(base * rnd.uniform(0.05, 0.3))
                    p.shares = int(base * rnd.uniform(0.01, 0.15))
                    if plat == "tiktok":
                        p.views = int(base * rnd.uniform(20, 60))
                        p.saves = int(base * rnd.uniform(0.02, 0.1))
                posts.append(p)
        comments = []
        for p in sorted(posts, key=lambda x: x.reactions, reverse=True)[:15]:
            for j in range(4):
                comments.append(Post(platform=p.platform, post_id=f"c_{p.post_id}_{j}", text=rnd.choice(cmts),
                                     kind="comment", parent_id=p.post_id, created_at=p.created_at + 600 * (j + 1),
                                     author=rnd.choice(AUTHORS), reactions=rnd.randint(0, 300), source="demo"))
        db.save_posts(posts + comments, topic_ids=[tid])
