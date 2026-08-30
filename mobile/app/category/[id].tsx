import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CATEGORIES, getCategoryExperiences, type ExperienceCategory } from "@lofibuddha/shared";
import { Screen } from "@/src/components/ui/Screen";
import { EmptyState } from "@/src/components/ui/Primitives";
import { IconButton } from "@/src/components/ui/Button";
import { CardRail } from "@/src/components/content/CardRail";
import { ExperienceCard } from "@/src/components/content/ExperienceCard";
import { usePlayer } from "@/src/providers/PlayerProvider";
import { useFavorites } from "@/src/lib/useFavorites";
import { accentByCategory, colors, radius, space, tint, type } from "@/src/theme/tokens";
import { useLayout } from "@/src/theme/useLayout";
import { Icon } from "@/src/components/ui/Icon";
import { useDismiss } from "@/src/lib/useDismiss";

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const dismiss = useDismiss();
  const l = useLayout();
  const insets = useSafeAreaInsets();
  const { playExperience } = usePlayer();
  const { toggle, isFavorite } = useFavorites();

  const category = CATEGORIES.find((c) => c.id === id);

  if (!category) {
    return (
      <Screen title="Journey">
        <EmptyState title="Unknown journey" message="Pick one of the four paths from Today." />
      </Screen>
    );
  }

  const accent = accentByCategory[category.id as ExperienceCategory] ?? colors.gold;
  const items = getCategoryExperiences(category.id);

  const open = async (expId: string) => {
    const exp = items.find((e) => e.id === expId);
    if (!exp) return;
    await playExperience(exp);
    router.push(`/player/${exp.id}`);
  };

  return (
    <Screen>
      <View style={[styles.hero, { marginTop: l.isDesktop ? 0 : insets.top ? 0 : space.lg }]}>
        <LinearGradient
          colors={[tint(accent, 0.35), "rgba(14,13,22,0.95)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.heroOrb, { backgroundColor: accent }]} />

        <View style={styles.heroTop}>
          <IconButton icon="back" onPress={() => dismiss()} accessibilityLabel="Back" />
          <Text style={[styles.script, { color: tint(accent, 0.95) }]}>{category.script}</Text>
        </View>

        <View style={styles.heroBody}>
          <Text style={styles.heroTitle}>{category.name}</Text>
          <Text style={styles.heroTagline}>{category.tagline}</Text>
          <View style={styles.heroMeta}>
            <Icon name="layers" size={14} color={colors.textMuted} />
            <Text style={styles.heroMetaText}>{items.length} practices</Text>
          </View>
        </View>
      </View>

      {l.isCompact ? (
        <View style={styles.grid}>
          {items.map((exp) => (
            <View key={exp.id} style={styles.gridCell}>
              <ExperienceCard
                experience={exp}
                variant="tile"
                onPress={() => open(exp.id)}
                isFavorite={isFavorite(exp.id)}
                onToggleFavorite={() => toggle(exp.id)}
              />
            </View>
          ))}
        </View>
      ) : (
        <CardRail minCardWidth={240}>
          {items.map((exp) => (
            <ExperienceCard key={exp.id} experience={exp} onPress={() => open(exp.id)} />
          ))}
        </CardRail>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.hairline,
    overflow: "hidden",
    padding: space.xl,
    minHeight: 200,
    justifyContent: "space-between",
    gap: space["2xl"],
    marginBottom: space["2xl"],
  },
  heroOrb: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    bottom: -110,
    right: -60,
    opacity: 0.2,
  },
  heroTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  script: { ...type.devanagari, fontSize: 22 },
  heroBody: { gap: space.xs },
  heroTitle: { ...type.hero, color: colors.text },
  heroTagline: { ...type.body, color: colors.textSecondary },
  heroMeta: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: space.sm },
  heroMetaText: { ...type.caption, color: colors.textMuted },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: space.md },
  gridCell: { flexGrow: 1, flexBasis: 160, minWidth: 150, maxWidth: "100%" },
});
