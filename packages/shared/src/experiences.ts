// LofiBuddha Experience ecosysteem.
// Eén datamodel voor alle meditaties: elke experience heeft een begeleiding (voice),
// een soundscape (bij-geluid), muziek en een levende scene (visualisatie).
// Categorieën: focus | breathe | sleep | relax — de 4 hoofd-categorieën van de hub.

export type ExperienceCategory = "focus" | "breathe" | "sleep" | "relax";

export type SceneType =
  | "ocean"
  | "rain"
  | "night"
  | "nature"
  | "temple"
  | "breathe"
  | "focus";

export interface Experience {
  id: string;
  category: ExperienceCategory;
  title: string;
  description: string;
  duration: string;
  /** Voice begeleiding: meditatie-id (meditations) of focus-guide-id (focus) of null (alleen muziek) */
  guide: string | null;
  /** Soundscape (bij-geluid) slug uit sounds.ts — "off" = geen */
  soundscape: string;
  /** Muziek-track id uit music.ts — "off" = geen */
  music: string;
  /** Visuele scene (visualisatie) */
  scene: SceneType;
  /** Accentkleur (palet) voor badges en gloed */
  accent?: string;
  /** Speciale interactieve ervaring (bv. box breathing timer, pomodoro) */
  special?: "box-breathing" | "pomodoro";
}

// Categorie-info voor de hub
export const CATEGORIES: { id: ExperienceCategory; name: string; tagline: string; scene: SceneType; accent: string; script: string }[] = [
  { id: "focus", name: "Focus", tagline: "deep work, guided", scene: "focus", accent: "#E8A33D", script: "एकाग्रता" },
  { id: "breathe", name: "Breathe", tagline: "calm the nervous system", scene: "breathe", accent: "#2DD4BF", script: "श्वास" },
  { id: "sleep", name: "Sleep & Relax", tagline: "drift off, let go", scene: "night", accent: "#b89258", script: "निद्रा" },
  { id: "relax", name: "Relax", tagline: "unwind, release, rest", scene: "ocean", accent: "#A855F7", script: "विश्राम" },
];

export const EXPERIENCES: Experience[] = [
  // ── FOCUS ──
  {
    id: "focus-anchor",
    category: "focus",
    title: "Focus Anchor",
    description: "One task, full attention — a voice to settle you in.",
    duration: "2 min",
    guide: "focus-anchor",
    soundscape: "off",
    music: "temple-rain",
    scene: "focus",
    accent: "#E8A33D",
  },
  {
    id: "deep-work",
    category: "focus",
    title: "Deep Work",
    description: "Your attention as a beam of light — steady and kind.",
    duration: "2 min",
    guide: "deep-work",
    soundscape: "off",
    music: "temple-rain",
    scene: "focus",
    accent: "#E8A33D",
  },
  {
    id: "mindful-reset",
    category: "focus",
    title: "Mindful Reset",
    description: "Drop the previous task — start fresh, quiet and steady.",
    duration: "2 min",
    guide: "mindful-reset",
    soundscape: "off",
    music: "temple-rain",
    scene: "focus",
    accent: "#E8A33D",
  },
  {
    id: "one-point-focus",
    category: "focus",
    title: "One-Point Focus",
    description: "Fix your attention on a single point — the mind grows quiet.",
    duration: "2 min",
    guide: "one-point-focus",
    soundscape: "off",
    music: "temple-rain",
    scene: "focus",
    accent: "#E8A33D",
  },
  {
    id: "the-listener",
    category: "focus",
    title: "The Listener",
    description: "Awareness through sound — steady, open, and calm.",
    duration: "2 min",
    guide: "the-listener",
    soundscape: "off",
    music: "temple-rain",
    scene: "focus",
    accent: "#E8A33D",
  },
  {
    id: "pomodoro",
    category: "focus",
    title: "Focus Timer",
    description: "Pomodoro sessions with lo-fi and a soft chime.",
    duration: "10–50 min",
    guide: null,
    soundscape: "off",
    music: "lo-fi-focus",
    scene: "focus",
    accent: "#E8A33D",
    special: "pomodoro",
  },

  // ── BREATHE ──
  {
    id: "box-breathing",
    category: "breathe",
    title: "Box Breathing",
    description: "In 4 · hold 4 · out 4 · rest 4 — the circle follows you.",
    duration: "4×4 box",
    guide: null,
    soundscape: "temple-ambience",
    music: "lofi-buddha-temple",
    scene: "breathe",
    accent: "#2DD4BF",
    special: "box-breathing",
  },
  {
    id: "breath-of-life",
    category: "breathe",
    title: "Breath of Life",
    description: "Notice the breath — the most intimate gift of existence.",
    duration: "2 min",
    guide: "breath-of-life",
    soundscape: "off",
    music: "temple-rain",
    scene: "breathe",
    accent: "#2DD4BF",
  },
  {
    id: "the-witness",
    category: "breathe",
    title: "The Witness",
    description: "Watch your thoughts — you are the sky, not the clouds.",
    duration: "2 min",
    guide: "the-witness",
    soundscape: "off",
    music: "temple-rain",
    scene: "breathe",
    accent: "#2DD4BF",
  },

  {
    id: "ocean-breath",
    category: "breathe",
    title: "Ocean Breath",
    description: "Ujjayi — a soft ocean sound as the breath rolls in and out.",
    duration: "5 min",
    guide: null,
    soundscape: "ocean-waves",
    music: "ocean-temple",
    scene: "ocean",
    accent: "#2DD4BF",
  },

  // ── SLEEP ──
  {
    id: "deep-sleep",
    category: "sleep",
    title: "Drift Into Sleep",
    description: "Let go of the day and sink into deep, restful sleep.",
    duration: "10–30 min",
    guide: "deep-sleep",
    soundscape: "off",
    music: "temple-rain",
    scene: "night",
    accent: "#b89258",
  },
  {
    id: "letting-go",
    category: "sleep",
    title: "Letting Go",
    description: "Release every weight — only this moment is real.",
    duration: "10–30 min",
    guide: "letting-go",
    soundscape: "off",
    music: "temple-rain",
    scene: "night",
    accent: "#b89258",
  },
  {
    id: "gratitude",
    category: "sleep",
    title: "Gratitude",
    description: "A quiet thankfulness for all that works for you.",
    duration: "10–30 min",
    guide: "gratitude",
    soundscape: "off",
    music: "temple-rain",
    scene: "night",
    accent: "#b89258",
  },

  // ── RELAX ──
  {
    id: "body-scan",
    category: "relax",
    title: "Body Scan",
    description: "Travel slowly through the body, releasing tension as you go.",
    duration: "3 min",
    guide: "body-scan",
    soundscape: "off",
    music: "temple-rain",
    scene: "ocean",
    accent: "#A855F7",
  },
  {
    id: "stillness-within",
    category: "relax",
    title: "The Stillness Within",
    description: "Rest in the silence between breaths — your true home.",
    duration: "2 min",
    guide: "stillness-within",
    soundscape: "off",
    music: "temple-rain",
    scene: "temple",
    accent: "#A855F7",
  },
  {
    id: "zen-garden",
    category: "relax",
    title: "Zen Garden",
    description: "Water, light wind and a very occasional distant bell.",
    duration: "10 min",
    guide: null,
    soundscape: "zen-garden",
    music: "rainy-kyoto",
    scene: "nature",
    accent: "#A855F7",
  },
  {
    id: "morning-gratitude",
    category: "relax",
    title: "Morning Gratitude",
    description: "Begin the day awake to all that is already working for you.",
    duration: "2 min",
    guide: "morning-gratitude",
    soundscape: "off",
    music: "temple-rain",
    scene: "nature",
    accent: "#A855F7",
  },
  {
    id: "loving-kindness",
    category: "relax",
    title: "Loving-Kindness",
    description: "May you be happy, may you be safe, may you be at ease.",
    duration: "3 min",
    guide: "loving-kindness",
    soundscape: "off",
    music: "temple-rain",
    scene: "temple",
    accent: "#A855F7",
  },
  {
    id: "self-compassion",
    category: "relax",
    title: "Self-Compassion",
    description: "Turn the same kindness you give others toward yourself.",
    duration: "3 min",
    guide: "self-compassion",
    soundscape: "off",
    music: "temple-rain",
    scene: "temple",
    accent: "#A855F7",
  },
  {
    id: "anxiety-release",
    category: "relax",
    title: "Anxiety Release",
    description: "Slow the nervous system down — the storm is passing.",
    duration: "3 min",
    guide: "anxiety-release",
    soundscape: "off",
    music: "temple-rain",
    scene: "rain",
    accent: "#A855F7",
  },
  {
    id: "grounding",
    category: "relax",
    title: "Grounding",
    description: "Return to your body — the earth is holding you.",
    duration: "3 min",
    guide: "grounding",
    soundscape: "off",
    music: "temple-rain",
    scene: "ocean",
    accent: "#A855F7",
  },
  {
    id: "breathwork-box",
    category: "breathe",
    title: "Box Breathing",
    description: "A steady four-four-four-four rhythm to calm the nervous system.",
    duration: "5 min",
    guide: "breathwork-box",
    soundscape: "off",
    music: "temple-rain",
    scene: "breathe",
    accent: "#2DD4BF",
  },
  {
    id: "breath-478",
    category: "breathe",
    title: "4-7-8 Breathing",
    description: "A deeply calming breath — in for four, hold for seven, out for eight.",
    duration: "5 min",
    guide: "breath-478",
    soundscape: "off",
    music: "temple-rain",
    scene: "breathe",
    accent: "#2DD4BF",
  },
  {
    id: "coherent-breathing",
    category: "breathe",
    title: "Coherent Breathing",
    description: "Five seconds in, five seconds out — a steady rhythm that balances heart and mind.",
    duration: "5 min",
    guide: "coherent-breathing",
    soundscape: "off",
    music: "temple-rain",
    scene: "breathe",
    accent: "#2DD4BF",
  },
  {
    id: "alternate-nostril",
    category: "breathe",
    title: "Alternate Nostril Breathing",
    description: "A balancing practice that clears the mind and centers the breath.",
    duration: "5 min",
    guide: "alternate-nostril",
    soundscape: "off",
    music: "temple-rain",
    scene: "breathe",
    accent: "#2DD4BF",
  },
];

export function getExperience(id: string): Experience | undefined {
  return EXPERIENCES.find(e => e.id === id);
}

export function getCategoryExperiences(cat: ExperienceCategory): Experience[] {
  return EXPERIENCES.filter(e => e.category === cat);
}

export function getCategory(cat: ExperienceCategory) {
  return CATEGORIES.find(c => c.id === cat)!;
}
