import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { CATEGORIES, EXPERIENCES, MUSIC_TRACKS, SOUNDS } from "@lofibuddha/shared";
import { Screen } from "@/src/components/ui/Screen";
import { Chip, SectionHeader, EmptyState } from "@/src/components/ui/Primitives";
import { CardRail } from "@/src/components/content/CardRail";
import { ExperienceCard } from "@/src/components/content/ExperienceCard";
import { usePlayer } from "@/src/providers/PlayerProvider";
import { useFavorites } from "@/src/lib/useFavorites";
import { accentByCategory, colors, radius, space, tint, type } from "@/src/theme/tokens";
import { useLayout } from "@/src/theme/useLayout";
import { Icon, type IconName } from "@/src/components/ui/Icon";

type Filter = "all" | "focus" | "breathe" | "sleep" | "relax";

export default function ExploreScreen() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const router = useRouter();
  const l = useLayout();
  const { playExperience, chooseSoundscape, chooseMusic } = usePlayer();
  const { toggle, isFavorite } = useFavorites();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return EXPERIENCES.filter((e) => {
      if (filter !== "all" && e.category !== filter) return false;
      if (!q) return true;
      return (
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.category.includes(q)
      );
    });
  }, [query, filter]);

  const searching = query.trim().length > 0;

  return (
    <Screen title="Explore" subtitle="Every session, sound and soundtrack">
      <View style={styles.search}>
        <Icon name="search" size={17} color={colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search practices, moods, sounds"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          returnKeyType="search"
        />
        {searching ? (
          <Pressable onPress={() => setQuery("")} hitSlop={8}>
            <Icon name="clear" size={17} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
      >
        <Chip label="All" active={filter === "all"} onPress={() => setFilter("all")} />
        {CATEGORIES.map((c) => (
          <Chip
            key={c.id}
            label={c.name}
            active={filter === c.id}
            accent={accentByCategory[c.id]}
            onPress={() => setFilter(c.id as Filter)}
          />
        ))}
      </ScrollView>

      {results.length === 0 ? (
        <EmptyState
          icon="search"
          title="Nothing matches yet"
          message="Try a feeling instead of a title — calm, sleep, focus, or rain."
        />
      ) : (
        <View style={styles.block}>
          <SectionHeader
            title={searching ? `${results.length} results` : "All practices"}
            caption={searching ? `for "${query}"` : undefined}
          />
          {l.isCompact ? (
            <View style={styles.list}>
              {results.map((exp) => (
                <ExperienceCard
                  key={exp.id}
                  experience={exp}
                  variant="row"
                  onPress={async () => {
                    await playExperience(exp);
                    router.push(`/player/${exp.id}`);
                  }}
                  isFavorite={isFavorite(exp.id)}
                  onToggleFavorite={() => toggle(exp.id)}
                />
              ))}
            </View>
          ) : (
            <CardRail minCardWidth={240}>
              {results.map((exp) => (
                <ExperienceCard
                  key={exp.id}
                  experience={exp}
                  onPress={async () => {
                    await playExperience(exp);
                    router.push(`/player/${exp.id}`);
                  }}
                />
              ))}
            </CardRail>
          )}
        </View>
      )}

      <View style={styles.block}>
        <SectionHeader title="Soundscapes" caption="Layer a background under anything" />
        <View style={styles.tokens}>
          {SOUNDS.filter((s) => s.category !== "Noise").map((s) => (
            <MiniTile
              key={s.slug}
              icon="water"
              label={s.name}
              caption={s.category}
              accent={colors.jade}
              onPress={() => chooseSoundscape(s.slug)}
            />
          ))}
        </View>
      </View>

      <View style={styles.block}>
        <SectionHeader title="Soundtracks" caption="Long-form temple lo-fi" />
        <View style={styles.tokens}>
          {MUSIC_TRACKS.map((t) => (
            <MiniTile
              key={t.id}
              icon="music"
              label={t.title.replace(" · ", " ")}
              caption={t.mood}
              accent={colors.gold}
              onPress={() => chooseMusic(t.id)}
            />
          ))}
        </View>
      </View>
    </Screen>
  );
}

function MiniTile({
  icon,
  label,
  caption,
  accent,
  onPress,
}: {
  icon: IconName;
  label: string;
  caption: string;
  accent: string;
  onPress: () => void;
}) {
  return (
    <View style={styles.tileWrap}>
      <Text
        onPress={onPress}
        suppressHighlighting
        style={[styles.tile, { borderColor: tint(accent, 0.25) }]}
      >
        <Icon name={icon} size={14} color={accent} />
        {"  "}
        <Text style={styles.tileLabel}>{label}</Text>
      </Text>
      <Text style={styles.tileCaption}>{caption}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    paddingHorizontal: space.lg,
    height: 46,
    marginBottom: space.lg,
    maxWidth: 560,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontFamily: type.body.fontFamily,
    fontSize: 15,
    outlineStyle: "none",
  } as any,
  filters: { gap: space.sm, paddingBottom: space["2xl"] },
  block: { marginBottom: space["3xl"] },
  list: { gap: 2 },
  tokens: { flexDirection: "row", flexWrap: "wrap", gap: space.md },
  tileWrap: { gap: 4 },
  tile: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    overflow: "hidden",
  },
  tileLabel: { ...type.label, color: colors.text },
  tileCaption: { ...type.caption, color: colors.textMuted, marginLeft: space.sm },
});
