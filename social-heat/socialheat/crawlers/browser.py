"""Phiên trình duyệt Playwright dùng chung: đăng nhập bằng session đã lưu, bắt response mạng, cuộn trang."""
from __future__ import annotations

import json
import logging
import random
import re
import time
from pathlib import Path
from typing import Callable

from ..config import Config

log = logging.getLogger("socialheat.browser")

LOGIN_URLS = {
    "facebook": "https://www.facebook.com/login",
    "tiktok": "https://www.tiktok.com/login",
    "threads": "https://www.threads.com/login",
}

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) "
      "Chrome/130.0.0.0 Safari/537.36")


class BrowserSession:
    """Context manager mở Chromium với storage_state (cookie đăng nhập) của từng nền tảng."""

    def __init__(self, cfg: Config, platform: str, headless: bool | None = None, debug: bool = False):
        self.cfg = cfg
        self.platform = platform
        self.headless = cfg["general"]["headless"] if headless is None else headless
        self.debug = debug
        self.state_path: Path = cfg.sessions_dir / f"{platform}.json"
        self._pw = self._browser = self.context = None

    # ------------------------------------------------------------------ vòng đời
    def __enter__(self) -> "BrowserSession":
        from playwright.sync_api import sync_playwright

        self._pw = sync_playwright().start()
        launch: dict = {"headless": self.headless, "args": ["--disable-blink-features=AutomationControlled"]}
        if self.cfg["general"].get("chromium_path"):
            launch["executable_path"] = self.cfg["general"]["chromium_path"]
        if self.cfg["general"].get("proxy"):
            launch["proxy"] = {"server": self.cfg["general"]["proxy"]}
        self._browser = self._pw.chromium.launch(**launch)
        ctx: dict = {"locale": "vi-VN", "timezone_id": self.cfg["general"]["timezone"],
                     "viewport": {"width": 1366, "height": 900}, "user_agent": UA}
        if self.state_path.exists():
            ctx["storage_state"] = str(self.state_path)
        self.context = self._browser.new_context(**ctx)
        return self

    def __exit__(self, *exc) -> None:
        try:
            if self.context and self.state_path.exists():
                # lưu lại cookie mới (gia hạn phiên)
                self.context.storage_state(path=str(self.state_path))
        except Exception:  # noqa: BLE001
            pass
        for obj in (self.context, self._browser):
            try:
                obj and obj.close()
            except Exception:  # noqa: BLE001
                pass
        if self._pw:
            self._pw.stop()

    @property
    def logged_in(self) -> bool:
        return self.state_path.exists()

    # ------------------------------------------------------------------ thao tác
    def sleep(self) -> None:
        lo, hi = self.cfg.platform(self.platform).get("delay_seconds", [2, 4])
        time.sleep(random.uniform(lo, hi))

    def capture_page(self, url: str, url_pattern: str, max_scrolls: int,
                     on_scroll: Callable | None = None, scroll_selector: str | None = None) -> tuple[list[str], str]:
        """Mở url, cuộn trang, trả về (danh sách body response khớp url_pattern, HTML cuối cùng)."""
        page = self.context.new_page()
        pending: list = []
        bodies: list[str] = []
        rx = re.compile(url_pattern)
        page.on("response", lambda r: pending.append(r) if rx.search(r.url) else None)

        def drain() -> None:
            while pending:
                r = pending.pop(0)
                try:
                    bodies.append(r.text())
                except Exception:  # noqa: BLE001 – response đã bị giải phóng / redirect
                    continue

        try:
            page.goto(url, wait_until="domcontentloaded", timeout=60000)
            try:
                page.wait_for_load_state("networkidle", timeout=15000)
            except Exception:  # noqa: BLE001
                pass
            self.sleep()
            drain()
            html = page.content()
            stale = 0
            for i in range(max_scrolls):
                before = len(bodies)
                if scroll_selector:
                    page.evaluate(
                        "sel => { const el = document.querySelector(sel); if (el) el.scrollBy(0, el.clientHeight * 2); }",
                        scroll_selector)
                page.mouse.wheel(0, random.randint(2200, 3600))
                self.sleep()
                drain()
                if on_scroll:
                    on_scroll(page, i)
                stale = stale + 1 if len(bodies) == before else 0
                if stale >= 3:  # không còn dữ liệu mới
                    break
            html = page.content()
            if self.debug:
                self._dump(url, bodies, html)
            return bodies, html
        finally:
            page.close()

    def _dump(self, url: str, bodies: list[str], html: str) -> None:
        slug = re.sub(r"[^a-zA-Z0-9]+", "_", url)[:80]
        base = self.cfg.debug_dir / f"{self.platform}_{int(time.time())}_{slug}"
        base.with_suffix(".html").write_text(html, encoding="utf-8")
        base.with_suffix(".responses.json").write_text(json.dumps(bodies, ensure_ascii=False), encoding="utf-8")
        log.info("Đã lưu debug: %s", base)

    def is_login_wall(self, html: str) -> bool:
        h = html.lower()
        markers = {
            "facebook": ['name="pass"', 'id="login_form"', "/login/?next"],
            "tiktok": ["login-modal", 'data-e2e="login-'],
            "threads": ['href="/login', "log in with instagram", "đăng nhập bằng instagram"],
        }.get(self.platform, [])
        return any(m in h for m in markers)


# ---------------------------------------------------------------------- đăng nhập


def interactive_login(cfg: Config, platform: str) -> Path:
    """Mở trình duyệt có giao diện để bạn tự đăng nhập, sau đó lưu cookie vào data/sessions/<platform>.json."""
    from playwright.sync_api import sync_playwright

    path = cfg.sessions_dir / f"{platform}.json"
    with sync_playwright() as pw:
        launch: dict = {"headless": False}
        if cfg["general"].get("chromium_path"):
            launch["executable_path"] = cfg["general"]["chromium_path"]
        browser = pw.chromium.launch(**launch)
        ctx = browser.new_context(locale="vi-VN", user_agent=UA,
                                  storage_state=str(path) if path.exists() else None)
        page = ctx.new_page()
        page.goto(LOGIN_URLS[platform])
        input(f"\n>>> Hãy đăng nhập {platform} trong cửa sổ trình duyệt, xong thì nhấn Enter tại đây... ")
        ctx.storage_state(path=str(path))
        browser.close()
    return path


def import_cookies(cfg: Config, platform: str, cookie_file: str) -> Path:
    """Chuyển file cookie xuất từ extension (Cookie-Editor, EditThisCookie – định dạng JSON) sang storage_state."""
    raw = json.loads(Path(cookie_file).read_text(encoding="utf-8"))
    if isinstance(raw, dict) and "cookies" in raw:
        raw = raw["cookies"]
    same_site = {"no_restriction": "None", "none": "None", "lax": "Lax", "strict": "Strict", "unspecified": "Lax"}
    cookies = []
    for c in raw:
        exp = c.get("expirationDate", c.get("expires", -1))
        cookies.append({
            "name": c["name"], "value": c["value"], "domain": c["domain"], "path": c.get("path", "/"),
            "expires": float(exp) if exp not in (None, "") else -1,
            "httpOnly": bool(c.get("httpOnly", False)), "secure": bool(c.get("secure", True)),
            "sameSite": same_site.get(str(c.get("sameSite", "lax")).lower(), "Lax"),
        })
    path = cfg.sessions_dir / f"{platform}.json"
    path.write_text(json.dumps({"cookies": cookies, "origins": []}, indent=1), encoding="utf-8")
    return path
