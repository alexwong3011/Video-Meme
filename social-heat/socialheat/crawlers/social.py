"""Crawler cho Facebook, TikTok, Threads.

Nguyên tắc chung "lấy tối đa": với mỗi từ khóa
  1. mở trang tìm kiếm (ưu tiên bài mới nhất), cuộn nhiều lần, bắt toàn bộ response API nội bộ + JSON nhúng trong HTML;
  2. lấy thêm bình luận của các bài có tương tác cao nhất (phục vụ đo cảm xúc / mức nghiêm trọng);
và theo dõi thêm danh sách fanpage / group / kênh cố định trong config.
"""
from __future__ import annotations

import base64
import json
import logging
from urllib.parse import quote

from ..db import Post
from . import parsers
from .browser import BrowserSession

log = logging.getLogger("socialheat.crawl")


def _engagement(p: Post) -> float:
    return p.reactions + 2 * p.comments + 3 * p.shares + 0.01 * p.views


class PlatformCrawler:
    platform = ""
    response_pattern = ""
    comment_pattern = ""

    def __init__(self, session: BrowserSession):
        self.s = session
        self.pcfg = session.cfg.platform(self.platform)

    # -- cần cài đặt ở lớp con
    def search_url(self, keyword: str) -> str:
        raise NotImplementedError

    def parse(self, doc, source: str) -> list[Post]:
        raise NotImplementedError

    def parse_comments(self, doc, root: Post) -> list[Post]:
        return []

    # -- chung
    def _collect(self, url: str, source: str, pattern: str | None = None, **kw) -> tuple[list[Post], str]:
        bodies, html = self.s.capture_page(url, pattern or self.response_pattern, self.pcfg.get("max_scrolls", 10), **kw)
        store: dict[str, Post] = {}
        docs = [d for b in bodies for d in parsers.iter_json_docs(b)] + list(parsers.json_from_html(html))
        for doc in docs:
            for p in self.parse(doc, source):
                if p.post_id in store:
                    store[p.post_id].merge(p)
                else:
                    store[p.post_id] = p
        return list(store.values()), html

    def search(self, keyword: str) -> list[Post]:
        posts, html = self._collect(self.search_url(keyword), "search")
        if not posts and self.s.is_login_wall(html):
            raise PermissionError(f"{self.platform}: bị yêu cầu đăng nhập – chạy `python -m socialheat login {self.platform}`")
        return posts

    def crawl_page(self, url: str) -> list[Post]:
        posts, _ = self._collect(url, "page")
        return posts

    def comments_for(self, posts: list[Post]) -> list[Post]:
        n = int(self.pcfg.get("comments_top_posts", 0))
        out: list[Post] = []
        for root in sorted([p for p in posts if p.url and p.kind != "comment"], key=_engagement, reverse=True)[:n]:
            try:
                bodies, html = self.s.capture_page(root.url, self.comment_pattern or self.response_pattern,
                                                   max_scrolls=4)
                docs = [d for b in bodies for d in parsers.iter_json_docs(b)] + list(parsers.json_from_html(html))
                for doc in docs:
                    for c in self.parse_comments(doc, root):
                        c.parent_id = root.post_id
                        out.append(c)
            except Exception as e:  # noqa: BLE001
                log.warning("%s: lỗi lấy bình luận %s: %s", self.platform, root.url, e)
        return out


class FacebookCrawler(PlatformCrawler):
    platform = "facebook"
    response_pattern = r"/api/graphql"

    def search_url(self, keyword: str) -> str:
        # bộ lọc "Bài viết mới nhất" của Facebook: JSON được mã hóa base64 trong tham số filters
        flt = json.dumps({"recent_posts:0": json.dumps({"name": "recent_posts", "args": ""})}, separators=(",", ":"))
        return (f"https://www.facebook.com/search/posts/?q={quote(keyword)}"
                f"&filters={quote(base64.b64encode(flt.encode()).decode())}")

    def parse(self, doc, source):
        return parsers.parse_facebook(doc, source)

    def parse_comments(self, doc, root):
        return parsers.parse_facebook_comments(doc, root.post_id)


class TikTokCrawler(PlatformCrawler):
    platform = "tiktok"
    response_pattern = r"/api/(search|challenge|post|recommend|related)/"
    comment_pattern = r"/api/comment/list"

    def search_url(self, keyword: str) -> str:
        return f"https://www.tiktok.com/search/video?q={quote(keyword)}"

    def search(self, keyword: str) -> list[Post]:
        posts = super().search(keyword)
        # hashtag: thêm trang /tag/<từ khóa viết liền không dấu cách>
        tag = keyword.replace(" ", "").replace("#", "")
        if tag and len(keyword.split()) <= 3:
            try:
                more, _ = self._collect(f"https://www.tiktok.com/tag/{quote(tag)}", "search")
                seen = {p.post_id for p in posts}
                posts += [p for p in more if p.post_id not in seen]
            except Exception as e:  # noqa: BLE001
                log.info("tiktok: bỏ qua hashtag %s: %s", tag, e)
        return posts

    def parse(self, doc, source):
        return parsers.parse_tiktok(doc, source)

    def parse_comments(self, doc, root):
        return parsers.parse_tiktok_comments(doc, root.post_id)


class ThreadsCrawler(PlatformCrawler):
    platform = "threads"
    response_pattern = r"/(api/graphql|graphql/query)"

    def search_url(self, keyword: str) -> str:
        return f"https://www.threads.com/search?q={quote(keyword)}&serp_type=default&filter=recent"

    def parse(self, doc, source):
        return parsers.parse_threads(doc, source)

    def parse_comments(self, doc, root):
        code = root.extra.get("code") if root.extra else None
        return [p for p in parsers.parse_threads(doc, "comments", root_code=code) if p.kind == "comment"]


CRAWLERS = {"facebook": FacebookCrawler, "tiktok": TikTokCrawler, "threads": ThreadsCrawler}
