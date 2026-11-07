"""Dòng lệnh: python -m socialheat <lệnh>"""
from __future__ import annotations

import argparse
import logging
import threading

from .config import load_config
from .db import DB


def _setup(args):
    cfg = load_config(args.config)
    if args.data_dir:
        cfg["general"]["data_dir"] = args.data_dir
    db = DB(cfg.db_path)
    for t in cfg.get("topics", []):  # chủ đề khai báo sẵn trong config.toml
        if not any(x["name"] == t["name"] for x in db.topics(active_only=False)):
            db.upsert_topic(t["name"], t["keywords"], t.get("exclude", []))
    return cfg, db


def _serve(cfg, db, with_scheduler: bool):
    import uvicorn

    from .api import create_app
    from .pipeline import scheduler_loop

    stop = threading.Event()
    if with_scheduler:
        threading.Thread(target=scheduler_loop, args=(db, cfg, stop), daemon=True).start()
    host, port = cfg["server"]["host"], cfg["server"]["port"]
    print(f"Dashboard: http://{host}:{port}")
    try:
        uvicorn.run(create_app(cfg, db), host=host, port=port, log_level="warning")
    finally:
        stop.set()


def main(argv=None):
    ap = argparse.ArgumentParser(prog="socialheat", description="Đo sức nóng & mức nghiêm trọng của vấn đề trên MXH")
    ap.add_argument("--config", help="đường dẫn config.toml")
    ap.add_argument("--data-dir", help="thư mục dữ liệu (ghi đè config)")
    ap.add_argument("-v", "--verbose", action="store_true")
    sub = ap.add_subparsers(dest="cmd", required=True)

    p = sub.add_parser("login", help="mở trình duyệt để đăng nhập & lưu phiên")
    p.add_argument("platform", choices=["facebook", "tiktok", "threads"])

    p = sub.add_parser("import-cookies", help="nhập cookie JSON xuất từ extension trình duyệt")
    p.add_argument("platform", choices=["facebook", "tiktok", "threads"])
    p.add_argument("file")

    p = sub.add_parser("topic", help="thêm/sửa chủ đề")
    p.add_argument("name")
    p.add_argument("-k", "--keywords", nargs="+", required=True, help='từ khóa; dùng "a & b" để bắt buộc cả hai')
    p.add_argument("-x", "--exclude", nargs="*", default=[])

    sub.add_parser("topics", help="liệt kê chủ đề")

    p = sub.add_parser("crawl", help="crawl một lượt")
    p.add_argument("-p", "--platforms", nargs="*", choices=["facebook", "tiktok", "threads", "news"])
    p.add_argument("-t", "--topics", nargs="*", type=int, help="id chủ đề")
    p.add_argument("--debug", action="store_true", help="lưu response thô vào data/debug & hiện trình duyệt")
    p.add_argument("--show", action="store_true", help="hiện cửa sổ trình duyệt")

    sub.add_parser("score", help="tính lại điểm & in bảng xếp hạng")
    sub.add_parser("serve", help="chỉ chạy dashboard")
    sub.add_parser("run", help="dashboard + tự động crawl định kỳ")
    p = sub.add_parser("demo", help="tạo dữ liệu MẪU (giả lập) để xem thử dashboard")
    p.add_argument("--serve", action="store_true")

    args = ap.parse_args(argv)
    logging.basicConfig(level=logging.DEBUG if args.verbose else logging.INFO,
                        format="%(asctime)s %(levelname)s %(name)s: %(message)s")
    if args.cmd == "demo" and not args.data_dir:
        args.data_dir = "data/demo"
    cfg, db = _setup(args)

    if args.cmd == "login":
        from .crawlers.browser import interactive_login
        print("Đã lưu phiên:", interactive_login(cfg, args.platform))
    elif args.cmd == "import-cookies":
        from .crawlers.browser import import_cookies
        print("Đã lưu phiên:", import_cookies(cfg, args.platform, args.file))
    elif args.cmd == "topic":
        tid = db.upsert_topic(args.name, args.keywords, args.exclude)
        print(f"Chủ đề #{tid}: {args.name} – {args.keywords}")
    elif args.cmd == "topics":
        for t in db.topics(active_only=False):
            print(f"#{t['id']:<3} {'✓' if t['active'] else '✗'} {t['name']:<30} {', '.join(t['keywords'])}"
                  + (f"  (loại trừ: {', '.join(t['exclude'])})" if t["exclude"] else ""))
    elif args.cmd == "crawl":
        from .pipeline import crawl
        if args.show or args.debug:
            cfg["general"]["headless"] = False
        crawl(db, cfg, args.platforms, args.topics, debug=args.debug)
        _print_scores(db, cfg)
    elif args.cmd == "score":
        from .pipeline import score_and_alert
        score_and_alert(db, cfg)
        _print_scores(db, cfg)
    elif args.cmd == "serve":
        _serve(cfg, db, with_scheduler=False)
    elif args.cmd == "run":
        _serve(cfg, db, with_scheduler=True)
    elif args.cmd == "demo":
        from .demo import seed_demo
        seed_demo(db)
        from .pipeline import score_and_alert
        cfg["llm"]["enabled"] = False
        score_and_alert(db, cfg)
        _print_scores(db, cfg)
        print(f"\nDữ liệu MẪU đã tạo trong {cfg.data_dir}. Xem dashboard: python -m socialheat --data-dir {args.data_dir} serve")
        if args.serve:
            _serve(cfg, db, with_scheduler=False)


def _print_scores(db, cfg):
    from .analysis.metrics import compute_all
    print(f"\n{'Chủ đề':<34}{'Nóng':>6}{'NgTr':>6}  {'Phân loại':<12}{'Giai đoạn':<12}{'Bài':>6}{'Tương tác':>12}")
    for r in compute_all(db, cfg):
        print(f"{r['name'][:33]:<34}{r['heat']:>6.0f}{r['severity']:>6.0f}  {r['quadrant']:<12}{r['stage']:<12}"
              f"{r['posts']:>6}{r['engagement']:>12,}")


if __name__ == "__main__":
    main()
