import { palette } from "./tokens";

export type SceneTheme = {
  id: string;
  name: string;
  /** Button and control gradient, light stop first. */
  gradient: [string, string];
  /** Flat colour for progress bars, chips and icons. */
  accent: string;
  /** Warm or cool wash behind the mandala. */
  wash: string;
  /** Mandala line colours, from outer ring inwards. */
  mandala: [string, string, string];
  /** Text on top of the gradient. */
  onGradient: string;
};

export const SCENE_THEMES: SceneTheme[] = [
  {
    id: "copper",
    name: "Copper",
    gradient: ["#C9843F", "#6E3617"],
    accent: "#D9954E",
    wash: "#7A431F",
    mandala: ["#D9954E", "#A5642C", "#F0C48A"],
    onGradient: "#1A0E06",
  },
  {
    id: "ember",
    name: "Ember",
    gradient: ["#E0761F", "#6B2708"],
    accent: "#E8892F",
    wash: "#7C3A0B",
    mandala: ["#E8892F", "#A3520F", "#F7BB78"],
    onGradient: "#1B0A02",
  },
  {
    id: "plum",
    name: "Plum",
    gradient: ["#7B4397", "#2E1140"],
    accent: "#9B62B8",
    wash: "#3D1A52",
    mandala: ["#9B62B8", "#6A3A85", "#D2A9E5"],
    onGradient: "#12061A",
  },
  {
    id: "gold",
    name: "Gold",
    gradient: [palette.goldBright, palette.goldDeep],
    accent: palette.gold,
    wash: palette.goldDeep,
    mandala: [palette.gold, palette.goldDeep, palette.goldBright],
    onGradient: palette.ink,
  },
  {
    id: "midnight",
    name: "Midnight",
    gradient: ["#4B5BC4", "#171B3D"],
    accent: "#6C74FF",
    wash: "#232A5C",
    mandala: ["#7E86FF", "#3F478F", "#B9BEFF"],
    onGradient: "#080A1A",
  },
];

export const DEFAULT_SCENE_THEME = SCENE_THEMES[0];

export function getSceneTheme(id: string | null | undefined): SceneTheme {
  return SCENE_THEMES.find((t) => t.id === id) ?? DEFAULT_SCENE_THEME;
}

// Categorie-themes: open een kaart in DEZELFDE kleur als zijn categorie-LED-accent.
export const CATEGORY_THEMES: Record<string, SceneTheme> = {
  focus: { id: "focus", name: "Focus", gradient: ["#E8A33D", "#7A4A12"], accent: "#E8A33D", wash: "#7A4A12", mandala: ["#E8A33D", "#B5761F", "#F7CE85"], onGradient: "#1A1004" },
  breathe: { id: "breathe", name: "Breathe", gradient: ["#2DD4BF", "#0B5A55"], accent: "#2DD4BF", wash: "#0B5A55", mandala: ["#2DD4BF", "#12867A", "#8FE9DD"], onGradient: "#041614" },
  sleep: { id: "sleep", name: "Sleep", gradient: ["#b89258", "#4A3416"], accent: "#b89258", wash: "#4A3416", mandala: ["#b89258", "#8A6A36", "#E3CDA2"], onGradient: "#1A1206" },
  relax: { id: "relax", name: "Relax", gradient: ["#A855F7", "#3B1663"], accent: "#A855F7", wash: "#3B1663", mandala: ["#A855F7", "#7C3AED", "#D8B4FE"], onGradient: "#14071F" },
};

export function getCategoryTheme(category: string | null | undefined): SceneTheme | null {
  return category ? CATEGORY_THEMES[category] ?? null : null;
}
