import http.server
import json
import os
import shutil
import threading
import time
from pathlib import Path

import pytest

from socialheat.analysis import metrics
from socialheat.analysis.text import analyze, match_topic
from socialheat.config import load_config
from socialheat.crawlers import parsers
from socialheat.crawlers.news import parse_rss
from socialheat.db import DB, Post

FX = Path(__file__).parent / "fixtures"


def docs(name):
    return list(parsers.iter_json_docs((FX / name).read_text(encoding="utf-8")))


# ---------------------------------------------------------------- parsers

def test_to_int():
    assert parsers.to_int("2,3K") == 2300
    assert parsers.to_int("1.2M") == 1_200_000
    assert parsers.to_int("12 N") == 12_000
    assert parsers.to_int("1.234") == 1234
    assert parsers.to_int({"count": 7}) == 7
    assert parsers.to_int(None) == 0


def test_tiktok():
    posts = [p for d in docs("tiktok_search.json") for p in parsers.parse_tiktok(d)]
    assert len(posts) == 2
    p = next(x for x in posts if x.post_id == "7431111111111111111")
    assert p.reactions == 15200 and p.comments == 830 and p.shares == 412 and p.saves == 95
    assert p.views == 520431  # statsV2 chính xác hơn
    assert p.url == "https://www.tiktok.com/@tinnong24h/video/7431111111111111111"
    assert p.created_at == 1730900000
    cs = [c for d in docs("tiktok_comments.json") for c in parsers.parse_tiktok_comments(d, "7431111111111111111")]
    assert cs[0].kind == "comment" and cs[0].reactions == 120 and cs[0].parent_id == "7431111111111111111"


def test_facebook():
    ds = docs("facebook_graphql.txt")
    assert len(ds) == 2
    posts = [p for d in ds for p in parsers.parse_facebook(d)]
    assert len(posts) == 1
    p = posts[0]
    assert p.post_id == "1234567890"
    assert "ngộ độc" in p.text
    assert p.reactions == 2345 and p.shares == 120 and p.comments == 456
    assert p.created_at == 1730900000
    assert p.author == "Báo Mới"
    assert p.url.startswith("https://www.facebook.com/baomoi/posts/")
    cs = [c for d in ds for c in parsers.parse_facebook_comments(d, "1234567890")]
    assert len(cs) == 1 and cs[0].text == "Quá bức xúc!"


def test_threads_from_html():
    html = (FX / "threads_page.html").read_text(encoding="utf-8")
    posts = [p for d in parsers.json_from_html(html) for p in parsers.parse_threads(d)]
    assert len(posts) == 1
    p = posts[0]
    assert p.reactions == 321 and p.comments == 12 and p.shares == 4
    assert p.url == "https://www.threads.com/@hoangyen/post/DAbc12"


def test_rss():
    posts = parse_rss((FX / "rss.xml").read_text(encoding="utf-8"), "google_news")
    assert len(posts) == 1
    assert posts[0].author == "VnExpress"
    assert posts[0].text == "Hơn 50 học sinh nhập viện nghi ngộ độc"
    assert posts[0].created_at == 1730880000


# ---------------------------------------------------------------- text

def test_match_topic():
    kws = ["ngộ độc & trường học", "bếp ăn bán trú"]
    assert match_topic("Hơn 50 học sinh ngộ độc tại trường học X", kws, [])
    assert match_topic("hon 50 hoc sinh ngo doc o truong hoc", kws, [])  # không dấu
    assert match_topic("#bepanbantru có vấn đề", kws, [])  # hashtag viết liền
    assert not match_topic("ngộ độc rượu ở quán nhậu", kws, [])  # thiếu 'trường học'
    assert not match_topic("Ngộ độc ở trường học - quảng cáo thuốc", kws, ["quảng cáo"])


def test_analyze():
    a = analyze("Phẫn nộ: 3 người tử vong, công an đã khởi tố vụ án")
    assert a["label"] == "neg" and a["emotion"] and a["official"] and a["danger"] >= 2
    assert "Tính mạng / an toàn" in a["categories"]
    assert analyze("MV quá tuyệt vời, ủng hộ ca sĩ")["label"] == "pos"
    assert analyze("Dịch vụ không tốt chút nào")["label"] == "neg"


# ---------------------------------------------------------------- metrics + db + api

@pytest.fixture()
def env(tmp_path):
    cfg = load_config(tmp_path / "none.toml")
    cfg["general"]["data_dir"] = str(tmp_path)
    db = DB(cfg.db_path)
    return cfg, db


def test_metrics_quadrants(env):
    from socialheat.demo import seed_demo

    cfg, db = env
    seed_demo(db)
    res = {r["name"]: r for r in metrics.compute_all(db, cfg)}
    crisis = res["[MẪU] Ngộ độc bếp ăn trường học"]
    trend = res["[MẪU] MV mới của ca sĩ X"]
    assert crisis["quadrant"] == "Khủng hoảng" and crisis["stage"] == "Bùng nổ"
    assert trend["quadrant"] == "Xu hướng" and trend["severity"] < 30
    assert crisis["risk_category"] == "Sức khỏe / thực phẩm"
    assert res["[MẪU] Tăng giá vé gửi xe"]["stage"] == "Thoái trào"
    for r in res.values():
        assert 0 <= r["heat"] <= 100 and 0 <= r["severity"] <= 100


def test_save_posts_upsert(env):
    cfg, db = env
    tid = db.upsert_topic("T", ["x"])
    db.save_posts([Post("tiktok", "1", text="a", reactions=5)], topic_ids=[tid])
    db.save_posts([Post("tiktok", "1", text="dài hơn", reactions=9)], topic_ids=[tid])
    r = db.q("SELECT * FROM posts")
    assert len(r) == 1 and r[0]["reactions"] == 9 and r[0]["text"] == "dài hơn"
    assert len(db.q("SELECT * FROM snapshots")) == 2


def test_api(env):
    from fastapi.testclient import TestClient

    from socialheat.api import create_app
    from socialheat.demo import seed_demo

    cfg, db = env
    seed_demo(db)
    c = TestClient(create_app(cfg, db))
    assert c.get("/").status_code == 200
    ov = c.get("/api/overview").json()
    assert len(ov["topics"]) == 5
    tid = ov["topics"][0]["topic_id"]
    d = c.get(f"/api/topics/{tid}?window=72").json()
    assert len(d["series"]["engagement"]) == 72 and d["top_posts"]
    r = c.post("/api/topics", json={"name": "Mới", "keywords": ["abc"]})
    assert r.status_code == 200 and r.json()["keywords"] == ["abc"]
    csv = c.get(f"/api/topics/{tid}/export.csv")
    assert csv.status_code == 200 and "platform" in csv.text


def test_basic_auth(env):
    from fastapi.testclient import TestClient

    from socialheat.api import create_app

    cfg, db = env
    cfg["server"]["username"], cfg["server"]["password"] = "u", "p"
    c = TestClient(create_app(cfg, db))
    assert c.get("/api/overview").status_code == 401
    assert c.get("/api/overview", auth=("u", "p")).status_code == 200


# ---------------------------------------------------------------- crawler (trình duyệt thật, trang giả lập cục bộ)

CHROME = os.environ.get("SOCIALHEAT_CHROMIUM") or shutil.which("chromium") or "/opt/pw-browsers/chromium"

FAKE_PAGE = """<html><body><div id=feed style="height:5000px">feed</div><script>
let n = 0;
async function load() { const r = await fetch('/api/search/item/full/?page=' + (n++)); document.getElementById('feed').append(' +' + (await r.text()).length); }
load(); window.addEventListener('scroll', () => { if (n < 3) load(); });
</script></body></html>"""


@pytest.mark.skipif(not Path(CHROME).exists(), reason="không có Chromium")
def test_tiktok_crawler_capture(env, monkeypatch):
    """Kiểm tra cơ chế bắt response mạng + cuộn trang bằng một server giả lập cấu trúc API TikTok."""
    from socialheat.crawlers.browser import BrowserSession
    from socialheat.crawlers.social import TikTokCrawler

    fixture = (FX / "tiktok_search.json").read_text(encoding="utf-8")

    class H(http.server.BaseHTTPRequestHandler):
        def do_GET(self):
            body = fixture if self.path.startswith("/api/") else FAKE_PAGE
            if self.path.startswith("/api/"):
                d = json.loads(body)
                page = self.path.rsplit("=", 1)[-1]
                for it in d["data"]:
                    it["item"]["id"] += page
                body = json.dumps(d)
            self.send_response(200)
            self.send_header("Content-Type", "application/json" if self.path.startswith("/api/") else "text/html")
            self.end_headers()
            self.wfile.write(body.encode())

        def log_message(self, *a):
            pass

    srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), H)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    cfg, _ = env
    cfg["general"]["chromium_path"] = CHROME
    cfg["platforms"]["tiktok"].update(delay_seconds=[0.3, 0.5], max_scrolls=4, comments_top_posts=0)
    base = f"http://127.0.0.1:{srv.server_address[1]}"
    monkeypatch.setattr(TikTokCrawler, "search_url", lambda self, kw: f"{base}/search")
    try:
        with BrowserSession(cfg, "tiktok") as s:
            posts, _ = TikTokCrawler(s)._collect(f"{base}/search", "search")
    finally:
        srv.shutdown()
    assert len(posts) >= 4  # ≥ 2 trang × 2 video
    assert all(p.platform == "tiktok" and p.reactions > 0 for p in posts)
