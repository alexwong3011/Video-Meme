"""Báo điện tử: RSS các báo lớn + Google News RSS theo từ khóa (không cần trình duyệt)."""
from __future__ import annotations

import hashlib
import logging
import re
import xml.etree.ElementTree as ET
from email.utils import parsedate_to_datetime
from urllib.parse import quote, urlparse

import httpx

from ..db import Post

log = logging.getLogger("socialheat.news")

HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; SocialHeat/0.1; +internal-monitoring)"}
_TAG_RE = re.compile(r"<[^>]+>")


def _clean(s: str | None) -> str:
    return re.sub(r"\s+", " ", _TAG_RE.sub(" ", s or "")).strip()


def _ts(s: str | None) -> int | None:
    if not s:
        return None
    try:
        return int(parsedate_to_datetime(s).timestamp())
    except (TypeError, ValueError):
        return None


def parse_rss(xml_text: str, source: str) -> list[Post]:
    try:
        root = ET.fromstring(xml_text.encode("utf-8") if isinstance(xml_text, str) else xml_text)
    except ET.ParseError:
        return []
    out = []
    for item in root.iter("item"):
        link = (item.findtext("link") or "").strip()
        title = _clean(item.findtext("title"))
        if not link or not title:
            continue
        src = item.find("source")
        outlet = (src.text.strip() if src is not None and src.text else urlparse(link).netloc.replace("www.", ""))
        desc = _clean(item.findtext("description"))
        if source == "google_news":
            desc = ""  # mô tả của Google News chỉ lặp lại tiêu đề + tên báo
            title = re.sub(r"\s+-\s+[^-]+$", "", title)
        out.append(Post(
            platform="news", post_id=hashlib.sha1(link.encode()).hexdigest()[:20], text=f"{title}. {desc}".strip(". "),
            url=link, author=outlet, author_id=outlet, created_at=_ts(item.findtext("pubDate")),
            kind="article", source=source,
        ))
    return out


class NewsCrawler:
    platform = "news"

    def __init__(self, cfg):
        self.cfg = cfg
        self.pcfg = cfg.platform("news")
        proxy = cfg["general"].get("proxy") or None
        self.client = httpx.Client(headers=HEADERS, timeout=20, follow_redirects=True, proxy=proxy)

    def close(self):
        self.client.close()

    def fetch(self, url: str, source: str) -> list[Post]:
        r = self.client.get(url)
        r.raise_for_status()
        return parse_rss(r.text, source)

    def rss_all(self) -> list[Post]:
        out: list[Post] = []
        for url in self.pcfg.get("rss", []):
            try:
                out += self.fetch(url, "rss")
            except Exception as e:  # noqa: BLE001
                log.warning("RSS lỗi %s: %s", url, e)
        return out

    def search(self, keyword: str) -> list[Post]:
        if not self.pcfg.get("google_news", True):
            return []
        url = f"https://news.google.com/rss/search?q={quote(keyword)}+when:7d&hl=vi&gl=VN&ceid=VN:vi"
        return self.fetch(url, "google_news")
