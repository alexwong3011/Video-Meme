"""Xử lý văn bản tiếng Việt: chuẩn hóa, khớp từ khóa (có/không dấu), cảm xúc, loại rủi ro.

Bộ từ điển dưới đây là điểm khởi đầu – nên bổ sung dần theo lĩnh vực bạn theo dõi.
"""
from __future__ import annotations

import re
import unicodedata
from functools import lru_cache

_ACCENTED = re.compile(r"[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]")
_URL = re.compile(r"https?://\S+")
_WS = re.compile(r"\s+")


def normalize(s: str) -> str:
    s = unicodedata.normalize("NFC", s or "").lower()
    s = _URL.sub(" ", s)
    return _WS.sub(" ", s).strip()


@lru_cache(maxsize=4096)
def strip_accents(s: str) -> str:
    s = s.replace("đ", "d").replace("Đ", "D")
    s = unicodedata.normalize("NFD", s)
    return "".join(ch for ch in s if unicodedata.category(ch) != "Mn")


def has_diacritics(s: str) -> bool:
    letters = sum(ch.isalpha() for ch in s)
    if letters < 20:
        return True
    return len(_ACCENTED.findall(s)) / letters > 0.04


def _contains(text: str, term: str) -> bool:
    """Khớp nguyên cụm từ (ranh giới từ) – tránh 'an' khớp 'bán'."""
    return re.search(r"(?<![\w])" + re.escape(term) + r"(?![\w])", text) is not None


class Doc:
    """Văn bản đã chuẩn hóa sẵn để khớp nhiều lần."""

    __slots__ = ("norm", "plain", "accented", "compact")

    def __init__(self, text: str):
        self.norm = normalize(text)
        self.plain = strip_accents(self.norm)
        self.accented = has_diacritics(self.norm)
        self.compact = self.plain.replace(" ", "")

    def has(self, term: str) -> bool:
        t = normalize(term)
        if _contains(self.norm, t):
            return True
        # bài viết không dấu ("chet nguoi") → so khớp không dấu
        if not self.accented and _contains(self.plain, strip_accents(t)):
            return True
        return False


def match_keyword(doc: Doc, keyword: str) -> bool:
    """Từ khóa hỗ trợ: "a & b" (phải có cả a và b), "#hashtag", khớp có dấu/không dấu, viết liền."""
    parts = [p.strip() for p in keyword.split("&") if p.strip()]
    for part in parts:
        t = normalize(part.lstrip("#"))
        tp = strip_accents(t)
        if _contains(doc.norm, t) or _contains(doc.plain, tp) or (len(tp) >= 6 and tp.replace(" ", "") in doc.compact):
            continue
        return False
    return bool(parts)


def match_topic(text: str, keywords: list[str], exclude: list[str]) -> bool:
    doc = Doc(text)
    if any(match_keyword(doc, x) for x in exclude):
        return False
    return any(match_keyword(doc, k) for k in keywords)


def is_excluded(text: str, exclude: list[str]) -> bool:
    doc = Doc(text)
    return any(match_keyword(doc, x) for x in exclude)


# ------------------------------------------------------------------ từ điển

NEGATIVE = """
tệ, tồi, kém, xấu, dở, bức xúc, phẫn nộ, bất bình, thất vọng, phản đối, tẩy chay, lừa đảo, lừa, gian lận, sai phạm,
vi phạm, tham nhũng, tiêu cực, khủng hoảng, scandal, bê bối, lùm xùm, ồn ào, chỉ trích, chê, lên án, tố cáo, tố, kiện,
tai nạn, thương vong, tử vong, chết, thiệt mạng, ngộ độc, sập, cháy, nổ, ô nhiễm, độc hại, hàng giả, kém chất lượng,
ăn bớt, quỵt, trốn, bỏ trốn, đánh, hành hung, bạo lực, xúc phạm, miệt thị, phân biệt, vô trách nhiệm, coi thường,
thiếu minh bạch, đáng lo, lo ngại, nguy hiểm, báo động, nhức nhối, bất cập, mất an toàn, thua lỗ, phá sản, sa thải,
đình chỉ, xử phạt, bắt giữ, khởi tố, điều tra, truy nã, nhập viện, cấp cứu, mất tích, sốc, kinh hoàng, khủng khiếp,
vô lý, bất công, ức hiếp, quấy rối, xâm hại, lừa gạt, chiếm đoạt, rửa tiền, đa cấp, chặt chém, ép giá, tăng giá,
ngập, lũ, sạt lở, thiệt hại, hỏng, lỗi, rò rỉ, lộ thông tin, hack, sập web
"""

POSITIVE = """
tốt, tuyệt, tuyệt vời, hay, đẹp, xuất sắc, ấn tượng, thích, yêu, ủng hộ, cảm ơn, biết ơn, tự hào, khen, hoan nghênh,
chúc mừng, vui, hạnh phúc, đáng yêu, dễ thương, hài lòng, chất lượng, uy tín, minh bạch, kịp thời, nhân văn, ý nghĩa,
thành công, chiến thắng, vô địch, kỷ lục, hỗ trợ, giúp đỡ, cứu, tri ân, đáng khen, ủng hộ nhiệt tình, xứng đáng
"""

EMOTION = """
phẫn nộ, bức xúc, căm phẫn, tức giận, giận dữ, điên tiết, uất ức, ghê tởm, kinh tởm, nhục, xấu hổ, sợ hãi, hoảng sợ,
hoang mang, lo sợ, kinh hoàng, rùng mình, ám ảnh, đau lòng, xót xa, phẫn uất, quá đáng, không thể chấp nhận, vô cảm,
mất dạy, khốn nạn, đáng xấu hổ, ghê sợ, sốc, hãi hùng
"""

DANGER = """
tử vong, chết, thiệt mạng, tử nạn, thương vong, nguy kịch, ngộ độc, cấp cứu, khởi tố, bắt giam, bắt tạm giam, truy nã,
lừa đảo, chiếm đoạt, tham ô, tham nhũng, hối lộ, rửa tiền, ma túy, cháy, nổ, sập, sạt lở, dịch bệnh, bùng phát,
xâm hại, hiếp dâm, bắt cóc, giết, đâm chết, tự tử, tẩy chay, biểu tình, đình công, vỡ nợ, phá sản, mất tích
"""

OFFICIAL = """
công an, cảnh sát, bộ công an, viện kiểm sát, tòa án, ubnd, ủy ban nhân dân, chính phủ, thủ tướng, bộ trưởng, quốc hội,
sở y tế, bộ y tế, thanh tra, cơ quan chức năng, cơ quan điều tra, chủ tịch tỉnh, chủ tịch thành phố, vào cuộc,
xác minh, làm rõ, triệu tập, lập biên bản, xử phạt hành chính, quản lý thị trường, bộ công thương, ngân hàng nhà nước
"""

# loại rủi ro: (trọng số nghiêm trọng, từ khóa)
RISK_CATEGORIES: dict[str, tuple[float, str]] = {
    "Tính mạng / an toàn": (1.0, "tử vong, chết, thiệt mạng, tử nạn, tai nạn, thương vong, nguy kịch, cháy, nổ, sập, sạt lở, "
                                 "đuối nước, mất tích, giết, đâm, bạo lực, hành hung, xâm hại, bắt cóc, tự tử"),
    "Sức khỏe / thực phẩm": (0.85, "ngộ độc, nhập viện, cấp cứu, dịch bệnh, bùng phát, vắc xin, thuốc giả, thực phẩm bẩn, "
                                   "hóa chất, ô nhiễm, độc hại, vi khuẩn, nhiễm khuẩn, an toàn thực phẩm, hàng giả"),
    "Pháp lý / hình sự": (0.9, "khởi tố, bắt giam, tạm giam, truy nã, điều tra, xét xử, tòa án, tham nhũng, tham ô, hối lộ, "
                               "rửa tiền, ma túy, buôn lậu, trốn thuế, vi phạm pháp luật, sai phạm"),
    "An ninh / chính trị / xã hội": (0.9, "biểu tình, đình công, gây rối, kích động, phản động, an ninh, trật tự, "
                                          "xuyên tạc, tin giả, bất ổn"),
    "Tài chính / lừa đảo": (0.8, "lừa đảo, chiếm đoạt, đa cấp, vỡ nợ, phá sản, sập sàn, mất tiền, tiền ảo, app vay, "
                                 "tín dụng đen, lãi suất, ôm tiền, quỵt, scam"),
    "Uy tín thương hiệu / dịch vụ": (0.6, "tẩy chay, phốt, bóc phốt, khiếu nại, kém chất lượng, chặt chém, thái độ, "
                                          "dịch vụ tệ, hoàn tiền, đền bù, xin lỗi, lỗi sản phẩm, thu hồi, khủng hoảng truyền thông"),
    "Giải trí / đời sống": (0.2, "showbiz, ca sĩ, diễn viên, hoa hậu, mv, phim, trend, meme, hài, livestream, idol, fan, "
                                 "concert, drama, tình cảm, chia tay, hẹn hò"),
}


def _terms(block: str) -> list[str]:
    return [t.strip() for t in block.replace("\n", ",").split(",") if t.strip()]


NEG_T, POS_T, EMO_T, DANGER_T, OFF_T = (_terms(b) for b in (NEGATIVE, POSITIVE, EMOTION, DANGER, OFFICIAL))
RISK_T = {k: (w, _terms(v)) for k, (w, v) in RISK_CATEGORIES.items()}
_NEGATORS = ("không ", "chẳng ", "chả ", "chưa ", "đâu có ", "ko ", "k ")


def _count(doc: Doc, terms: list[str]) -> int:
    n = 0
    for t in terms:
        if doc.has(t):
            # "không tốt" → không tính là tích cực
            if any(neg + t in doc.norm for neg in _NEGATORS):
                continue
            n += 1
    return n


def analyze(text: str) -> dict:
    """Trả về các đặc trưng cảm xúc / rủi ro cho 1 văn bản."""
    doc = Doc(text)
    neg, pos = _count(doc, NEG_T), _count(doc, POS_T)
    # phủ định từ tích cực ("không tốt") => tiêu cực
    neg += sum(1 for t in POS_T for n in _NEGATORS if n + t in doc.norm)
    sentiment = 0.0 if neg == pos else (pos - neg) / (pos + neg)
    cats = {}
    for name, (w, terms) in RISK_T.items():
        hits = sum(1 for t in terms if doc.has(t))
        if hits:
            cats[name] = hits
    return {
        "sentiment": sentiment,  # -1..1
        "label": "neg" if sentiment < -0.1 else ("pos" if sentiment > 0.1 else "neu"),
        "emotion": _count(doc, EMO_T) > 0,
        "danger": sum(1 for t in DANGER_T if doc.has(t)),
        "official": any(doc.has(t) for t in OFF_T),
        "categories": cats,
    }


def fingerprint(text: str) -> str:
    """Dấu vân tay để phát hiện nội dung đăng lặp hàng loạt (seeding)."""
    s = strip_accents(normalize(text))
    s = re.sub(r"#\S+|@\S+|[^a-z0-9 ]", " ", s)
    return " ".join(s.split()[:40])
