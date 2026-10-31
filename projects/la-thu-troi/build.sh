#!/usr/bin/env bash
# Build the 30 s "Lá Thu Trôi" music clip:
#   10 s source video -> 30 s slow-motion montage (3 shots + crossfades)
#   + 30 s chorus hook from the song (loudness-normalised)
#   + karaoke subtitles burned in.
# usage: build.sh SOURCE_VIDEO SONG_MP3 [OUT=../../out/la-thu-troi-30s.mp4]
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
SRC="$(realpath "$1")"; SONG="$(realpath "$2")"
OUT="$(realpath -m "${3:-$HERE/../../out/la-thu-troi-30s.mp4}")"
HOOK_START="${HOOK_START:-67.4}"   # song time of the hook (chorus 1, line 1 at 69.0 s)
DUR=30
TMP="${TMPDIR:-/tmp}/la-thu-troi-build"; mkdir -p "$TMP" "$(dirname "$OUT")"
log() { printf '\033[1;35m==> %s\033[0m\n' "$*"; }

# 1. Motion-interpolate 24 -> 48 fps so the slow-motion stays fluid (cached).
if [ ! -s "$TMP/src48.mp4" ]; then
  log "Interpolating source to 48 fps (takes a few minutes)"
  ffmpeg -y -hide_banner -loglevel error -i "$SRC" -map 0:v:0 -an \
    -vf "minterpolate=fps=48:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1,scale=1080:-2:flags=lanczos" \
    -c:v libx264 -crf 14 -preset fast "$TMP/src48.mp4"
fi
read -r W H < <(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "$TMP/src48.mp4" | tr ',' ' ')

# 2. Subtitles + bottom gradient for legibility.
log "Generating karaoke subtitles"
python3 "$HERE/make_ass.py" "$HERE/lyrics.json" "$TMP/lyrics.ass" --offset "$HOOK_START" --duration $DUR --width "$W" --height "$H"
ffmpeg -y -hide_banner -loglevel error -f lavfi -i "color=black:s=${W}x${H}:d=1,format=rgba" -frames:v 1 \
  -vf "geq=r=0:g=0:b=0:a='if(gt(Y,H*0.62),190*pow((Y-H*0.62)/(H*0.38),1.4),0)+if(lt(Y,H*0.2),110*pow(1-Y/(H*0.2),1.6),0)'" "$TMP/grad.png"

# 3. Montage + grade + subtitles + audio in one pass.
#   A: full shot, 0.8x            -> 12.5 s
#   B: close-up of 5.5-10 s, 0.5x, push-in tracking her to the right -> 9 s
#   C: bridge 0-5.25 s, 0.5x, mirrored, slow push-in                 -> 10.5 s
#   xfade 1 s at 11.5 s and 19.5 s  => 30 s
log "Rendering montage"
FC="
[0:v]split=3[a0][b0][c0];
[a0]trim=0:10,setpts=(PTS-STARTPTS)/0.8,fps=30,format=yuv420p[A];
[b0]trim=5.5:10,setpts=(PTS-STARTPTS)/0.5,fps=30,
  scale=w='trunc(iw*(1.22+0.08*t/9)/2)*2':h=-2:eval=frame:flags=bicubic,
  crop=${W}:${H}:x='(iw-ow)*(0.45+0.25*t/9)':y='(ih-oh)*0.12',format=yuv420p[B];
[c0]trim=0:5.25,setpts=(PTS-STARTPTS)/0.5,fps=30,hflip,
  scale=w='trunc(iw*(1.02+0.1*t/10.5)/2)*2':h=-2:eval=frame:flags=bicubic,
  crop=${W}:${H}:x='(iw-ow)/2':y='(ih-oh)*0.4',format=yuv420p[C];
[A][B]xfade=transition=fade:duration=1:offset=11.5[AB];
[AB][C]xfade=transition=fade:duration=1:offset=19.5,
  eq=contrast=1.04:saturation=1.06,vignette=angle=PI/5:mode=forward,
  fade=t=in:st=0:d=0.4,fade=t=out:st=28.6:d=1.4[mont];
[2:v]format=rgba[g];[mont][g]overlay=0:0:format=auto,
  subtitles='$TMP/lyrics.ass':fontsdir='$HERE/fonts',format=yuv420p[v];
[1:a]atrim=0:$DUR,asetpts=PTS-STARTPTS,afade=t=in:st=0:d=0.6,afade=t=out:st=28.4:d=1.6,
  loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]"
ffmpeg -y -hide_banner -loglevel error \
  -i "$TMP/src48.mp4" -ss "$HOOK_START" -t $DUR -i "$SONG" -loop 1 -i "$TMP/grad.png" \
  -filter_complex "$FC" -map "[v]" -map "[a]" -t $DUR \
  -c:v libx264 -crf 19 -preset slow -profile:v high -pix_fmt yuv420p -r 30 \
  -c:a aac -b:a 256k -movflags +faststart "$OUT"
log "Done: $OUT"
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate:format=duration -of compact "$OUT"
