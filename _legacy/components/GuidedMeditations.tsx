"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Play, Pause, Music, Music2 } from "lucide-react";
import CarouselDots from "@/components/CarouselDots";

interface Meditation {
  id: string;
  title: string;
  description: string;
  duration: string;
  theme: string;
  hasAudio: boolean;
  audioUrl: string | null;
}

const BACKGROUNDS = [
  { slug: "temple-ambience", name: "Temple" },
  { slug: "gentle-rain", name: "Gentle Rain" },
  { slug: "ocean-waves", name: "Soft Ocean" },
  { slug: "singing-bowls", name: "Bowls" },
];

// India/Tibet LED palette
const LED_COLORS = ["#E8A33D", "#2DD4BF", "#E05252", "#A855F7"];

function fmtTime(sec: number) {
  if (!isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function GuidedMeditations() {
  const [meditations, setMeditations] = useState<Meditation[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [musicOn, setMusicOn] = useState(true);
  const [bgSlug, setBgSlug] = useState("temple-ambience");
  const [progress, setProgress] = useState(0);
  const [durationSec, setDurationSec] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);
  const bgChoicesRef = useRef<HTMLDivElement>(null);
  const voiceRef = useRef<HTMLAudioElement | null>(null);
  const bgRef = useRef<HTMLAudioElement | null>(null);
  const searchParams = useSearchParams();
  const meditationParam = searchParams.get("meditation");

  useEffect(() => {
    fetch("/api/meditations")
      .then(r => r.json())
      .then(d => setMeditations(d.meditations || []))
      .catch(() => setMeditations([]));
    return () => {
      voiceRef.current?.pause();
      bgRef.current?.pause();
    };
  }, []);

  // Auto-play a meditation when arriving via ?meditation=<id> (e.g. deep-sleep)
  useEffect(() => {
    if (meditations.length === 0 || !meditationParam) return;
    const m = meditations.find(x => x.id === meditationParam) || meditations[0];
    if (m?.audioUrl && playingId !== m.id) toggle(m.id, m.audioUrl);
  }, [meditations, meditationParam]);

  function stopBg() {
    bgRef.current?.pause();
    bgRef.current = null;
  }

  function startBg(slug: string) {
    stopBg();
    if (!musicOn) return;
    const bg = new Audio(`/api/sounds/audio/${slug}.mp3`);
    bg.loop = true;
    bg.volume = 0.28;
    bg.play().catch(() => {});
    bgRef.current = bg;
  }

  function stopVoice() {
    voiceRef.current?.pause();
    voiceRef.current = null;
  }

  function toggle(id: string, url: string) {
    if (playingId === id) {
      stopVoice();
      stopBg();
      setPlayingId(null);
      setProgress(0);
      setDurationSec(0);
      return;
    }
    stopVoice();
    const voice = new Audio(url);
    voice.onended = () => { stopBg(); setPlayingId(null); setProgress(0); };
    voice.onloadedmetadata = () => setDurationSec(voice.duration || 0);
    voice.ontimeupdate = () => {
      if (voice.duration) setProgress(voice.currentTime / voice.duration);
    };
    voice.play().catch(() => {});
    voiceRef.current = voice;
    startBg(bgSlug);
    setPlayingId(id);
    setProgress(0);
  }

  function toggleMusic() {
    const next = !musicOn;
    setMusicOn(next);
    if (next && playingId) {
      startBg(bgSlug);
    } else {
      stopBg();
    }
  }

  function chooseBg(slug: string) {
    setBgSlug(slug);
    if (playingId && musicOn) {
      startBg(slug);
    }
  }

  if (meditations.length === 0) return null;

  const RING_R = 34;
  const CIRC = 2 * Math.PI * RING_R;

  return (
    <section className="guided">
      <div className="guided-head">
        <div>
          <h2 className="guided-title">Guided meditations</h2>
          <p className="guided-sub">Five calm journeys, in the voice of stillness.</p>
        </div>

        {/* Background music controls */}
        <div className="guided-bg">
          <button
            className={`guided-bg-toggle ${musicOn ? "guided-bg-on" : ""}`}
            onClick={toggleMusic}
            title="Background music on/off"
          >
            {musicOn ? <Music2 size={15} /> : <Music size={15} />}
            <span>{musicOn ? "music on" : "music off"}</span>
          </button>
          <div className="guided-bg-choices" ref={bgChoicesRef}>
            {BACKGROUNDS.map(b => (
              <button
                key={b.slug}
                className={`guided-bg-choice ${bgSlug === b.slug ? "guided-bg-active" : ""}`}
                onClick={() => chooseBg(b.slug)}
              >
                {b.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <CarouselDots containerRef={bgChoicesRef} color="#b89258" label="Background sounds" />
      <div className="guided-grid" ref={gridRef}>
        {meditations.map((m, i) => {
          const isPlaying = playingId === m.id;
          const led = LED_COLORS[i % 4];
          return (
            <div
              key={m.id}
              className={`guided-card ${isPlaying ? "guided-card-playing" : ""}`}
              style={isPlaying ? ({ "--led": led } as React.CSSProperties) : undefined}
            >
              <div className="guided-card-top">
                <div className="guided-play-wrap">
                  {/* golden waves */}
                  <div className="guided-waves">
                    <span /><span /><span />
                  </div>
                  {/* gold dust */}
                  <div className="guided-dust">
                    {Array.from({ length: 8 }).map((_, k) => (
                      <span key={k} style={{ "--angle": `${k * 45}deg`, "--delay": `${(k % 4) * 1.1}s` } as React.CSSProperties} />
                    ))}
                  </div>
                  {/* progress ring */}
                  <svg className="guided-ring" width="78" height="78" viewBox="0 0 78 78">
                    <circle cx="39" cy="39" r={RING_R} fill="none" stroke="rgba(255,245,230,0.08)" strokeWidth="2" />
                    <circle
                      cx="39" cy="39" r={RING_R} fill="none"
                      stroke={led} strokeWidth="2" strokeLinecap="round"
                      strokeDasharray={CIRC}
                      strokeDashoffset={isPlaying ? CIRC * (1 - progress) : CIRC}
                      transform="rotate(-90 39 39)"
                      style={{ transition: "stroke-dashoffset 0.3s linear" }}
                    />
                  </svg>
                  <button
                    className="guided-play"
                    onClick={() => m.audioUrl && toggle(m.id, m.audioUrl)}
                    disabled={!m.hasAudio}
                    title={m.hasAudio ? (isPlaying ? "Pause" : "Play") : "Audio not ready"}
                    style={isPlaying ? { background: led, color: "#0d0b09" } : undefined}
                  >
                    {isPlaying ? <Pause size={26} /> : <Play size={26} />}
                  </button>
                </div>
                <div className="guided-card-meta">
                  <span className="guided-card-theme">{m.theme}</span>
                  <span className="guided-card-duration">{isPlaying ? fmtTime(progress * durationSec) : m.duration}</span>
                </div>
              </div>
              <h3 className="guided-card-title">{m.title}</h3>
              <p className="guided-card-desc">{m.description}</p>

              {/* progress bar */}
              {isPlaying && (
                <div className="guided-progress">
                  <div className="guided-progress-track">
                    <div className="guided-progress-fill" style={{ width: `${progress * 100}%`, background: led }} />
                  </div>
                  <span className="guided-progress-time">{fmtTime(progress * durationSec)} / {fmtTime(durationSec)}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <CarouselDots containerRef={gridRef} color="#E8A33D" label="Meditations" />
    </section>
  );
}
