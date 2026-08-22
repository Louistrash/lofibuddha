"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";
import CarouselDots from "@/components/CarouselDots";

interface Track {
  id: string;
  title: string;
  description: string;
  duration: number;
  mood: string;
  hasAudio: boolean;
  audioUrl: string | null;
}

export default function MusicTracks() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/music-tracks")
      .then(r => r.json())
      .then(d => setTracks(d.tracks || []))
      .catch(() => setTracks([]));
    return () => { audioRef.current?.pause(); };
  }, []);

  function toggle(id: string, url: string) {
    if (playingId === id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }
    audioRef.current?.pause();
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.onended = () => setPlayingId(null);
    audio.play();
    setPlayingId(id);
  }

  if (tracks.length === 0) return null;

  return (
    <section className="musictracks">
      <h2 className="musictracks-title">Soundscapes</h2>
      <p className="musictracks-sub">Four-minute journeys, composed for deep meditation.</p>
      <div className="musictracks-grid" ref={gridRef}>
        {tracks.map(t => (
          <div key={t.id} className={`musictracks-card ${playingId === t.id ? "musictracks-playing" : ""}`}>
            <div className="musictracks-top">
              <div className="dusty-wrap">
                <div className="play-glow" />
                <div className="play-waves"><span /><span /><span /></div>
                <div className="play-dust">
                  {Array.from({ length: 8 }).map((_, k) => (
                    <span key={k} style={{ "--angle": `${k * 45}deg`, "--delay": `${(k % 4) * 1.2}s` } as React.CSSProperties} />
                  ))}
                </div>
                <button
                  className="musictracks-play"
                  onClick={() => t.audioUrl && toggle(t.id, t.audioUrl)}
                  disabled={!t.hasAudio}
                  title={playingId === t.id ? "Pause" : "Play"}
                >
                  {playingId === t.id ? <Pause size={26} /> : <Play size={26} />}
                </button>
              </div>
              <span className="musictracks-mood">{t.mood}</span>
            </div>
            <h3 className="musictracks-title-txt">{t.title}</h3>
            <p className="musictracks-desc">{t.description}</p>
            <span className="musictracks-duration">{Math.round(t.duration / 60)} min</span>
          </div>
        ))}
      </div>
      <CarouselDots containerRef={gridRef} color="#2DD4BF" label="Soundscapes" />
    </section>
  );
}
