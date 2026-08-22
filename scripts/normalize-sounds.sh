#!/bin/bash
# Normalize all soundscape mp3s (except the already-normalized gentle-rain/ocean-waves)
# to a consistent mean volume of ~ -30 dB, keeping max below -1 dB (no clipping).
set -u
cd /opt/data/bodhi-dashboard/data/sounds/audio || exit 1

TARGET=-30
for f in *.mp3; do
  case "$f" in
    gentle-rain.mp3|ocean-waves.mp3) continue ;;  # already done
  esac

  stats=$(ffmpeg -i "$f" -af volumedetect -f null - 2>&1)
  mean=$(echo "$stats" | grep mean_volume | sed 's/.*mean_volume: //;s/ dB//')
  max=$(echo "$stats" | grep max_volume | sed 's/.*max_volume: //;s/ dB//')
  [ -z "$mean" ] && { echo "SKIP $f (geen mean)"; continue; }

  # gain = target - mean, but never push max above -1 dB (allow attenuation)
  gain=$(python3 -c "print(min($TARGET - ($mean), -1 - ($max)))")

  if [ "$(python3 -c "print(1 if abs($gain) > 0.3 else 0)")" = "1" ]; then
    ffmpeg -y -v error -i "$f" -af "volume=${gain}dB" -c:a libmp3lame -b:a 192k "tmp-$f" \
      && mv "tmp-$f" "$f"
    new=$(ffmpeg -i "$f" -af volumedetect -f null - 2>&1 | grep mean_volume | sed 's/.*mean_volume: //;s/ dB//')
    echo "✅ $f: ${mean}dB -> ${new}dB (gain ${gain}dB)"
  else
    echo "⏭️  $f: al ok (mean ${mean}dB, gain ${gain}dB)"
  fi
done
echo "Klaar."
