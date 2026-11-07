"""Tính Chỉ số Sức nóng (Heat) và Chỉ số Nghiêm trọng (Severity) cho từng chủ đề."""
from __future__ import annotations

import math
import time
from collections import Counter, defaultdict

from ..config import Config
from ..db import DB
from .text import analyze, fingerprint

HOUR = 3600
SOCIAL = ("facebook", "tiktok", "threads")


def log_score(x: float, ref: float) -> float:
    """Chuẩn hóa log: 0 → 0, ref (≈P95) → 1, có trần 1."""
    if x <= 0 or ref <= 0:
        return 0.0
    return min(1.0, math.log1p(x) / math.log1p(ref))


def clamp(x: float, lo: float = 0.0, hi: float = 1.0) -> float:
    return max(lo, min(hi, x))


def engagement(row, w: dict) -> float:
    return (w["reactions"] * (row["reactions"] or 0) + w["comments"] * (row["comments"] or 0)
            + w["shares"] * (row["shares"] or 0) + w["saves"] * (row["saves"] or 0)
            + w["views"] * (row["views"] or 0))


def _ts(row) -> int:
    return row["created_at"] or row["first_seen"]


def lifecycle(hourly: list[int], first_seen_age_h: float) -> str:
    """Giai đoạn vòng đời dựa trên chuỗi số bài theo giờ (cũ → mới)."""
    if not hourly or sum(hourly) == 0:
        return "Chưa có dữ liệu"
    win = [sum(hourly[max(0, i - 5): i + 1]) for i in range(len(hourly))]  # tổng trượt 6h
    last6 = win[-1]
    prev6 = win[-7] if len(win) >= 7 else 0
    peak = max(win)
    if first_seen_age_h < 12 and last6 >= 1 and (prev6 == 0 or last6 <= 5):
        return "Khởi phát"
    if last6 >= 5 and last6 > 1.5 * max(prev6, 1):
        return "Bùng nổ"
    if last6 >= 0.7 * peak:
        return "Đỉnh"
    if last6 < 0.4 * peak:
        return "Thoái trào"
    return "Âm ỉ"


def quadrant(heat: float, severity: float, cfg: Config) -> str:
    hot = heat >= cfg["scoring"]["heat_threshold"]
    severe = severity >= cfg["scoring"]["severity_threshold"]
    if hot and severe:
        return "Khủng hoảng"
    if severe:
        return "Tiềm ẩn"
    if hot:
        return "Xu hướng"
    return "Theo dõi"


def calibrated_refs(db: DB, cfg: Config) -> tuple[dict, dict]:
    """Nếu đã đủ lịch sử (≥ 30 lần chấm điểm), dùng P95 thực tế thay cho mức tham chiếu mặc định."""
    vol_ref = dict(cfg["scoring"]["volume_ref"])
    eng_ref = dict(cfg["scoring"]["engagement_ref"])
    import json

    rows = db.q("SELECT data FROM topic_scores ORDER BY ts DESC LIMIT 2000")
    if len(rows) < 30:
        return vol_ref, eng_ref
    vols, engs = defaultdict(list), defaultdict(list)
    for r in rows:
        d = json.loads(r["data"])
        for p, v in d.get("raw_volume", {}).items():
            vols[p].append(v)
        for p, v in d.get("raw_engagement", {}).items():
            engs[p].append(v)

    def p95(xs):
        xs = sorted(xs)
        return xs[int(0.95 * (len(xs) - 1))] if xs else 0

    for p, xs in vols.items():
        v = p95(xs)
        if v > 0:
            vol_ref[p] = max(v, vol_ref.get(p, 1) * 0.2)
    for p, xs in engs.items():
        v = p95(xs)
        if v > 0:
            eng_ref[p] = max(v, eng_ref.get(p, 1) * 0.2)
    return vol_ref, eng_ref


def compute_topic(db: DB, cfg: Config, topic: dict, now: int | None = None, window_hours: int | None = None,
                  refs: tuple[dict, dict] | None = None, detail: bool = False) -> dict:
    now = now or int(time.time())
    sc = cfg["scoring"]
    W = window_hours or sc["window_hours"]
    start = now - W * HOUR
    hist_start = now - max(7 * 24, 3 * W) * HOUR
    ew = sc["engagement_weights"]
    platforms = cfg.enabled_platforms()
    vol_ref, eng_ref = refs or calibrated_refs(db, cfg)

    rows = db.q(
        """SELECT p.* FROM posts p JOIN topic_posts tp ON tp.post_pk=p.id
           WHERE tp.topic_id=? AND coalesce(p.created_at, p.first_seen) >= ?""",
        (topic["id"], hist_start),
    )
    posts = [r for r in rows if r["kind"] != "comment"]
    comments = [r for r in rows if r["kind"] == "comment" and _ts(r) >= start]
    win = [r for r in posts if start <= _ts(r) <= now + HOUR]

    # ---------------------------------------------------------------- khối lượng & tương tác
    vol = Counter(r["platform"] for r in win)
    eng = defaultdict(float)
    for r in win:
        eng[r["platform"]] += engagement(r, ew)

    def wavg(scores: dict, plats) -> float:
        ws = {p: cfg.platform(p)["weight"] for p in plats}
        tot = sum(ws.values()) or 1
        return sum(ws[p] * scores.get(p, 0) for p in plats) / tot

    vol_score = wavg({p: log_score(vol[p], vol_ref.get(p, 100)) for p in platforms}, platforms)
    social = [p for p in platforms if p in SOCIAL]
    eng_score = wavg({p: log_score(eng[p], eng_ref.get(p, 1e5)) for p in social}, social) if social else 0

    # ---------------------------------------------------------------- tốc độ
    recent_n = sum(1 for r in posts if now - 6 * HOUR <= _ts(r) <= now + HOUR)
    base_rows = [r for r in posts if now - 54 * HOUR <= _ts(r) < now - 6 * HOUR]
    baseline = len(base_rows) / 8.0  # trung bình mỗi khung 6h trong 48h trước đó
    ratio = (recent_n + 1) / (baseline + 1)
    # gấp 8 lần nền = 1.0; giảm trọng số khi số bài còn quá ít (tránh nhiễu "0 → 3 bài")
    vel_score = clamp(math.log2(ratio) / 3) * min(1.0, recent_n / 10) if ratio > 1 else 0.0

    # ---------------------------------------------------------------- độ lan rộng
    authors = {(r["platform"], r["author_id"] or r["author"]) for r in win if (r["author_id"] or r["author"])}
    active = [p for p in platforms if vol[p] > 0]
    outlets = {r["author"] for r in win if r["platform"] == "news" and r["author"]}
    crossover = 1.0 if (len(outlets) >= 2 and any(vol[p] for p in SOCIAL)) else (0.5 if outlets else 0.0)
    spread_score = (0.5 * log_score(len(authors), sc["authors_ref"])
                    + 0.3 * (len(active) / max(1, len(platforms))) + 0.2 * crossover)

    hw = sc["heat_weights"]
    heat = 100 * (hw["volume"] * vol_score + hw["engagement"] * eng_score
                  + hw["velocity"] * vel_score + hw["spread"] * spread_score)

    # ---------------------------------------------------------------- mức độ nghiêm trọng
    texts = [(r, analyze(r["text"] or "")) for r in win + comments if (r["text"] or "").strip()]
    tot_w = neg_w = pos_w = 0.0
    emo = dang = off = 0
    cat_hits: Counter = Counter()
    for r, a in texts:
        w = 1 + math.log1p(engagement(r, ew))
        tot_w += w
        if a["label"] == "neg":
            neg_w += w
        elif a["label"] == "pos":
            pos_w += w
        emo += a["emotion"]
        dang += a["danger"] > 0
        off += a["official"]
        for c in a["categories"]:
            cat_hits[c] += 1
    n = max(1, len(texts))
    neg_ratio = neg_w / tot_w if tot_w else 0.0
    from .text import RISK_T

    risk_score, risk_cat = 0.0, None
    for c, hits in cat_hits.items():
        risk_score = max(risk_score, RISK_T[c][0] * clamp(hits / n * 4))
    if cat_hits:  # nhãn hiển thị: loại xuất hiện nhiều nhất (có tính trọng số)
        risk_cat = max(cat_hits, key=lambda c: cat_hits[c] * RISK_T[c][0])
    comp_sev = {
        "negative": clamp(neg_ratio * 1.25),
        "emotion": clamp(emo / n * 2),
        "risk": risk_score,
        "danger": clamp(dang / n * 3),
        "mainstream": log_score(len(outlets), 15),
        "official": clamp(off / n * 4),
    }
    sw = sc["severity_weights"]
    severity_rule = 100 * sum(sw[k] * v for k, v in comp_sev.items())
    severity = severity_rule
    llm = db.latest_llm_label(topic["id"])
    if llm and now - llm["ts"] < 12 * HOUR and isinstance(llm.get("severity"), (int, float)):
        severity = 0.5 * severity_rule + 0.5 * float(llm["severity"])
        risk_cat = llm.get("risk_category") or risk_cat

    # ---------------------------------------------------------------- chuỗi theo giờ
    hours = max(W, 24)
    series_start = (now // HOUR - hours + 1) * HOUR
    by_plat = {p: [0] * hours for p in platforms}
    eng_series = [0.0] * hours
    all_hourly = [0] * (7 * 24)
    for r in posts:
        t = _ts(r)
        i = (t - series_start) // HOUR
        if 0 <= i < hours and r["platform"] in by_plat:
            by_plat[r["platform"]][i] += 1
            eng_series[i] += engagement(r, ew)
        j = (t - (now // HOUR - 7 * 24 + 1) * HOUR) // HOUR
        if 0 <= j < len(all_hourly):
            all_hourly[j] += 1
    first_seen = min((_ts(r) for r in posts), default=now)
    stage = lifecycle(all_hourly, (now - first_seen) / HOUR)

    # seeding: nội dung trùng lặp từ ≥3 tác giả khác nhau
    fp = defaultdict(set)
    for r in win:
        if len(r["text"] or "") >= 40:
            fp[fingerprint(r["text"])].add(r["author_id"] or r["author"])
    dup = sum(1 for r in win if len(r["text"] or "") >= 40 and len(fp[fingerprint(r["text"])]) >= 3)
    seeding = dup / max(1, sum(1 for r in win if len(r["text"] or "") >= 40))

    out = {
        "topic_id": topic["id"], "name": topic["name"], "keywords": topic["keywords"],
        "heat": round(heat, 1), "severity": round(severity, 1),
        "quadrant": quadrant(heat, severity, cfg), "stage": stage, "risk_category": risk_cat,
        "window_hours": W,
        "posts": len(win), "comments": len(comments), "engagement": round(sum(eng.values())),
        "authors": len(authors), "outlets": len(outlets), "platforms_active": active,
        "velocity_ratio": round(ratio, 2), "posts_last6h": recent_n,
        "sentiment": {
            "neg": round(neg_ratio, 3),
            "pos": round(pos_w / tot_w, 3) if tot_w else 0,
            "neu": round(1 - neg_ratio - (pos_w / tot_w if tot_w else 0), 3) if tot_w else 0,
        },
        "seeding_ratio": round(seeding, 3),
        "components": {
            "heat": {"volume": round(vol_score, 3), "engagement": round(eng_score, 3),
                     "velocity": round(vel_score, 3), "spread": round(spread_score, 3)},
            "severity": {k: round(v, 3) for k, v in comp_sev.items()},
            "severity_rule": round(severity_rule, 1),
        },
        "by_platform": {p: {"posts": vol[p], "engagement": round(eng[p])} for p in platforms},
        "raw_volume": dict(vol), "raw_engagement": {k: round(v) for k, v in eng.items()},
        "spark": [sum(by_plat[p][i] for p in platforms) for i in range(hours)],
        "llm": llm,
    }
    if detail:
        out["series"] = {
            "start": series_start, "step": HOUR,
            "volume": by_plat, "engagement": [round(x) for x in eng_series],
        }
        top = sorted(win, key=lambda r: engagement(r, ew), reverse=True)[:30]
        out["top_posts"] = [_post_json(r, ew) for r in top]
        latest = sorted(win, key=_ts, reverse=True)[:30]
        out["latest_posts"] = [_post_json(r, ew) for r in latest]
        neg_comments = [(r, a) for r, a in texts if r["kind"] == "comment" and a["label"] == "neg"]
        neg_comments.sort(key=lambda x: engagement(x[0], ew), reverse=True)
        out["negative_comments"] = [_post_json(r, ew) for r, _ in neg_comments[:15]]
        out["categories"] = dict(cat_hits.most_common())
        out["history"] = db.score_history(topic["id"], now - 7 * 24 * HOUR)
    return out


def _post_json(r, ew) -> dict:
    return {
        "platform": r["platform"], "kind": r["kind"], "url": r["url"], "author": r["author"],
        "text": (r["text"] or "")[:400], "created_at": _ts(r),
        "reactions": r["reactions"], "comments": r["comments"], "shares": r["shares"], "views": r["views"],
        "engagement": round(engagement(r, ew)),
    }


def compute_all(db: DB, cfg: Config, window_hours: int | None = None, now: int | None = None) -> list[dict]:
    refs = calibrated_refs(db, cfg)
    res = [compute_topic(db, cfg, t, now=now, window_hours=window_hours, refs=refs) for t in db.topics()]
    res.sort(key=lambda d: (d["heat"] + d["severity"]), reverse=True)
    return res
