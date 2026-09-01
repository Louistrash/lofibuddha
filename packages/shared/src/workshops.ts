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
    background: "off",
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

  {
    id: "deep-sleep-reset-2",
    title: "Deep Sleep Reset — Night 2: Softening the Body",
    description:
      "The second night. Sink deeper into the body and let every surface soften toward sleep.",
    duration: "20 min",
    theme: "Deep Sleep Reset",
    category: "sleep",
    background: "off",
    introPause: 25,
    segments: [
      { text: "Welcome back. This is the second night of your deep sleep reset. Find your way into bed, and let yourself settle into the same familiar position, the one your body already knows. There is nowhere else to be, and nothing else to prepare. Tonight is simply a continuation of the rest you have already begun.", pauseAfter: 14 },
      { text: "Take one slow breath in through the nose, and let it out with a soft sigh, as if you were letting the whole day pour out of you. Feel how natural that sigh is, how the body knows exactly what to do. You do not have to manage this. You only have to allow it.", pauseAfter: 16 },
      { text: "Now bring your attention to the skin, the outer surface of you. Notice how it rests against the sheets, the pillow, the cool air of the room. Feel the places where the body touches something, and the places where it touches nothing at all. You are held on every side.", pauseAfter: 16 },
      { text: "Let your face go completely soft. The forehead, smooth and wide. The eyes, heavy and still beneath their lids. The cheeks, loose. The jaw, unclenched, so that the teeth no longer touch, and the lips rest gently apart.", pauseAfter: 15 },
      { text: "Now soften the throat, the place where so much of the day gathers, where words are formed and held back. Let it open and relax. Then the neck, and the shoulders, letting them drop away from the ears, falling like water over stone.", pauseAfter: 16 },
      { text: "Bring your awareness to your arms, and simply let them be heavy. Feel the weight of each hand, the palms open and soft, the fingers curling slightly, as if they had already fallen asleep without you.", pauseAfter: 16 },
      { text: "Now the chest and the belly, rising and falling on their own, without any effort from you. Feel the breath moving here like a slow tide, in and out, and let each exhale carry a little more tension away from the body.", pauseAfter: 16 },
      { text: "Let your attention drift down through the hips and the legs, growing warm and distant. The thighs, the knees, the calves, all sinking into the bed. And the feet, far away now, as soft and still as the rest of you.", pauseAfter: 18 },
      { text: "By now the whole body has begun to feel like one single, quiet surface, a field of softness with no edges and no effort. And it is enough to simply be here, resting inside it, letting it hold you.", pauseAfter: 18 },
      { text: "If any part of you still feels tight, do not struggle against it. Simply breathe in its direction, and imagine the breath arriving there like warm light, loosening whatever it touches. There is no hurry. The body will let go when it is ready.", pauseAfter: 18 },
      { text: "Notice how the mind, too, has begun to soften, the edges of your thoughts blurring gently, like the last light of evening. You do not have to follow any of them. They can come and go on their own, like slow clouds across a dim sky.", pauseAfter: 20 },
      { text: "Feel the heaviness deepening, a pleasant weight settling over you, warm as a blanket and just as safe. It is the body's own way of saying that it is time, that you are allowed to stop holding on, that you can let yourself be carried.", pauseAfter: 20 },
      { text: "There is nothing you need to do now, and nothing you need to remember. The day is already complete, and you are already here, exactly where you belong. Let the night close around you, soft and certain.", pauseAfter: 22 },
      { text: "With every breath out, allow a little more of yourself to sink into the bed, until you can no longer tell where you end and the sheets begin. You are not leaving anything behind. You are simply arriving, more and more deeply, into rest.", pauseAfter: 22 },
      { text: "If you are still awake, that is perfectly fine. There is no goal here, and no one keeping score. Just keep breathing, slow and even, and let the softness do the work for you.", pauseAfter: 22 },
      { text: "I will be quiet now, and leave you to the dark and the quiet and the gentle weight of sleep. Stay here as long as you like. Let yourself drift. Goodnight.", pauseAfter: 0 },
    ],
  },
  {
    id: "deep-sleep-reset-3",
    title: "Deep Sleep Reset — Night 3: Quieting the Mind",
    description:
      "The third night. Learn to let the thinking mind wind down and rest like the body.",
    duration: "20 min",
    theme: "Deep Sleep Reset",
    category: "sleep",
    background: "off",
    introPause: 25,
    segments: [
      { text: "Welcome back. This is the third night of your deep sleep reset. Settle into bed, and let your body find its place, as if it had been waiting for this all day. Tonight we turn our attention gently toward the mind, the part of you that has been busy, and invite it, too, to rest.", pauseAfter: 14 },
      { text: "Take a slow breath in, and let it out through the mouth with a long, soft sigh. Feel the day begin to loosen its grip, and notice how, for just a moment, the thinking mind goes quiet. That quiet is always there, underneath everything. Tonight, we rest in it.", pauseAfter: 16 },
      { text: "Bring your attention to your thoughts, not to stop them, but simply to watch them, the way you might watch leaves drifting on a slow river. They come, and they go. You are not the thoughts. You are the one watching them.", pauseAfter: 18 },
      { text: "If a thought about tomorrow appears, let it pass by. If a memory of today appears, let it pass by too. You do not have to fix anything, resolve anything, or hold onto anything. The mind can rest from its work now.", pauseAfter: 18 },
      { text: "Feel the breath, moving slow and steady in the background, like a gentle current that has always been there. Each time you notice the mind wandering, do not scold it. Simply return, kindly, to the breath, and to the quiet.", pauseAfter: 17 },
      { text: "Notice that the more you watch the thoughts, the quieter they become, the way a lake grows still when the wind dies down. The surface of the mind begins to smooth, and the depths below become clear and calm.", pauseAfter: 18 },
      { text: "Let the body sink deeper into the bed, and let the mind sink too, into a soft, warm drowsiness. You do not have to stay alert, or hold anything together. The night will hold it all for you.", pauseAfter: 18 },
      { text: "Imagine the mind as a room, and one by one, the lights in that room are being turned down. The thoughts grow softer, dimmer, until only a faint, gentle glow remains, and then even that begins to fade.", pauseAfter: 20 },
      { text: "There is nowhere you need to be, and nothing you need to solve. The questions that felt so urgent today can wait until the morning. They will still be there, but you do not have to carry them into the night.", pauseAfter: 20 },
      { text: "With each breath out, feel the mind let go of a little more of its holding. The lists, the plans, the small worries — they loosen, and they float away, like lanterns released into the dark.", pauseAfter: 20 },
      { text: "You are entering the space between waking and sleeping, where the mind is no longer thinking, and not yet dreaming. It is a soft, borderless place, and it is safe to be here. Let yourself rest on its edge.", pauseAfter: 20 },
      { text: "If sleep comes, let it come. If it does not, that is all right too. There is no effort required, and no performance. Just the quiet, and the breath, and the slow unspooling of the day.", pauseAfter: 22 },
      { text: "Feel how still everything has become. The body, heavy and warm. The mind, like a calm sea. The breath, moving in and out, slow as the tide, drawing you gently toward the shore of sleep.", pauseAfter: 22 },
      { text: "You have carried enough for one day. You are allowed to set it all down now, to close the door on the thinking mind, and to rest. Nothing will be lost. Everything that matters will still be here in the morning.", pauseAfter: 22 },
      { text: "Stay here, in this quiet, for as long as you like. You are not waiting for anything. You are already where you need to be. Let the night gather you up, soft and complete.", pauseAfter: 22 },
      { text: "I will be quiet now, and leave you with the breath and the stillness and the dark. Let yourself drift. Goodnight.", pauseAfter: 0 },
    ],
  },
  {
    id: "deep-sleep-reset-4",
    title: "Deep Sleep Reset — Night 4: The Breath of Sleep",
    description:
      "The fourth night. Follow the breath as it slows, deepens, and carries you into rest.",
    duration: "20 min",
    theme: "Deep Sleep Reset",
    category: "sleep",
    background: "off",
    introPause: 25,
    segments: [
      { text: "Welcome back. This is the fourth night of your deep sleep reset. Settle in, and let the body arrange itself into rest, the way it knows how. Tonight, we let the breath become the guide, and follow it all the way down into sleep.", pauseAfter: 14 },
      { text: "Take one slow, full breath in through the nose, and let it go with a soft, audible sigh. Notice the sound of it, how the breath is like a small wave arriving on a shore, and then receding. You do not have to shape it. Just follow it.", pauseAfter: 16 },
      { text: "Now simply observe the breath, exactly as it is, without changing a thing. Feel the cool air at the nostrils, the gentle rise of the chest, the soft fall of the belly. The breath has been doing this all your life, without ever asking your permission.", pauseAfter: 16 },
      { text: "With every breath out, let it become a little longer, a little slower, a little deeper, as if the body itself were winding down. You are not forcing anything. You are only noticing the natural rhythm, and letting it deepen on its own.", pauseAfter: 17 },
      { text: "Feel the pause at the end of each exhale, the tiny stillness before the next breath arrives. Rest in that pause. It is a doorway, and each time you pass through it, you sink a little deeper into the quiet.", pauseAfter: 18 },
      { text: "Let the breath travel down through the whole body, from the crown of the head to the soles of the feet. Imagine it as a slow, warm current, washing through you, softening everything it touches.", pauseAfter: 18 },
      { text: "The body grows heavy now, warm and still, and the breath becomes so soft you can barely hear it. It is no longer something you are doing. It is something that is happening to you, like sleep itself, arriving from the inside.", pauseAfter: 18 },
      { text: "Notice how the rhythm of the breath begins to match the rhythm of the night, slow and even, like the rise and fall of a sleeping ocean. You are in tune with something much larger than yourself now.", pauseAfter: 18 },
      { text: "If a thought drifts in, let it ride out on the next exhale. You do not have to hold it, or answer it. Just breathe it away, and return to the soft, steady tide of the breath.", pauseAfter: 20 },
      { text: "With each cycle, the breath carries you a little further from the day, and a little closer to the edge of sleep. You are not making this happen. You are simply allowing it, the way you allow a wave to carry you.", pauseAfter: 20 },
      { text: "Feel the chest rise, and fall. The belly, rise and fall. The whole body, breathing as one, slow and luminous and at peace. This is the breath of sleep, and it is already yours.", pauseAfter: 20 },
      { text: "There is nothing to do but breathe, and even the breathing is doing itself. You can let go of the need to control it, to watch it, to manage anything at all. The breath will keep you safe while you rest.", pauseAfter: 22 },
      { text: "Let the breath grow so soft that it is almost silent, and let the silence grow so deep that it is almost like sleep. You are hovering now, on the very edge, weightless and warm.", pauseAfter: 22 },
      { text: "If you are still awake, simply remain with the breath, and let it be enough. You are not failing at anything. You are resting, and resting is enough. The night is long, and it is all for you.", pauseAfter: 22 },
      { text: "Feel the breath, slow as a sleeping tide. Feel the body, heavy and warm. Feel the dark, soft and close. There is nothing more you need to do. Just breathe, and let go.", pauseAfter: 22 },
      { text: "I will be quiet now, and leave you with the breath, the tide, and the dark. Let yourself drift. Goodnight.", pauseAfter: 0 },
    ],
  },
  {
    id: "deep-sleep-reset-5",
    title: "Deep Sleep Reset — Night 5: The Safe Place",
    description:
      "The fifth night. Return to a place of deep safety and let it hold you into sleep.",
    duration: "20 min",
    theme: "Deep Sleep Reset",
    category: "sleep",
    background: "off",
    introPause: 25,
    segments: [
      { text: "Welcome back. This is the fifth night of your deep sleep reset. Settle into bed, and let the room grow soft around you. Tonight, we travel to a place of safety, a place that exists only for you, and we let it hold you while you rest.", pauseAfter: 14 },
      { text: "Take a slow breath in, and let it out gently, allowing the body to release into the bed. Feel the covers around you, the pillow beneath your head. You are already safe. Everything else can wait.", pauseAfter: 16 },
      { text: "Now close your eyes, if you have not already, and bring to mind a place where you have felt completely, utterly safe. It may be a real place, or one you have only imagined. There is no wrong answer. Let it arise on its own.", pauseAfter: 17 },
      { text: "See this place softly, in gentle colours, as if through the haze of a warm evening. Do not force the details. Let them come slowly — a shape, a texture, a familiar light. You are arriving there now, and you are welcome.", pauseAfter: 18 },
      { text: "Listen to the sounds of this place. The quiet hush of it, the soft rhythm of whatever is near. Perhaps it is the sound of rain on a roof, or leaves in a breeze, or simply a deep, warm silence. Let it become the soundtrack of your rest.", pauseAfter: 18 },
      { text: "Feel the air of this place on your skin, the perfect temperature, neither too warm nor too cool. Feel the surface beneath you, made for your exact shape, receiving you completely, as if you had always belonged here.", pauseAfter: 18 },
      { text: "In this place, nothing is required of you. There are no tasks, no questions, no one to be. You are free to simply be here, quiet and still, like an animal at rest in a place it knows is safe.", pauseAfter: 18 },
      { text: "Let yourself settle deeper into this place, and notice how the body relaxes on its own, the way it always relaxes when it knows it is safe. The shoulders drop. The breath slows. The mind grows quiet.", pauseAfter: 18 },
      { text: "Stay here for a while, resting in this safety. You have been carrying so much, out in the world, staying alert, staying strong. But here, you can lay all of that down. Here, you are held.", pauseAfter: 20 },
      { text: "If the mind wanders, gently guide it back to this place, to its sounds and its soft light. You do not have to fight the wandering. You only have to return, again and again, as many times as it takes.", pauseAfter: 20 },
      { text: "Feel the safety of this place seeping into you, like warmth spreading through the body, until every part of you knows, without a doubt, that you are safe. You can let your guard down completely now.", pauseAfter: 20 },
      { text: "This place will always be here for you. You can return to it any night, any moment, whenever you need to feel held. It is yours, and no one can take it from you. Let that knowing settle deep into your bones.", pauseAfter: 20 },
      { text: "Now let this place begin to grow dim, like a room where the lamps are being turned down one by one. The colours soften, the sounds grow distant, and the warmth remains, wrapping around you like a blanket.", pauseAfter: 22 },
      { text: "You are slipping from this place into sleep, and it is all right to let go. The safety does not leave you. It goes with you, into the dark, into the rest, like a hand holding yours.", pauseAfter: 22 },
      { text: "If you are still awake, that is perfectly all right. Stay in the warmth, in the safety, in the quiet. There is nowhere else to be, and nothing else to do. Just rest, here, where you are safe.", pauseAfter: 22 },
      { text: "I will be quiet now, and leave you in your safe place, with its soft light and its deep quiet. Let yourself drift. Goodnight.", pauseAfter: 0 },
    ],
  },
  {
    id: "deep-sleep-reset-6",
    title: "Deep Sleep Reset — Night 6: Letting the Day Dissolve",
    description:
      "The sixth night. Watch the whole day dissolve like mist and surrender to the dark.",
    duration: "20 min",
    theme: "Deep Sleep Reset",
    category: "sleep",
    background: "off",
    introPause: 25,
    segments: [
      { text: "Welcome back. This is the sixth night of your deep sleep reset. Settle into bed, and let the body grow still. Tonight, we take everything the day has left behind, and we let it dissolve, like mist in the morning sun, until only rest remains.", pauseAfter: 14 },
      { text: "Take a slow breath in, and let it out with a long, soft sigh, as if you were releasing the very last of the day. Feel the sigh travel all the way through you, loosening whatever it touches, leaving you a little lighter.", pauseAfter: 16 },
      { text: "Now bring the day to mind, not to relive it, but simply to acknowledge it. See it as a long, winding ribbon of moments, now complete, now behind you. You lived it as well as you could. It is finished now.", pauseAfter: 17 },
      { text: "Let the conversations of the day dissolve. The words you said, the words left unsaid, the voices that lingered — let them all soften and fade, until they are nothing but a distant murmur, and then silence.", pauseAfter: 18 },
      { text: "Let the tasks of the day dissolve. The things you finished, the things left undone, the lists and the small pressures — let them all loosen and drift away, like leaves carried off by a slow river. They do not belong to the night.", pauseAfter: 18 },
      { text: "Let the emotions of the day dissolve. The moments of joy, the moments of frustration, the small hurts and the small victories — let them all pass through you and out, leaving you clear and still, like water after the sediment has settled.", pauseAfter: 18 },
      { text: "Notice how much lighter you feel, with each of these things released. The shoulders have dropped. The brow has smoothed. The body, which has been carrying the day, is finally allowed to set it down.", pauseAfter: 18 },
      { text: "With every breath out, let a little more of the day fall away, until there is almost nothing left of it, only the faintest trace, like the last warmth of the sun long after it has gone down.", pauseAfter: 18 },
      { text: "You are becoming lighter and lighter, emptier and emptier, the way the sky empties of birds at dusk. What remains is not emptiness, but spaciousness — a wide, quiet space where you can simply be.", pauseAfter: 20 },
      { text: "In this space, there is no yesterday and no tomorrow. There is only this moment, and the next breath, and the soft dark gathering around you. You are no longer the person who lived the day. You are simply presence, at rest.", pauseAfter: 20 },
      { text: "Let yourself float in this space, weightless and warm, held by the night itself. There is nothing to hold onto, and nothing that needs holding. You are free to drift, free to let go, free to be carried.", pauseAfter: 20 },
      { text: "If a thought of the day returns, do not engage it. Let it be like the last leaf of autumn, and watch it fall away into the dark. You have already said goodbye to it. You do not need to say it again.", pauseAfter: 20 },
      { text: "Feel how quiet everything has become. The body, soft and still. The mind, clear and calm. The day, gone. Only the night remains, and the night is gentle, and it is all for you.", pauseAfter: 22 },
      { text: "You have done enough. You have been enough. Whatever the day was, it is complete now, and you are free to rest. Let the last of it dissolve, and feel yourself sink into the welcome darkness.", pauseAfter: 22 },
      { text: "If you are still awake, simply rest in the spaciousness, in the quiet, in the dark. There is no test here, and no failing. Only the slow, sweet letting go.", pauseAfter: 22 },
      { text: "I will be quiet now, and leave you to the dark, and the quiet, and the deep, dissolving rest. Let yourself drift. Goodnight.", pauseAfter: 0 },
    ],
  },
  {
    id: "deep-sleep-reset-7",
    title: "Deep Sleep Reset — Night 7: The Deep Rest",
    description:
      "The final night. A long, deep descent into rest, and a gentle farewell to the journey.",
    duration: "20 min",
    theme: "Deep Sleep Reset",
    category: "sleep",
    background: "off",
    introPause: 25,
    segments: [
      { text: "Welcome back, for the last time. This is the seventh and final night of your deep sleep reset. Settle into bed, and take a moment to feel how far you have come. Seven nights of returning to yourself. Seven nights of letting go. Tonight, we simply rest, deep and complete.", pauseAfter: 15 },
      { text: "Take a slow breath in, and let it out with a soft sigh, releasing the day, releasing the week, releasing everything that no longer serves you. Feel the body answer with a deep, instinctive relaxation, as if it has been waiting for this.", pauseAfter: 16 },
      { text: "Bring your attention to the whole body, all at once, not part by part but as one single field of warmth and stillness. Notice how familiar this has become, this settling, this arriving. Your body knows the way now.", pauseAfter: 17 },
      { text: "Let your awareness travel slowly down from the crown of the head to the soles of the feet, lingering wherever there is still a little tension, and breathing it away. The forehead. The jaw. The shoulders. The belly. The legs. Let every part of you rest.", pauseAfter: 18 },
      { text: "Feel the breath, slow and deep, moving through you like a tide, and let it carry you down, down, into a deeper place than before. There is no rush, and no destination. Just the gentle, endless descent into rest.", pauseAfter: 18 },
      { text: "Tonight the mind is quiet almost on its own, the way it has learned to be over these seven nights. The thoughts are few and far between, like distant stars, and even they are beginning to fade.", pauseAfter: 18 },
      { text: "Let yourself feel the weight of the body, heavy and warm, sinking into the bed, into the earth, into the deep. And let yourself feel, at the same time, how light the mind has become, how free, how unburdened.", pauseAfter: 18 },
      { text: "You have learned, over these nights, how to let go — of the day, of the thoughts, of the need to hold on. And now, on this final night, you can let go of the letting go itself, and simply rest, the way you were always meant to.", pauseAfter: 20 },
      { text: "There is nothing left to practice, nothing left to reach for. The journey is complete, but it does not end here. It lives on in you, in the way you breathe, in the way you soften, in the way you return to yourself, night after night.", pauseAfter: 20 },
      { text: "Feel the deep rest moving through you now, like slow water through still ground, saturating every cell, every breath, every quiet corner of the mind. This is what you came for, and it is already here.", pauseAfter: 20 },
      { text: "Let the darkness become a comfort now, not something to be avoided, but something to be welcomed, the way a tired child welcomes sleep. It is soft, and it is safe, and it is waiting to hold you.", pauseAfter: 20 },
      { text: "With each breath out, sink a little deeper, until the boundary between you and the night grows thin, and you can no longer tell where one ends and the other begins. You are not disappearing. You are expanding, into rest.", pauseAfter: 22 },
      { text: "If you are still awake, that is all right. Rest is not something you achieve. It is something you allow. And you are allowing it, even now, in this very moment, simply by being here, breathing, letting go.", pauseAfter: 22 },
      { text: "Take with you, from these seven nights, this one thing: you can always return here. The breath is always with you. The quiet is always underneath. The rest is always waiting, patient and kind, whenever you are ready.", pauseAfter: 22 },
      { text: "Thank you for walking this path with me. You have done something gentle and true for yourself, and it matters more than you know. Now, let it all go, and let the deep rest carry you home.", pauseAfter: 22 },
      { text: "I will be quiet now, and leave you to the deep, to the dark, and to the rest you have so gently earned. Stay here as long as you like. Let yourself drift. Goodnight, and sleep well.", pauseAfter: 0 },
    ],
  },
];
