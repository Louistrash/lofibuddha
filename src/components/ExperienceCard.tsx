"use client";

import { useEffect, useState } from "react";
import { Play, Pause, Mic, Music, Waves, Clock, Timer, Wind, Heart } from "lucide-react";
import Scene from "@/components/Scene";
import { Chip } from "@/components/ui";
import type { Experience } from "@/lib/experiences";
import { getCategory } from "@/lib/experiences";

interface ExperienceCardProps {
  experience: Experience;
  playing: boolean;
  onPlay: () => void;
}

function getFavorites(): string[] {
  try {
    return JSON.parse(localStorage.getItem("lofibuddha-favorites") || "[]");
  } catch { return []; }
}

/**
 * Eén kaart voor alle experiences — token-gebaseerd (frosted glass, Zen Night).
 * Toont de levende scene, titel, badges (begeleiding/soundscape/muziek), play en favoriet.
 */
export default function ExperienceCard({ experience, playing, onPlay }: ExperienceCardProps) {
  const cat = getCategory(experience.category);
  const accent = experience.accent || cat.accent;
  const SpecialIcon = experience.special === "pomodoro" ? Timer : experience.special === "box-breathing" ? Wind : null;
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const update = () => setIsFavorite(getFavorites().includes(experience.id));
    update();
    window.addEventListener("lofibuddha-favorites", update);
    return () => window.removeEventListener("lofibuddha-favorites", update);
  }, [experience.id]);

  function toggleFavorite(e: React.MouseEvent) {
    e.stopPropagation();
    const favs = getFavorites();
    const next = favs.includes(experience.id) ? favs.filter(f => f !== experience.id) : [...favs, experience.id];
    localStorage.setItem("lofibuddha-favorites", JSON.stringify(next));
    window.dispatchEvent(new Event("lofibuddha-favorites"));
  }

  return (
    <div
      className="relative rounded-[var(--radius)] border overflow-hidden backdrop-blur-xl transition-all duration-[var(--duration-base)] hover:-translate-y-0.5 min-h-[360px] flex flex-col shrink-0 basis-[72%] snap-start"
      style={{
        borderColor: playing ? accent : `color-mix(in srgb, ${accent} 70%, var(--border))`,
        boxShadow: playing ? `0 0 52px ${accent}66` : `0 8px 32px rgba(0,0,0,0.45), 0 0 30px ${accent}42`,
        background: `radial-gradient(140% 110% at 50% 0%, ${accent}8c, transparent 64%), radial-gradient(90% 70% at 50% 112%, ${accent}2e, transparent 55%), var(--bg-card)`,
      }}
    >
      {/* Levende mini-scene achtergrond */}
      <Scene type={experience.scene} variant="card" />

      <button
        className="absolute top-3 right-3 z-[3] w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-[var(--duration-fast)] hover:scale-110"
        style={{
          background: "rgba(0,0,0,0.42)",
          border: "1px solid var(--border-strong)",
          color: isFavorite ? "var(--error)" : "var(--text-muted)",
        }}
        onClick={toggleFavorite}
        aria-label={isFavorite ? "Remove favorite" : "Add favorite"}
      >
        <Heart size={14} fill={isFavorite ? "currentColor" : "none"} />
      </button>

      <div
        className="relative z-[2] flex flex-col gap-4 p-5 w-full flex-1"
        style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.02) 18%, rgba(0,0,0,0.82) 100%)" }}
      >
        <div className="flex items-center justify-end">
          <span className="inline-flex items-center gap-1.5 text-[var(--text-muted)] text-[0.68rem]">
            <Clock size={11} /> {experience.duration}
          </span>
        </div>

        <div className="flex flex-col gap-2.5 flex-1">
          <h3 className="text-text-primary font-semibold tracking-[-0.02em] text-[1.25rem] m-0">{experience.title}</h3>
          <p className="text-text-secondary text-[0.88rem] leading-[1.6] m-0">{experience.description}</p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <button
              className="w-[42px] h-[42px] rounded-full flex items-center justify-center text-[#0a0a0c] transition-all duration-[var(--duration-fast)] hover:scale-105 active:scale-95 shrink-0"
              style={{ background: "rgba(255,255,255,0.92)", boxShadow: "0 2px 10px rgba(0,0,0,0.4)" }}
              onClick={onPlay}
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? <Pause size={18} /> : SpecialIcon ? <SpecialIcon size={18} /> : <Play size={18} style={{ marginLeft: 2 }} />}
            </button>
            <span className="text-[var(--text-muted)] text-[0.72rem]">{playing ? "playing…" : "play"}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {experience.guide && <Chip icon={<Mic size={11} />}>guided</Chip>}
            {experience.soundscape !== "off" && <Chip icon={<Waves size={11} />}>sound</Chip>}
            {experience.music !== "off" && <Chip icon={<Music size={11} />}>lofi</Chip>}
          </div>
        </div>
      </div>
    </div>
  );
}
