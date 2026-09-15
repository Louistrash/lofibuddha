import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import {
  getExperience,
  workshopExperiences,
  MUSIC_TRACKS,
  SOUNDS,
} from "@lofibuddha/shared";
import { Screen } from "@/src/components/ui/Screen";
import { SectionHeader } from "@/src/components/ui/Primitives";
import { CardRail } from "@/src/components/content/CardRail";
import { ExperienceCard } from "@/src/components/content/ExperienceCard";
import { MusicTrackCard } from "@/src/components/content/MusicTrackCard";
import { SoundCard } from "@/src/components/content/SoundCard";
import { CourseCard } from "@/src/components/content/CourseCard";
import { usePlayer } from "@/src/providers/PlayerProvider";
import { useEntitlement } from "@/src/providers/EntitlementProvider";
import { useFavorites } from "@/src/lib/useFavorites";
import { apiFetch } from "@/src/lib/api";
import { colors, space } from "@/src/theme/tokens";

type Course = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;
  duration?: string;
  level?: string;
  moduleCount?: number;
  premium?: boolean;
};

/**
 * Library — every shelf in one place. Instead of tabs that hide most of the
 * catalogue (which read as "empty"), all content lives in stacked shelves:
 * Saved, Recent, Courses, Workshops (grouped by series), Soundtracks, Soundscapes.
 */
export default function LibraryScreen() {
  const router = useRouter();
  const { playExperience, chooseSoundscape, soundscape, chooseMusic, toggleMusic, musicOn, musicTrack } =
    usePlayer();
  const { tier } = useEntitlement();
  const { favorites, recent, toggle, isFavorite } = useFavorites();
  const [courses, setCourses] = useState<Course[]>([]);

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

  const scapes = SOUNDS.filter((s) => s.category !== "Noise");

  const toggleTrack = (id: string) => {
    if (musicOn && musicTrack === id) {
      void toggleMusic();
    } else if (musicTrack !== id) {
      void chooseMusic(id);
    } else {
      void toggleMusic();
    }
  };

  return (
    <Screen title="Library" subtitle="Your whole practice, in one place">
      {/* Saved */}
      {savedItems.length > 0 ? (
        <Animated.View entering={FadeInDown.duration(420)} style={styles.shelf}>
          <SectionHeader title="Saved" caption="Tap the heart while listening to add more" />
          <CardRail minCardWidth={240}>
            {savedItems.map((exp) =>
              exp ? (
                <ExperienceCard
                  key={exp.id}
                  experience={exp}
                  onPress={() => open(exp.id)}
                  isFavorite={isFavorite(exp.id)}
                  onToggleFavorite={() => toggle(exp.id)}
                />
              ) : null
            )}
          </CardRail>
        </Animated.View>
      ) : null}

      {/* Recently played */}
      {recentItems.length > 0 ? (
        <Animated.View entering={FadeInDown.duration(420).delay(60)} style={styles.shelf}>
          <SectionHeader title="Recently played" caption="Pick up where you left off" />
          <CardRail minCardWidth={240}>
            {recentItems.map((exp) =>
              exp ? <ExperienceCard key={exp.id} experience={exp} onPress={() => open(exp.id)} /> : null
            )}
          </CardRail>
        </Animated.View>
      ) : null}

      {/* Courses */}
      {courses.length > 0 ? (
        <Animated.View entering={FadeInDown.duration(420).delay(120)} style={styles.shelf}>
          <SectionHeader title="Courses" caption="Multi-day journeys from LofiBuddha" />
          <CardRail minCardWidth={260}>
            {courses.map((c) => (
              <CourseCard
                key={c.id}
                course={c}
                locked={!!c.premium && tier !== "enlightened"}
                onPress={() =>
                  router.push(c.premium && tier !== "enlightened" ? "/deepen" : `/course/${c.slug}`)
                }
              />
            ))}
          </CardRail>
        </Animated.View>
      ) : null}

      {/* Workshops — grouped by series */}
      {workshopSeries.map((series, i) => (
        <Animated.View
          key={series.name}
          entering={FadeInDown.duration(420).delay(160 + i * 40)}
          style={styles.shelf}
        >
          <SectionHeader title={series.name} caption={`${series.items.length} sessions`} />
          <CardRail minCardWidth={240}>
            {series.items.map((exp) => (
              <ExperienceCard key={exp.id} experience={exp} onPress={() => openWorkshop(exp.id)} />
            ))}
          </CardRail>
        </Animated.View>
      ))}

      {/* Soundtracks — the Suno temple-lofi catalogue */}
      <Animated.View entering={FadeInDown.duration(420).delay(200)} style={styles.shelf}>
        <SectionHeader
          title="Soundtracks"
          caption={`${MUSIC_TRACKS.length} temple lofi tracks to layer or play alone`}
        />
        <CardRail minCardWidth={180}>
          {MUSIC_TRACKS.map((t) => (
            <MusicTrackCard
              key={t.id}
              track={t}
              active={musicOn && musicTrack === t.id}
              onPress={() => router.push(`/music/${t.id}`)}
              onTogglePlay={() => toggleTrack(t.id)}
            />
          ))}
        </CardRail>
      </Animated.View>

      {/* Soundscapes */}
      <Animated.View entering={FadeInDown.duration(420).delay(240)} style={styles.shelf}>
        <SectionHeader title="Soundscapes" caption="Ambient texture to layer under anything" />
        <View style={styles.scapeGrid}>
          {scapes.map((s) => {
            const active = soundscape === s.slug;
            return (
              <SoundCard
                key={s.slug}
                label={s.name}
                caption={s.category}
                category={s.category}
                active={active}
                onPress={() => chooseSoundscape(active ? "off" : s.slug)}
              />
            );
          })}
        </View>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  shelf: { marginBottom: space["3xl"] },
  scapeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.md,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    paddingTop: space.lg,
  },
});
