#!/usr/bin/env python3
"""Naadloos verlengen van lofi-buddha-temple naar 10/20/30 min (crossfade-loop).

Gebruik: python3 scripts/loop-music.py <input.mp3> <output.mp3> <minuten> [crossfade_sec]
Crossfade wordt toegepast op elk naadpunt zodat de loop onhoorbaar is.
"""
import subprocess, sys, wave, array, math, os, tempfile

def decode(path, tmp_wav):
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", path, "-ac", "1", "-ar", "44100",
                    "-c:a", "pcm_s16le", tmp_wav], check=True)

def read_wav(path):
    with wave.open(path, "rb") as w:
        ch = w.getnchannels(); sw = w.getsampwidth(); sr = w.getframerate()
        n = w.getnframes()
        data = array.array("h", w.readframes(n))
    return data, sr

def write_wav(path, samples, sr):
    with wave.open(path, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
        w.writeframes(samples.tobytes())

def main():
    inp, outp, minutes, cf = sys.argv[1], sys.argv[2], int(sys.argv[3]), float(sys.argv[4]) if len(sys.argv) > 4 else 6.0
    tmp = tempfile.mktemp(suffix=".wav")
    tmp_out = tempfile.mktemp(suffix=".wav")
    try:
        decode(inp, tmp)
        samples, sr = read_wav(tmp)
        total = minutes * 60 * sr
        cf_n = int(cf * sr)
        # crossfade-loop: [unit zonder laatste cf] + crossfade(einde, begin) + [unit zonder eerste cf] ...
        body = samples[cf_n:-cf_n] if len(samples) > 2 * cf_n else samples
        fade_in = samples[:cf_n]
        fade_out = samples[-cf_n:]
        out = array.array("h")
        # eerste unit: fade-in vanaf 0
        out.extend(samples[:cf_n])
        out.extend(body)
        while len(out) < total + cf_n:
            # crossfade overgang
            for i in range(cf_n):
                a = fade_out[i] * (1 - i / cf_n)
                b = fade_in[i] * (i / cf_n)
                out.append(int(a + b))
            out.extend(body)
        del out[total:]
        write_wav(tmp_out, out, sr)
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", tmp_out, "-c:a", "libmp3lame", "-b:a", "192k", outp], check=True)
        print(f"✅ {outp}: {minutes} min (crossfade {cf}s)")
    finally:
        for p in (tmp, tmp_out):
            try: os.unlink(p)
            except OSError: pass

if __name__ == "__main__":
    main()
