import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePlayer } from "@/src/providers/PlayerProvider";
import { accentByCategory, colors, layout, radius, space, tint, type } from "@/src/theme/tokens";
import { useLayout } from "@/src/theme/useLayout";
import { Icon } from "@/src/components/ui/Icon";

export function MiniPlayer() {
  const { experience, phase, toggle, clear, progress } = usePlayer();
  const router = useRouter();
  const l = useLayout();
  const insets = useSafeAreaInsets();

  if (!experience) return null;

  const accent = accentByCategory[experience.category] ?? colors.gold;
  const playing = phase === "playing";

  return (
    <View
      style={[
        styles.wrap,
        l.isDesktop
          ? { left: space["2xl"], right: space["2xl"], bottom: space["2xl"] }
          : {
              left: space.md,
              right: space.md,
              bottom: layout.tabBarHeight + insets.bottom + space.sm,
            },
      ]}
      pointerEvents="box-none"
    >
      <Pressable
        onPress={() => router.push(`/player/${experience.id}`)}
        style={({ hovered }: any) => [styles.bar, hovered && { borderColor: colors.hairlineStrong }]}
      >
        {Platform.OS === "web" ? (
          <View style={[StyleSheet.absoluteFill, styles.webSurface]} />
        ) : (
          <BlurView intensity={70} tint="dark" style={StyleSheet.absoluteFill} />
        )}

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.min(100, progress * 100)}%`, backgroundColor: accent },
            ]}
          />
        </View>

        <LinearGradient
          colors={[tint(accent, 0.9), tint(accent, 0.45)]}
          style={styles.art}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Icon name="music" size={16} color={colors.ink} />
        </LinearGradient>

        <View style={styles.meta}>
          <Text style={styles.title} numberOfLines={1}>
            {experience.title}
          </Text>
          <Text style={styles.sub} numberOfLines={1}>
            {playing ? "Now playing" : "Paused"} · {experience.duration}
          </Text>
        </View>

        <View style={styles.controls}>
          <Pressable
            onPress={(e) => {
              e.stopPropagation?.();
              toggle();
            }}
            hitSlop={10}
            style={({ pressed }) => [styles.playBtn, pressed && { opacity: 0.75 }]}
          >
            <Icon name={playing ? "pause" : "play"} size={17} color={colors.ink} />
          </Pressable>
          {l.isMedium ? (
            <Pressable
              onPress={(e) => {
                e.stopPropagation?.();
                clear();
              }}
              hitSlop={10}
              style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.6 }]}
            >
              <Icon name="close" size={16} color={colors.textSecondary} />
            </Pressable>
          ) : null}
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", zIndex: 40 },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    height: layout.miniPlayerHeight,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    overflow: "hidden",
    maxWidth: layout.maxContentWidth,
    alignSelf: "center",
    width: "100%",
  },
  webSurface: { backgroundColor: "rgba(18,17,26,0.94)" },
  progressTrack: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  progressFill: { height: 2 },
  art: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  meta: { flex: 1 },
  title: { ...type.headline, fontSize: 14, color: colors.text },
  sub: { ...type.caption, color: colors.textMuted, marginTop: 2 },
  controls: { flexDirection: "row", alignItems: "center", gap: space.sm },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});
