#!/usr/bin/env python3
"""Build a 120 s slow-motion background montage from the 48 fps interpolated source.

usage: montage.py SRC48.mp4 OUT.mp4 [--duration 120]
Each shot: source range, speed, zoom start/end, frame-centre start/end (fractions), mirror.
The last shot is stretched so the total (minus crossfades) is exactly --duration.
"""
import argparse, subprocess

p = argparse.ArgumentParser()
p.add_argument("src"); p.add_argument("out")
p.add_argument("--duration", type=float, default=120.0)
p.add_argument("--xfade", type=float, default=1.2)
p.add_argument("--fps", type=int, default=30)
a = p.parse_args()

# name, src_in, src_out, speed, zoom0, zoom1, (cx0, cy0), (cx1, cy1), mirror
SHOTS = [
    ("sky / willows",     0.0, 4.4, 0.50, 1.45, 1.58, (0.60, 0.24), (0.54, 0.21), False),
    ("wide bridge",       0.0, 10., 0.75, 1.00, 1.07, (0.50, 0.50), (0.50, 0.48), False),
    ("rapids",            0.5, 5.0, 0.50, 1.55, 1.68, (0.50, 0.80), (0.44, 0.82), False),
    ("face",              6.5, 10., 0.40, 1.55, 1.70, (0.45, 0.22), (0.60, 0.19), False),
    ("bridge, mirrored",  0.0, 5.5, 0.50, 1.05, 1.18, (0.50, 0.45), (0.52, 0.43), True),
    ("chrysanthemums",    7.0, 10., 0.40, 1.60, 1.66, (0.22, 0.62), (0.28, 0.60), False),
    ("dress",             7.2, 10., 0.40, 1.60, 1.72, (0.50, 0.56), (0.60, 0.55), False),
    ("pavilion",          0.0, 3.0, 0.40, 1.70, 1.74, (0.82, 0.30), (0.76, 0.29), False),
    ("wide, mirrored",    0.0, 10., 0.75, 1.08, 1.00, (0.50, 0.48), (0.50, 0.50), True),
    ("face, mirrored",    6.5, 10., 0.40, 1.50, 1.66, (0.55, 0.22), (0.40, 0.19), True),
    ("approach",          3.0, 7.5, 0.50, 1.30, 1.42, (0.45, 0.40), (0.47, 0.36), False),
    ("rapids, mirrored",  0.0, 4.5, 0.50, 1.50, 1.60, (0.50, 0.78), (0.55, 0.80), True),
    ("sky, mirrored",     0.0, 4.5, 0.50, 1.50, 1.42, (0.40, 0.22), (0.46, 0.25), True),
    ("final pull-out",    4.0, 10., 0.50, 1.28, 1.00, (0.55, 0.40), (0.50, 0.50), False),
]

durs = [(o - i) / s for _, i, o, s, *_ in SHOTS]
total = sum(durs) - a.xfade * (len(SHOTS) - 1)
last = SHOTS[-1]
durs[-1] += a.duration - total  # stretch/shrink final shot to hit the exact length
speed_last = (last[2] - last[1]) / durs[-1]

W, H = map(int, subprocess.check_output(
    ["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height",
     "-of", "csv=p=0", a.src], text=True).strip().split(","))

inputs, chains = [], []
for k, (name, i0, i1, sp, z0, z1, c0, c1, mir) in enumerate(SHOTS):
    d = durs[k]
    sp = speed_last if k == len(SHOTS) - 1 else sp
    inputs += ["-ss", f"{i0}", "-t", f"{i1 - i0}", "-i", a.src]
    zoom = f"({z0}+({z1}-{z0})*min(t/{d:.3f},1))"
    cx = f"({c0[0]}+({c1[0]}-{c0[0]})*min(t/{d:.3f},1))"
    cy = f"({c0[1]}+({c1[1]}-{c0[1]})*min(t/{d:.3f},1))"
    f = (f"[{k}:v]setpts=(PTS-STARTPTS)/{sp:.4f},fps={a.fps},"
         + ("hflip," if mir else "")
         + f"scale=w='trunc(iw*{zoom}/2)*2':h=-2:eval=frame:flags=bicubic,"
         + f"crop={W}:{H}:x='max(0,min(iw-ow,iw*{cx}-ow/2))':y='max(0,min(ih-oh,ih*{cy}-oh/2))',"
         + ("unsharp=5:5:0.5," if max(z0, z1) > 1.3 else "")
         + f"trim=0:{d:.3f},setpts=PTS-STARTPTS,format=yuv420p,setsar=1[s{k}]")
    chains.append(f)
    print(f"  shot {k + 1:2d} {name:18s} {d:5.2f}s")

prev, t = "s0", durs[0]
for k in range(1, len(SHOTS)):
    off = t - a.xfade
    out = f"x{k}" if k < len(SHOTS) - 1 else "mont"
    chains.append(f"[{prev}][s{k}]xfade=transition=fade:duration={a.xfade}:offset={off:.3f}[{out}]")
    prev, t = out, off + durs[k]
chains.append(f"[mont]eq=contrast=1.04:saturation=1.05,vignette=angle=PI/5,"
              f"fade=t=in:st=0:d=0.8,fade=t=out:st={a.duration - 2.5}:d=2.5,trim=0:{a.duration}[v]")

cmd = ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", *inputs,
       "-filter_complex", ";".join(chains), "-map", "[v]", "-an",
       "-c:v", "libx264", "-crf", "16", "-preset", "medium", "-pix_fmt", "yuv420p", "-r", str(a.fps), a.out]
print(f"total {a.duration:.1f}s from {len(SHOTS)} shots")
subprocess.run(cmd, check=True)
