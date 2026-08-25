"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, X, RotateCcw, Waves, Music } from "lucide-react";
import Chip from "@/components/ui/Chip";
import SegmentedControl from "@/components/ui/SegmentedControl";
import Scene from "@/components/Scene";
import type { Experience } from "@/lib/experiences";
import { getCategory } from "@/lib/experiences";
import { SOUNDS } from "@/lib/sounds";
import { MUSIC_TRACKS } from "@/lib/music";

interface ExperiencePlayerProps {
  experience: Experience;
  onClose: () => void;
}

// Box breathing fasen
const PHASES = ["inhale", "hold", "exhale", "rest"] as const;
type Phase = (typeof PHASES)[number];
const PHASE_LABELS: Record<Phase, string> = {
  inhale: "Breathe in",
  hold: "Hold",
  exhale: "Breathe out",
  rest: "Rest",
};
const BOX_DUR: Record<Phase, number> = { inhale: 4, hold: 4, exhale: 4, rest: 4 };

// Pomodoro presets
const FOCUS_PRESETS = [
  { label: "Quick", min: 10 },
  { label: "Focus", min: 25 },
  { label: "Deep", min: 50 },
];

function fmt(sec: number) {
  if (!isFinite(sec) || sec < 0) return "0:00";
  const total = Math.round(sec);
  return `${Math.floor(total / 60)}:${(total % 60).toString().padStart(2, "0")}`;
}

/**
 * Gedeelde player voor alle experiences:
 * - normale experiences: chime → voice begeleiding + soundscape + muziek, met levende scene
 * - specials: box-breathing (ademcirkel) of pomodoro (focus timer)
 * Soundscape en muziek zijn live te wisselen tijdens het afspelen (mix).
 */
export default function ExperiencePlayer({ experience, onClose }: ExperiencePlayerProps) {
  const [phase, setPhase] = useState<"idle" | "chime" | "playing">("idle");
  const [breathe, setBreathe] = useState(0);
  const [soundscape, setSoundscape] = useState(experience.soundscape);
  const [musicOn, setMusicOn] = useState(experience.music !== "off");
  const [musicTrack, setMusicTrack] = useState(experience.music);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  // Box breathing state
  const [boxPhase, setBoxPhase] = useState<Phase>("inhale");
  const [boxCount, setBoxCount] = useState(BOX_DUR.inhale);
  // Pomodoro state
  const [pomodoroMin, setPomodoroMin] = useState(25);
  const [pomodoroLeft, setPomodoroLeft] = useState(25 * 60);

  const voiceRef = useRef<HTMLAudioElement | null>(null);
  const chimeRef = useRef<HTMLAudioElement | null>(null);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const bgRef = useRef<HTMLAudioElement | null>(null);
  const breatheRef = useRef<number>(0);
  const breatheTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const specialTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pomodoroEndRef = useRef<number>(0);

  const cat = getCategory(experience.category);
  const accent = experience.accent || cat.accent;
  const isBox = experience.special === "box-breathing";
  const isPomodoro = experience.special === "pomodoro";

  useEffect(() => {
    return () => {
      voiceRef.current?.pause();
      chimeRef.current?.pause();
      musicRef.current?.pause();
      bgRef.current?.pause();
      if (breatheTimerRef.current) clearInterval(breatheTimerRef.current);
      if (specialTimerRef.current) clearInterval(specialTimerRef.current);
    };
  }, []);

  // Breathe scene animatie (alleen bij breathe-experiences)
  useEffect(() => {
    if (experience.scene !== "breathe" || isBox) return;
    breatheTimerRef.current = setInterval(() => {
      breatheRef.current = (breatheRef.current + 0.02) % 1.2;
      setBreathe(breatheRef.current > 1 ? 1 : breatheRef.current);
    }, 60);
    return () => { if (breatheTimerRef.current) clearInterval(breatheTimerRef.current); };
  }, [experience.scene, isBox]);

  function stopAll() {
    voiceRef.current?.pause(); voiceRef.current = null;
    chimeRef.current?.pause(); chimeRef.current = null;
    musicRef.current?.pause(); musicRef.current = null;
    bgRef.current?.pause(); bgRef.current = null;
    if (specialTimerRef.current) { clearInterval(specialTimerRef.current); specialTimerRef.current = null; }
    setPhase("idle");
    setProgress(0);
  }

  // Live mix: wissel soundscape zonder te stoppen
  function chooseSoundscape(slug: string) {
    setSoundscape(slug);
    if (phase === "playing") startBg(slug);
  }

  function startBg(slug: string) {
    bgRef.current?.pause();
    bgRef.current = null;
    if (slug === "off") return;
    const bg = new Audio(`/api/sounds/audio/${slug}.mp3`);
    bg.loop = true;
    bg.volume = 0.18;
    bg.play().catch(() => {});
    bgRef.current = bg;
  }

  function toggleMusic() {
    const next = !musicOn;
    setMusicOn(next);
    if (phase !== "playing") return;
    if (next) startMusic(musicTrack);
    else { musicRef.current?.pause(); musicRef.current = null; }
  }

  // Live mix: wissel muziektrack zonder te stoppen
  function chooseMusic(trackId: string) {
    setMusicTrack(trackId);
    if (!musicOn) { setMusicOn(true); }
    if (phase === "playing") startMusic(trackId);
  }

  function startMusic(trackId?: string) {
    const id = trackId || musicTrack;
    if (id === "off") return;
    musicRef.current?.pause();
    const music = new Audio(`/api/music-tracks/audio/${id}.mp3`);
    music.loop = true;
    music.volume = 0.3;
    music.play().catch(() => {});
    musicRef.current = music;
  }

  // ── Box breathing loop ──
  function startBoxBreathing() {
    setPhase("playing");
    let phaseIdx = 0;
    let count = BOX_DUR[PHASES[0]];
    setBoxPhase(PHASES[0]);
    setBoxCount(count);
    const tick = () => {
      count--;
      setBoxCount(Math.max(0, count));
      setBreathe(phaseIdx % 2 === 0 ? count / BOX_DUR[PHASES[phaseIdx % 4]] : 1 - count / BOX_DUR[PHASES[phaseIdx % 4]]);
      if (count <= 0) {
        phaseIdx++;
        if (phaseIdx >= PHASES.length) phaseIdx = 0;
        const p = PHASES[phaseIdx];
        count = BOX_DUR[p];
        setBoxPhase(p);
        setBoxCount(count);
      }
    };
    specialTimerRef.current = setInterval(tick, 1000);
  }

  // ── Pomodoro loop ──
  function startPomodoro() {
    setPhase("playing");
    pomodoroEndRef.current = Date.now() + pomodoroLeft * 1000;
    specialTimerRef.current = setInterval(() => {
      const left = Math.max(0, Math.round((pomodoroEndRef.current - Date.now()) / 1000));
      setPomodoroLeft(left);
      if (left <= 0) {
        if (specialTimerRef.current) clearInterval(specialTimerRef.current);
        specialTimerRef.current = null;
        setPhase("idle");
        setPomodoroLeft(pomodoroMin * 60);
        const chime = new Audio("/api/breathe/audio/chime.mp3");
        chime.play().catch(() => {});
      }
    }, 500);
  }

  function play() {
    stopAll();

    if (musicOn && musicTrack !== "off") startMusic(musicTrack);
    if (soundscape !== "off") startBg(soundscape);

    // Specials: eigen interactieve loop
    if (isBox) { startBoxBreathing(); return; }
    if (isPomodoro) { startPomodoro(); return; }

    // Guided experiences hebben al een chime-intro in hun voice-audio
    // (generate-meditation.mjs zet "chime + segmenten"), dus geen aparte
    // chime hier — anders klinkt de bel dubbel.
    if (experience.guide) {
      startVoice();
    } else {
      setPhase("playing");
    }
  }

  function startVoice() {
    // Focus guides staan in data/focus/audio, meditaties in data/meditations/audio
    const base = experience.category === "focus" ? "focus" : "meditations";
    const voice = new Audio(`/api/${base}/audio/${experience.guide}.mp3`);
    voice.onended = () => { setPhase("idle"); setProgress(0); setElapsed(0); };
    voice.onloadedmetadata = () => setDuration(voice.duration || 0);
    voice.ontimeupdate = () => { if (voice.duration) { setElapsed(voice.currentTime); setProgress(voice.currentTime / voice.duration); } };
    voice.play().catch(() => {});
    voiceRef.current = voice;
    setPhase("playing");
    setProgress(0);
    setElapsed(0);
  }

  function toggle() {
    if (phase === "playing" || phase === "chime") stopAll();
    else play();
  }

  function resetSpecial() {
    if (isBox) {
      setBoxPhase("inhale");
      setBoxCount(BOX_DUR.inhale);
      setBreathe(0);
      if (phase === "playing") { stopAll(); play(); }
    }
    if (isPomodoro) {
      setPomodoroLeft(pomodoroMin * 60);
      if (phase === "playing") { stopAll(); play(); }
    }
  }

  const soundOptions = SOUNDS.filter(s => s.category === "Water" || s.category === "Nature" || s.category === "Spiritual" || s.category === "Warmth");

  return (
    <div className="exp-player" style={{ "--accent": accent } as React.CSSProperties}>
      {/* Levende scene — full screen */}
      <Scene type={experience.scene} variant="full" breathe={breathe} />

      <div className="exp-player-ui">
        <div className="exp-player-top">
          <button className="exp-player-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
          <div className="exp-player-cat" style={{ color: accent }}>{cat.name}</div>
        </div>

        <div className="exp-player-mid">
          <span className="exp-player-script">{cat.script}</span>
          <h2 className="exp-player-title">{experience.title}</h2>
          <p className="exp-player-desc">{experience.description}</p>

          {isBox ? (
            /* ── Box breathing visual ── */
            <div className="exp-box" style={{ "--accent": accent } as React.CSSProperties}>
              <div
                className="exp-box-core"
                style={{ transform: `scale(${boxPhase === "inhale" || boxPhase === "hold" ? 1.6 : 1})` }}
              >
                <span className="exp-box-count">{boxCount}</span>
              </div>
              <span className="exp-box-phase">{PHASE_LABELS[boxPhase]}</span>
            </div>
          ) : isPomodoro ? (
            /* ── Pomodoro visual ── */
            <div className="exp-pomodoro" style={{ "--accent": accent } as React.CSSProperties}>
              <div className="exp-pomodoro-presets">
                <SegmentedControl
                  options={FOCUS_PRESETS.map(p => ({ value: String(p.min), label: `${p.label} · ${p.min}m` }))}
                  value={String(pomodoroMin)}
                  onChange={(v) => { setPomodoroMin(Number(v)); setPomodoroLeft(Number(v) * 60); }}
                />
              </div>
              <span className="exp-pomodoro-time">{fmt(pomodoroLeft)}</span>
            </div>
          ) : (
            /* ── Normale player ring ── */
            <div className="exp-player-ring-wrap" style={{ "--accent": accent } as React.CSSProperties}>
              <button className="exp-player-play" onClick={toggle} aria-label={phase === "playing" ? "pause" : "play"}>
                {phase === "playing" ? <Pause size={30} /> : <Play size={30} style={{ marginLeft: 4 }} />}
              </button>
              <span className="exp-player-time">
                {experience.guide ? `${fmt(elapsed)}` : "playing"}
              </span>
              {experience.guide && duration > 0 && (
                <div className="exp-player-progress">
                  <div className="exp-player-progress-fill" style={{ width: `${progress * 100}%`, background: accent }} />
                </div>
              )}
            </div>
          )}

          {/* Specials: eigen play/reset knoppen */}
          {(isBox || isPomodoro) && (
            <div className="exp-player-actions">
              <button className="exp-player-mainbtn" onClick={toggle} style={{ background: accent, color: "#0d0b09" }}>
                {phase === "playing" ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: 2 }} />}
                {phase === "playing" ? "Pause" : "Start"}
              </button>
              <button className="exp-player-reset" onClick={resetSpecial}>
                <RotateCcw size={15} /> Reset
              </button>
            </div>
          )}
        </div>

        {/* Live mix controls — soundscape + music */}
        <div className="exp-player-settings">
          <div className="exp-player-setting">
            <div className="exp-player-setting-label">
              <Waves size={14} /> Soundscape
              <span className="exp-player-setting-value">{soundscape === "off" ? "off" : soundscape.replace(/-/g, " ")}</span>
            </div>
            <div className="exp-player-choices">
              <Chip active={soundscape === "off"} onClick={() => chooseSoundscape("off")}>Off</Chip>
              {soundOptions.slice(0, 8).map(s => (
                <Chip key={s.slug} active={soundscape === s.slug} onClick={() => chooseSoundscape(s.slug)}>{s.name}</Chip>
              ))}
            </div>
          </div>

          <div className="exp-player-setting">
            <div className="exp-player-setting-label">
              <Music size={14} /> Music
              <span className="exp-player-setting-value">{!musicOn ? "off" : musicTrack.replace(/-/g, " ")}</span>
            </div>
            <div className="exp-player-choices">
              <Chip active={!musicOn} onClick={toggleMusic}>Off</Chip>
              {MUSIC_TRACKS.map(t => (
                <Chip key={t.id} active={musicOn && musicTrack === t.id} onClick={() => chooseMusic(t.id)} title={t.description}>{t.title.replace(" · ", " ")}</Chip>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
