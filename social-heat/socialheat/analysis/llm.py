"""(Tùy chọn) Dùng Claude đọc mẫu bài viết để gắn nhãn loại rủi ro, mức nghiêm trọng và viết tóm tắt.

Bật trong config.toml: [llm] enabled = true, và đặt biến môi trường ANTHROPIC_API_KEY.
"""
from __future__ import annotations

import json
import logging
import time

from ..config import Config
from ..db import DB
from .metrics import engagement
from .text import RISK_CATEGORIES

log = logging.getLogger("socialheat.llm")

SCHEMA = {
    "type": "object",
    "properties": {
        "risk_category": {"type": "string", "enum": list(RISK_CATEGORIES.keys())},
        "severity": {"type": "integer", "description": "0-100"},
        "sentiment_negative_pct": {"type": "integer"},
        "summary": {"type": "string"},
        "key_points": {"type": "array", "items": {"type": "string"}},
        "reason": {"type": "string"},
    },
    "required": ["risk_category", "severity", "sentiment_negative_pct", "summary", "key_points", "reason"],
    "additionalProperties": False,
}

SYSTEM = (
    "Bạn là chuyên viên phân tích dư luận xã hội tại Việt Nam. Bạn nhận một chủ đề và các bài viết/bình luận mẫu "
    "(kèm nền tảng và lượng tương tác) thu thập từ Facebook, TikTok, Threads và báo điện tử. "
    "Hãy đánh giá mức độ nghiêm trọng của vấn đề trên thang 0-100: 0-20 giải trí/vô hại, 20-40 tranh luận thông thường, "
    "40-60 tiêu cực rõ rệt ảnh hưởng uy tín, 60-80 có thiệt hại thực tế hoặc cơ quan chức năng vào cuộc, "
    "80-100 đe dọa tính mạng, an ninh hoặc khủng hoảng diện rộng. Chỉ dựa vào nội dung được cung cấp. "
    "Tóm tắt 2-3 câu bằng tiếng Việt: chuyện gì đang xảy ra, ai liên quan, dư luận phản ứng thế nào. "
    "key_points tối đa 5 ý ngắn."
)


def label_topic(db: DB, cfg: Config, topic: dict, force: bool = False) -> dict | None:
    lc = cfg["llm"]
    if not lc.get("enabled"):
        return None
    last = db.latest_llm_label(topic["id"])
    if last and not force and time.time() - last["ts"] < lc["interval_hours"] * 3600:
        return last
    import anthropic

    since = int(time.time()) - cfg["scoring"]["window_hours"] * 3600
    rows = db.q(
        """SELECT p.* FROM posts p JOIN topic_posts tp ON tp.post_pk=p.id
           WHERE tp.topic_id=? AND coalesce(p.created_at, p.first_seen) >= ? AND length(coalesce(p.text,''))>10""",
        (topic["id"], since),
    )
    if not rows:
        return None
    ew = cfg["scoring"]["engagement_weights"]
    rows = sorted(rows, key=lambda r: engagement(r, ew), reverse=True)[: lc["sample_size"]]
    sample = "\n".join(
        f"- [{r['platform']}/{r['kind']}, tương tác {round(engagement(r, ew))}] {(r['text'] or '')[:500]}" for r in rows
    )
    client = anthropic.Anthropic()
    try:
        resp = client.beta.messages.create(
            model=lc["model"],
            max_tokens=4000,
            system=SYSTEM,
            output_config={"effort": "low", "format": {"type": "json_schema", "schema": SCHEMA}},
            betas=["server-side-fallback-2026-07-01"],
            fallbacks="default",
            messages=[{"role": "user", "content": f"Chủ đề: {topic['name']}\nTừ khóa: {', '.join(topic['keywords'])}\n\nBài viết mẫu:\n{sample}"}],
        )
    except anthropic.RateLimitError:
        log.warning("Claude API: bị giới hạn tốc độ, bỏ qua lần này")
        return last
    except anthropic.APIStatusError as e:
        log.warning("Claude API lỗi %s: %s", e.status_code, e.message)
        return last
    except anthropic.APIConnectionError as e:
        log.warning("Không kết nối được Claude API: %s", e)
        return last
    if resp.stop_reason == "refusal":
        log.warning("Claude từ chối gắn nhãn chủ đề %s", topic["name"])
        return last
    text = next((b.text for b in resp.content if b.type == "text"), None)
    if not text:
        return last
    data = json.loads(text)
    data["severity"] = max(0, min(100, int(data["severity"])))
    db.save_llm_label(topic["id"], data)
    data["ts"] = int(time.time())
    return data
