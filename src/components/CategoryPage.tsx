"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Heart } from "lucide-react";
import ExperienceCard from "@/components/ExperienceCard";
import ExperiencePlayer from "@/components/ExperiencePlayer";
import CarouselDots from "@/components/CarouselDots";
import Mandala from "@/components/Mandala";
import { useRef } from "react";
import type { Experience, ExperienceCategory } from "@/lib/experiences";
import { getCategory, getCategoryExperiences } from "@/lib/experiences";

interface CategoryPageProps {
  category: ExperienceCategory;
}

function getFavorites(): string[] {
  try {
    return JSON.parse(localStorage.getItem("lofibuddha-favorites") || "[]");
  } catch { return []; }
}

/**
 * Eén pagina voor elke hoofd-categorie (focus / breathe / sleep / relax):
 * toont de experiences als kaarten, elke kaart opent de gedeelde player.
 */
export default function CategoryPage({ category }: CategoryPageProps) {
  const [active, setActive] = useState<Experience | null>(null);
  const [onlyFavs, setOnlyFavs] = useState(false);
  const [favCount, setFavCount] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);
  const cat = getCategory(category);
  const experiences = getCategoryExperiences(category);

  useEffect(() => {
    const update = () => setFavCount(getFavorites().length);
    update();
    window.addEventListener("lofibuddha-favorites", update);
    return () => window.removeEventListener("lofibuddha-favorites", update);
  }, []);

  const visible = onlyFavs ? experiences.filter(e => getFavorites().includes(e.id)) : experiences;

  return (
    <div className="breathe-page">
      <Mandala />

      <nav className="breathe-nav">
        <Link href="/mindfulness" className="breathe-nav-home">
          <img src="/bodhi-icon.png" alt="LofiBuddha" className="breathe-nav-icon" />
          <span>
            <span className="breathe-nav-name">LofiBuddha</span>
            <span className="breathe-nav-script">{cat.script}</span>
          </span>
        </Link>
        <Link href="/mindfulness" className="breathe-nav-back"><ArrowLeft size={13} /> mindfulness</Link>
      </nav>

      <main className="breathe-main">
        <span className="exp-page-eyebrow">{cat.script}</span>
        <h1 className="exp-page-title">{cat.name}</h1>
        <p className="exp-page-sub">{cat.tagline} — pick an experience, it brings its own sound and guidance.</p>

        {favCount > 0 && (
          <button
            className={`exp-favfilter ${onlyFavs ? "exp-favfilter-active" : ""}`}
            onClick={() => setOnlyFavs(!onlyFavs)}
          >
            <Heart size={13} fill={onlyFavs ? "currentColor" : "none"} />
            {onlyFavs ? "Show all" : `Favorites (${favCount})`}
          </button>
        )}

        <div className="exp-grid" ref={gridRef}>
          {visible.map(exp => (
            <ExperienceCard
              key={exp.id}
              experience={exp}
              playing={active?.id === exp.id}
              onPlay={() => setActive(active?.id === exp.id ? null : exp)}
            />
          ))}
        </div>
        <CarouselDots containerRef={gridRef} color={cat.accent} label={cat.name} />
      </main>

      {active && (
        <ExperiencePlayer experience={active} onClose={() => setActive(null)} />
      )}
    </div>
  );
}
