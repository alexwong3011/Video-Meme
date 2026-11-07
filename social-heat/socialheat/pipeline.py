"""Điều phối: crawl → lưu → gán chủ đề → chấm điểm → cảnh báo."""
from __future__ import annotations

import logging
import threading
import time
import traceback

import httpx

from .analysis import metrics
from .analysis.llm import label_topic
from .analysis.text import is_excluded, match_topic
from .config import Config
from .db import DB, Post

log = logging.getLogger("socialheat")

_crawl_lock = threading.Lock()
STATE = {"running": False, "current": None, "last_finished": None}


def _assign(db: DB, posts: list[Post], pks: list[int], topics: list[dict], search_topic: dict | None) -> None:
    """Gán bài vào chủ đề: kết quả tìm kiếm thuộc chủ đề đã tìm (trừ khi dính từ loại trừ);
    mọi bài cũng được so khớp chặt với các chủ đề khác."""
    for t in topics:
        linked = []
        for p, pk in zip(posts, pks):
            text = p.text or ""
            if search_topic and t["id"] == search_topic["id"]:
                if not is_excluded(text, t["exclude"]):
                    linked.append(pk)
            elif match_topic(text, t["keywords"], t["exclude"]):
                linked.append(pk)
        if linked:
            db.link_topic(t["id"], linked)


def crawl_social(db: DB, cfg: Config, platform: str, topics: list[dict], debug: bool = False) -> None:
    from .crawlers.browser import BrowserSession
    from .crawlers.social import CRAWLERS

    all_topics = db.topics()
    with BrowserSession(cfg, platform, debug=debug) as s:
        crawler = CRAWLERS[platform](s)
        for t in topics:
            for kw in t["keywords"]:
                q = kw.replace("&", " ")
                run = db.start_run(platform, f"{t['name']}: {q}")
                STATE["current"] = f"{platform} · {q}"
                try:
                    posts = crawler.search(q)
                    pks = db.save_posts(posts)
                    _assign(db, posts, pks, all_topics, t)
                    comments = crawler.comments_for(posts)
                    if comments:
                        db.save_posts(comments, topic_ids=[t["id"]])
                    db.finish_run(run, "ok", len(posts) + len(comments))
                    log.info("%s | %s: %d bài, %d bình luận", platform, q, len(posts), len(comments))
                except Exception as e:  # noqa: BLE001
                    db.finish_run(run, "error", 0, f"{type(e).__name__}: {e}")
                    log.error("%s | %s lỗi: %s", platform, q, e)
                    if debug:
                        traceback.print_exc()
                    if isinstance(e, PermissionError):
                        return
                s.sleep()
        for url in cfg.platform(platform).get("pages", []):
            run = db.start_run(platform, url)
            STATE["current"] = f"{platform} · {url}"
            try:
                posts = crawler.crawl_page(url)
                pks = db.save_posts(posts)
                _assign(db, posts, pks, all_topics, None)
                db.finish_run(run, "ok", len(posts))
            except Exception as e:  # noqa: BLE001
                db.finish_run(run, "error", 0, f"{type(e).__name__}: {e}")
                log.error("%s | %s lỗi: %s", platform, url, e)


def crawl_news(db: DB, cfg: Config, topics: list[dict]) -> None:
    from .crawlers.news import NewsCrawler

    all_topics = db.topics()
    nc = NewsCrawler(cfg)
    try:
        run = db.start_run("news", "RSS")
        STATE["current"] = "news · RSS"
        try:
            posts = nc.rss_all()
            # chỉ giữ bài RSS khớp ít nhất 1 chủ đề – tránh phình CSDL
            keep = [p for p in posts if any(match_topic(p.text, t["keywords"], t["exclude"]) for t in all_topics)]
            pks = db.save_posts(keep)
            _assign(db, keep, pks, all_topics, None)
            db.finish_run(run, "ok", len(keep))
        except Exception as e:  # noqa: BLE001
            db.finish_run(run, "error", 0, str(e))
        for t in topics:
            for kw in t["keywords"]:
                q = kw.replace("&", " ")
                run = db.start_run("news", f"{t['name']}: {q}")
                STATE["current"] = f"news · {q}"
                try:
                    posts = nc.search(kw)
                    pks = db.save_posts(posts)
                    _assign(db, posts, pks, all_topics, t)
                    db.finish_run(run, "ok", len(posts))
                except Exception as e:  # noqa: BLE001
                    db.finish_run(run, "error", 0, f"{type(e).__name__}: {e}")
                    log.error("news | %s lỗi: %s", q, e)
    finally:
        nc.close()


def crawl(db: DB, cfg: Config, platforms: list[str] | None = None, topic_ids: list[int] | None = None,
          debug: bool = False) -> bool:
    if not _crawl_lock.acquire(blocking=False):
        log.warning("Đang có lượt crawl khác chạy – bỏ qua")
        return False
    STATE["running"] = True
    try:
        topics = [t for t in db.topics() if not topic_ids or t["id"] in topic_ids]
        for p in platforms or cfg.enabled_platforms():
            if not cfg.platform(p).get("enabled"):
                continue
            try:
                if p == "news":
                    crawl_news(db, cfg, topics)
                else:
                    crawl_social(db, cfg, p, topics, debug=debug)
            except Exception as e:  # noqa: BLE001 – ví dụ chưa cài Chromium
                run = db.start_run(p, "*")
                db.finish_run(run, "error", 0, f"{type(e).__name__}: {e}")
                log.error("%s: %s", p, e)
        score_and_alert(db, cfg)
        return True
    finally:
        STATE.update(running=False, current=None, last_finished=int(time.time()))
        _crawl_lock.release()


# ------------------------------------------------------------------ chấm điểm & cảnh báo


def send_telegram(cfg: Config, text: str) -> None:
    a = cfg["alerts"]
    if not (a.get("telegram_bot_token") and a.get("telegram_chat_id")):
        return
    try:
        httpx.post(f"https://api.telegram.org/bot{a['telegram_bot_token']}/sendMessage",
                   json={"chat_id": a["telegram_chat_id"], "text": text}, timeout=15)
    except Exception as e:  # noqa: BLE001
        log.warning("Gửi Telegram lỗi: %s", e)


def score_and_alert(db: DB, cfg: Config) -> list[dict]:
    for t in db.topics():
        try:
            label_topic(db, cfg, t)
        except Exception as e:  # noqa: BLE001
            log.warning("LLM lỗi (%s): %s", t["name"], e)
    results = metrics.compute_all(db, cfg)
    a = cfg["alerts"]
    cooldown = a["cooldown_hours"] * 3600
    now = int(time.time())
    for r in results:
        db.save_score(r["topic_id"], r["heat"], r["severity"],
                      {k: r[k] for k in ("raw_volume", "raw_engagement", "quadrant", "stage", "posts", "engagement")})
        msgs = []
        if r["quadrant"] == "Khủng hoảng":
            msgs.append(("crisis", f"🔴 KHỦNG HOẢNG: «{r['name']}» – Nóng {r['heat']:.0f}, Nghiêm trọng {r['severity']:.0f}, "
                                   f"{r['posts']} bài/{r['window_hours']}h, loại: {r['risk_category'] or 'chưa rõ'}"))
        if r["velocity_ratio"] >= a["spike_ratio"] and r["posts_last6h"] >= a["spike_min_posts"]:
            msgs.append(("spike", f"📈 TĂNG ĐỘT BIẾN: «{r['name']}» – {r['posts_last6h']} bài trong 6h "
                                  f"(gấp {r['velocity_ratio']:.1f} lần mức nền)"))
        for kind, msg in msgs:
            last = db.last_alert(r["topic_id"], kind)
            if last and now - last < cooldown:
                continue
            db.add_alert(r["topic_id"], kind, msg)
            send_telegram(cfg, msg)
    return results


def scheduler_loop(db: DB, cfg: Config, stop: threading.Event) -> None:
    interval = cfg["general"]["crawl_interval_minutes"] * 60
    while not stop.is_set():
        try:
            crawl(db, cfg)
        except Exception as e:  # noqa: BLE001
            log.error("Lỗi vòng lặp: %s", e)
        stop.wait(interval)
