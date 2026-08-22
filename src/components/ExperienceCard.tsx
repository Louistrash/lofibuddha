"use client";

import { useEffect, useState } from "react";
import { Play, Pause, Mic, Music, Waves, Clock, Timer, Wind, Heart } from "lucide-react";
import Scene from "@/components/Scene";
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
 * Eén kaart voor alle experiences in het ecosysteem.
 * Toont de levende scene, titel, badges (begeleiding/soundscape/muziek), play en favoriet.
 * Specials (pomodoro / box breathing) openen ook de player met hun eigen modus.
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
    <div className={`exp-card ${playing ? "exp-card-playing" : ""}`} style={{ "--accent": accent } as React.CSSProperties}>
      {/* Levende mini-scene achtergrond */}
      <Scene type={experience.scene} variant="card" />

      <button
        className={`exp-fav ${isFavorite ? "exp-fav-active" : ""}`}
        onClick={toggleFavorite}
        aria-label={isFavorite ? "Remove favorite" : "Add favorite"}
      >
        <Heart size={14} fill={isFavorite ? "currentColor" : "none"} />
      </button>

      <div className="exp-card-inner">
        <div className="exp-card-top">
          <span className="exp-card-cat" style={{ borderColor: accent, color: accent }}>
            {experience.special ? "special" : cat.name}
          </span>
          <span className="exp-card-dur"><Clock size={11} /> {experience.duration}</span>
        </div>

        <h3 className="exp-card-title">{experience.title}</h3>
        <p className="exp-card-desc">{experience.description}</p>

        <div className="exp-card-badges">
          {experience.guide && (
            <span className="exp-badge"><Mic size={11} /> guided</span>
          )}
          {experience.soundscape !== "off" && (
            <span className="exp-badge"><Waves size={11} /> sound</span>
          )}
          {experience.music !== "off" && (
            <span className="exp-badge"><Music size={11} /> lofi</span>
          )}
        </div>

        <div className="exp-card-actions">
          <button
            className="exp-play"
            onClick={onPlay}
            style={playing ? { background: accent, color: "#0d0b09" } : undefined}
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? <Pause size={18} /> : SpecialIcon ? <SpecialIcon size={18} /> : <Play size={18} style={{ marginLeft: 2 }} />}
          </button>
          <span className="exp-play-hint">{playing ? "playing…" : "play"}</span>
        </div>
      </div>
    </div>
  );
}

