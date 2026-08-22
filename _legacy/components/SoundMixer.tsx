"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, SlidersHorizontal, Square } from "lucide-react";
import CarouselDots from "@/components/CarouselDots";

interface Sound {
  slug: string;
  name: string;
  description: string;
  category: string;
  hasAudio: boolean;
  audioUrl: string | null;
}

interface Mode {
  slug: string;
  name: string;
  description: string;
  mix: Record<string, number>;
}

// Curated, ready-to-play presets (modes + popular single sounds)
const SOUND_PRESETS = [
  { slug: "gentle-rain", name: "Gentle Rain" },
  { slug: "ocean-waves", name: "Soft Ocean" },
  { slug: "forest-morning", name: "Forest" },
  { slug: "fireplace", name: "Fire" },
  { slug: "flowing-water", name: "Water" },
  { slug: "mountain-wind", name: "Wind" },
  { slug: "singing-bowls", name: "Bowls" },
  { slug: "brown-noise", name: "Brown noise" },
  { slug: "temple-ambience", name: "Temple" },
];

export default function SoundMixer() {
  const [sounds, setSounds] = useState<Sound[]>([]);
  const [modes, setModes] = useState<Mode[]>([]);
  const [volumes, setVolumes] = useState<Record<string, number>>({});
  const [playingSlug, setPlayingSlug] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});
  const soundRowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/sounds")
      .then(r => r.json())
      .then(d => {
        setSounds(d.sounds || []);
        setModes(d.modes || []);
      })
      .catch(() => {});
    return () => { stopAll(); };
  }, []);

  function stopAll() {
    Object.values(audioRefs.current).forEach(a => { a.pause(); a.currentTime = 0; });
    audioRefs.current = {};
    setPlayingSlug(null);
  }

  function startMix(vols: Record<string, number>) {
    sounds.forEach(s => {
      const vol = vols[s.slug] || 0;
      if (vol > 0 && s.audioUrl) {
        const audio = new Audio(s.audioUrl);
        audio.loop = true;
        audio.volume = vol;
        audio.play().catch(() => {});
        audioRefs.current[s.slug] = audio;
      }
    });
  }

  function playMode(mode: Mode) {
    if (playingSlug === mode.slug) { stopAll(); return; }
    stopAll();
    const next: Record<string, number> = {};
    sounds.forEach(s => (next[s.slug] = 0));
    Object.entries(mode.mix).forEach(([slug, vol]) => (next[slug] = vol));
    setVolumes(next);
    startMix(next);
    setPlayingSlug(mode.slug);
  }

  function playSound(slug: string) {
    if (playingSlug === slug) { stopAll(); return; }
    stopAll();
    const next: Record<string, number> = {};
    sounds.forEach(s => (next[s.slug] = 0));
    next[slug] = 1;
    setVolumes(next);
    startMix(next);
    setPlayingSlug(slug);
  }

  function setVolume(slug: string, vol: number) {
    setVolumes(v => ({ ...v, [slug]: vol }));
    const audio = audioRefs.current[slug];
    if (audio) audio.volume = vol;
  }

  function toggleAdvancedMix() {
    setShowAdvanced(!showAdvanced);
  }

  if (sounds.length === 0) return null;

  const grouped: Record<string, Sound[]> = {};
  sounds.forEach(s => {
    (grouped[s.category] ||= []).push(s);
  });

  return (
    <section className="mixer">
      <div className="mixer-head">
        <div>
          <h2 className="mixer-title">Sound Mixer</h2>
          <p className="mixer-sub">Tap a sound — or blend your own.</p>
        </div>
        <button className="mixer-save" onClick={toggleAdvancedMix} title="Customize your mix">
          <SlidersHorizontal size={16} />
          <span>{showAdvanced ? "Done" : "Customize"}</span>
        </button>
        {playingSlug && (
          <button className="mixer-stop" onClick={stopAll} title="Stop all sounds">
            <Square size={14} />
            <span>Stop</span>
          </button>
        )}
      </div>

      {/* Mode presets */}
      <div className="mixer-modes">
        {modes.map(m => (
          <button
            key={m.slug}
            className={`mixer-mode ${playingSlug === m.slug ? "mixer-mode-playing" : ""}`}
            onClick={() => playMode(m)}
          >
            <span className="mixer-mode-play">{playingSlug === m.slug ? <Pause size={16} /> : <Play size={16} />}</span>
            <span className="mixer-mode-name">{m.name}</span>
            <span className="mixer-mode-desc">{m.description}</span>
          </button>
        ))}
      </div>

      {/* Single-sound presets — horizontal scroll */}
      <div className="mixer-soundrow" ref={soundRowRef}>
        {SOUND_PRESETS.map(p => {
          const s = sounds.find(x => x.slug === p.slug);
          if (!s || !s.hasAudio) return null;
          const active = playingSlug === p.slug;
          return (
            <button
              key={p.slug}
              className={`mixer-soundchip ${active ? "mixer-soundchip-playing" : ""}`}
              onClick={() => playSound(p.slug)}
            >
              <span className="mixer-soundchip-play">{active ? <Pause size={15} /> : <Play size={15} />}</span>
              <span className="mixer-soundchip-name">{p.name}</span>
            </button>
          );
        })}
      </div>
      <CarouselDots containerRef={soundRowRef} color="#b89258" label="Sounds" />

      {/* Advanced mixer (collapsible) */}
      {showAdvanced && (
        <div className="mixer-advanced">
          <div className="mixer-channels">
            {Object.entries(grouped).map(([category, items]) => (
              <div key={category} className="mixer-group">
                <span className="mixer-group-label">{category}</span>
                {items.map(s => {
                  const vol = Math.round((volumes[s.slug] || 0) * 100);
                  return (
                    <div key={s.slug} className={`mixer-channel ${vol > 0 ? "mixer-channel-on" : ""}`}>
                      <div className="mixer-channel-info">
                        <span className="mixer-channel-name">{s.name}</span>
                        <span className="mixer-channel-val">{vol}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={vol}
                        disabled={!s.hasAudio}
                        onChange={e => setVolume(s.slug, Number(e.target.value) / 100)}
                        className="mixer-slider"
                      />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="mixer-advanced-actions">
            <button className="mixer-play" onClick={() => {
              if (playingSlug) { stopAll(); } else { startMix(volumes); setPlayingSlug("custom"); }
            }}>
              {playingSlug ? <Pause size={18} /> : <Play size={18} />}
              <span>{playingSlug ? "Stop" : "Play mix"}</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
