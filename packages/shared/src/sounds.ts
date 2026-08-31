// Sound library + mixer presets for LofiBuddha.

export interface Sound {
  slug: string;
  name: string;
  description: string;
  category: string;
  // ElevenLabs sound-generation prompt
  prompt: string;
}

export interface Mode {
  slug: string;
  name: string;
  description: string;
  // preset channel mix: sound slug -> volume (0-1)
  mix: Record<string, number>;
}

export const SOUNDS: Sound[] = [
  { slug: "flowing-water", name: "Flowing Water", description: "Soft stream, small waterfall, gentle babbling water.", category: "Water", prompt: "Clean gentle flowing stream water, soft babbling brook, clear close-mic recording, no music, no reverb, calm and continuous" },
  { slug: "gentle-rain", name: "Gentle Rain", description: "Very soft, gentle rain — light patter, deeply calming.", category: "Water", prompt: "Soft gentle rain, light and calming, steady patter on leaves, smooth continuous rainfall, clearly audible and soothing, no thunder, no wind, no hard drops, no distortion, pure clean gentle rain, no music" },
  { slug: "ocean-waves", name: "Soft Ocean", description: "Soft ocean waves gently rolling over the beach.", category: "Water", prompt: "Very soft ocean waves gently rolling onto a sandy beach, slow calm rhythm, soft foam, whisper-quiet surf, no harsh crashing, no wind, no music, deeply relaxing and even" },
  { slug: "bamboo-garden", name: "Bamboo Garden", description: "Soft wind, bamboo and subtle water.", category: "Nature", prompt: "Bamboo garden, soft wind through bamboo stalks, subtle trickling water, clean and clear, no music, calm" },
  { slug: "zen-garden", name: "Zen Garden", description: "Water, light wind and a very occasional distant bell.", category: "Nature", prompt: "Zen garden, quiet clear water, light wind, a very occasional distant temple bell, clean and sparse, no music" },
  { slug: "fireplace", name: "Fireplace", description: "Slowly crackling fire.", category: "Warmth", prompt: "Gentle fireplace ambience, soft slow crackle, warm and cozy, no loud pops, no music, continuous and even" },
  { slug: "mountain-wind", name: "Mountain Wind", description: "Soft, wide wind without hard gusts.", category: "Wind", prompt: "Clean soft wide mountain wind, gentle breeze, no harsh gusts, clear and airy, no music" },
  { slug: "temple-ambience", name: "Temple Ambience", description: "Very subtle space, distant gong or singing bowl.", category: "Spiritual", prompt: "Temple ambience, very subtle reverberant space, distant gong and singing bowl, clean sparse and sacred, no music" },
  { slug: "brown-noise", name: "Brown Noise", description: "Warm and low, great for focus and sleep.", category: "Noise", prompt: "Pure smooth brown noise, deep low continuous rumble, no crackle, no clicking, no artifacts, steady and even" },
  { slug: "pink-noise", name: "Pink Noise", description: "Softer and more natural than white noise.", category: "Noise", prompt: "Pure smooth pink noise, soft continuous hiss, no crackle, no static, gentle and even" },
  { slug: "deep-space", name: "Deep Space", description: "Near-abstract, very soft ambient drone.", category: "Ambient", prompt: "Smooth deep ambient pad, soft low continuous drone, slowly evolving, no melody, no glitches, no static" },
  { slug: "lo-fi-meditation", name: "Lo-fi Meditation", description: "Warm pads, minimal piano, no drums.", category: "Music", prompt: "Soft warm ambient pad with gentle piano notes, slow and calming, no percussion, no drums, clean smooth production, no artifacts" },
  { slug: "singing-bowls", name: "Singing Bowls", description: "Long resonance, used sparingly.", category: "Spiritual", prompt: "Clean singing bowls, long resonant tones, slow decay, sparse and meditative, clear recording" },
];

export const MODES: Mode[] = [
  {
    slug: "meditate",
    name: "Meditate",
    description: "Water, bowls and temple — for inner stillness.",
    mix: { "flowing-water": 0.6, "zen-garden": 0.35, "singing-bowls": 0.2, "temple-ambience": 0.15 },
  },
  {
    slug: "focus",
    name: "Focus",
    description: "Clean brown + pink noise — for deep work.",
    mix: { "brown-noise": 0.6, "pink-noise": 0.3 },
  },
  {
    slug: "sleep",
    name: "Sleep",
    description: "Soft ocean, night and fire — to drift off.",
    mix: { "ocean-waves": 0.55, "gentle-rain": 0.3, "fireplace": 0.2 },
  },
];
