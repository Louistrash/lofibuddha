/**
 * Daily affirmations — a rotating library of short, warm statements.
 *
 * Pre-recorded (not realtime), so every listen is free. The day's affirmation
 * is chosen deterministically from the date, so it is stable for everyone on
 * the same day and cycles through the whole library.
 */

export type Affirmation = {
  id: string;
  text: string;
  theme: string;
};

export const AFFIRMATIONS: Affirmation[] = [
  { id: "calm-01", text: "I am allowed to slow down. Nothing is chasing me.", theme: "Calm" },
  { id: "calm-02", text: "This moment is enough. I do not need to fix it.", theme: "Calm" },
  { id: "calm-03", text: "My breath is an anchor. I return to it, again and again.", theme: "Calm" },

  { id: "strength-01", text: "I have already survived everything that brought me here.", theme: "Strength" },
  { id: "strength-02", text: "I can do hard things, one small step at a time.", theme: "Strength" },
  { id: "strength-03", text: "I am more resilient than the worry tells me I am.", theme: "Strength" },

  { id: "compassion-01", text: "I speak to myself like someone I love.", theme: "Self-compassion" },
  { id: "compassion-02", text: "I am doing my best, and my best is enough.", theme: "Self-compassion" },
  { id: "compassion-03", text: "I do not have to be perfect to be worthy of rest.", theme: "Self-compassion" },

  { id: "focus-01", text: "One thing at a time. I give it my full attention.", theme: "Focus" },
  { id: "focus-02", text: "My attention is mine to place. I choose where it rests.", theme: "Focus" },
  { id: "focus-03", text: "I let go of distraction, and return to what matters.", theme: "Focus" },

  { id: "letting-go-01", text: "I release what I cannot control, and soften into the present.", theme: "Letting go" },
  { id: "letting-go-02", text: "I do not have to carry yesterday into today.", theme: "Letting go" },
  { id: "letting-go-03", text: "What is for me will not pass me by. I can trust the unfolding.", theme: "Letting go" },

  { id: "gratitude-01", text: "There is something good here, even now. I notice it.", theme: "Gratitude" },
  { id: "gratitude-02", text: "I am grateful for this breath, and the one after it.", theme: "Gratitude" },
  { id: "gratitude-03", text: "Small moments of peace are enough to be thankful for.", theme: "Gratitude" },

  { id: "presence-01", text: "I am here, in this body, in this moment. Fully.", theme: "Presence" },
  { id: "presence-02", text: "The past is memory. The future is a guess. Only now is real.", theme: "Presence" },
  { id: "presence-03", text: "I arrive wherever I am, without rushing to be elsewhere.", theme: "Presence" },

  { id: "confidence-01", text: "I trust myself to figure things out as I go.", theme: "Confidence" },
  { id: "confidence-02", text: "My voice matters. My needs matter.", theme: "Confidence" },
  { id: "confidence-03", text: "I am allowed to take up space, exactly as I am.", theme: "Confidence" },

  { id: "breath-01", text: "Inhale, I receive. Exhale, I release.", theme: "Breath" },
  { id: "breath-02", text: "With every out-breath, a little more tension leaves me.", theme: "Breath" },
  { id: "breath-03", text: "My breath is slow, and my body follows it into ease.", theme: "Breath" },

  { id: "rest-01", text: "Rest is not a reward. It is my birthright.", theme: "Rest" },
  { id: "rest-02", text: "I have done enough for today. I can lay it all down.", theme: "Rest" },
  { id: "rest-03", text: "The night will hold me. I do not have to hold myself.", theme: "Rest" },
];

/**
 * Deterministic "affirmation of the day" — same result for everyone on the same
 * UTC day, and it cycles through the entire library.
 */
export function affirmationOfTheDay(date: Date = new Date()): Affirmation {
  const dayIndex = Math.floor(date.getTime() / 86400000);
  return AFFIRMATIONS[((dayIndex % AFFIRMATIONS.length) + AFFIRMATIONS.length) % AFFIRMATIONS.length];
}
