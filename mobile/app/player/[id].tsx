import React, { useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { MUSIC_TRACKS, SOUNDS, getExperience } from "@lofibuddha/shared";
import { SceneCanvas } from "@/src/components/content/SceneCanvas";
import { Mandala } from "@/src/components/content/Mandala";
import { Chip, EmptyState } from "@/src/components/ui/Primitives";
import { IconButton } from "@/src/components/ui/Button";
import { usePlayer } from "@/src/providers/PlayerProvider";
import { useFavorites } from "@/src/lib/useFavorites";
import { useDismiss } from "@/src/lib/useDismiss";
import { colors, layout, radius, space, type } from "@/src/theme/tokens";
import { SCENE_THEMES, type SceneTheme } from "@/src/theme/sceneThemes";
import { useLayout } from "@/src/theme/useLayout";
import { Icon } from "@/src/components/ui/Icon";

const POMODORO_OPTIONS = [15, 25, 45, 60];

export default function PlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const l = useLayout();
  const insets = useSafeAreaInsets();
  const player = usePlayer();
  const dismiss = useDismiss();
  const { toggle: toggleFavorite, isFavorite } = useFavorites();

  const experience = getExperience(String(id)) ?? player.experience;

  useEffect(() => {
    if (experience && player.experience?.id !== experience.id) {
      player.playExperience(experience);
    }
    // Only re-run when the route target changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experience?.id]);

  if (!experience) {
    return (
      <SceneCanvas>
        <EmptyState title="Practice not found" message="Head back and pick another session." />
      </SceneCanvas>
    );
  }

  // Inside the player the listener's chosen mood owns every colour.
  const theme = player.theme;
  const accent = theme.accent;
  const playing = player.phase === "playing";
  const isBreath = experience.special === "box-breathing";
  const isTimer = experience.special === "pomodoro";

  return (
    <SceneCanvas theme={theme} intensity={isBreath ? player.breathe : 0.5}>
      <View style={[styles.topBar, { paddingTop: insets.top + space.md }]}>
        <View style={styles.topLeft}>
          <IconButton icon="down" onPress={dismiss} accessibilityLabel="Close player" />
          <Pressable
            onPress={() => router.replace("/")}
            accessibilityLabel="Go to Today"
            style={({ hovered }: any) => [styles.homeLink, hovered && { opacity: 0.7 }]}
          >
            <Icon name="buddha" size={19} color={colors.textSecondary} />
            {l.isMedium ? <Text style={styles.homeLabel}>Today</Text> : null}
          </Pressable>
        </View>
        <View style={styles.topMeta}>
          <Text style={[styles.topLabel, { color: accent }]}>
            {experience.category.toUpperCase()}
          </Text>
        </View>
        <IconButton
          icon={isFavorite(experience.id) ? "heart" : "heartOutline"}
          color={isFavorite(experience.id) ? accent : colors.text}
          onPress={() => toggleFavorite(experience.id)}
          accessibilityLabel="Save"
        />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + space["3xl"], paddingHorizontal: l.gutter },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.stage, l.isDesktop && styles.stageRow]}>
          <View style={[styles.visualCol, l.isDesktop && { flex: 1 }]}>
            <MandalaStage
              theme={theme}
              progress={isBreath ? player.breathe : player.progress}
              playing={playing}
              size={l.isCompact ? 280 : 340}
              label={
                isBreath
                  ? String(player.boxCount)
                  : isTimer
                    ? formatTime(player.pomodoroLeft)
                    : undefined
              }
              caption={isBreath ? player.boxPhase.toUpperCase() : isTimer ? "REMAINING" : undefined}
            />
          </View>

          <View style={[styles.infoCol, l.isDesktop && { flex: 1 }]}>
            <Text style={styles.title}>{experience.title}</Text>
            <Text style={styles.description}>{experience.description}</Text>

            {!isBreath && !isTimer ? (
              <View style={styles.progressBlock}>
                <View style={styles.track}>
                  <View
                    style={[
                      styles.fill,
                      { width: `${Math.min(100, player.progress * 100)}%`, backgroundColor: accent },
                    ]}
                  />
                </View>
                <View style={styles.times}>
                  <Text style={styles.time}>{formatTime(player.elapsed)}</Text>
                  <Text style={styles.time}>
                    {player.duration ? formatTime(player.duration) : experience.duration}
                  </Text>
                </View>
              </View>
            ) : null}

            <View style={styles.transport}>
              <IconButton
                icon="refresh"
                size={48}
                onPress={() => player.resetSpecial()}
                accessibilityLabel="Restart"
              />
              <Pressable
                onPress={() => player.toggle()}
                style={({ pressed }) => [
                  styles.playBig,
                  pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
                ]}
              >
                <LinearGradient
                  colors={theme.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <Icon name={playing ? "pause" : "play"} size={30} color={theme.onGradient} />
              </Pressable>
              <IconButton
                icon={player.musicOn ? "music" : "musicOff"}
                size={48}
                color={player.musicOn ? accent : colors.textSecondary}
                onPress={() => player.toggleMusic()}
                accessibilityLabel={player.musicOn ? "Mute soundtrack" : "Unmute soundtrack"}
              />
            </View>

            {isTimer ? (
              <View style={styles.mixBlock}>
                <Text style={styles.mixLabel}>SESSION LENGTH</Text>
                <View style={styles.chips}>
                  {POMODORO_OPTIONS.map((min) => (
                    <Chip
                      key={min}
                      label={`${min} min`}
                      accent={accent}
                      active={player.pomodoroMin === min}
                      onPress={() => player.setPomodoroMin(min)}
                    />
                  ))}
                </View>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.mixPanel}>
          <View style={styles.mixBlock}>
            <Text style={styles.mixLabel}>MOOD</Text>
            <View style={styles.swatches}>
              {SCENE_THEMES.map((t) => {
                const active = t.id === theme.id;
                return (
                  <Pressable
                    key={t.id}
                    onPress={() => player.setTheme(t.id)}
                    style={({ hovered, pressed }: any) => [
                      styles.swatch,
                      active && { borderColor: t.accent },
                      (hovered || pressed) && !active && { borderColor: colors.hairlineStrong },
                    ]}
                  >
                    <LinearGradient
                      colors={t.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.swatchDot}
                    />
                    <Text style={[styles.swatchLabel, active && { color: colors.text }]}>
                      {t.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.mixBlock}>
            <Text style={styles.mixLabel}>SOUNDSCAPE</Text>
            <View style={styles.chips}>
              <Chip
                label="Off"
                accent={accent}
                active={player.soundscape === "off"}
                onPress={() => player.chooseSoundscape("off")}
              />
              {SOUNDS.filter((s) => s.category !== "Noise").map((s) => (
                <Chip
                  key={s.slug}
                  label={s.name}
                  accent={accent}
                  active={player.soundscape === s.slug}
                  onPress={() => player.chooseSoundscape(s.slug)}
                />
              ))}
            </View>
          </View>

          <View style={styles.mixBlock}>
            <Text style={styles.mixLabel}>SOUNDTRACK</Text>
            <View style={styles.chips}>
              <Chip
                label="Off"
                accent={accent}
                active={player.musicTrack === "off"}
                onPress={() => player.chooseMusic("off")}
              />
              {MUSIC_TRACKS.map((t) => (
                <Chip
                  key={t.id}
                  label={t.title.split(" · ")[0]}
                  accent={accent}
                  active={player.musicTrack === t.id}
                  onPress={() => player.chooseMusic(t.id)}
                />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SceneCanvas>
  );
}

function MandalaStage({
  theme,
  progress,
  playing,
  size,
  label,
  caption,
}: {
  theme: SceneTheme;
  progress: number;
  playing: boolean;
  size: number;
  label?: string;
  caption?: string;
}) {
  const bloom = useSharedValue(0);

  useEffect(() => {
    bloom.value = withTiming(playing ? progress : 0, {
      duration: 900,
      easing: Easing.inOut(Easing.ease),
    });
  }, [progress, playing, bloom]);

  const glow = useAnimatedStyle(() => ({
    opacity: 0.1 + bloom.value * 0.18,
    transform: [{ scale: 0.9 + bloom.value * 0.18 }],
  }));

  return (
    <View style={[styles.mandalaStage, { width: size, height: size }]}>
      <Animated.View
        style={[styles.mandalaGlow, { backgroundColor: theme.wash }, glow]}
        pointerEvents="none"
      />
      <Mandala size={size} intensity={playing ? progress : 0} colors={theme.mandala}>
        {label ? (
          <View style={styles.readout}>
            <Text style={[styles.readoutLabel, { color: theme.mandala[2] }]}>{label}</Text>
            {caption ? <Text style={styles.readoutCaption}>{caption}</Text> : null}
          </View>
        ) : null}
      </Mandala>
    </View>
  );
}

function formatTime(seconds: number) {
  const s = Math.max(0, Math.round(seconds));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
  },
  topLeft: { flexDirection: "row", alignItems: "center", gap: space.md },
  homeLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    paddingVertical: space.xs,
    paddingHorizontal: space.sm,
  },
  homeLabel: { ...type.caption, color: colors.textSecondary },
  topMeta: { flex: 1, alignItems: "center" },
  topLabel: { ...type.caption, color: colors.textSecondary },

  scroll: { alignItems: "center", paddingTop: space.lg },
  stage: {
    width: "100%",
    maxWidth: layout.maxContentWidth,
    gap: space["3xl"],
    alignItems: "center",
  },
  stageRow: { flexDirection: "row", alignItems: "center" },
  visualCol: { alignItems: "center", width: "100%" },
  infoCol: { width: "100%", maxWidth: 480, gap: space.lg, alignItems: "center" },

  mandalaStage: { alignItems: "center", justifyContent: "center", marginVertical: space.lg },
  mandalaGlow: { ...StyleSheet.absoluteFillObject, borderRadius: 999 },
  readout: { alignItems: "center", gap: 4 },
  readoutLabel: { ...type.hero, fontSize: 46 },
  readoutCaption: { ...type.caption, color: colors.textSecondary },

  swatches: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
  swatch: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    paddingLeft: space.sm,
    paddingRight: space.lg,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  swatchDot: { width: 18, height: 18, borderRadius: 9 },
  swatchLabel: { ...type.label, color: colors.textSecondary },

  title: { ...type.largeTitle, color: colors.text, textAlign: "center" },
  description: { ...type.body, color: colors.textSecondary, textAlign: "center", maxWidth: 420 },

  progressBlock: { width: "100%", gap: space.sm, marginTop: space.md },
  track: { height: 3, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.1)", overflow: "hidden" },
  fill: { height: 3, borderRadius: 2 },
  times: { flexDirection: "row", justifyContent: "space-between" },
  time: { ...type.caption, color: colors.textMuted },

  transport: {
    flexDirection: "row",
    alignItems: "center",
    gap: space["2xl"],
    marginTop: space.lg,
  },
  playBig: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  mixPanel: {
    width: "100%",
    maxWidth: layout.maxContentWidth,
    marginTop: space["4xl"],
    gap: space["2xl"],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hairline,
    paddingTop: space["2xl"],
  },
  mixBlock: { gap: space.md, width: "100%" },
  mixLabel: { ...type.caption, color: colors.textMuted },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
});
