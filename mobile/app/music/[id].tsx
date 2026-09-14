import React, { useCallback } from "react";
import { Platform, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MUSIC_TRACKS } from "@lofibuddha/shared";
import { SceneCanvas } from "@/src/components/content/SceneCanvas";
import { IconButton } from "@/src/components/ui/Button";
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
  const { chooseMusic, toggleMusic, musicOn, musicTrack } = usePlayer();

  const track = MUSIC_TRACKS.find((t) => t.id === id) ?? MUSIC_TRACKS[0];
  const playing = musicOn && musicTrack === track.id;
  const art = track.cover ? coverUrl(track.cover) : null;

  const handlePlay = useCallback(async () => {
    if (playing) {
      await toggleMusic();
      return;
    }
    if (musicTrack !== track.id) await chooseMusic(track.id);
    else await toggleMusic();
  }, [playing, musicTrack, track.id, chooseMusic, toggleMusic]);

  const handleShare = useCallback(async () => {
    const url = art ?? `https://lofibuddha.com/music/${track.id}`;
    const title = `${track.title} — LofiBuddha`;
    if (Platform.OS === "web") {
      try {
        if (navigator.share) {
          await navigator.share({ title, url });
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
      await Share.share({ message: `${title} — ${url}` });
    } catch {}
  }, [art, track]);

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

            {playing ? (
              <Text style={styles.playingNote}>Now playing — mix it with any practice</Text>
            ) : (
              <Text style={styles.playingNote}>Tap to play this soundtrack</Text>
            )}
          </View>
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
});
