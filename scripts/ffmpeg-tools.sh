#!/usr/bin/env bash
# FFmpeg helpers for post-production. Usage: scripts/ffmpeg-tools.sh <command> [args]
set -euo pipefail
cmd="${1:-help}"; shift || true

case "$cmd" in
  concat)      # concat OUT IN1 IN2 [...]  — join clips (re-encodes, any sizes -> 1920x1080@30)
    out="$1"; shift; args=(); filt=""; i=0
    for f in "$@"; do
      args+=(-i "$f")
      filt+="[$i:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,fps=30,format=yuv420p,setsar=1[v$i];"
      i=$((i+1))
    done
    for ((j=0;j<i;j++)); do filt+="[v$j]"; done
    ffmpeg -y -hide_banner -loglevel error "${args[@]}" -filter_complex "${filt}concat=n=$i:v=1:a=0[v]" \
      -map "[v]" -c:v libx264 -crf 18 -preset medium -movflags +faststart "$out" ;;
  xfade)       # xfade OUT A B [DURATION=0.5]  — crossfade transition between two clips
    out="$1"; a="$2"; b="$3"; d="${4:-0.5}"
    off=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$a" | awk -v d="$d" '{print $1-d}')
    ffmpeg -y -hide_banner -loglevel error -i "$a" -i "$b" \
      -filter_complex "[0:v]fps=30,format=yuv420p[a];[1:v]fps=30,format=yuv420p[b];[a][b]xfade=transition=fade:duration=$d:offset=$off[v]" \
      -map "[v]" -c:v libx264 -crf 18 -movflags +faststart "$out" ;;
  add-audio)   # add-audio OUT VIDEO AUDIO  — mux music, loudness-normalised to -14 LUFS, trimmed to video
    ffmpeg -y -hide_banner -loglevel error -i "$2" -i "$3" -filter:a "loudnorm=I=-14:TP=-1.5:LRA=11" \
      -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "$1" ;;
  vertical)    # vertical OUT IN  — 9:16 version (1080x1920) with blurred background fill
    ffmpeg -y -hide_banner -loglevel error -i "$2" -filter_complex \
      "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=20[bg];[0:v]scale=1080:-2[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2,format=yuv420p[v]" \
      -map "[v]" -map 0:a? -c:v libx264 -crf 20 -c:a copy -movflags +faststart "$1" ;;
  gif)         # gif OUT IN [WIDTH=640] [FPS=15]  — high-quality GIF via palettegen
    w="${3:-640}"; fps="${4:-15}"
    ffmpeg -y -hide_banner -loglevel error -i "$2" -filter_complex \
      "fps=$fps,scale=$w:-1:flags=lanczos,split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=5" "$1" ;;
  webm)        # webm OUT IN  — VP9/Opus for the web
    ffmpeg -y -hide_banner -loglevel error -i "$2" -c:v libvpx-vp9 -crf 32 -b:v 0 -row-mt 1 -c:a libopus "$1" ;;
  caption)     # caption OUT IN "TEXT"  — burn a meme-style caption at the top
    ffmpeg -y -hide_banner -loglevel error -i "$2" -vf \
      "drawtext=text='$3':fontcolor=white:fontsize=h/12:borderw=6:bordercolor=black:x=(w-tw)/2:y=h/20" \
      -c:v libx264 -crf 18 -c:a copy -movflags +faststart "$1" ;;
  subtitles)   # subtitles OUT IN SUBS.srt  — burn subtitles (libass)
    ffmpeg -y -hide_banner -loglevel error -i "$2" -vf "subtitles=$3" -c:v libx264 -crf 18 -c:a copy "$1" ;;
  probe)       # probe IN  — show codec/size/fps/duration
    ffprobe -v error -show_entries stream=codec_type,codec_name,width,height,r_frame_rate:format=duration,size -of compact "$1" ;;
  *)
    grep -E '^  [a-z-]+\)' "$0" | sed 's/)[^#]*#/  —/' ;;
esac
