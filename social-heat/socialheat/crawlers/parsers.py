"""Bóc tách bài viết từ JSON thô mà các nền tảng trả về (GraphQL / API nội bộ / JSON nhúng trong HTML).

Các nền tảng thay đổi cấu trúc thường xuyên, nên thay vì bám đường dẫn cố định, ta *duyệt toàn bộ cây JSON*
và nhận diện "nút bài viết" theo tập khóa đặc trưng. Khi nền tảng đổi cấu trúc, chạy crawl với --debug để lưu
response thô vào data/debug/ rồi chỉnh các hàm dưới đây.
"""
from __future__ import annotations

import html as htmllib
import json
import re
from typing import Any, Iterator

from ..db import Post

# ---------------------------------------------------------------- tiện ích JSON


def iter_json_docs(text: str) -> Iterator[Any]:
    """Một response có thể là 1 JSON, nhiều JSON nối dòng (FB/Threads GraphQL), hoặc có tiền tố 'for (;;);'."""
    if not text:
        return
    text = text.strip()
    if text.startswith("for (;;);"):
        text = text[len("for (;;);"):]
    try:
        yield json.loads(text)
        return
    except (ValueError, RecursionError):
        pass
    for line in text.splitlines():
        line = line.strip()
        if not line or line[0] not in "{[":
            continue
        try:
            yield json.loads(line)
        except (ValueError, RecursionError):
            continue


_SCRIPT_RE = re.compile(r"<script[^>]*type=\"application/json\"[^>]*>(.*?)</script>", re.S | re.I)


def json_from_html(page_html: str) -> Iterator[Any]:
    """JSON nhúng trong <script type="application/json"> (SSR của Facebook, Threads, TikTok)."""
    for m in _SCRIPT_RE.finditer(page_html or ""):
        body = m.group(1).strip()
        if not body:
            continue
        try:
            yield json.loads(body)
        except ValueError:
            try:
                yield json.loads(htmllib.unescape(body))
            except ValueError:
                continue


def walk(obj: Any, max_depth: int = 80) -> Iterator[dict]:
    """Duyệt mọi dict trong cây JSON (không đệ quy để tránh tràn stack)."""
    stack = [(obj, 0)]
    while stack:
        cur, depth = stack.pop()
        if depth > max_depth:
            continue
        if isinstance(cur, dict):
            yield cur
            for v in cur.values():
                if isinstance(v, (dict, list)):
                    stack.append((v, depth + 1))
        elif isinstance(cur, list):
            for v in cur:
                if isinstance(v, (dict, list)):
                    stack.append((v, depth + 1))


def to_int(v: Any) -> int:
    """Chuyển '1,2K', '3.4M', '12 N', 1234 -> số nguyên."""
    if v is None:
        return 0
    if isinstance(v, bool):
        return int(v)
    if isinstance(v, (int, float)):
        return int(v)
    if isinstance(v, dict):
        for k in ("count", "total_count", "value"):
            if k in v:
                return to_int(v[k])
        return 0
    s = str(v).strip().lower().replace(" ", " ")
    m = re.search(r"([\d.,]+)\s*(k|m|b|n|nghìn|ngàn|tr|triệu|tỷ)?", s)
    if not m:
        return 0
    num, unit = m.group(1), m.group(2)
    if unit:
        num = num.replace(",", ".")
        if num.count(".") > 1:
            num = num.replace(".", "")
    else:
        num = num.replace(",", "").replace(".", "")
    try:
        f = float(num)
    except ValueError:
        return 0
    mult = {"k": 1e3, "n": 1e3, "nghìn": 1e3, "ngàn": 1e3, "m": 1e6, "tr": 1e6, "triệu": 1e6, "b": 1e9, "tỷ": 1e9}
    return int(f * mult.get(unit or "", 1))


def _merge_into(store: dict[str, Post], p: Post) -> None:
    if p.post_id in store:
        store[p.post_id].merge(p)
    else:
        store[p.post_id] = p


# ---------------------------------------------------------------- Facebook

_FB_URL_HINT = ("/posts/", "permalink", "story_fbid", "/videos/", "/reel/", "/watch", "/photo", "pfbid", "/groups/")


def _fb_subtree_stats(node: dict) -> dict:
    st = {"text": "", "created": None, "reactions": 0, "comments": 0, "shares": 0, "views": 0,
          "author": None, "author_id": None, "url": None}
    for d in walk(node, max_depth=40):
        msg = d.get("message")
        if isinstance(msg, dict) and isinstance(msg.get("text"), str) and len(msg["text"]) > len(st["text"]):
            st["text"] = msg["text"]
        if st["created"] is None and isinstance(d.get("creation_time"), int):
            st["created"] = d["creation_time"]
        for k in ("reaction_count", "reactors", "top_reactions"):
            if k in d and isinstance(d[k], dict):
                st["reactions"] = max(st["reactions"], to_int(d[k]))
        if isinstance(d.get("i18n_reaction_count"), str):
            st["reactions"] = max(st["reactions"], to_int(d["i18n_reaction_count"]))
        if isinstance(d.get("share_count"), dict):
            st["shares"] = max(st["shares"], to_int(d["share_count"]))
        if isinstance(d.get("i18n_share_count"), str):
            st["shares"] = max(st["shares"], to_int(d["i18n_share_count"]))
        for k in ("comment_count", "comments", "comment_rendering_instance"):
            v = d.get(k)
            if isinstance(v, dict):
                if "total_count" in v:
                    st["comments"] = max(st["comments"], to_int(v["total_count"]))
                elif isinstance(v.get("comments"), dict) and "total_count" in v["comments"]:
                    st["comments"] = max(st["comments"], to_int(v["comments"]["total_count"]))
        if isinstance(d.get("total_comment_count"), int):
            st["comments"] = max(st["comments"], d["total_comment_count"])
        for k in ("play_count", "video_view_count", "post_view_count"):
            if isinstance(d.get(k), (int, str)):
                st["views"] = max(st["views"], to_int(d[k]))
        actors = d.get("actors")
        if st["author"] is None and isinstance(actors, list) and actors and isinstance(actors[0], dict):
            st["author"] = actors[0].get("name")
            st["author_id"] = str(actors[0].get("id")) if actors[0].get("id") else None
        for k in ("url", "permalink_url", "wwwURL"):
            u = d.get(k)
            if st["url"] is None and isinstance(u, str) and "facebook.com" in u and any(h in u for h in _FB_URL_HINT):
                st["url"] = u
    return st


def parse_facebook(doc: Any, source: str = "search") -> list[Post]:
    store: dict[str, Post] = {}
    for d in walk(doc):
        pid = d.get("post_id")
        if not (isinstance(pid, str) and pid.isdigit()):
            continue
        st = _fb_subtree_stats(d)
        if not st["text"] and not st["url"]:
            continue
        _merge_into(store, Post(
            platform="facebook", post_id=pid, text=st["text"], url=st["url"] or f"https://www.facebook.com/{pid}",
            author=st["author"], author_id=st["author_id"], created_at=st["created"],
            reactions=st["reactions"], comments=st["comments"], shares=st["shares"], views=st["views"],
            kind="video" if st["views"] else "post", source=source,
        ))
    return list(store.values())


def parse_facebook_comments(doc: Any, parent_id: str | None) -> list[Post]:
    store: dict[str, Post] = {}
    for d in walk(doc):
        if d.get("__typename") != "Comment":
            continue
        body = d.get("body") or d.get("preferred_body")
        text = body.get("text") if isinstance(body, dict) else None
        cid = d.get("legacy_fbid") or d.get("id")
        if not text or not cid:
            continue
        author = d.get("author") if isinstance(d.get("author"), dict) else {}
        fb = d.get("feedback") if isinstance(d.get("feedback"), dict) else {}
        _merge_into(store, Post(
            platform="facebook", post_id=f"c_{cid}", text=text, kind="comment", parent_id=parent_id,
            author=author.get("name"), author_id=str(author.get("id")) if author.get("id") else None,
            created_at=d.get("created_time") if isinstance(d.get("created_time"), int) else None,
            reactions=to_int(fb.get("reactors")) if fb else 0, source="comments",
        ))
    return list(store.values())


# ---------------------------------------------------------------- TikTok


def parse_tiktok(doc: Any, source: str = "search") -> list[Post]:
    store: dict[str, Post] = {}
    for d in walk(doc):
        if not ("createTime" in d and "desc" in d and ("stats" in d or "statsV2" in d)):
            continue
        vid = str(d.get("id") or d.get("aweme_id") or "")
        if not vid:
            continue
        stats = dict(d.get("stats") or {})
        for k, v in (d.get("statsV2") or {}).items():
            stats[k] = max(to_int(stats.get(k)), to_int(v))
        author = d.get("author") if isinstance(d.get("author"), dict) else {}
        uid = author.get("uniqueId") or (d.get("author") if isinstance(d.get("author"), str) else None)
        tags = [c.get("title") for c in d.get("challenges") or [] if isinstance(c, dict) and c.get("title")]
        _merge_into(store, Post(
            platform="tiktok", post_id=vid, text=d.get("desc") or "",
            url=f"https://www.tiktok.com/@{uid}/video/{vid}" if uid else f"https://www.tiktok.com/video/{vid}",
            author=author.get("nickname") or uid, author_id=uid, created_at=to_int(d.get("createTime")) or None,
            reactions=to_int(stats.get("diggCount")), comments=to_int(stats.get("commentCount")),
            shares=to_int(stats.get("shareCount")), views=to_int(stats.get("playCount")),
            saves=to_int(stats.get("collectCount")), kind="video", source=source,
            extra={"hashtags": tags} if tags else {},
        ))
    return list(store.values())


def parse_tiktok_comments(doc: Any, parent_id: str | None) -> list[Post]:
    store: dict[str, Post] = {}
    for d in walk(doc):
        if "cid" not in d or not isinstance(d.get("text"), str):
            continue
        user = d.get("user") if isinstance(d.get("user"), dict) else {}
        _merge_into(store, Post(
            platform="tiktok", post_id=f"c_{d['cid']}", text=d["text"], kind="comment",
            parent_id=parent_id or (str(d.get("aweme_id")) if d.get("aweme_id") else None),
            author=user.get("nickname") or user.get("unique_id"), author_id=user.get("unique_id"),
            created_at=to_int(d.get("create_time")) or None, reactions=to_int(d.get("digg_count")),
            comments=to_int(d.get("reply_comment_total")), source="comments",
        ))
    return list(store.values())


# ---------------------------------------------------------------- Threads


def parse_threads(doc: Any, source: str = "search", root_code: str | None = None) -> list[Post]:
    """Nút bài Threads có: pk, code, taken_at, like_count, caption{text}, user{username}, text_post_app_info{...}."""
    store: dict[str, Post] = {}
    for d in walk(doc):
        if not ("taken_at" in d and "like_count" in d and ("code" in d or "pk" in d)):
            continue
        pk = str(d.get("pk") or d.get("id") or d.get("code"))
        cap = d.get("caption")
        text = cap.get("text") if isinstance(cap, dict) else (cap if isinstance(cap, str) else "")
        user = d.get("user") if isinstance(d.get("user"), dict) else {}
        uname = user.get("username")
        info = d.get("text_post_app_info") if isinstance(d.get("text_post_app_info"), dict) else {}
        code = d.get("code")
        is_reply = bool(root_code and code and code != root_code)
        _merge_into(store, Post(
            platform="threads", post_id=f"c_{pk}" if is_reply else pk, text=text or "",
            url=f"https://www.threads.com/@{uname}/post/{code}" if uname and code else None,
            author=uname, author_id=str(user.get("pk") or user.get("id") or uname or ""), created_at=to_int(d.get("taken_at")) or None,
            reactions=to_int(d.get("like_count")),
            comments=to_int(info.get("direct_reply_count")),
            shares=to_int(info.get("repost_count")) + to_int(info.get("quote_count")) + to_int(info.get("reshare_count")),
            views=to_int(d.get("view_count")),
            kind="comment" if is_reply else "post", parent_id=root_code if is_reply else None,
            source="comments" if is_reply else source, extra={"code": code} if code else {},
        ))
    return list(store.values())
