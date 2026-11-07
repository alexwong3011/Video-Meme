"""Đọc cấu hình từ config.toml (có giá trị mặc định đầy đủ)."""
from __future__ import annotations

import copy
import os
import tomllib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

PLATFORMS = ("facebook", "tiktok", "threads", "news")

DEFAULTS: dict = {
    "general": {
        "data_dir": "data",
        "crawl_interval_minutes": 30,
        "headless": True,
        "timezone": "Asia/Ho_Chi_Minh",
        "chromium_path": "",  # để trống = dùng Chromium của Playwright
        "proxy": "",  # ví dụ "http://user:pass@host:port"
    },
    "server": {"host": "127.0.0.1", "port": 8800, "username": "", "password": ""},
    "platforms": {
        "facebook": {
            "enabled": True,
            "weight": 0.35,
            "max_scrolls": 12,
            "delay_seconds": [2.0, 5.0],
            "comments_top_posts": 5,
            "pages": [],  # URL fanpage / group công khai cần theo dõi thêm
        },
        "tiktok": {
            "enabled": True,
            "weight": 0.30,
            "max_scrolls": 10,
            "delay_seconds": [2.0, 4.5],
            "comments_top_posts": 5,
            "pages": [],  # URL kênh, ví dụ https://www.tiktok.com/@vtv24news
        },
        "threads": {
            "enabled": True,
            "weight": 0.15,
            "max_scrolls": 10,
            "delay_seconds": [2.0, 4.5],
            "comments_top_posts": 5,
            "pages": [],  # URL profile, ví dụ https://www.threads.com/@username
        },
        "news": {
            "enabled": True,
            "weight": 0.20,
            "google_news": True,
            "rss": [
                "https://vnexpress.net/rss/tin-moi-nhat.rss",
                "https://tuoitre.vn/rss/tin-moi-nhat.rss",
                "https://thanhnien.vn/rss/home.rss",
                "https://dantri.com.vn/rss/home.rss",
                "https://vietnamnet.vn/rss/tin-moi-nhat.rss",
                "https://znews.vn/rss/tin-moi.rss",
                "https://laodong.vn/rss/home.rss",
                "https://nld.com.vn/rss/home.rss",
                "https://www.vietnamplus.vn/rss/home.rss",
                "https://kenh14.vn/rss/home.rss",
            ],
        },
    },
    "scoring": {
        "window_hours": 24,
        "heat_weights": {"volume": 0.30, "engagement": 0.35, "velocity": 0.20, "spread": 0.15},
        "severity_weights": {
            "negative": 0.25,
            "emotion": 0.15,
            "risk": 0.30,
            "danger": 0.10,
            "mainstream": 0.10,
            "official": 0.10,
        },
        "engagement_weights": {"reactions": 1.0, "comments": 2.0, "shares": 3.0, "saves": 1.0, "views": 0.01},
        # Mức tham chiếu "rất nóng" (≈ P95) trong 24h cho 1 chủ đề – tự hiệu chỉnh khi đủ lịch sử
        "volume_ref": {"facebook": 300, "tiktok": 300, "threads": 150, "news": 40},
        "engagement_ref": {"facebook": 500000, "tiktok": 3000000, "threads": 50000},
        "authors_ref": 300,
        "heat_threshold": 50,
        "severity_threshold": 50,
    },
    "alerts": {
        "telegram_bot_token": "",
        "telegram_chat_id": "",
        "cooldown_hours": 6,
        "spike_ratio": 4.0,
        "spike_min_posts": 10,
    },
    "llm": {
        "enabled": False,
        "model": "claude-opus-5-5",
        "interval_hours": 3,
        "sample_size": 40,
    },
    "topics": [],
}


def _merge(base: dict, override: dict) -> dict:
    out = copy.deepcopy(base)
    for k, v in override.items():
        if isinstance(v, dict) and isinstance(out.get(k), dict):
            out[k] = _merge(out[k], v)
        else:
            out[k] = v
    return out


class Config(dict):
    @property
    def data_dir(self) -> Path:
        p = Path(self["general"]["data_dir"])
        if not p.is_absolute():
            p = ROOT / p
        p.mkdir(parents=True, exist_ok=True)
        return p

    @property
    def db_path(self) -> Path:
        return self.data_dir / "socialheat.db"

    @property
    def sessions_dir(self) -> Path:
        p = self.data_dir / "sessions"
        p.mkdir(parents=True, exist_ok=True)
        return p

    @property
    def debug_dir(self) -> Path:
        p = self.data_dir / "debug"
        p.mkdir(parents=True, exist_ok=True)
        return p

    def platform(self, name: str) -> dict:
        return self["platforms"][name]

    def enabled_platforms(self) -> list[str]:
        return [p for p in PLATFORMS if self["platforms"].get(p, {}).get("enabled")]


def load_config(path: str | os.PathLike | None = None) -> Config:
    path = Path(path or os.environ.get("SOCIALHEAT_CONFIG") or ROOT / "config.toml")
    data: dict = {}
    if path.exists():
        with open(path, "rb") as f:
            data = tomllib.load(f)
    return Config(_merge(DEFAULTS, data))
