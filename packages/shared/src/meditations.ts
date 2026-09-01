// Guided meditations structured as segments with pauses (Sadhguru style).
// Each segment is a short voice block followed by silence so the music can breathe.

export interface MeditationSegment {
  text: string;
  pauseAfter: number; // seconds of silence after this segment
}

export interface Meditation {
  id: string;
  title: string;
  description: string;
  duration: string;
  theme: string;
  background: string; // background sound slug
  /** Seconds of silence after the chime, before the voice begins — lets the
   *  user settle in / put the device down. */
  introPause?: number;
  /** Skip the 10s chime entirely (e.g. voice must start at an exact time). */
  noChime?: boolean;
  segments: MeditationSegment[];
}

export const MEDITATIONS: Meditation[] = [
  {
    id: "ocean-breath",
    title: "Ocean Breath",
    description: "Breathe with the tide — a slow return to the deep, calm water inside you.",
    duration: "6 min",
    theme: "Breath",
    background: "off",
    introPause: 20,
    segments: [
      { text: "Come into stillness. Let your body settle, like a stone returning to the sand. There is a shore, and there is you. The tide is already breathing.", pauseAfter: 14 },
      { text: "Close your eyes and see the sea. Endless, patient, older than the sky. The water moves in slow silver breaths, in and out, without effort.", pauseAfter: 16 },
      { text: "Now let your breath become the tide. Breathe in as the wave rises. Breathe out as it draws back, taking the whole shoreline with it.", pauseAfter: 18 },
      { text: "With each out-breath, let something go. A thought. A tension. A weight you have been carrying without ever deciding to.", pauseAfter: 18 },
      { text: "You are not swimming. You are floating. Held by water that has cradled life since the very beginning. You do not need to try.", pauseAfter: 20 },
      { text: "Beneath you, the deep is calm. The surface may ripple, but the deep never moves. Let yourself sink, softly, into that quiet.", pauseAfter: 20 },
      { text: "The waves soften. The tide slows. And slowly, gently, you become the silence between them.", pauseAfter: 18 },
      { text: "When you are ready, hear the water once more. Feel the ground beneath you. And carry this deep calm back with you, into the rest of your day.", pauseAfter: 12 },
    ],
  },
  {
    id: "stillness-within",
    title: "The Stillness Within",
    description: "Rest in the silence between breaths — your true home.",
    duration: "2 min",
    theme: "Stillness",
    background: "off",
    introPause: 15,
    segments: [
      { text: "Sit comfortably. Close your eyes. There is nowhere to go, and nothing to do. Just sit.", pauseAfter: 8 },
      { text: "Feel the weight of your body, settling into the earth. Now bring your attention to your breath. Do not change it. Just watch it.", pauseAfter: 12 },
      { text: "The breath flows in, and out, on its own. You are not breathing. Existence is breathing through you.", pauseAfter: 15 },
      { text: "Between the in-breath and the out-breath, there is a moment of absolute stillness. Rest there. This is your true home.", pauseAfter: 10 },
    ],
  },
  {
    id: "breath-of-life",
    title: "Breath of Life",
    description: "Notice the breath — the most intimate gift of existence.",
    duration: "2 min",
    theme: "Breath",
    background: "off",
    segments: [
      { text: "Close your eyes. Turn your attention inward. The breath is the most intimate thing you have.", pauseAfter: 8 },
      { text: "Without it, you cannot be here for even a moment. Yet you never notice it. Now, notice it.", pauseAfter: 12 },
      { text: "Feel the cool air entering your nostrils. Feel the warm air leaving. Every breath is a gift. You did not earn it. It is simply given.", pauseAfter: 15 },
      { text: "Breathe in this gift. Breathe out everything you are holding. Let the breath wash through you, like a gentle river.", pauseAfter: 10 },
    ],
  },
  {
    id: "letting-go",
    title: "Letting Go",
    description: "Release every weight — only this moment is real.",
    duration: "2 min",
    theme: "Release",
    background: "off",
    introPause: 15,
    segments: [
      { text: "Sit quietly. Close your eyes. Notice where you are holding tension. In your shoulders. In your jaw. In your belly.", pauseAfter: 8 },
      { text: "You have been carrying so much. Thoughts. Worries. The past. But look. The past is only memory. The future is only imagination.", pauseAfter: 12 },
      { text: "Neither exists right now. Only this moment is real. And in this moment, there is nothing to carry.", pauseAfter: 15 },
      { text: "Let the shoulders drop. Let the jaw soften. Let every weight fall away, like leaves falling from a tree. Existence is holding you.", pauseAfter: 10 },
    ],
  },
  {
    id: "gratitude",
    title: "Gratitude",
    description: "A quiet thankfulness for all that works for you.",
    duration: "2 min",
    theme: "Gratitude",
    background: "off",
    segments: [
      { text: "Close your eyes. Sit with a sense of ease. Think of everything that had to happen for you to be here, in this moment.", pauseAfter: 8 },
      { text: "The sun that gives warmth. The air that fills your lungs. The heart that beats without your effort.", pauseAfter: 12 },
      { text: "A thousand things are working for you right now, without you even asking. When was the last time you said thank you? Not with words. But with the very way you are.", pauseAfter: 15 },
      { text: "Just sit, and feel a quiet gratitude, like a soft glow in your chest. This gratitude is not a thought. It is a way of being. Let it fill you completely.", pauseAfter: 10 },
    ],
  },
  {
    id: "the-witness",
    title: "The Witness",
    description: "Watch your thoughts — you are the sky, not the clouds.",
    duration: "2 min",
    theme: "Awareness",
    background: "off",
    introPause: 15,
    segments: [
      { text: "Close your eyes. Settle into stillness. Now, watch your thoughts. Do not stop them. Do not follow them. Just watch.", pauseAfter: 8 },
      { text: "Thoughts come, like clouds drifting across the sky. They are not you. You are the sky.", pauseAfter: 12 },
      { text: "The sky is never disturbed by the clouds. It simply watches. So you watch. Feelings arise and pass. Sensations come and go.", pauseAfter: 15 },
      { text: "You are the one who is aware of them all. That awareness. Still. Silent. Unchanging. That is who you really are. Rest there, as the witness.", pauseAfter: 10 },
    ],
  },
  {
    id: "body-scan",
    title: "Body Scan",
    description: "Travel slowly through the body, releasing tension as you go.",
    duration: "3 min",
    theme: "Relax",
    background: "off",
    introPause: 15,
    segments: [
      { text: "Lie down, or sit comfortably. Close your eyes. Let your body be completely supported by the ground beneath you.", pauseAfter: 10 },
      { text: "Bring your attention to your feet. Feel the soles of your feet, the toes, the ankles. Let them soften and sink into the ground.", pauseAfter: 14 },
      { text: "Now let your awareness travel up to your legs. Calves, knees, thighs. Feel any tension you have been holding, and let it melt away with each breath.", pauseAfter: 16 },
      { text: "Move to your belly and your chest. Feel the gentle rise and fall of each breath, with no effort at all. The body knows how to breathe. Let it.", pauseAfter: 16 },
      { text: "Travel up through your shoulders, your arms, your hands. Let the shoulders drop. Let the fingers uncurl, soft and open.", pauseAfter: 14 },
      { text: "Finally, bring your awareness to your neck, your jaw, your eyes, your forehead. Soften every part of your face. Your whole body is now soft, warm and at ease. Rest here, in this quiet wholeness.", pauseAfter: 12 },
    ],
  },
  {
    id: "deep-sleep",
    title: "Drift Into Sleep",
    description: "Let go of the day and sink into deep, restful sleep.",
    duration: "2 min",
    theme: "Sleep",
    background: "off",
    introPause: 15,
    segments: [
      { text: "Close your eyes. Let the day fall away. You have done enough. Now it is time to rest.", pauseAfter: 10 },
      { text: "Feel your body growing heavy. Your head sinking into the pillow. Your shoulders softening. Your jaw relaxing.", pauseAfter: 14 },
      { text: "There is nothing to solve tonight. Nothing to fix. The world can wait until tomorrow.", pauseAfter: 16 },
      { text: "With each breath, sink a little deeper. Down, down, into a soft, dark stillness. Sleep is coming to you now, like a gentle tide. Let it carry you.", pauseAfter: 12 },
    ],
  },
  {
    id: "morning-gratitude",
    title: "Morning Gratitude",
    description: "Begin the day awake to all that is already working for you.",
    duration: "2 min",
    theme: "Morning",
    background: "off",
    segments: [
      { text: "You are awake. The night has passed, and you are here, in a brand new day. Before anything else, just sit with that. You are here.", pauseAfter: 8 },
      { text: "The sun is rising, whether you see it or not. The earth is turning, the air is moving, your heart is beating. So much is working for you, without you even asking.", pauseAfter: 12 },
      { text: "Think of one thing you are grateful for. Not a big thing. A small thing. Warm water. A quiet moment. Someone who smiled at you yesterday. Hold it gently, like a small flame.", pauseAfter: 15 },
      { text: "Now let that gratitude grow. Feel it in your chest, like warmth spreading. You did not earn this day. It is given to you, fresh, complete, unspoiled. Receive it.", pauseAfter: 12 },
      { text: "Carry this quiet thankfulness into everything you do today. Let it be the tone of your morning. The day is new. And so are you.", pauseAfter: 10 },
    ],
  },
  {
    id: "loving-kindness",
    title: "Loving-Kindness",
    description: "May you be happy, may you be safe, may you be at ease.",
    duration: "3 min",
    theme: "Compassion",
    background: "off",
    segments: [
      { text: "Sit comfortably. Soften your eyes, soften your shoulders. Bring your hands to your heart, or simply rest them. This practice is about warmth — for yourself, first.", pauseAfter: 8 },
      { text: "Repeat slowly, in your mind: May I be happy. May I be safe. May I be healthy. May I live with ease. Feel each phrase like a gentle touch on your own heart.", pauseAfter: 16 },
      { text: "Now bring to mind someone you love dearly. Picture them clearly. And offer them the same words: May you be happy. May you be safe. May you be healthy. May you live with ease.", pauseAfter: 16 },
      { text: "Now someone neutral — someone you see often but barely notice. The person at the shop, a neighbour. Offer them the same warmth. May you be happy. May you be safe. May you be at ease.", pauseAfter: 15 },
      { text: "Finally, let the warmth spread wider. To your street. To your city. To everyone struggling today. May all beings be happy. May all beings be safe. May all beings live with ease. Rest in this open-hearted warmth.", pauseAfter: 12 },
    ],
  },
  {
    id: "self-compassion",
    title: "Self-Compassion",
    description: "Turn the same kindness you give others toward yourself.",
    duration: "3 min",
    theme: "Compassion",
    background: "off",
    segments: [
      { text: "Close your eyes. Notice how you talk to yourself. Most of us are far kinder to others than we are to ourselves. Today, we practise the opposite.", pauseAfter: 8 },
      { text: "Place a hand on your chest. Feel its warmth. Now say to yourself, gently: It is okay to be where I am. I am doing my best. I deserve kindness, like anyone else.", pauseAfter: 16 },
      { text: "Think of a difficulty you are carrying. Do not push it away. Hold it the way you would hold a friend's struggle — with tenderness, not judgment.", pauseAfter: 16 },
      { text: "Say: May I forgive myself for being human. May I accept myself exactly as I am. May I be gentle with myself today.", pauseAfter: 15 },
      { text: "Sit with this softness. You are not broken. You are learning. And learning is allowed to be messy. Carry this kindness with you into the rest of your day.", pauseAfter: 12 },
    ],
  },
  {
    id: "anxiety-release",
    title: "Anxiety Release",
    description: "Slow the nervous system down — the storm is passing.",
    duration: "3 min",
    theme: "Release",
    background: "off",
    segments: [
      { text: "When anxiety rises, the mind races and the body tightens. First, just acknowledge it. Say to yourself: I notice I am anxious. That is okay. It is a signal, not a sentence.", pauseAfter: 8 },
      { text: "Now, long exhale. Breathe in through the nose for four. Breathe out slowly for six. The exhale is the body's brake pedal. Longer out, slower down.", pauseAfter: 16 },
      { text: "Again. In for four. Out for six. Feel your shoulders drop with each out-breath. Your jaw softening. Your belly releasing. The nervous system listens to the breath.", pauseAfter: 16 },
      { text: "Anxiety is energy moving through you. It cannot stay forever. It rises, it peaks, and it passes — like a wave, like a storm. You are the shore, not the storm.", pauseAfter: 15 },
      { text: "One more long exhale. The storm is passing. You are still here. You are safe. And you are more capable than the anxiety wants you to believe.", pauseAfter: 12 },
    ],
  },
  {
    id: "grounding",
    title: "Grounding",
    description: "Return to your body — the earth is holding you.",
    duration: "3 min",
    theme: "Grounding",
    background: "off",
    segments: [
      { text: "Sit or stand with both feet on the ground. Feel the weight of your body moving down — through your legs, through your feet, into the earth. You are supported.", pauseAfter: 8 },
      { text: "Notice five things you can see. Softly, without straining. Then four things you can feel. Three things you can hear. The world is right here with you.", pauseAfter: 16 },
      { text: "Feel the contact of your feet with the ground. Imagine roots growing down from the soles, deep into the earth, steady and calm. The earth holds you, as it holds everything.", pauseAfter: 16 },
      { text: "Bring your attention back to your breath — the one thing that has never left you. In. Out. You are here. Fully here, in this body, in this moment.", pauseAfter: 15 },
      { text: "When you are ready, move your fingers, roll your shoulders, open your eyes. You are grounded. You are present. And you can return to this place anytime.", pauseAfter: 12 },
    ],
  },
  {
    id: "short-one-breath",
    title: "One Breath",
    description: "A single breath to come home — a thirty-second reset.",
    duration: "30 sec",
    theme: "Breath",
    background: "off",
    introPause: 3,
    segments: [
      { text: "Slowly breathe in through your nose, holding it for a moment.", pauseAfter: 4 },
      { text: "Then, when you are ready, let it all go.", pauseAfter: 12 }
    ],
  },
  {
    id: "short-ground-here",
    title: "Ground Here",
    description: "Thirty seconds to feel your feet and come back to the present.",
    duration: "30 sec",
    theme: "Grounding",
    background: "off",
    introPause: 3,
    segments: [
      { text: "Feel your feet on the ground, and the weight of your body, held gently by the earth.", pauseAfter: 4 },
      { text: "You are here, safe in this moment.", pauseAfter: 6 }
    ],
  },
  {
    id: "short-let-it-go",
    title: "Let It Go",
    description: "A quick release — soften the grip in half a minute.",
    duration: "30 sec",
    theme: "Release",
    background: "off",
    introPause: 3,
    segments: [
      { text: "Notice what you are holding, the tension in your shoulders, and gently soften, release.", pauseAfter: 4 },
      { text: "You do not have to carry it anymore.", pauseAfter: 6 }
    ],
  },
  {
    id: "stop-for-a-moment",
    title: "Stop for a Moment",
    description: "A minute of presence — nothing to solve, nowhere to become.",
    duration: "1 min",
    theme: "Presence",
    background: "off",
    introPause: 7,
    noChime: true,
    segments: [
      { text: "Stop for a moment, because you don't have to solve everything today.", pauseAfter: 6 },
      { text: "Take a slow breath, feeling the air enter your body, then leaving again.", pauseAfter: 6 },
      { text: "Let this moment be enough.", pauseAfter: 7 },
      { text: "What happened before is gone, and what comes next has not arrived.", pauseAfter: 7 },
      { text: "Right now, you are here, and there is nothing you need to become.", pauseAfter: 8 }
    ],
  },

  {
    id: "close-your-eyes",
    title: "Close Your Eyes",
    description: "Forget the world for a few seconds and rest in silence.",
    duration: "1 min",
    theme: "Presence",
    background: "off",
    noChime: true,
    introPause: 7,
    segments: [
      { text: "Close your eyes gently, and for a few seconds, let the world outside drift away.", pauseAfter: 6 },
      { text: "Can you listen to your breath, and hear the silence between your thoughts?", pauseAfter: 7 },
      { text: "Peace is not something you find, but something you uncover when you stop chasing everything else.", pauseAfter: 7 },
      { text: "Be still, softly, allowing yourself to simply be.", pauseAfter: 8 }
    ],
  },
  {
    id: "take-the-next-step",
    title: "Take the Next Step",
    description: "One breath, one thought, one action — just the next step.",
    duration: "1 min",
    theme: "Focus",
    background: "off",
    noChime: true,
    introPause: 7,
    segments: [
      { text: "For the next few minutes, you need nothing else, just one breath, one thought, one action.", pauseAfter: 6 },
      { text: "Don't think about the entire journey, simply take the next step.", pauseAfter: 6 },
      { text: "When your attention is complete, even a small moment becomes powerful.", pauseAfter: 7 },
      { text: "Be here, do what is in front of you, and let everything else wait.", pauseAfter: 8 }
    ],
  },
  {
    id: "already-here",
    title: "You Are Already Here",
    description: "Stop trying to become someone — you are already enough.",
    duration: "1 min",
    theme: "Self-compassion",
    background: "off",
    noChime: true,
    introPause: 7,
    segments: [
      { text: "You spend so much time trying to become someone, more successful, more peaceful, more worthy.", pauseAfter: 6 },
      { text: "But for this moment, just stop trying, and breathe.", pauseAfter: 6 },
      { text: "You are already here, already alive.", pauseAfter: 6 },
      { text: "Perhaps peace begins when you stop asking whether you are enough, and simply experience that you are.", pauseAfter: 8 }
    ],
  },

  {
    id: "breathwork-box",
    title: "Box Breathing",
    description: "A steady four-four-four-four rhythm to calm the nervous system.",
    duration: "5 min",
    theme: "Breathwork",
    background: "off",
    noChime: true,
    introPause: 5,
    segments: [
      { text: "Settle into a comfortable seat, and let your shoulders drop away from your ears. We are going to practice box breathing, a slow, even rhythm that steadies the mind and calms the nervous system. There is nothing to get right here. Just follow along, gently.", pauseAfter: 6 },
      { text: "Breathe in through the nose, slowly, for a count of four. Two, three, four. Feel the air fill you, calm and steady, all the way down into the belly.", pauseAfter: 4 },
      { text: "Now hold the breath, softly, for four. Two, three, four. There is no straining, just a gentle pause, like the stillness between two waves.", pauseAfter: 4 },
      { text: "Now breathe out through the mouth, slowly, for a count of four. Two, three, four. Let the breath leave you completely, and feel the body soften.", pauseAfter: 4 },
      { text: "And now rest, empty, for four. Two, three, four. In this quiet pause, there is nothing to do at all.", pauseAfter: 4 },
      { text: "Let us repeat this together a few more times. In for four, hold for four, out for four, rest for four. With each round, the rhythm becomes smoother, and the mind grows a little quieter.", pauseAfter: 8 },
      { text: "Keep breathing this way, at your own gentle pace. You do not need to count perfectly. The box is only a shape to rest your attention in. What matters is the steadiness, the slowness, the calm.", pauseAfter: 8 },
      { text: "When you are ready, let the breathing return to normal, and notice how different the body feels now. Quieter. Slower. More at ease. You can return to this box whenever you need to steady yourself.", pauseAfter: 8 },
    ],
  },
  {
    id: "breath-478",
    title: "4-7-8 Breathing",
    description: "A deeply calming breath — in for four, hold for seven, out for eight.",
    duration: "5 min",
    theme: "Breathwork",
    background: "off",
    noChime: true,
    introPause: 5,
    segments: [
      { text: "Find a comfortable position, and let your face, your jaw, and your shoulders soften. We are going to practice the four-seven-eight breath, a gentle technique that helps the body and mind let go. It is deeply calming, especially before sleep.", pauseAfter: 6 },
      { text: "Breathe in through the nose, quietly, for a count of four. Two, three, four. Let the air come in soft and easy.", pauseAfter: 4 },
      { text: "Now hold the breath, gently, for a count of seven. Two, three, four, five, six, seven. There is no force here, just a soft, patient hold.", pauseAfter: 7 },
      { text: "Now breathe out through the mouth, slowly and completely, for a count of eight. Two, three, four, five, six, seven, eight. Let everything leave you with the breath.", pauseAfter: 8 },
      { text: "Let us do that once more. In through the nose for four, hold for seven, and out through the mouth for eight. Feel the long exhale melt the tension from your shoulders and your chest.", pauseAfter: 10 },
      { text: "Continue at your own pace, letting each exhale be a little longer than the breath in. The long, slow out-breath is what signals the body that it is safe to rest.", pauseAfter: 8 },
      { text: "Notice how, with each cycle, the body grows heavier, the thoughts grow softer, and the whole of you begins to unwind. There is nothing to do but breathe, and let go.", pauseAfter: 8 },
      { text: "When you are ready, allow the breath to return to its natural rhythm. Carry this calm with you, and know you can return to the four-seven-eight breath any time you need to soften into rest.", pauseAfter: 8 },
    ],
  },
  {
    id: "coherent-breathing",
    title: "Coherent Breathing",
    description: "Five seconds in, five seconds out — a steady rhythm that balances heart and mind.",
    duration: "5 min",
    theme: "Breathwork",
    background: "off",
    noChime: true,
    introPause: 5,
    segments: [
      { text: "Settle into a comfortable seat, or lie down if you prefer. We are going to practice coherent breathing, a slow, even rhythm of about five seconds in and five seconds out. It brings the heart and the mind into a gentle, steady balance.", pauseAfter: 6 },
      { text: "Breathe in slowly through the nose, for about five seconds, smooth and even. Let the breath fill you from the belly upward, calm and unhurried.", pauseAfter: 5 },
      { text: "And breathe out through the nose, for about five seconds, just as slow and smooth. Let the breath leave you softly, without effort.", pauseAfter: 5 },
      { text: "Keep this rhythm going — in for five, out for five — like a slow tide moving through you, steady and unbroken. You do not need to count. Just find the pace that feels natural and even.", pauseAfter: 8 },
      { text: "Feel the breath moving in and out in one continuous, gentle flow, with no pause and no strain. The in-breath and the out-breath become like two halves of a single wave.", pauseAfter: 8 },
      { text: "As you continue, notice how the body begins to settle, how the thoughts begin to slow, how the whole of you comes into a quiet, balanced rhythm. This is the breath of coherence, and it is deeply restful.", pauseAfter: 8 },
      { text: "Stay with this even breathing for as long as you like, letting the tide carry you. There is nowhere to be and nothing to fix. Just the steady in, and the steady out.", pauseAfter: 8 },
      { text: "When you are ready, let the breath return to its own rhythm, and notice the sense of balance and calm that remains. You can return to this breath whenever you need to find your center.", pauseAfter: 8 },
    ],
  },
  {
    id: "alternate-nostril",
    title: "Alternate Nostril Breathing",
    description: "A balancing practice that clears the mind and centers the breath.",
    duration: "5 min",
    theme: "Breathwork",
    background: "off",
    noChime: true,
    introPause: 5,
    segments: [
      { text: "Settle into a comfortable seat, with your spine long and your shoulders soft. We are going to practice alternate nostril breathing, a gentle technique that balances the two sides of the mind and leaves you feeling clear and centered.", pauseAfter: 6 },
      { text: "Bring your right hand to your face, and rest your index and middle fingers gently on your forehead. Your thumb will close the right nostril, and your ring finger the left. But first, just breathe naturally, and settle in.", pauseAfter: 8 },
      { text: "To begin, close your right nostril with your thumb, and breathe in slowly through the left nostril. Feel the cool air moving in, calm and even.", pauseAfter: 5 },
      { text: "Now close the left nostril with your ring finger, release the thumb, and breathe out slowly through the right nostril. Let the breath leave you completely.", pauseAfter: 5 },
      { text: "Keeping the left nostril closed, breathe in through the right nostril. Then close the right, release the left, and breathe out through the left. This is one full round.", pauseAfter: 8 },
      { text: "Continue at your own pace, slow and steady — in through one nostril, out through the other, in through the other, out through the first. The breath flows like a gentle current from one side to the other.", pauseAfter: 8 },
      { text: "If you lose the pattern, simply pause, breathe naturally for a moment, and begin again. There is no wrong way. The practice is in the returning, in the slow, patient attention.", pauseAfter: 8 },
      { text: "When you have completed a few rounds, lower your hand, and breathe naturally through both nostrils. Notice the sense of balance, clarity, and calm. You can return to this practice whenever you need to come back to center.", pauseAfter: 8 },
    ],
  },
];
