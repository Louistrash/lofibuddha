"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Volume2, VolumeX } from "lucide-react";

export default function RainyTokyoPage() {
  const [soundOn, setSoundOn] = useState(true);
  const rainRef = useRef<HTMLCanvasElement | null>(null);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const rainSoundRef = useRef<HTMLAudioElement | null>(null);

  // Rain animation (canvas)
  useEffect(() => {
    const canvas = rainRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const drops = Array.from({ length: 130 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      speed: 4 + Math.random() * 7,
      len: 8 + Math.random() * 18,
      opacity: 0.06 + Math.random() * 0.24,
    }));
    let raf = 0;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(180,205,230,1)";
      ctx.lineWidth = 0.6;
      for (const d of drops) {
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - 1.2, d.y + d.len);
        ctx.globalAlpha = d.opacity;
        ctx.stroke();
        d.y += d.speed;
        if (d.y > h) { d.y = -d.len; d.x = Math.random() * w; }
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    draw();
    const onResize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);

  // Loopable sound: rainy-kyoto music + gentle rain
  useEffect(() => {
    if (!soundOn) return;
    const music = new Audio("/api/music-tracks/audio/rainy-kyoto.mp3");
    music.loop = true;
    music.volume = 0.6;
    music.play().catch(() => {});
    const rain = new Audio("/api/sounds/audio/gentle-rain.mp3");
    rain.loop = true;
    rain.volume = 0.22;
    rain.play().catch(() => {});
    musicRef.current = music;
    rainSoundRef.current = rain;
    return () => { music.pause(); rain.pause(); };
  }, [soundOn]);

  return (
    <div className="world-page">
      {/* Scene */}
      <div className="world-scene">
        <div className="world-sky" />
        <div className="world-moon" />

        {/* City skyline */}
        <div className="world-skyline">
          <svg className="world-skyline-svg" viewBox="0 0 1440 420" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
            <g fill="#070a12">
              <rect x="0" y="280" width="90" height="140" />
              <rect x="95" y="220" width="70" height="200" />
              <rect x="170" y="300" width="110" height="120" />
              <rect x="285" y="180" width="80" height="240" />
              <rect x="370" y="250" width="95" height="170" />
              <rect x="470" y="150" width="70" height="270" />
              <rect x="545" y="270" width="120" height="150" />
              <rect x="670" y="200" width="85" height="220" />
              <rect x="760" y="300" width="100" height="120" />
              <rect x="865" y="170" width="75" height="250" />
              <rect x="945" y="240" width="110" height="180" />
              <rect x="1060" y="190" width="80" height="230" />
              <rect x="1145" y="280" width="95" height="140" />
              <rect x="1245" y="230" width="75" height="190" />
              <rect x="1325" y="300" width="115" height="120" />
            </g>
            {/* Antennas */}
            <g stroke="#070a12" strokeWidth="4" fill="none">
              <line x1="325" y1="180" x2="325" y2="150" />
              <line x1="505" y1="150" x2="505" y2="120" />
              <line x1="902" y1="170" x2="902" y2="135" />
              <line x1="1100" y1="190" x2="1100" y2="155" />
            </g>
            {/* Lit windows */}
            <g fill="#e8c97a" opacity="0.55">
              <rect x="305" y="210" width="8" height="8" />
              <rect x="325" y="240" width="8" height="8" />
              <rect x="345" y="200" width="8" height="8" />
              <rect x="490" y="180" width="8" height="8" />
              <rect x="510" y="230" width="8" height="8" />
              <rect x="530" y="170" width="8" height="8" />
              <rect x="690" y="240" width="8" height="8" />
              <rect x="710" y="280" width="8" height="8" />
              <rect x="885" y="200" width="8" height="8" />
              <rect x="905" y="250" width="8" height="8" />
              <rect x="1080" y="220" width="8" height="8" />
              <rect x="1100" y="260" width="8" height="8" />
              <rect x="1265" y="260" width="8" height="8" />
            </g>
          </svg>
        </div>

        {/* Neon signs */}
        <div className="world-neon">
          <span className="world-neon-sign world-neon-tokyo">東京</span>
          <span className="world-neon-sign world-neon-cafe">喫茶</span>
          <span className="world-neon-sign world-neon-ramen">ラーメン</span>
          <span className="world-neon-sign world-neon-bar">BAR</span>
        </div>

        {/* Street reflection glow */}
        <div className="world-street-glow" />

        {/* Rain */}
        <canvas ref={rainRef} className="world-rain" aria-hidden="true" />

        {/* Vignette + warm glow */}
        <div className="world-vignette" />
        <div className="world-glow" />
      </div>

      {/* Overlay UI */}
      <div className="world-ui">
        <Link href="/" className="world-back">← back</Link>
        <div className="world-title-wrap">
          <h1 className="world-title">Rainy Tokyo Night</h1>
          <p className="world-sub">a quiet neon evening — rain on the window</p>
        </div>
        <button onClick={() => setSoundOn(s => !s)} className="world-sound" aria-label="toggle sound">
          {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
          <span>{soundOn ? "sound on" : "sound off"}</span>
        </button>
      </div>
    </div>
  );
}
