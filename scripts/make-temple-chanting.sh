#!/usr/bin/env bash
# Bouwt data/sounds/audio/temple-chanting.mp3: chime (bel) intro + temple chanting (monks-chant),
# 20s, genormaliseerd naar soundscape-niveau (~-30 dB mean) voor mixer-consistentie.
set -e
cd /opt/data/bodhi-dashboard
OUT=data/sounds/audio/temple-chanting.mp3
TMP=$(mktemp -d)

# 1) Chant: eerste 20s van monks-chant, van -16.9 dB naar ~-30 dB (factor ~0.22)
ffmpeg -y -v error -i data/music/tracks/monks-chant.mp3 -t 20 \
  -af "volume=0.22" -ar 44100 -ac 2 "$TMP/chant.wav"

# 2) Chime: eerste 5s van de bel, fade-out vanaf 2.5s (hoort boven de chant)
ffmpeg -y -v error -i data/breathe/audio/chime.mp3 -t 5 \
  -af "volume=0.6,afade=t=out:st=2.5:d=2.0" -ar 44100 -ac 2 "$TMP/chime.wav"

# 3) Mix: chant volle 20s, chime alleen de eerste 5s (rest stilte)
ffmpeg -y -v error -i "$TMP/chant.wav" -i "$TMP/chime.wav" \
  -filter_complex "[1:a]apad=pad_dur=15[a1];[0:a][a1]amix=inputs=2:duration=first:dropout_transition=0[out]" \
  -map "[out]" -c:a libmp3lame -b:a 192k "$OUT"

rm -rf "$TMP"
echo "=== RESULTAAT ==="
ls -la "$OUT"
ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$OUT" | xargs -I{} echo "duration: {}s"
ffmpeg -i "$OUT" -af volumedetect -f null - 2>&1 | grep -E 'mean_volume|max_volume'
