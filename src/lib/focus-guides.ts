// Guided focus sessions — short voice guides that settle you into deep work.
// Same structure as meditations.ts (segments + pauses), rendered via ElevenLabs.

export interface FocusGuideSegment {
  text: string;
  pauseAfter: number; // seconds of silence after this segment
}

export interface FocusGuide {
  id: string;
  title: string;
  description: string;
  duration: string;
  segments: FocusGuideSegment[];
}

export const FOCUS_GUIDES: FocusGuide[] = [
  {
    id: "focus-anchor",
    title: "Focus Anchor",
    description: "One task, full attention — settle in and begin.",
    duration: "2 min",
    segments: [
      { text: "Close your eyes. Take one slow breath in, and one long breath out. This is your time to work.", pauseAfter: 8 },
      { text: "Choose one single task. Not everything. Just one. Give it your full attention.", pauseAfter: 12 },
      { text: "When your mind wanders — and it will — simply notice, and return. No judgment. Just return.", pauseAfter: 14 },
      { text: "You are here now. The work is simple. Open your eyes and begin.", pauseAfter: 6 },
    ],
  },
  {
    id: "deep-work",
    title: "Deep Work",
    description: "Your attention as a beam of light — steady and kind.",
    duration: "2 min",
    segments: [
      { text: "Settle in. Your body is still, your hands are ready. One task, fully yours.", pauseAfter: 8 },
      { text: "Think of your attention as a beam of light. Point it at your work. When it drifts, bring it back — gently, like a friend.", pauseAfter: 14 },
      { text: "The noise of the world can wait. This moment is for depth. Let the surface be quiet.", pauseAfter: 12 },
      { text: "Breathe in focus. Breathe out distraction. Stay with the work.", pauseAfter: 6 },
    ],
  },
  {
    id: "mindful-reset",
    title: "Mindful Reset",
    description: "Drop the previous task — start fresh, quiet and steady.",
    duration: "2 min",
    segments: [
      { text: "Pause. Take three slow breaths. Feel your shoulders drop with each one.", pauseAfter: 10 },
      { text: "Let go of what just happened. It is done. This moment is fresh.", pauseAfter: 12 },
      { text: "Notice your body — relaxed and ready. Notice your mind — clear and open.", pauseAfter: 12 },
      { text: "Now begin again. Quietly. Steadily. One step at a time.", pauseAfter: 6 },
    ],
  },
  {
    id: "one-point-focus",
    title: "One-Point Focus",
    description: "Fix your attention on a single point — the mind grows quiet.",
    duration: "2 min",
    segments: [
      { text: "Find a single point of focus — the tip of your nose, your breath, or the edge of your desk. Let it hold your attention.", pauseAfter: 10 },
      { text: "Thoughts will pass like clouds. You are not the clouds — you are the sky that watches them.", pauseAfter: 12 },
      { text: "Each time you notice you have drifted, smile inwardly, and return to your point of focus.", pauseAfter: 12 },
      { text: "One point. One mind. One moment. Rest there, and begin.", pauseAfter: 6 },
    ],
  },
  {
    id: "the-listener",
    title: "The Listener",
    description: "Awareness through sound — steady, open, and calm.",
    duration: "2 min",
    segments: [
      { text: "Close your eyes and become a listener. Let the sounds around you come to you — nothing to do, nothing to fix.", pauseAfter: 10 },
      { text: "Notice the nearest sound, then the furthest. Let your hearing open like a wide, still lake.", pauseAfter: 12 },
      { text: "When a thought pulls you away, hear it too — then let it go, and return to listening.", pauseAfter: 12 },
      { text: "You are awareness itself. Quiet, open, and completely here.", pauseAfter: 6 },
    ],
  },
];
