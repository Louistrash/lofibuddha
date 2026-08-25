// Gedeelde YouTube titel/description/tags generator.
// Rijke, spirituele "yoga Buddha" mindfulness-toon — bewust niet mager/kort.

export interface YouTubeMeta {
  title: string;
  description: string;
  tags: string[];
}

/** "ancient-temple" / "temple-01-jungle" / "promo-moon-chant.mp4" → "Ancient Temple" */
export function prettyName(raw: string): string {
  const base = raw
    .replace(/\.mp4$/, "")
    .replace(/^.*\//, "")
    .replace(/-\d{10,}$/, "") // strip trailing timestamp suffixes like -1780083958167
    .replace(/^promo-/, "")
    .replace(/^(tt|v\d+)-/, "")
    .trim();
  const words = base
    .split(/[-_]+/)
    .filter(Boolean)
    .map((w) => (/^\d+$/.test(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)));
  return words.join(" ") || "Lofi Buddha";
}

interface Theme {
  deeplink: string;
  noun: string;      // "breathwork" / "sleep" / "focus" / "meditation" / "relaxation"
  opening: string;   // spirituele openingszin na "Close your eyes and let go."
  emoji: string;
}

function detectTheme(text: string): Theme {
  const c = text.toLowerCase();
  if (/(breath|breathe|pranayama|box|inhale|exhale)/.test(c))
    return {
      deeplink: "https://lofibuddha.com/mindfulness/breathe",
      noun: "breathwork",
      opening: "Feel the rise and fall of your breath, and return to the quiet rhythm of your own body.",
      emoji: "🌬️",
    };
  if (/(sleep|drift|insomnia|rest|unwind|evening|night|dream)/.test(c))
    return {
      deeplink: "https://lofibuddha.com/mindfulness/sleep",
      noun: "sleep",
      opening: "Let the day dissolve behind you and drift gently into deep, restful sleep.",
      emoji: "🌙",
    };
  if (/(focus|study|work|deep|concentr|productiv|flow|lo-?fi|beat)/.test(c))
    return {
      deeplink: "https://lofibuddha.com/mindfulness/focus",
      noun: "focus",
      opening: "Settle into stillness and let your mind find its natural, effortless focus.",
      emoji: "🎧",
    };
  if (/(relax|release|body ?scan|ocean|wave|rain|water|lake|zen|calm)/.test(c))
    return {
      deeplink: "https://lofibuddha.com/mindfulness/relax",
      noun: "relaxation",
      opening: "Release the tension you have been carrying and sink into softness.",
      emoji: "🌊",
    };
  if (/(temple|chant|mantra|monk|sacred|buddha|himalay|cosmic|milky|star|void|lotus|jungle|cave|desert|sakura|bamboo|dragon|waterfall|frost|autumn|mirror|firefl)/.test(c))
    return {
      deeplink: "https://lofibuddha.com/mindfulness",
      noun: "temple meditation",
      opening: "Ancient stillness meets the present moment — listen, and let the sacred quiet hold you.",
      emoji: "🕉️",
    };
  return {
    deeplink: "https://lofibuddha.com/mindfulness",
    noun: "meditation",
    opening: "Arrive here fully, exactly as you are, and let the noise of the world fall away.",
    emoji: "🧘",
  };
}

export function buildYouTubeMeta(raw: string): YouTubeMeta {
  const pretty = prettyName(raw);
  const theme = detectTheme(pretty);

  const title = `${pretty} | ${titleCase(theme.noun)} & Calm — Lofi Buddha`;

  const description = [
    `${theme.emoji} ${pretty} — ${titleCase(theme.noun)} & Deep Calm`,
    "",
    "Close your eyes and let go. " + theme.opening,
    "",
    `This ${theme.noun} journey from Lofi Buddha carries you into a space of quiet presence — where the breath slows, the mind settles, and the heart opens. No words to follow, no effort required. Just soft sound, warm light, and the gentle pull of the present moment.`,
    "",
    "🧘 Perfect for:",
    "• Meditation & mindfulness",
    "• Yoga, breathwork & stillness",
    "• Deep focus, or drifting into sleep",
    "",
    "🎧 Find more calm:",
    "→ " + theme.deeplink,
    "→ Chat with Buddha: https://lofibuddha.com/chat",
    "",
    "May you find a moment of peace today. 🙏",
    "",
    "#lofi #meditation #mindfulness #yoga #zen #buddha #calm #relaxation #lofibuddha",
  ].join("\n");

  const tags = [
    "lofi",
    "meditation",
    "mindfulness",
    "yoga",
    "zen",
    "buddha",
    theme.noun.replace(/\s+/g, ""),
    "calm",
    "lofibuddha",
  ];

  return { title, description, tags };
}

function titleCase(s: string): string {
  return s
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
