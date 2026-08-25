#!/usr/bin/env bash
# Check welke video's een audio-track hebben en welke niet.
cd /opt/data/bodhi-dashboard
echo "=== Video's ZONDER audio-track ==="
noaudio=0
withaudio=0
while IFS= read -r f; do
  has=$(ffprobe -v error -select_streams a -show_entries stream=codec_type -of csv=p=0 "$f" 2>/dev/null | head -1)
  if [ -z "$has" ]; then
    echo "NO-AUDIO: ${f#public/}"
    noaudio=$((noaudio+1))
  else
    withaudio=$((withaudio+1))
  fi
done < <(find public/videos -name '*.mp4' | sort)
echo ""
echo "Totaal: $withaudio met audio, $noaudio zonder audio"
