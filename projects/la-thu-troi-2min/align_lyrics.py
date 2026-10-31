#!/usr/bin/env python3
"""Align canonical lyrics to Whisper word timestamps.

usage: align_lyrics.py whisper.json lyrics.txt OUT.json --start 157.8 --end 277.8
whisper.json: list of segments with "words": [{"w", "s", "e"}] in song time.
Output times are clip time (song time - start). Unmatched syllables are interpolated.
"""
import argparse, difflib, json, re, unicodedata

p = argparse.ArgumentParser()
p.add_argument("whisper"); p.add_argument("lyrics"); p.add_argument("out")
p.add_argument("--start", type=float, required=True); p.add_argument("--end", type=float, required=True)
a = p.parse_args()

def norm(s):
    s = unicodedata.normalize("NFD", s.lower().replace("đ", "d"))
    return re.sub(r"[^a-z]", "", "".join(c for c in s if unicodedata.category(c) != "Mn"))

hyp = [w for seg in json.load(open(a.whisper)) for w in seg["words"]
       if a.start - 1 <= w["s"] <= a.end and norm(w["w"])]
lines = [l.strip() for l in open(a.lyrics, encoding="utf-8") if l.strip() and not l.startswith("#")]
ref = [(li, t) for li, l in enumerate(lines) for t in l.split()]

sm = difflib.SequenceMatcher(a=[norm(t) for _, t in ref], b=[norm(w["w"]) for w in hyp], autojunk=False)
times = [None] * len(ref)
for op, i1, i2, j1, j2 in sm.get_opcodes():
    if op == "equal" or (op == "replace" and i2 - i1 == j2 - j1):
        for k in range(i2 - i1):
            times[i1 + k] = (hyp[j1 + k]["s"], hyp[j1 + k]["e"])
    elif op == "replace":  # unequal block: spread hypothesis span evenly over the reference tokens
        s, e = hyp[j1]["s"], hyp[j2 - 1]["e"]
        n = i2 - i1
        for k in range(n):
            times[i1 + k] = (s + (e - s) * k / n, s + (e - s) * (k + 1) / n)
matched = sum(t is not None for t in times)
# interpolate the rest
for i, t in enumerate(times):
    if t is None:
        prv = next((j for j in range(i - 1, -1, -1) if times[j]), None)
        nxt = next((j for j in range(i + 1, len(times)) if times[j]), None)
        s0 = times[prv][1] if prv is not None else times[nxt][0] - 0.4 * (nxt - i)
        s1 = times[nxt][0] if nxt is not None else s0 + 0.4 * (i - prv)
        gap = (nxt if nxt is not None else i + 1) - (prv if prv is not None else i - 1)
        k = i - (prv if prv is not None else i - 1)
        st = s0 + (s1 - s0) * (k - 1) / max(1, gap - 1)
        times[i] = (st, st + (s1 - s0) / max(1, gap - 1))

out = []
for li, text in enumerate(lines):
    ws = [{"text": t, "start": round(times[i][0] - a.start, 3), "end": round(times[i][1] - a.start, 3)}
          for i, (l, t) in enumerate(ref) if l == li]
    out.append({"words": ws})
    print(f"{ws[0]['start']:7.2f}–{ws[-1]['end']:7.2f}  {text}")
json.dump({"song": "Lá Thu Trôi", "artist": "alexwong3011", "songStart": a.start, "duration": a.end - a.start,
           "lines": out}, open(a.out, "w"), ensure_ascii=False, indent=1)
print(f"matched {matched}/{len(ref)} syllables directly")
