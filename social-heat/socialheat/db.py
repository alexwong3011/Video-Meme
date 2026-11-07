"""Lưu trữ SQLite: chủ đề, bài viết, snapshot tương tác, lượt crawl, cảnh báo."""
from __future__ import annotations

import json
import sqlite3
import threading
import time
from dataclasses import dataclass, field
from pathlib import Path

SCHEMA = """
CREATE TABLE IF NOT EXISTS topics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    keywords TEXT NOT NULL DEFAULT '[]',
    exclude TEXT NOT NULL DEFAULT '[]',
    active INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    platform TEXT NOT NULL,
    post_id TEXT NOT NULL,
    kind TEXT NOT NULL DEFAULT 'post',          -- post | video | article | comment
    parent_id TEXT,                              -- post_id của bài gốc nếu là bình luận
    url TEXT,
    author TEXT,
    author_id TEXT,
    text TEXT,
    created_at INTEGER,                          -- epoch giây (thời điểm đăng)
    first_seen INTEGER NOT NULL,
    last_seen INTEGER NOT NULL,
    reactions INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,
    source TEXT,                                 -- search | page | rss | google_news | comments
    extra TEXT,
    UNIQUE(platform, post_id)
);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at);
CREATE INDEX IF NOT EXISTS idx_posts_parent ON posts(platform, parent_id);
CREATE TABLE IF NOT EXISTS topic_posts (
    topic_id INTEGER NOT NULL,
    post_pk INTEGER NOT NULL,
    matched_at INTEGER NOT NULL,
    PRIMARY KEY (topic_id, post_pk)
);
CREATE INDEX IF NOT EXISTS idx_tp_post ON topic_posts(post_pk);
CREATE TABLE IF NOT EXISTS snapshots (
    post_pk INTEGER NOT NULL,
    ts INTEGER NOT NULL,
    reactions INTEGER, comments INTEGER, shares INTEGER, views INTEGER, saves INTEGER
);
CREATE INDEX IF NOT EXISTS idx_snap_post ON snapshots(post_pk, ts);
CREATE TABLE IF NOT EXISTS crawl_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    platform TEXT, target TEXT,
    started INTEGER, finished INTEGER,
    status TEXT, items INTEGER DEFAULT 0, error TEXT
);
CREATE TABLE IF NOT EXISTS topic_scores (
    topic_id INTEGER NOT NULL,
    ts INTEGER NOT NULL,
    heat REAL, severity REAL,
    data TEXT
);
CREATE INDEX IF NOT EXISTS idx_scores ON topic_scores(topic_id, ts);
CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_id INTEGER, ts INTEGER, kind TEXT, message TEXT
);
CREATE TABLE IF NOT EXISTS llm_labels (
    topic_id INTEGER NOT NULL,
    ts INTEGER NOT NULL,
    data TEXT
);
"""


@dataclass
class Post:
    platform: str
    post_id: str
    text: str = ""
    url: str | None = None
    author: str | None = None
    author_id: str | None = None
    created_at: int | None = None
    reactions: int = 0
    comments: int = 0
    shares: int = 0
    views: int = 0
    saves: int = 0
    kind: str = "post"
    parent_id: str | None = None
    source: str | None = None
    extra: dict = field(default_factory=dict)

    def merge(self, other: "Post") -> None:
        """Gộp 2 bản ghi cùng post_id (dữ liệu từ nhiều response khác nhau)."""
        for attr in ("reactions", "comments", "shares", "views", "saves"):
            setattr(self, attr, max(getattr(self, attr) or 0, getattr(other, attr) or 0))
        if len(other.text or "") > len(self.text or ""):
            self.text = other.text
        for attr in ("url", "author", "author_id", "created_at", "parent_id"):
            if not getattr(self, attr) and getattr(other, attr):
                setattr(self, attr, getattr(other, attr))
        self.extra.update(other.extra)


class DB:
    def __init__(self, path: str | Path):
        self.path = str(path)
        self._local = threading.local()
        self.lock = threading.RLock()
        with self.lock:
            self.conn.executescript(SCHEMA)
            self.conn.commit()

    @property
    def conn(self) -> sqlite3.Connection:
        c = getattr(self._local, "conn", None)
        if c is None:
            c = sqlite3.connect(self.path, timeout=30)
            c.row_factory = sqlite3.Row
            c.execute("PRAGMA journal_mode=WAL")
            self._local.conn = c
        return c

    def q(self, sql: str, args: tuple | list = ()) -> list[sqlite3.Row]:
        return self.conn.execute(sql, args).fetchall()

    def x(self, sql: str, args: tuple | list = ()) -> int:
        with self.lock:
            cur = self.conn.execute(sql, args)
            self.conn.commit()
            return cur.lastrowid

    # ---------- topics ----------
    def topics(self, active_only: bool = True) -> list[dict]:
        sql = "SELECT * FROM topics" + (" WHERE active=1" if active_only else "") + " ORDER BY id"
        out = []
        for r in self.q(sql):
            d = dict(r)
            d["keywords"] = json.loads(d["keywords"])
            d["exclude"] = json.loads(d["exclude"])
            out.append(d)
        return out

    def topic(self, topic_id: int) -> dict | None:
        r = self.q("SELECT * FROM topics WHERE id=?", (topic_id,))
        if not r:
            return None
        d = dict(r[0])
        d["keywords"] = json.loads(d["keywords"])
        d["exclude"] = json.loads(d["exclude"])
        return d

    def upsert_topic(self, name: str, keywords: list[str], exclude: list[str] | None = None, active: bool = True) -> int:
        exclude = exclude or []
        row = self.q("SELECT id FROM topics WHERE name=?", (name,))
        if row:
            self.x(
                "UPDATE topics SET keywords=?, exclude=?, active=? WHERE id=?",
                (json.dumps(keywords, ensure_ascii=False), json.dumps(exclude, ensure_ascii=False), int(active), row[0]["id"]),
            )
            return row[0]["id"]
        return self.x(
            "INSERT INTO topics(name, keywords, exclude, active, created_at) VALUES (?,?,?,?,?)",
            (name, json.dumps(keywords, ensure_ascii=False), json.dumps(exclude, ensure_ascii=False), int(active), int(time.time())),
        )

    def update_topic(self, topic_id: int, **fields) -> None:
        sets, args = [], []
        for k, v in fields.items():
            if k in ("keywords", "exclude"):
                v = json.dumps(v, ensure_ascii=False)
            if k == "active":
                v = int(v)
            sets.append(f"{k}=?")
            args.append(v)
        if sets:
            self.x(f"UPDATE topics SET {', '.join(sets)} WHERE id=?", (*args, topic_id))

    # ---------- posts ----------
    def save_posts(self, posts: list[Post], topic_ids: list[int] | None = None) -> list[int]:
        """Lưu/ cập nhật bài viết + ghi snapshot tương tác. Trả về danh sách khóa chính."""
        now = int(time.time())
        pks: list[int] = []
        with self.lock:
            c = self.conn
            for p in posts:
                row = c.execute("SELECT id FROM posts WHERE platform=? AND post_id=?", (p.platform, p.post_id)).fetchone()
                if row:
                    pk = row["id"]
                    c.execute(
                        """UPDATE posts SET last_seen=?,
                           reactions=MAX(reactions, ?), comments=MAX(comments, ?), shares=MAX(shares, ?),
                           views=MAX(views, ?), saves=MAX(saves, ?),
                           text=CASE WHEN length(coalesce(?, '')) > length(coalesce(text, '')) THEN ? ELSE text END,
                           url=coalesce(url, ?), author=coalesce(author, ?), author_id=coalesce(author_id, ?),
                           created_at=coalesce(created_at, ?), parent_id=coalesce(parent_id, ?)
                           WHERE id=?""",
                        (now, p.reactions, p.comments, p.shares, p.views, p.saves, p.text, p.text,
                         p.url, p.author, p.author_id, p.created_at, p.parent_id, pk),
                    )
                else:
                    pk = c.execute(
                        """INSERT INTO posts(platform, post_id, kind, parent_id, url, author, author_id, text,
                           created_at, first_seen, last_seen, reactions, comments, shares, views, saves, source, extra)
                           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                        (p.platform, p.post_id, p.kind, p.parent_id, p.url, p.author, p.author_id, p.text,
                         p.created_at, now, now, p.reactions, p.comments, p.shares, p.views, p.saves, p.source,
                         json.dumps(p.extra, ensure_ascii=False) if p.extra else None),
                    ).lastrowid
                if p.kind != "comment":
                    c.execute(
                        "INSERT INTO snapshots(post_pk, ts, reactions, comments, shares, views, saves) VALUES (?,?,?,?,?,?,?)",
                        (pk, now, p.reactions, p.comments, p.shares, p.views, p.saves),
                    )
                for tid in topic_ids or []:
                    c.execute("INSERT OR IGNORE INTO topic_posts(topic_id, post_pk, matched_at) VALUES (?,?,?)", (tid, pk, now))
                pks.append(pk)
            c.commit()
        return pks

    def link_topic(self, topic_id: int, post_pks: list[int]) -> None:
        now = int(time.time())
        with self.lock:
            self.conn.executemany(
                "INSERT OR IGNORE INTO topic_posts(topic_id, post_pk, matched_at) VALUES (?,?,?)",
                [(topic_id, pk, now) for pk in post_pks],
            )
            self.conn.commit()

    # ---------- crawl runs ----------
    def start_run(self, platform: str, target: str) -> int:
        return self.x("INSERT INTO crawl_runs(platform, target, started, status) VALUES (?,?,?,?)",
                      (platform, target, int(time.time()), "running"))

    def finish_run(self, run_id: int, status: str, items: int = 0, error: str | None = None) -> None:
        self.x("UPDATE crawl_runs SET finished=?, status=?, items=?, error=? WHERE id=?",
               (int(time.time()), status, items, error, run_id))

    def recent_runs(self, limit: int = 30) -> list[dict]:
        return [dict(r) for r in self.q("SELECT * FROM crawl_runs ORDER BY id DESC LIMIT ?", (limit,))]

    # ---------- scores / alerts / llm ----------
    def save_score(self, topic_id: int, heat: float, severity: float, data: dict) -> None:
        self.x("INSERT INTO topic_scores(topic_id, ts, heat, severity, data) VALUES (?,?,?,?,?)",
               (topic_id, int(time.time()), heat, severity, json.dumps(data, ensure_ascii=False)))

    def score_history(self, topic_id: int, since: int) -> list[dict]:
        return [dict(r) for r in self.q(
            "SELECT ts, heat, severity FROM topic_scores WHERE topic_id=? AND ts>=? ORDER BY ts", (topic_id, since))]

    def add_alert(self, topic_id: int, kind: str, message: str) -> int:
        return self.x("INSERT INTO alerts(topic_id, ts, kind, message) VALUES (?,?,?,?)",
                      (topic_id, int(time.time()), kind, message))

    def last_alert(self, topic_id: int, kind: str) -> int | None:
        r = self.q("SELECT MAX(ts) AS t FROM alerts WHERE topic_id=? AND kind=?", (topic_id, kind))
        return r[0]["t"] if r else None

    def alerts(self, limit: int = 50) -> list[dict]:
        return [dict(r) for r in self.q(
            "SELECT a.*, t.name AS topic FROM alerts a LEFT JOIN topics t ON t.id=a.topic_id ORDER BY a.ts DESC LIMIT ?",
            (limit,))]

    def save_llm_label(self, topic_id: int, data: dict) -> None:
        self.x("INSERT INTO llm_labels(topic_id, ts, data) VALUES (?,?,?)",
               (topic_id, int(time.time()), json.dumps(data, ensure_ascii=False)))

    def latest_llm_label(self, topic_id: int) -> dict | None:
        r = self.q("SELECT ts, data FROM llm_labels WHERE topic_id=? ORDER BY ts DESC LIMIT 1", (topic_id,))
        if not r:
            return None
        d = json.loads(r[0]["data"])
        d["ts"] = r[0]["ts"]
        return d
