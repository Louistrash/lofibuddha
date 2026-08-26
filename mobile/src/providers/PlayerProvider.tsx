import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Audio, AVPlaybackStatus } from "expo-av";
import type { Experience } from "@lofibuddha/shared";
import { audioUrl } from "@/src/lib/api";
import { getStoredSceneTheme, pushRecent, storeSceneTheme } from "@/src/lib/favorites";
import { DEFAULT_SCENE_THEME, getSceneTheme, type SceneTheme } from "@/src/theme/sceneThemes";

type Phase = "idle" | "playing";
type BoxPhase = "inhale" | "hold" | "exhale" | "rest";

const BOX_PHASES: BoxPhase[] = ["inhale", "hold", "exhale", "rest"];
const BOX_DUR: Record<BoxPhase, number> = { inhale: 4, hold: 4, exhale: 4, rest: 4 };

type PlayerContextValue = {
  experience: Experience | null;
  phase: Phase;
  soundscape: string;
  musicTrack: string;
  musicOn: boolean;
  progress: number;
  elapsed: number;
  duration: number;
  boxPhase: BoxPhase;
  boxCount: number;
  pomodoroLeft: number;
  pomodoroMin: number;
  breathe: number;
  theme: SceneTheme;
  setTheme: (id: string) => void;
  playExperience: (exp: Experience) => Promise<void>;
  toggle: () => Promise<void>;
  stop: () => Promise<void>;
  chooseSoundscape: (slug: string) => Promise<void>;
  chooseMusic: (id: string) => Promise<void>;
  toggleMusic: () => Promise<void>;
  setPomodoroMin: (min: number) => void;
  resetSpecial: () => Promise<void>;
  clear: () => Promise<void>;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

async function unload(ref: React.MutableRefObject<Audio.Sound | null>) {
  if (ref.current) {
    try {
      await ref.current.stopAsync();
      await ref.current.unloadAsync();
    } catch {}
    ref.current = null;
  }
}

/**
 * "10 min" -> 600, "10–30 min" -> 1800, "2 min" -> 120.
 * Ranges take the upper bound so an open session is never cut short.
 */
function parseDurationSeconds(label: string): number {
  const nums = label.match(/\d+/g);
  if (!nums?.length) return 0;
  const minutes = Number(nums[nums.length - 1]);
  return Number.isFinite(minutes) ? minutes * 60 : 0;
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [experience, setExperience] = useState<Experience | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [soundscape, setSoundscape] = useState("off");
  const [musicTrack, setMusicTrack] = useState("off");
  const [musicOn, setMusicOn] = useState(false);
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [boxPhase, setBoxPhase] = useState<BoxPhase>("inhale");
  const [boxCount, setBoxCount] = useState(4);
  const [pomodoroMin, setPomodoroMinState] = useState(25);
  const [pomodoroLeft, setPomodoroLeft] = useState(25 * 60);
  const [breathe, setBreathe] = useState(0);
  const [theme, setThemeState] = useState<SceneTheme>(DEFAULT_SCENE_THEME);

  useEffect(() => {
    getStoredSceneTheme().then((id) => {
      if (id) setThemeState(getSceneTheme(id));
    });
  }, []);

  const setTheme = useCallback((id: string) => {
    setThemeState(getSceneTheme(id));
    void storeSceneTheme(id);
  }, []);

  const voiceRef = useRef<Audio.Sound | null>(null);
  const musicRef = useRef<Audio.Sound | null>(null);
  const bgRef = useRef<Audio.Sound | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pomodoroEndRef = useRef(0);
  /** Bumped on every stop so ambient layers loading in the background can tell they are stale. */
  const sessionRef = useRef(0);

  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    }).catch(() => {});
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      unload(voiceRef);
      unload(musicRef);
      unload(bgRef);
    };
  }, []);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const stopAll = useCallback(async () => {
    clearTimer();
    sessionRef.current += 1;
    await unload(voiceRef);
    await unload(musicRef);
    await unload(bgRef);
    setPhase("idle");
    setProgress(0);
    setElapsed(0);
    setDuration(0);
  }, []);

  /**
   * Ambient layers stream large files, so they never block the guide.
   * `downloadFirst: false` starts playback as soon as enough is buffered.
   */
  const startLayer = useCallback(
    async (
      ref: React.MutableRefObject<Audio.Sound | null>,
      uri: string,
      volume: number
    ) => {
      const session = sessionRef.current;
      await unload(ref);
      try {
        const { sound } = await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: true, isLooping: true, volume },
          undefined,
          false
        );
        if (session !== sessionRef.current) {
          await sound.unloadAsync();
          return;
        }
        ref.current = sound;
      } catch {
        // A missing or unreachable layer must never break the session.
      }
    },
    []
  );

  const startBg = useCallback(
    async (slug: string) => {
      if (slug === "off") {
        await unload(bgRef);
        return;
      }
      await startLayer(bgRef, audioUrl("sounds", slug), 0.18);
    },
    [startLayer]
  );

  const startMusic = useCallback(
    async (id: string) => {
      if (id === "off") {
        await unload(musicRef);
        return;
      }
      await startLayer(musicRef, audioUrl("music-tracks", id), 0.3);
    },
    [startLayer]
  );

  const startBox = useCallback(() => {
    setPhase("playing");
    let phaseIdx = 0;
    let count = BOX_DUR[BOX_PHASES[0]];
    setBoxPhase(BOX_PHASES[0]);
    setBoxCount(count);
    timerRef.current = setInterval(() => {
      count--;
      setBoxCount(Math.max(0, count));
      const p = BOX_PHASES[phaseIdx];
      setBreathe(phaseIdx % 2 === 0 ? count / BOX_DUR[p] : 1 - count / BOX_DUR[p]);
      if (count <= 0) {
        phaseIdx = (phaseIdx + 1) % BOX_PHASES.length;
        const next = BOX_PHASES[phaseIdx];
        count = BOX_DUR[next];
        setBoxPhase(next);
        setBoxCount(count);
      }
    }, 1000);
  }, []);

  const startPomodoro = useCallback((seconds: number) => {
    setPhase("playing");
    pomodoroEndRef.current = Date.now() + seconds * 1000;
    timerRef.current = setInterval(async () => {
      const left = Math.max(0, Math.round((pomodoroEndRef.current - Date.now()) / 1000));
      setPomodoroLeft(left);
      if (left <= 0) {
        clearTimer();
        setPhase("idle");
        try {
          const { sound } = await Audio.Sound.createAsync({ uri: audioUrl("breathe", "chime") });
          await sound.playAsync();
          sound.setOnPlaybackStatusUpdate((s: AVPlaybackStatus) => {
            if (s.isLoaded && s.didJustFinish) sound.unloadAsync();
          });
        } catch {}
      }
    }, 500);
  }, []);

  /**
   * Unguided sessions (soundscape/music only) have no voice track to report
   * playback position, so the clock is driven by wall time instead. Without
   * this the timer sat at 0:00 for the whole session.
   */
  const startAmbientClock = useCallback(
    (exp: Experience) => {
      const target = parseDurationSeconds(exp.duration);
      const startedAt = Date.now();

      clearTimer();
      setDuration(target);
      setElapsed(0);
      setProgress(0);
      setPhase("playing");

      timerRef.current = setInterval(() => {
        const secs = (Date.now() - startedAt) / 1000;
        setElapsed(secs);
        if (target > 0) {
          setProgress(Math.min(1, secs / target));
          if (secs >= target) void stopAll();
        }
      }, 250);
    },
    [stopAll]
  );

  const startVoice = useCallback(
    async (exp: Experience) => {
      if (!exp.guide) {
        startAmbientClock(exp);
        return;
      }

    const session = sessionRef.current;
    const kind = exp.category === "focus" ? "focus" : "meditations";

    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl(kind, exp.guide) },
        { shouldPlay: true, volume: 1, progressUpdateIntervalMillis: 250 },
        undefined,
        false
      );

      if (session !== sessionRef.current) {
        await sound.unloadAsync();
        return;
      }

      voiceRef.current = sound;
      setPhase("playing");

      sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
        if (!status.isLoaded) return;
        const position = status.positionMillis || 0;
        setElapsed(position / 1000);
        if (status.durationMillis) {
          setDuration(status.durationMillis / 1000);
          setProgress(Math.min(1, position / status.durationMillis));
        }
        if (status.didJustFinish) {
          setPhase("idle");
          setProgress(0);
          setElapsed(0);
        }
      });
    } catch {
      // Guide unavailable: fall back to the wall clock so the session still
      // reports progress while the ambient layers keep playing.
      startAmbientClock(exp);
    }
    },
    [startAmbientClock]
  );

  const playExperience = useCallback(
    async (exp: Experience) => {
      await stopAll();
      setExperience(exp);
      setSoundscape(exp.soundscape);
      setMusicTrack(exp.music);
      setMusicOn(exp.music !== "off");
      await pushRecent(exp.id);

      // The guide drives the clock, so it starts before the ambient layers,
      // which stream in afterwards without holding up playback.
      if (exp.special === "box-breathing") startBox();
      else if (exp.special === "pomodoro") startPomodoro(pomodoroMin * 60);
      else await startVoice(exp);

      if (exp.music !== "off") void startMusic(exp.music);
      if (exp.soundscape !== "off") void startBg(exp.soundscape);
    },
    [stopAll, startMusic, startBg, startBox, startPomodoro, startVoice, pomodoroMin]
  );

  const toggle = useCallback(async () => {
    if (!experience) return;

    // Breath and timer sessions have no seekable audio, so they restart instead.
    if (experience.special) {
      if (phase === "playing") await stopAll();
      else await playExperience(experience);
      return;
    }

    const layers = [voiceRef, musicRef, bgRef].filter((r) => r.current);

    if (phase === "playing") {
      setPhase("idle");
      await Promise.all(
        layers.map(async (r) => {
          try {
            await r.current?.pauseAsync();
          } catch {}
        })
      );
      return;
    }

    if (layers.length) {
      setPhase("playing");
      await Promise.all(
        layers.map(async (r) => {
          try {
            await r.current?.playAsync();
          } catch {}
        })
      );
      return;
    }

    await playExperience(experience);
  }, [experience, phase, stopAll, playExperience]);

  const value = useMemo<PlayerContextValue>(
    () => ({
      experience,
      phase,
      soundscape,
      musicTrack,
      musicOn,
      progress,
      elapsed,
      duration,
      boxPhase,
      boxCount,
      pomodoroLeft,
      pomodoroMin,
      breathe,
      theme,
      setTheme,
      playExperience,
      toggle,
      stop: stopAll,
      async chooseSoundscape(slug) {
        setSoundscape(slug);
        if (phase === "playing") await startBg(slug);
      },
      async chooseMusic(id) {
        setMusicTrack(id);
        setMusicOn(true);
        if (phase === "playing") await startMusic(id);
      },
      async toggleMusic() {
        const next = !musicOn;
        setMusicOn(next);
        if (phase !== "playing") return;
        if (next) await startMusic(musicTrack);
        else await unload(musicRef);
      },
      setPomodoroMin(min) {
        setPomodoroMinState(min);
        setPomodoroLeft(min * 60);
      },
      async resetSpecial() {
        if (!experience) return;
        if (experience.special === "box-breathing") {
          setBoxPhase("inhale");
          setBoxCount(4);
          setBreathe(0);
          if (phase === "playing") await playExperience(experience);
        }
        if (experience.special === "pomodoro") {
          setPomodoroLeft(pomodoroMin * 60);
          if (phase === "playing") await playExperience(experience);
        }
      },
      async clear() {
        await stopAll();
        setExperience(null);
      },
    }),
    [
      experience,
      phase,
      soundscape,
      musicTrack,
      musicOn,
      progress,
      elapsed,
      duration,
      boxPhase,
      boxCount,
      pomodoroLeft,
      pomodoroMin,
      breathe,
      theme,
      setTheme,
      playExperience,
      toggle,
      stopAll,
      startBg,
      startMusic,
    ]
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}
