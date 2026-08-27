import { accentByCategory } from "@/src/theme/tokens";

export type Journey = "focus" | "breathe" | "sleep" | "relax";

export type JourneySuggestion = {
  journey: Journey;
  title: string;
  tagline: string;
  script: string;
  accent: string;
  href: string;
};

/**
 * Intent lives on the client because only the app knows its own routes. The
 * server's deepLink still points at the pre-Expo pages (/breathe, /mindfulness),
 * which no longer exist here, so its url is treated as a hint, not a target.
 */
const KEYWORDS: Record<Journey, string[]> = {
  breathe: [
    "breath", "breathe", "breathing", "inhale", "exhale", "anxious", "anxiety",
    "panic", "nervous", "overwhelmed", "stressed", "stress", "tight chest",
    "hyperventilat", "calm down", "adem",
  ],
  sleep: [
    "sleep", "sleeping", "insomnia", "awake", "bed", "bedtime", "night",
    "restless", "tired", "exhausted", "cannot rest", "can't rest", "slapen",
    "nightmare", "wind down",
  ],
  focus: [
    "focus", "concentrate", "concentration", "distract", "procrastinat",
    "deep work", "study", "studying", "work", "attention", "scattered",
    "productiv", "focussen",
  ],
  relax: [
    "relax", "unwind", "rest", "let go", "release", "tension", "soften",
    "stillness", "quiet", "peace", "ontspann", "slow down", "settle",
  ],
};

const COPY: Record<Journey, { title: string; tagline: string; script: string }> = {
  focus: { title: "Focus", tagline: "deep work, guided", script: "एकाग्रता" },
  breathe: { title: "Breathe", tagline: "calm the nervous system", script: "श्वास" },
  sleep: { title: "Sleep", tagline: "let the day dissolve", script: "निद्रा" },
  relax: { title: "Relax", tagline: "unwind, release, rest", script: "विश्राम" },
};

/**
 * Scores every journey and returns the strongest match, so a message mentioning
 * both "stressed" and "sleep" resolves to whichever it leans on, instead of
 * whichever happens to be first in the list.
 */
export function detectJourney(...texts: (string | null | undefined)[]): Journey | null {
  const haystack = texts.filter(Boolean).join(" ").toLowerCase();
  if (!haystack.trim()) return null;

  let best: Journey | null = null;
  let bestScore = 0;

  for (const journey of Object.keys(KEYWORDS) as Journey[]) {
    const score = KEYWORDS[journey].reduce(
      (n, k) => (haystack.includes(k) ? n + 1 : n),
      0
    );
    if (score > bestScore) {
      bestScore = score;
      best = journey;
    }
  }

  return best;
}

export function suggestionFor(journey: Journey): JourneySuggestion {
  const copy = COPY[journey];
  return {
    journey,
    ...copy,
    accent: accentByCategory[journey],
    href: `/category/${journey}`,
  };
}

/** Opening prompts, shown before the first message. */
export const OPENING_PROMPTS = [
  "My mind won't slow down",
  "Help me breathe",
  "I can't sleep",
  "I need to focus",
  "I feel overwhelmed",
];

/**
 * Follow-ups keep the conversation moving without the user having to invent a
 * question. They shift with the detected intent so they stay relevant.
 */
export function followUpsFor(journey: Journey | null): string[] {
  switch (journey) {
    case "breathe":
      return ["Guide me through one round", "Why does this help?", "Something shorter"];
    case "sleep":
      return ["Talk me down to sleep", "My thoughts keep racing", "Something without a voice"];
    case "focus":
      return ["Set me up for deep work", "I keep getting distracted", "How long should I sit?"];
    case "relax":
      return ["Help me let go", "I carry tension in my body", "Just some quiet sound"];
    default:
      return ["Tell me more", "What should I practise today?", "I'd rather just listen"];
  }
}
