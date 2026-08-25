#!/usr/bin/env bash
# Voegt audio toe aan alle video's die nog géén audio-track hebben.
# Sound = chime-intro (eenmalig) + een "temple lofi" soundscape (loop), met variatie per thema.
# Video-stream wordt gecopieerd (-c:v copy), dus geen kwaliteitsverlies; alleen audio wordt toegevoegd.
set -euo pipefail
cd /opt/data/bodhi-dashboard

CHIME="data/breathe/audio/chime.mp3"
SOUNDS="data/sounds/audio"

# Temple-lofi soundscape pools (variatie per thema)
TEMPLE=(temple-ambience singing-bowls)
STARS=(deep-space singing-bowls)
WATER=(zen-garden bamboo-garden)
GARDEN=(bamboo-garden zen-garden)
LOFI=(lo-fi-meditation zen-garden)

pick_sound() {
  local name="$1"; local idx="$2"
  local c
  c=$(echo "$name" | tr 'A-Z' 'a-z')
  if echo "$c" | grep -qE 'temple|chant|monk|sacred|lotus|cave|buddha'; then echo "${TEMPLE[$((idx % 2))]}"; return; fi
  if echo "$c" | grep -qE 'star|milky|cosmic|void|night|space|moon'; then echo "${STARS[$((idx % 2))]}"; return; fi
  if echo "$c" | grep -qE 'water|rain|lake|ocean|river|waterfall|mirror'; then echo "${WATER[$((idx % 2))]}"; return; fi
  if echo "$c" | grep -qE 'bamboo|jungle|garden|sakura|bonsai|rice|roots|floating|dragon|firefl|mountain|wind|himalay|desert|frost|autumn'; then echo "${GARDEN[$((idx % 2))]}"; return; fi
  if echo "$c" | grep -qE 'lofi|lo-fi|focus|study|meditat|deep|breath|yoga|calm|album|featured|quote|thumb|zen'; then echo "${LOFI[$((idx % 2))]}"; return; fi
  echo "temple-ambience"
}

# Verzamel video's zonder audio (gesorteerd voor deterministische toewijzing)
mapfile -t VIDEOS < <(find public/videos -name '*.mp4' | sort)

idx=0
done=0
skipped=0
for video in "${VIDEOS[@]}"; do
  has=$(ffprobe -v error -select_streams a -show_entries stream=codec_type -of csv=p=0 "$video" 2>/dev/null | head -1)
  if [ -n "$has" ]; then
    skipped=$((skipped+1))
    continue
  fi

  name="${video#public/}"   # bijv. videos/worlds/moon-temple.mp4
  sound=$(pick_sound "$name" "$idx")
  dur=$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$video" 2>/dev/null)

  tmp="${video}.audio.mp4"
  ffmpeg -y -v error -i "$video" -i "$SOUNDS/$sound.mp3" -i "$CHIME" \
    -filter_complex "[1:a]aloop=loop=-1:size=2e9,atrim=duration=${dur},volume=0.85[sc];[2:a]atrim=duration=3.5,afade=t=out:st=2.5:d=1.0,volume=0.5[ch];[sc][ch]amix=inputs=2:duration=first:dropout_transition=0[a]" \
    -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest "$tmp"

  mv "$tmp" "$video"
  echo "[$idx] +audio ($sound) → $name"
  idx=$((idx+1))
  done=$((done+1))
done

echo ""
echo "Klaar: $done video's voorzien van audio, $skipped overgeslagen (hadden al audio)."
