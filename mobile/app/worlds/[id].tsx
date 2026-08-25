import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SceneCanvas } from "@/src/components/content/SceneCanvas";
import { IconButton } from "@/src/components/ui/Button";
import { usePlayer } from "@/src/providers/PlayerProvider";
import { getWorld, WORLDS } from "@/src/lib/worlds";
import { getSceneTheme } from "@/src/theme/sceneThemes";
import { colors, radius, space, tint, type } from "@/src/theme/tokens";
import { useLayout } from "@/src/theme/useLayout";
import { Icon } from "@/src/components/ui/Icon";
import { useDismiss } from "@/src/lib/useDismiss";

export default function WorldScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const dismiss = useDismiss();
  const l = useLayout();
  const insets = useSafeAreaInsets();
  const { chooseSoundscape, chooseMusic, musicOn, toggleMusic } = usePlayer();

  const world = getWorld(String(id));
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await chooseSoundscape(world.sound);
      await chooseMusic(world.music);
      if (!cancelled) setEntered(true);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [world.id]);

  return (
    <SceneCanvas theme={getSceneTheme(world.theme)} intensity={entered ? 0.8 : 0.4}>
      <View style={[styles.top, { paddingTop: insets.top + space.md, paddingHorizontal: l.gutter }]}>
        <IconButton icon="back" onPress={() => dismiss()} accessibilityLabel="Back" />
        <IconButton
          icon={musicOn ? "music" : "musicOff"}
          color={musicOn ? world.accent : colors.textSecondary}
          onPress={() => toggleMusic()}
          accessibilityLabel="Toggle music"
        />
      </View>

      <View style={[styles.body, { paddingHorizontal: l.gutter }]}>
        <Text style={[styles.script, { color: tint(world.accent, 0.95) }]}>{world.script}</Text>
        <Text style={styles.title}>{world.title}</Text>
        <Text style={styles.subtitle}>{world.subtitle}</Text>

        <View style={[styles.state, { borderColor: tint(world.accent, 0.35) }]}>
          <View style={[styles.dot, { backgroundColor: world.accent }]} />
          <Text style={styles.stateText}>{entered ? "You are here" : "Arriving…"}</Text>
        </View>
      </View>

      <View style={[styles.switcher, { paddingBottom: insets.bottom + space["2xl"], paddingHorizontal: l.gutter }]}>
        <Text style={styles.switcherLabel}>TRAVEL TO</Text>
        <View style={styles.switcherRow}>
          {WORLDS.filter((w) => w.id !== world.id).map((w) => (
            <Pressable
              key={w.id}
              onPress={() => router.replace(`/worlds/${w.id}`)}
              style={({ hovered, pressed }: any) => [
                styles.switcherItem,
                (hovered || pressed) && { borderColor: tint(w.accent, 0.5) },
              ]}
            >
              <Text style={[styles.switcherScript, { color: tint(w.accent, 0.9) }]}>{w.script}</Text>
              <Text style={styles.switcherTitle}>{w.title}</Text>
              <Icon name="arrowRight" size={14} color={colors.textMuted} />
            </Pressable>
          ))}
        </View>
      </View>
    </SceneCanvas>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  body: { flex: 1, alignItems: "center", justifyContent: "center", gap: space.sm },
  script: { ...type.devanagari, fontSize: 34 },
  title: { ...type.hero, color: colors.text, textAlign: "center" },
  subtitle: { ...type.body, color: colors.textSecondary, textAlign: "center" },
  state: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    marginTop: space.xl,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
  stateText: { ...type.caption, color: colors.textSecondary },

  switcher: { gap: space.md },
  switcherLabel: { ...type.caption, color: colors.textMuted },
  switcherRow: { flexDirection: "row", flexWrap: "wrap", gap: space.md },
  switcherItem: {
    flexGrow: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  switcherScript: { ...type.devanagari, fontSize: 16 },
  switcherTitle: { ...type.label, color: colors.text, flex: 1 },
});
