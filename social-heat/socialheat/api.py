"""API + dashboard nội bộ (FastAPI)."""
from __future__ import annotations

import csv
import io
import secrets
import threading
import time
from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from pydantic import BaseModel, Field

from . import pipeline
from .analysis import metrics
from .config import Config
from .db import DB

STATIC = Path(__file__).parent / "static"


class TopicIn(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    keywords: list[str] = Field(min_length=1)
    exclude: list[str] = []
    active: bool = True


class CrawlIn(BaseModel):
    platforms: list[str] | None = None
    topic_ids: list[int] | None = None


def create_app(cfg: Config, db: DB) -> FastAPI:
    srv = cfg["server"]
    security = HTTPBasic(auto_error=False)

    def auth(creds: HTTPBasicCredentials | None = Depends(security)):
        if not srv.get("username"):
            return
        ok = creds and secrets.compare_digest(creds.username, srv["username"]) and \
            secrets.compare_digest(creds.password, srv["password"])
        if not ok:
            raise HTTPException(401, "Sai thông tin đăng nhập", headers={"WWW-Authenticate": "Basic"})

    app = FastAPI(title="Social Heat", dependencies=[Depends(auth)])
    app.mount("/static", StaticFiles(directory=STATIC), name="static")
    cache: dict = {}

    def overview_cached(window: int) -> list[dict]:
        key = ("ov", window)
        hit = cache.get(key)
        if hit and time.time() - hit[0] < 30:
            return hit[1]
        data = metrics.compute_all(db, cfg, window_hours=window)
        cache[key] = (time.time(), data)
        return data

    @app.get("/")
    def index():
        return FileResponse(STATIC / "index.html")

    @app.get("/api/overview")
    def overview(window: int = 24):
        topics = overview_cached(window)
        since = int(time.time()) - window * 3600
        tot = db.q("SELECT count(*) n FROM posts WHERE kind!='comment' AND coalesce(created_at, first_seen)>=?", (since,))[0]["n"]
        return {
            "generated_at": int(time.time()), "window": window, "topics": topics,
            "thresholds": {"heat": cfg["scoring"]["heat_threshold"], "severity": cfg["scoring"]["severity_threshold"]},
            "platforms": cfg.enabled_platforms(), "total_posts": tot,
            "alerts": db.alerts(10),
        }

    @app.get("/api/topics/{topic_id}")
    def topic_detail(topic_id: int, window: int = 24):
        t = db.topic(topic_id)
        if not t:
            raise HTTPException(404, "Không tìm thấy chủ đề")
        return metrics.compute_topic(db, cfg, t, window_hours=window, detail=True)

    @app.get("/api/topics")
    def list_topics():
        return db.topics(active_only=False)

    @app.post("/api/topics")
    def create_topic(body: TopicIn):
        tid = db.upsert_topic(body.name.strip(), [k.strip() for k in body.keywords if k.strip()],
                              [k.strip() for k in body.exclude if k.strip()], body.active)
        cache.clear()
        return db.topic(tid)

    @app.put("/api/topics/{topic_id}")
    def update_topic(topic_id: int, body: TopicIn):
        if not db.topic(topic_id):
            raise HTTPException(404)
        db.update_topic(topic_id, name=body.name.strip(), keywords=body.keywords, exclude=body.exclude, active=body.active)
        cache.clear()
        return db.topic(topic_id)

    @app.delete("/api/topics/{topic_id}")
    def delete_topic(topic_id: int):
        db.update_topic(topic_id, active=False)
        cache.clear()
        return {"ok": True}

    @app.post("/api/crawl")
    def start_crawl(body: CrawlIn | None = None):
        if pipeline.STATE["running"]:
            return {"started": False, "reason": "Đang crawl"}
        body = body or CrawlIn()

        def job():
            pipeline.crawl(db, cfg, body.platforms, body.topic_ids)
            cache.clear()

        threading.Thread(target=job, daemon=True).start()
        return {"started": True}

    @app.get("/api/status")
    def status():
        sessions = {p: (cfg.sessions_dir / f"{p}.json").exists() for p in ("facebook", "tiktok", "threads")}
        return {"state": pipeline.STATE, "sessions": sessions, "runs": db.recent_runs(40),
                "interval_minutes": cfg["general"]["crawl_interval_minutes"], "llm": bool(cfg["llm"]["enabled"])}

    @app.get("/api/alerts")
    def alerts(limit: int = 50):
        return db.alerts(limit)

    @app.get("/api/topics/{topic_id}/export.csv")
    def export(topic_id: int, request: Request):
        rows = db.q(
            """SELECT p.platform, p.kind, p.url, p.author, p.created_at, p.reactions, p.comments, p.shares, p.views, p.text
               FROM posts p JOIN topic_posts tp ON tp.post_pk=p.id WHERE tp.topic_id=? ORDER BY p.created_at DESC""",
            (topic_id,))
        buf = io.StringIO()
        buf.write("﻿")  # BOM để Excel đọc đúng tiếng Việt
        w = csv.writer(buf)
        w.writerow(["platform", "kind", "url", "author", "created_at", "reactions", "comments", "shares", "views", "text"])
        for r in rows:
            w.writerow([r["platform"], r["kind"], r["url"], r["author"],
                        time.strftime("%Y-%m-%d %H:%M", time.localtime(r["created_at"])) if r["created_at"] else "",
                        r["reactions"], r["comments"], r["shares"], r["views"], (r["text"] or "").replace("\n", " ")])
        buf.seek(0)
        return StreamingResponse(iter([buf.getvalue()]), media_type="text/csv; charset=utf-8",
                                 headers={"Content-Disposition": f"attachment; filename=topic_{topic_id}.csv"})

    return app
