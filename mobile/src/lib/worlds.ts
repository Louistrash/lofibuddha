export const WORLDS = [
  {
    id: "ocean-horizon",
    title: "Ocean Horizon",
    subtitle: "Endless water · soft light · deep breath",
    script: "सागर",
    accent: "#6C74FF",
    theme: "midnight",
    sound: "ocean-waves",
    music: "ocean-temple",
  },
  {
    id: "rainy-tokyo",
    title: "Rainy Tokyo",
    subtitle: "Neon rain · quiet streets · night calm",
    script: "雨",
    accent: "#9B62B8",
    theme: "plum",
    sound: "gentle-rain",
    music: "rainy-kyoto",
  },
] as const;

export type World = (typeof WORLDS)[number];

export function getWorld(id: string): World {
  return WORLDS.find((w) => w.id === id) ?? WORLDS[0];
}

/** Time-of-day greeting used across the dashboard. */
export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 6) return "Still awake";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

/** Which journey to surface first, based on the hour. */
export function suggestedCategory(date = new Date()): "focus" | "breathe" | "sleep" | "relax" {
  const h = date.getHours();
  if (h < 11) return "focus";
  if (h < 15) return "breathe";
  if (h < 21) return "relax";
  return "sleep";
}
