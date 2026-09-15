import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import type { MusicTrack } from "@lofibuddha/shared";
import { thumbUrl } from "@/src/lib/api";
import { colors, radius, shadow, space, tint, type } from "@/src/theme/tokens";
import { Icon } from "@/src/components/ui/Icon";

type Props = {
  track: MusicTrack;
  active?: boolean;
  onPress: () => void;
  onTogglePlay?: () => void;
};

function formatDuration(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.round(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

/**
 * A music track as an album card: cover-art thumbnail on top, title + mood
 * underneath. Carries a live play/pause button and a duration badge so a
 * track can be started (or layered) straight from the shelf.
 */
export function MusicTrackCard({ track, active = false, onPress, onTogglePlay }: Props) {
  const art = track.cover ? thumbUrl(track.cover) : null;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${track.title}, ${track.mood}, ${formatDuration(track.duration)}${
        active ? ", playing" : ""
      }`}
      style={({ pressed, hovered }: any) => [
        styles.card,
        hovered && styles.cardHover,
        pressed && { opacity: 0.9, transform: [{ scale: 0.985 }] },
      ]}
    >
      <View style={styles.art}>
        {art ? (
          <Image
            source={{ uri: art }}
            style={styles.artImage}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
          />
        ) : (
          <LinearGradient
            colors={[tint(colors.lotus, 0.3), colors.card]}
            style={styles.artImage}
          >
            <Icon name="music" size={28} color={colors.lotus} />
          </LinearGradient>
        )}

        {/* Dark scrim so overlays stay legible over bright covers. */}
        <LinearGradient
          colors={["transparent", "rgba(8,7,12,0.7)"]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        {/* Duration / length */}
        <View style={styles.durationBadge} pointerEvents="none">
          <Icon name="clock" size={11} color={colors.text} />
          <Text style={styles.durationText}>{formatDuration(track.duration)}</Text>
        </View>

        {/* Play / pause */}
        <Pressable
          onPress={(e: any) => {
            e?.stopPropagation?.();
            onTogglePlay?.();
          }}
          accessibilityRole="button"
          accessibilityLabel={active ? "Pause" : "Play"}
          style={({ pressed }: any) => [
            styles.playButton,
            pressed && { opacity: 0.85, transform: [{ scale: 0.92 }] },
          ]}
        >
          <Icon name={active ? "pause" : "play"} size={15} color={colors.ink} />
        </Pressable>
      </View>

      <View style={styles.meta}>
        <Text style={styles.title} numberOfLines={1}>
          {track.title}
        </Text>
        <Text style={styles.mood} numberOfLines={1}>
          {track.mood}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexGrow: 1,
    flexBasis: 168,
    maxWidth: 240,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.card,
    overflow: "hidden",
    ...shadow.card,
    cursor: "pointer",
  } as any,
  cardHover: { borderColor: colors.hairlineStrong },
  art: {
    width: "100%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  artImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  durationBadge: {
    position: "absolute",
    top: space.sm,
    left: space.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: "rgba(8,7,12,0.68)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  durationText: { ...type.caption, fontSize: 11, letterSpacing: 0, color: colors.text },
  playButton: {
    position: "absolute",
    bottom: space.md,
    right: space.md,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  } as any,
  meta: {
    gap: 2,
    paddingHorizontal: space.md,
    paddingVertical: space.md,
  },
  title: { ...type.headline, fontSize: 14, color: colors.text },
  mood: { ...type.caption, color: colors.textMuted },
});
