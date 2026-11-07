"""Tự phát hiện các vấn đề đang được quan tâm (không cần nhập từ khóa trước).

Nguồn: Google News Việt Nam (tin nổi bật, mỗi tin kèm cụm bài liên quan từ nhiều báo), RSS các báo,
Google Trends Việt Nam (từ khóa tìm kiếm tăng vọt). Tiêu đề được gom cụm theo cụm từ 2–3 âm tiết chung;
cụm nào được nhiều báo khác nhau cùng đưa tin trong 24h thì là ứng viên "vấn đề lớn".
Ứng viên được thêm thành chủ đề (tiền tố [Tự động]) để các crawler mạng xã hội theo dõi tiếp.
"""
from __future__ import annotations

import html
import logging
import math
import re
import time
import xml.etree.ElementTree as ET
from collections import defaultdict
from dataclasses import dataclass, field
from email.utils import parsedate_to_datetime

import httpx

from .analysis.text import normalize

log = logging.getLogger("socialheat.discover")

GNEWS_HOME = "https://news.google.com/rss?hl=vi&gl=VN&ceid=VN:vi"
GNEWS_SECTIONS = [  # các chuyên mục chính của Google News Việt Nam
    "https://news.google.com/rss/headlines/section/topic/NATION?hl=vi&gl=VN&ceid=VN:vi",
    "https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=vi&gl=VN&ceid=VN:vi",
    "https://news.google.com/rss/headlines/section/topic/ENTERTAINMENT?hl=vi&gl=VN&ceid=VN:vi",
    "https://news.google.com/rss/headlines/section/topic/HEALTH?hl=vi&gl=VN&ceid=VN:vi",
    "https://news.google.com/rss/headlines/section/topic/WORLD?hl=vi&gl=VN&ceid=VN:vi",
]
TRENDS = "https://trends.google.com/trending/rss?geo=VN"

STOP = set("""
của và là có cho với các những một được trong khi đã sẽ này đến từ tại về người ra vào không bị sau trước theo như để thì
mà lên hơn nhiều đang vẫn còn cũng rất gì ai nào sao thế đó đây năm ngày tháng giờ mới nhất vì do nên hay hoặc lại chỉ ở
qua bằng trên dưới nói cùng việc gần tin video ảnh clip hôm nay tiếp đầu lần thêm hai ba bốn năm sáu bảy tám chín mười
trăm nghìn triệu tỷ vừa đi làm xem muốn phải cần nhau ông bà anh chị em họ ta tôi chúng cách gây khiến sắp liền ngay
bao giờ thì tới vụ chiều sáng tối đêm mai qua nhằm hết toàn rằng thông báo cập nhật trực tiếp live nóng sốc mới nhất
""".split())


@dataclass
class Headline:
    title: str
    outlet: str
    ts: int
    url: str = ""
    lead: bool = False  # tiêu đề chính của một cụm Google News


@dataclass
class Cluster:
    phrase: str
    headlines: list[Headline] = field(default_factory=list)
    trends_traffic: int = 0

    @property
    def outlets(self) -> set[str]:
        return {h.outlet for h in self.headlines}

    @property
    def title(self) -> str:
        leads = [h for h in self.headlines if h.lead] or self.headlines
        return min(leads, key=lambda h: (-h.ts, len(h.title))).title

    @property
    def score(self) -> float:
        return len(self.outlets) * math.log2(1 + len(self.headlines)) + math.log10(1 + self.trends_traffic)


def _ts(s: str | None) -> int:
    try:
        return int(parsedate_to_datetime(s).timestamp())
    except (TypeError, ValueError):
        return int(time.time())


def _split_outlet(title: str) -> tuple[str, str]:
    m = re.match(r"^(.*)\s+-\s+([^-]{2,40})$", title.strip())
    return (m.group(1), m.group(2).strip()) if m else (title, "")


def fetch_headlines(client: httpx.Client, extra_rss: list[str]) -> list[Headline]:
    out: list[Headline] = []
    for url in [GNEWS_HOME, *GNEWS_SECTIONS]:
        try:
            root = ET.fromstring(client.get(url).content)
        except Exception as e:  # noqa: BLE001
            log.warning("Google News lỗi %s: %s", url, e)
            continue
        for it in root.iter("item"):
            ts = _ts(it.findtext("pubDate"))
            t, outlet = _split_outlet(it.findtext("title") or "")
            src = it.find("source")
            out.append(Headline(t, (src.text if src is not None and src.text else outlet), ts, it.findtext("link") or "", True))
            # cụm bài liên quan: <li><a>tiêu đề</a> <font>Báo</font></li>
            for a, o in re.findall(r"<a [^>]*>(.*?)</a>(?:&nbsp;|\s)*<font[^>]*>(.*?)</font>", it.findtext("description") or ""):
                out.append(Headline(html.unescape(a), html.unescape(o), ts))
    for url in extra_rss:
        try:
            root = ET.fromstring(client.get(url).content)
        except Exception as e:  # noqa: BLE001
            log.info("RSS lỗi %s: %s", url, e)
            continue
        outlet = re.sub(r"^https?://(www\.)?([^/]+).*", r"\2", url)
        for it in root.iter("item"):
            out.append(Headline(html.unescape(it.findtext("title") or "").strip(), outlet, _ts(it.findtext("pubDate")),
                                it.findtext("link") or ""))
    # bỏ trùng (cùng báo, cùng tiêu đề) – chuẩn hóa tên báo trước
    seen, uniq = set(), []
    for h in out:
        h.outlet = canonical_outlet(h.outlet)
        k = (h.outlet, normalize(h.title))
        if h.title and k not in seen:
            seen.add(k)
            uniq.append(h)
    return uniq


# bản tin tổng hợp nhiều sự việc – không dùng để gom cụm
DIGEST = re.compile(r"^(đọc nhanh|bản tin|điểm tin|tin tức (sáng|trưa|chiều|tối)|tin sáng|tin tối|nhịp sống 24h|tin nóng)",
                    re.I)

_OUTLET_ALIAS = {
    "tuoitre.vn": "tuổi trẻ", "vnexpress.net": "vnexpress", "thanhnien.vn": "thanh niên", "dantri.com.vn": "dân trí",
    "vietnamnet.vn": "vietnamnet", "znews.vn": "znews", "laodong.vn": "lao động", "nld.com.vn": "người lao động",
    "vietnamplus.vn": "vietnamplus", "kenh14.vn": "kenh14", "kenh14.vn ": "kenh14",
}


def canonical_outlet(name: str) -> str:
    n = normalize(name).replace("www.", "")
    n = _OUTLET_ALIAS.get(n, n)
    for pre in ("báo điện tử ", "báo ", "tạp chí "):
        if n.startswith(pre):
            n = n[len(pre):]
    return {"laodong.vn": "lao động", "kenh14.vn": "kenh14"}.get(n, n)


def fetch_trends(client: httpx.Client) -> list[tuple[str, int, list[str]]]:
    """(từ khóa, lượt tìm ước tính, tiêu đề bài liên quan)."""
    try:
        root = ET.fromstring(client.get(TRENDS).content)
    except Exception as e:  # noqa: BLE001
        log.warning("Google Trends lỗi: %s", e)
        return []
    ns = {"ht": "https://trends.google.com/trending/rss"}
    res = []
    for it in root.iter("item"):
        traffic = int(re.sub(r"\D", "", it.findtext("ht:approx_traffic", default="0", namespaces=ns)) or 0)
        news = [n.findtext("ht:news_item_title", default="", namespaces=ns) for n in it.findall("ht:news_item", ns)]
        res.append((it.findtext("title") or "", traffic, news))
    return res


def _tokens(title: str) -> list[str]:
    s = normalize(title)
    s = re.sub(r"[\"'“”‘’«»:;,.!?()\[\]|/–—-]+", " ", s)
    return [t for t in s.split() if not t.isdigit()]


def phrases(title: str) -> set[str]:
    toks = _tokens(title)
    out = set()
    for n in (2, 3, 4):
        for i in range(len(toks) - n + 1):
            g = toks[i:i + n]
            if g[0] in STOP or g[-1] in STOP or sum(t in STOP for t in g) > n // 2:
                continue
            if any(len(t) == 1 for t in g):
                continue
            out.add(" ".join(g))
    return out


def cluster(headlines: list[Headline], max_clusters: int = 15, min_outlets: int = 3) -> list[Cluster]:
    """Gom các tiêu đề nói về CÙNG một sự việc (gom theo "hạt nhân", không nối chuỗi).

    - Cụm từ quá phổ biến (ví dụ "hà nội", "việt nam") bị bỏ vì không đặc trưng cho sự việc.
    - Tiêu đề chính của Google News được dùng làm hạt nhân trước; một tiêu đề gia nhập cụm nếu chung
      ≥ 2 cụm từ đặc trưng với tập cụm từ cốt lõi của cụm (cụm từ của hạt nhân + cụm từ lặp lại trong cụm).
    """
    n = len(headlines)
    ph = [phrases(h.title) for h in headlines]
    df: dict[str, int] = defaultdict(int)
    for ps in ph:
        for p in ps:
            df[p] += 1
    generic = max(4, int(0.015 * n))
    ph = [{p for p in ps if 2 <= df[p] <= generic} for ps in ph]

    def distinct(ps: set[str]) -> set[str]:
        return {p for p in ps if not any(p != q and p in q for q in ps)}

    order = sorted(range(n), key=lambda i: (not headlines[i].lead, -len(ph[i])))
    groups: list[dict] = []  # {"ids": [...], "core": set, "cnt": {phrase: count}}
    for i in order:
        if not ph[i]:
            continue
        best, best_k = None, 1
        for g in groups:
            k = len(distinct(ph[i] & g["core"]))
            if k > best_k:
                best, best_k = g, k
        if best is None:
            groups.append({"ids": [i], "core": set(ph[i]), "cnt": defaultdict(int, {p: 1 for p in ph[i]})})
            continue
        best["ids"].append(i)
        for p in ph[i]:
            best["cnt"][p] += 1
            if best["cnt"][p] >= 2:
                best["core"].add(p)
    clusters = []
    for g in groups:
        hs = [headlines[i] for i in g["ids"] if not DIGEST.search(headlines[i].title)]
        if not hs or len({h.outlet for h in hs}) < min_outlets:
            continue
        outs: dict[str, set] = defaultdict(set)
        for i in g["ids"]:
            for p in ph[i]:
                outs[p].add(headlines[i].outlet)
        phrase = max(outs, key=lambda p: (len(outs[p]), p.count(" ")))
        # ưu tiên cụm dài hơn chứa cụm này nếu phủ gần như cùng số báo ("sân bay long" → "sân bay long thành")
        longer = [q for q in outs if phrase in q and q != phrase and len(outs[q]) >= len(outs[phrase]) - 1]
        if longer:
            phrase = max(longer, key=lambda q: (len(outs[q]), -q.count(" ")))
        clusters.append(Cluster(phrase, hs))
    clusters.sort(key=lambda c: c.score, reverse=True)
    return clusters[:max_clusters]


def second_phrase(c: Cluster) -> str | None:
    """Cụm từ thứ hai đặc trưng nhất trong cụm – để làm từ khóa 'a & b' chặt hơn."""
    cnt: dict[str, set] = defaultdict(set)
    for h in c.headlines:
        for p in phrases(h.title):
            if p != c.phrase and not set(p.split()) & set(c.phrase.split()):
                cnt[p].add(h.outlet)
    if not cnt:
        return None
    p, outs = max(cnt.items(), key=lambda kv: (len(kv[1]), kv[0].count(" ")))
    return p if len(outs) >= 3 else None


def discover(cfg, top: int = 10) -> tuple[list[Cluster], list[tuple[str, int, list[str]]]]:
    client = httpx.Client(timeout=20, follow_redirects=True,
                          headers={"User-Agent": "Mozilla/5.0 (compatible; SocialHeat/0.1)"})
    try:
        heads = fetch_headlines(client, cfg.platform("news").get("rss", []))
        trends = fetch_trends(client)
    finally:
        client.close()
    now = time.time()
    heads = [h for h in heads if now - h.ts < 36 * 3600]
    log.info("Thu được %d tiêu đề, %d xu hướng tìm kiếm", len(heads), len(trends))
    clusters = cluster(heads, max_clusters=top * 2)
    for c in clusters:
        for term, traffic, news in trends:
            t = normalize(term)
            if t in c.phrase or c.phrase in t or any(c.phrase in normalize(n) for n in news):
                c.trends_traffic += traffic
    clusters.sort(key=lambda c: c.score, reverse=True)
    return clusters[:top], trends
