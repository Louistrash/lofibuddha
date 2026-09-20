import React, { useCallback, useMemo } from "react";
import { Platform, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EXPERIENCES, MUSIC_TRACKS, SOUNDS, type Experience } from "@lofibuddha/shared";
import { SceneCanvas } from "@/src/components/content/SceneCanvas";
import { IconButton } from "@/src/components/ui/Button";
import { SectionHeader } from "@/src/components/ui/Primitives";
import { SoundCard } from "@/src/components/content/SoundCard";
import { usePlayer } from "@/src/providers/PlayerProvider";
import { coverUrl } from "@/src/lib/api";
import { useDismiss } from "@/src/lib/useDismiss";
import { colors, radius, space, tint, type } from "@/src/theme/tokens";
import { useLayout } from "@/src/theme/useLayout";
import { Icon } from "@/src/components/ui/Icon";

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function MusicDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const dismiss = useDismiss();
  const insets = useSafeAreaInsets();
  const l = useLayout();
  const { chooseMusic, toggleMusic, musicOn, musicTrack, playExperience, chooseSoundscape, soundscape } =
    usePlayer();

  const track = MUSIC_TRACKS.find((t) => t.id === id) ?? MUSIC_TRACKS[0];
  const playing = musicOn && musicTrack === track.id;
  const art = track.cover ? coverUrl(track.cover) : null;

  // Guides = elke experience met een voice-begeleiding; soundscapes = de ambient layers.
  const guides = useMemo(() => EXPERIENCES.filter((e) => e.guide), []);
  const scapes = useMemo(() => SOUNDS.filter((s) => s.category !== "Noise"), []);

  const handlePlay = useCallback(async () => {
    if (playing) {
      await toggleMusic();
      return;
    }
    if (musicTrack !== track.id) await chooseMusic(track.id);
    else await toggleMusic();
  }, [playing, musicTrack, track.id, chooseMusic, toggleMusic]);

  // Speel een guide (meditatie-stem) OVER deze soundtrack.
  const handleAddGuide = useCallback(
    async (g: Experience) => {
      await playExperience({ ...g, music: track.id, voiceOnly: true });
    },
    [playExperience, track.id]
  );

  const handleToggleScape = useCallback(
    (slug: string) => {
      void chooseSoundscape(soundscape === slug ? "off" : slug);
    },
    [chooseSoundscape, soundscape]
  );

  const handleShare = useCallback(async () => {
    // Deel de track-LINK (niet de cover-image). Ontvangers krijgen de sound link
    // mét een rijke preview (OG-image = cover) via de muziekpagina.
    const url = `https://lofibuddha.com/music/${track.id}`;
    const title = `${track.title} — LofiBuddha`;
    const text = `${track.title} — mindful lofi soundtrack on LofiBuddha`;
    if (Platform.OS === "web") {
      try {
        if (navigator.share) {
          await navigator.share({ title, text, url });
          return;
        }
      } catch {}
      try {
        await navigator.clipboard.writeText(url);
        return;
      } catch {}
      return;
    }
    try {
      await Share.share({ message: `${text}\n${url}`, url });
    } catch {}
  }, [track]);

  return (
    <SceneCanvas>
      <View style={[styles.topBar, { paddingTop: insets.top + space.md }]}>
        <IconButton icon="back" onPress={dismiss} accessibilityLabel="Back" />
        <Text style={styles.topLabel}>SOUNDTRACK</Text>
        <IconButton
          icon="share"
          onPress={handleShare}
          accessibilityLabel="Share"
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
          <View style={[styles.artWrap, l.isDesktop && { flex: 1 }]}>
            {art ? (
              <Image
                source={{ uri: art }}
                style={styles.art}
                contentFit="cover"
                transition={250}
                cachePolicy="memory-disk"
              />
            ) : (
              <LinearGradient
                colors={[tint(colors.lotus, 0.3), colors.card]}
                style={styles.art}
              >
                <Icon name="music" size={64} color={colors.lotus} />
              </LinearGradient>
            )}
            <LinearGradient
              colors={["transparent", "rgba(8,7,12,0.55)"]}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />
          </View>

          <View style={[styles.info, l.isDesktop && { flex: 1 }]}>
            <Text style={styles.title}>{track.title}</Text>
            <Text style={styles.description}>{track.description}</Text>

            <View style={styles.metaRow}>
              <View style={styles.metaPill}>
                <Icon name="music" size={13} color={colors.gold} />
                <Text style={styles.metaText}>{track.mood}</Text>
              </View>
              <View style={styles.metaPill}>
                <Icon name="clock" size={13} color={colors.textMuted} />
                <Text style={styles.metaText}>{formatDuration(track.duration)}</Text>
              </View>
            </View>

            <Pressable
              onPress={handlePlay}
              style={({ pressed }: any) => [
                styles.playBig,
                pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
              ]}
            >
              <LinearGradient
                colors={[colors.goldBright, colors.goldDeep]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <Icon name={playing ? "pause" : "play"} size={28} color={colors.ink} />
            </Pressable>

            <Text style={styles.playingNote}>
              {playing ? "Now playing — layer a guide or soundscape below" : "Tap to play this soundtrack"}
            </Text>
          </View>
        </View>

        {/* Layering: add a guided voice over the music */}
        <View style={styles.layerSection}>
          <SectionHeader title="Add a guide" caption="Layer a guided voice over this soundtrack" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.rail}
          >
            {guides.map((g) => (
              <Pressable
                key={g.id}
                onPress={() => handleAddGuide(g)}
                style={({ pressed }: any) => [styles.guideChip, pressed && { opacity: 0.85 }]}
              >
                <LinearGradient
                  colors={[colors.goldBright, colors.goldDeep]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <Icon name="headphones" size={14} color={colors.ink} />
                <Text style={[styles.guideTitle, { color: colors.ink }]} numberOfLines={2}>
                  {g.title}
                </Text>
                <Text style={[styles.guideDur, { color: "rgba(8,7,12,0.64)" }]}>{g.duration}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Layering: add an ambient soundscape under the music */}
        <View style={styles.layerSection}>
          <SectionHeader title="Add a soundscape" caption="Ambient texture under the music" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.rail}
          >
            {scapes.map((s) => {
              const active = soundscape === s.slug;
              return (
                <SoundCard
                  key={s.slug}
                  label={s.name}
                  caption={s.category}
                  category={s.category}
                  active={active}
                  onPress={() => handleToggleScape(s.slug)}
                />
              );
            })}
          </ScrollView>
        </View>
      </ScrollView>
    </SceneCanvas>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
  },
  topLabel: { ...type.caption, color: colors.textSecondary, letterSpacing: 1 },

  scroll: { alignItems: "center", paddingTop: space.lg },
  stage: {
    width: "100%",
    maxWidth: 900,
    gap: space["3xl"],
    alignItems: "center",
  },
  stageRow: { flexDirection: "row", alignItems: "center" },

  artWrap: {
    width: "100%",
    maxWidth: 420,
    aspectRatio: 1,
    borderRadius: radius.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  art: { width: "100%", height: "100%" },

  info: { width: "100%", maxWidth: 460, gap: space.md, alignItems: "center" },
  title: { ...type.largeTitle, color: colors.text, textAlign: "center" },
  description: { ...type.body, color: colors.textSecondary, textAlign: "center" },

  metaRow: { flexDirection: "row", gap: space.sm, marginTop: space.sm },
  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: space.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  metaText: { ...type.caption, color: colors.textSecondary },

  playBig: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginTop: space.lg,
    cursor: "pointer",
  } as any,

  playingNote: { ...type.caption, color: colors.textMuted },

  layerSection: {
    width: "100%",
    maxWidth: 900,
    marginTop: space["3xl"],
    gap: space.md,
  },
  rail: { gap: space.sm, paddingVertical: space.xs },
  guideChip: {
    width: 168,
    paddingHorizontal: space.md,
    paddingVertical: space.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "rgba(166,124,61,0.45)",
    backgroundColor: colors.card,
    gap: 6,
    alignItems: "flex-start",
    overflow: "hidden",
  },
  guideTitle: { ...type.headline, fontSize: 13, color: colors.text },
  guideDur: { ...type.caption, color: colors.textMuted },
});
