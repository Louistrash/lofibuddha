/**
 * Premium workshops — multi-session guided series.
 *
 * Same shape as meditations.ts so the existing player and generation script
 * pick them up unchanged. Each session targets ~20 minutes of voice + pauses.
 */

export type Workshop = {
  id: string;
  title: string;
  description: string;
  duration: string;
  theme: string;
  category: "focus" | "breathe" | "sleep" | "relax";
  background: string;
  /** Seconds of silence after the chime, before the voice begins — lets the
   *  user put the device down and settle in. */
  introPause?: number;
  segments: { text: string; pauseAfter: number }[];
};

export const WORKSHOPS: Workshop[] = [
  {
    id: "deep-sleep-reset-1",
    title: "Deep Sleep Reset — Night 1: Letting Go",
    description:
      "The first night of the Deep Sleep Reset. Release the weight of the day and let the body sink toward rest.",
    duration: "20 min",
    theme: "Deep Sleep Reset",
    category: "sleep",
    background: "ocean-waves",
    introPause: 25,
    segments: [
      {
        text: "Welcome. This is the first night of your deep sleep reset. Find a comfortable position, lying down if you can. Let your arms rest at your sides, palms open. Allow the room to be as dark and quiet as it needs to be. There is nothing you need to fix, nothing you need to hold. This time belongs only to you.",
        pauseAfter: 14,
      },
      {
        text: "Take one slow breath in through the nose. Let it travel all the way down into the belly. And now breathe out, a little longer than the breath in. Feel the breath soften the muscles around your eyes, your jaw, your brow. You are allowed to arrive slowly. There is no rush.",
        pauseAfter: 16,
      },
      {
        text: "Now bring a gentle attention to the weight of your body. Feel where it meets the bed, the floor, the surface beneath you. Notice the places where you are being held. The back of your head. Your shoulder blades. Your hips. Your heels. You do not need to hold yourself up tonight. Let the ground take the weight.",
        pauseAfter: 18,
      },
      {
        text: "Soften your face. Let the forehead go smooth. Let the space between your eyebrows release. Unclench the jaw, and let the tongue rest gently behind the lower teeth. Let the lips part slightly. With every breath out, a little more of the day leaves you.",
        pauseAfter: 14,
      },
      {
        text: "Move your attention down to your neck and your shoulders. If there is any tightness here, do not fight it. Simply breathe into it. Imagine the breath flowing down into the shoulders like warm water, and as you exhale, the shoulders melt a little further into the bed.",
        pauseAfter: 16,
      },
      {
        text: "Now your arms, heavy and warm. Your hands, soft and still. Feel the gentle heaviness of them as they rest. Then your chest and your belly, rising and falling without any effort. You are not doing the breathing. The breath is doing you. Let it.",
        pauseAfter: 16,
      },
      {
        text: "Let your awareness travel down through your hips, heavy and sinking. Your thighs, your knees, your calves. Your ankles, and at last your feet, growing distant and warm. Your whole body is now a single field of softness, quiet and still.",
        pauseAfter: 18,
      },
      {
        text: "If a thought appears, let it be like a cloud passing across a wide, dark sky. You do not need to chase it, and you do not need to push it away. You simply watch it drift, and then return your attention to the breath, moving slow and steady in the dark.",
        pauseAfter: 20,
      },
      {
        text: "Now I want you to picture a place where you have felt completely safe. It may be a room from childhood, a quiet shore, a warm garden at dusk. See it softly, in gentle colours. Hear it, the way it sounds when everything else has gone quiet. You are there now, and you are safe.",
        pauseAfter: 18,
      },
      {
        text: "In this place, there is a soft surface waiting for you — a bed, a blanket in the grass, the warm sand. You lie down upon it, and it receives you completely. It is made for exactly your shape. Sink into it. Let it hold every part of you, without you having to try.",
        pauseAfter: 18,
      },
      {
        text: "Listen to the sound around you. A quiet wave in the distance, or the slow rustle of leaves, or a silence so deep it hums. Let that sound become the rhythm of your breath. Each wave, each whisper, each rise and fall, drawing you deeper and deeper into rest.",
        pauseAfter: 20,
      },
      {
        text: "With every breath out, you are letting go of something you no longer need to carry. The conversations that circled and circled. The list of things for tomorrow. The small tensions you have held in your body all day. One by one, they loosen, and they float away, into the dark.",
        pauseAfter: 20,
      },
      {
        text: "There is nothing more to do. No next step, no place to be. The day has already been lived, and it is complete. You have done enough. You have been enough. You can lay down the weight now, and let the night take over.",
        pauseAfter: 22,
      },
      {
        text: "Feel how heavy the body has become, and how light the mind. The two are drifting apart, gently. The body is a warm, still thing, resting in the earth. The mind is a soft light, rising. Sleep is not something you need to find. It is finding you, slowly, from the inside.",
        pauseAfter: 22,
      },
      {
        text: "If you are still awake, that is perfectly fine. There is no test here, and no failing. Simply remain in this quiet place, breathing, listening, letting go. You are already exactly where you need to be.",
        pauseAfter: 24,
      },
      {
        text: "I will be quiet now, and leave you with the sound, and the breath, and the dark. Stay here as long as you like. Let yourself drift. Goodnight.",
        pauseAfter: 0,
      },
    ],
  },
];
