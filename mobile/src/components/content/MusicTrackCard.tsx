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
};

/**
 * A music track as an album card: cover-art thumbnail on top, title + mood
 * underneath. The whole surface is the touch target.
 */
export function MusicTrackCard({ track, active = false, onPress }: Props) {
  const art = track.cover ? thumbUrl(track.cover) : null;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${track.title}, ${track.mood}${active ? ", playing" : ""}`}
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

        {/* Dark scrim so the title stays legible over bright covers. */}
        <LinearGradient
          colors={["transparent", "rgba(8,7,12,0.7)"]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        {active ? (
          <View style={styles.playingBadge}>
            <Icon name="music" size={12} color={colors.gold} />
          </View>
        ) : (
          <View style={styles.playHint}>
            <Icon name="play" size={13} color={colors.ink} />
          </View>
        )}
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
  playingBadge: {
    position: "absolute",
    top: space.md,
    right: space.md,
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: "rgba(8,7,12,0.6)",
    borderWidth: 1,
    borderColor: tint(colors.gold, 0.5),
    alignItems: "center",
    justifyContent: "center",
  },
  playHint: {
    position: "absolute",
    bottom: space.md,
    right: space.md,
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  meta: {
    gap: 2,
    paddingHorizontal: space.md,
    paddingVertical: space.md,
  },
  title: { ...type.headline, fontSize: 14, color: colors.text },
  mood: { ...type.caption, color: colors.textMuted },
});
