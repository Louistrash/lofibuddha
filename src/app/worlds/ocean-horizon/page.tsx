"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Volume2, VolumeX } from "lucide-react";

export default function OceanHorizonPage() {
  const [soundOn, setSoundOn] = useState(true);
  const oceanRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!soundOn) return;
    const ocean = new Audio("/api/sounds/audio/ocean-waves.mp3");
    ocean.loop = true;
    ocean.volume = 0.55;
    ocean.play().catch(() => {});
    oceanRef.current = ocean;
    return () => { ocean.pause(); };
  }, [soundOn]);

  return (
    <div className="world-page">
      <div className="world-scene">
        {/* Sunset sky */}
        <div className="ocean-sky" />
        {/* Sun */}
        <div className="ocean-sun" />
        {/* Clouds */}
        <div className="ocean-clouds">
          <span /><span /><span />
        </div>
        {/* Stars (upper sky) */}
        <div className="ocean-stars">
          {Array.from({ length: 24 }).map((_, i) => (
            <span key={i} style={{ "--x": `${(i * 37) % 100}%`, "--y": `${(i * 13) % 28}%`, "--d": `${(i % 5) * 1.4}s` } as React.CSSProperties} />
          ))}
        </div>
        {/* Ocean */}
        <div className="ocean-sea">
          <svg className="ocean-waves" viewBox="0 0 1440 220" preserveAspectRatio="none" aria-hidden="true">
            <path className="ocean-wave ocean-wave-1" d="M0,110 C240,60 480,160 720,110 C960,60 1200,160 1440,110 L1440,220 L0,220 Z" />
            <path className="ocean-wave ocean-wave-2" d="M0,140 C260,90 520,180 780,140 C1040,100 1220,170 1440,140 L1440,220 L0,220 Z" />
          </svg>
          {/* Sun reflection path */}
          <div className="ocean-reflection" />
        </div>
        {/* Warm glow + vignette */}
        <div className="ocean-glow" />
        <div className="world-vignette" />
      </div>

      {/* UI */}
      <div className="world-ui">
        <Link href="/" className="world-back">← back</Link>
        <div className="world-title-wrap">
          <h1 className="world-title">Ocean Horizon</h1>
          <p className="world-sub">slow waves, endless calm — the sun setting over the sea</p>
        </div>
        <button onClick={() => setSoundOn(s => !s)} className="world-sound" aria-label="toggle sound">
          {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
          <span>{soundOn ? "sound on" : "sound off"}</span>
        </button>
      </div>
    </div>
  );
}
