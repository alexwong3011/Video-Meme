#!/usr/bin/env python3
"""Generate karaoke (.ass) subtitles from lyrics.json for a clip cut from the song.

usage: make_ass.py lyrics.json OUT.ass --offset 67.4 --duration 30 --width 1080 --height 1608
Times in lyrics.json are song times; --offset is the song time at clip 0s.
"""
import argparse, json

p = argparse.ArgumentParser()
p.add_argument("lyrics"); p.add_argument("out")
p.add_argument("--offset", type=float, required=True)
p.add_argument("--duration", type=float, required=True)
p.add_argument("--width", type=int, default=1080)
p.add_argument("--height", type=int, default=1608)
p.add_argument("--title", default="Lá Thu Trôi")
p.add_argument("--lead", type=float, default=0.35, help="show a line this long before it is sung")
a = p.parse_args()

def ts(t):
    t = max(0.0, t); cs = int(round(t * 100))
    return f"{cs // 360000}:{cs // 6000 % 60:02d}:{cs // 100 % 60:02d}.{cs % 100:02d}"

W, H = a.width, a.height
# ASS colours are &HAABBGGRR. Karaoke fills SecondaryColour -> PrimaryColour.
GOLD, CREAM, INK = "&H0066C8F5", "&H00EEF6FF", "&H00101828"
head = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Lyric,Cormorant Garamond SemiBold,74,{GOLD},{CREAM},{INK},&H96000000,0,0,0,0,100,100,1,0,1,3.2,3,2,60,60,150,1
Style: Title,Cormorant Garamond SemiBold,120,{GOLD},{GOLD},{INK},&H96000000,0,1,0,0,100,100,4,0,1,3,4,8,60,60,60,1
Style: Credit,Cormorant Garamond SemiBold,44,{CREAM},{CREAM},{INK},&H96000000,0,1,0,0,100,100,6,0,1,2,2,8,60,60,196,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
ev = [
    f"Dialogue: 1,{ts(0.15)},{ts(4.6)},Title,,0,0,0,,{{\\fad(500,700)}}{a.title}",
    f"Dialogue: 1,{ts(0.45)},{ts(4.6)},Credit,,0,0,0,,{{\\fad(500,700)}}— hồng diệp đề thi —",
]
lines = json.load(open(a.lyrics))["lines"]
for i, line in enumerate(lines):
    words = [w for row in line["rows"] for w in row]
    s0 = words[0]["start"] - a.offset
    if s0 >= a.duration:
        continue
    nxt = lines[i + 1]["rows"][0][0]["start"] - a.offset if i + 1 < len(lines) else None
    end = min(a.duration, (nxt - a.lead - 0.05) if nxt else words[-1]["end"] - a.offset + 1.2)
    start = s0 - a.lead
    parts = [f"{{\\k{int(round(a.lead * 100))}}}"]  # unsung lead-in
    for r, row in enumerate(line["rows"]):
        for j, w in enumerate(row):
            flat = words.index(w)
            nxt_w = words[flat + 1]["start"] if flat + 1 < len(words) else w["end"]
            dur = max(8, int(round((nxt_w - w["start"]) * 100)))
            sep = " " if j < len(row) - 1 else ""
            parts.append(f"{{\\kf{dur}}}{w['text']}{sep}")
        if r < len(line["rows"]) - 1:
            parts.append("\\N")
    ev.append(f"Dialogue: 0,{ts(start)},{ts(end)},Lyric,,0,0,0,,{{\\fad(250,250)}}" + "".join(parts))

open(a.out, "w", encoding="utf-8").write(head + "\n".join(ev) + "\n")
print(f"wrote {a.out}: {len(ev)} events")
