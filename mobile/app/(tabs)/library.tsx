import React, { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { EXPERIENCES, getExperience, workshopExperiences } from "@lofibuddha/shared";
import { Screen } from "@/src/components/ui/Screen";
import { SectionHeader, EmptyState } from "@/src/components/ui/Primitives";
import { CardRail } from "@/src/components/content/CardRail";
import { ExperienceCard } from "@/src/components/content/ExperienceCard";
import { usePlayer } from "@/src/providers/PlayerProvider";
import { useFavorites } from "@/src/lib/useFavorites";
import { apiFetch } from "@/src/lib/api";
import { colors, radius, space, type } from "@/src/theme/tokens";
import { useLayout } from "@/src/theme/useLayout";

type Course = { id: string; title: string; description?: string; lessons?: unknown[] };
type Tab = "saved" | "recent" | "courses" | "workshops";

export default function LibraryScreen() {
  const params = useLocalSearchParams<{ tab?: string }>();
  const validTabs: Tab[] = ["saved", "recent", "courses", "workshops"];
  const [tab, setTab] = useState<Tab>(() =>
    validTabs.includes(params.tab as Tab) ? (params.tab as Tab) : "saved"
  );

  useEffect(() => {
    if (validTabs.includes(params.tab as Tab)) setTab(params.tab as Tab);
  }, [params.tab]);
  const [courses, setCourses] = useState<Course[]>([]);
  const router = useRouter();
  const l = useLayout();
  const { playExperience } = usePlayer();
  const { favorites, recent, toggle, isFavorite } = useFavorites();

  useFocusEffect(
    useCallback(() => {
      let active = true;
      apiFetch("/api/courses/public")
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          const list = data?.courses ?? data;
          if (active && Array.isArray(list)) setCourses(list.slice(0, 12));
        })
        .catch(() => {});
      return () => {
        active = false;
      };
    }, [])
  );

  const savedItems = favorites.map(getExperience).filter(Boolean);
  const recentItems = recent.map(getExperience).filter(Boolean);
  const workshops = workshopExperiences();
  const tabs: { id: Tab; label: string }[] = [
    { id: "saved", label: `Saved · ${favorites.length}` },
    { id: "recent", label: `Recent · ${recent.length}` },
    { id: "courses", label: `Courses · ${courses.length}` },
    { id: "workshops", label: `Workshops · ${workshops.length}` },
  ];
  const workshopSeries = workshops.reduce<{ name: string; items: typeof workshops }[]>(
    (groups, exp) => {
      const name = exp.series ?? "Workshops";
      const g = groups.find((x) => x.name === name);
      if (g) g.items.push(exp);
      else groups.push({ name, items: [exp] });
      return groups;
    },
    []
  );

  const open = async (id: string) => {
    const exp = getExperience(id);
    if (!exp) return;
    await playExperience(exp);
    router.push(`/player/${exp.id}`);
  };

  const openWorkshop = async (id: string) => {
    const exp = workshopExperiences().find((e) => e.id === id);
    if (!exp) return;
    await playExperience(exp);
    router.push(`/player/${exp.id}`);
  };

  return (
    <Screen title="Library" subtitle="Your saved practices and progress">
      <View style={styles.segmented}>
        {tabs.map((t) => (
          <Pressable
            key={t.id}
            onPress={() => setTab(t.id)}
            style={({ pressed }: any) => [
              styles.segment,
              pressed && { opacity: 0.8 },
            ]}
          >
            {tab === t.id ? (
              <LinearGradient
                colors={["#F7DDA0", "#C1842E"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            ) : null}
            <Text
              style={[styles.segmentText, tab === t.id && styles.segmentTextActive]}
              numberOfLines={1}
            >
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {tab === "saved" ? (
        savedItems.length ? (
          <View style={styles.block}>
            <SectionHeader title="Saved" caption="Tap the heart while listening to add more" />
            <View style={styles.playlistList}>
              {savedItems.map((exp) =>
                exp ? (
                  <ExperienceCard
                    key={exp.id}
                    experience={exp}
                    variant="mini"
                    onPress={() => open(exp.id)}
                    isFavorite={isFavorite(exp.id)}
                    onToggleFavorite={() => toggle(exp.id)}
                  />
                ) : null
              )}
            </View>
          </View>
        ) : (
          <EmptyState
            icon="heartOutline"
            title="Nothing saved yet"
            message={`Tap the heart on any of the ${EXPERIENCES.length} practices and it lands here.`}
          />
        )
      ) : null}

      {tab === "recent" ? (
        recentItems.length ? (
          <View style={styles.block}>
            <SectionHeader title="Recently played" />
            <View style={styles.playlistList}>
              {recentItems.map((exp) =>
                exp ? (
                  <ExperienceCard
                    key={exp.id}
                    experience={exp}
                    variant="mini"
                    onPress={() => open(exp.id)}
                  />
                ) : null
              )}
            </View>
          </View>
        ) : (
          <EmptyState
            icon="clock"
            title="No sessions yet"
            message="Start any practice and your history builds itself."
          />
        )
      ) : null}

      {tab === "courses" ? (
        courses.length ? (
          <View style={styles.block}>
            <SectionHeader title="Courses" caption="Multi-day journeys from LofiBuddha" />
            <View style={styles.courseGrid}>
              {courses.map((c) => (
                <View key={c.id} style={[styles.course, !l.isCompact && { width: "48%" }]}>
                  <Text style={styles.courseTitle} numberOfLines={2}>
                    {c.title}
                  </Text>
                  {c.description ? (
                    <Text style={styles.courseDesc} numberOfLines={3}>
                      {c.description}
                    </Text>
                  ) : null}
                  {c.lessons?.length ? (
                    <Text style={styles.courseMeta}>{c.lessons.length} lessons</Text>
                  ) : null}
                </View>
              ))}
            </View>
          </View>
        ) : (
          <EmptyState
            icon="school"
            title="Courses are on the way"
            message="They sync automatically from LofiBuddha once published."
          />
        )
      ) : null}

      {tab === "workshops" ? (
        <View style={styles.block}>
          <SectionHeader title="Workshops" caption="Multi-night guided series for deeper practice" />
          {workshopSeries.map((series) => (
            <View key={series.name} style={styles.seriesBlock}>
              <SectionHeader title={series.name} caption={`${series.items.length} sessions`} />
              <CardRail minCardWidth={240}>
                {series.items.map((exp) => (
                  <ExperienceCard key={exp.id} experience={exp} onPress={() => openWorkshop(exp.id)} />
                ))}
              </CardRail>
            </View>
          ))}
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  segmented: {
    flexDirection: "row",
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: 4,
    gap: 4,
    marginBottom: space["2xl"],
  },
  segment: {
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    borderRadius: radius.pill,
    overflow: "hidden",
  },
  segmentText: { ...type.label, color: colors.textSecondary },
  segmentTextActive: { color: colors.ink },
  block: { marginBottom: space["3xl"] },
  seriesBlock: { marginBottom: space["2xl"] },
  playlistList: { gap: space.sm },
  list: { gap: 2 },
  courseGrid: { flexDirection: "row", flexWrap: "wrap", gap: space.lg },
  course: {
    flexGrow: 1,
    minWidth: 240,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: space.xl,
    gap: space.sm,
  },
  courseTitle: { ...type.headline, color: colors.text },
  courseDesc: { ...type.bodySmall, color: colors.textSecondary },
  courseMeta: { ...type.caption, color: colors.textMuted },
});
