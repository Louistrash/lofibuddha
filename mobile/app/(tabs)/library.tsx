import React, { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { EXPERIENCES, getExperience, workshopExperiences } from "@lofibuddha/shared";
import { Screen } from "@/src/components/ui/Screen";
import { SectionHeader, EmptyState, Chip } from "@/src/components/ui/Primitives";
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
  const [tab, setTab] = useState<Tab>("saved");
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
      <View style={styles.tabs}>
        <Chip label={`Saved · ${favorites.length}`} active={tab === "saved"} onPress={() => setTab("saved")} />
        <Chip label={`Recent · ${recent.length}`} active={tab === "recent"} onPress={() => setTab("recent")} />
        <Chip label={`Courses · ${courses.length}`} active={tab === "courses"} onPress={() => setTab("courses")} />
        <Chip label={`Workshops · ${workshops.length}`} active={tab === "workshops"} onPress={() => setTab("workshops")} />
      </View>

      {tab === "saved" ? (
        savedItems.length ? (
          <View style={styles.block}>
            <SectionHeader title="Saved" caption="Tap the heart while listening to add more" />
            {l.isCompact ? (
              <View style={styles.list}>
                {savedItems.map((exp) =>
                  exp ? (
                    <ExperienceCard
                      key={exp.id}
                      experience={exp}
                      variant="row"
                      onPress={() => open(exp.id)}
                      isFavorite={isFavorite(exp.id)}
                      onToggleFavorite={() => toggle(exp.id)}
                    />
                  ) : null
                )}
              </View>
            ) : (
              <CardRail minCardWidth={240}>
                {savedItems.map((exp) =>
                  exp ? (
                    <ExperienceCard key={exp.id} experience={exp} onPress={() => open(exp.id)} />
                  ) : null
                )}
              </CardRail>
            )}
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
            <View style={styles.list}>
              {recentItems.map((exp) =>
                exp ? (
                  <ExperienceCard
                    key={exp.id}
                    experience={exp}
                    variant="row"
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
          <CardRail minCardWidth={240}>
            {workshops.map((exp) => (
              <ExperienceCard key={exp.id} experience={exp} onPress={() => openWorkshop(exp.id)} />
            ))}
          </CardRail>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: "row", flexWrap: "wrap", gap: space.sm, marginBottom: space["2xl"] },
  block: { marginBottom: space["3xl"] },
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
