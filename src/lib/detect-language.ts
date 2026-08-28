/**
 * Detects whether a chat message is Dutch or English so Buddha can reply in
 * the language the user actually wrote in. Heuristic only — good enough for
 * "respond in the language of the reply" (the model's language line does the
 * real work; this just picks which one to ask for).
 */

const NL = new Set([
  "ik", "je", "jij", "het", "een", "niet", "dat", "wat", "hoe", "kan", "wil",
  "graag", "slaap", "slapen", "adem", "ademen", "rust", "moe", "gestrest",
  "angst", "angstig", "focus", "focussen", "gevoel", "voel", "vandaag",
  "vanavond", "morgen", "nacht", "zou", "ben", "mijn", "jouw", "alsjeblieft",
  "help", "bedankt", "dank", "slecht", "goed", "kan", "kunt", "kunnen",
  "weer", "steeds", "maar", "toch", "wel", "even", "gewoon", "doe", "doen",
  "als", "dan", "ook", "nog", "nu", "heel", "erg", "veel", "minder", "meer",
]);

const EN = new Set([
  "i", "you", "the", "a", "an", "not", "that", "what", "how", "can", "want",
  "please", "sleep", "sleeping", "breathe", "breathing", "rest", "tired",
  "stressed", "anxiety", "anxious", "focus", "concentrate", "feel", "feeling",
  "today", "tonight", "tomorrow", "night", "would", "am", "my", "your", "help",
  "thanks", "thank", "bad", "good", "can't", "cannot", "but", "and", "also",
  "just", "very", "so", "much", "more", "less", "really", "need", "to", "for",
  "with", "about", "mind", "thoughts", "overwhelmed",
]);

export function detectLanguage(text: string | null | undefined): "nl" | "en" {
  const words = (text || "")
    .toLowerCase()
    .split(/[^a-zà-ÿ]+/)
    .filter(Boolean);

  let nl = 0;
  let en = 0;
  for (const w of words) {
    if (NL.has(w)) nl++;
    if (EN.has(w)) en++;
  }

  return nl > en ? "nl" : "en";
}
