import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import {
  getExperience,
  workshopExperiences,
  MUSIC_TRACKS,
  SOUNDS,
} from "@lofibuddha/shared";
import { Screen } from "@/src/components/ui/Screen";
import { Chip } from "@/src/components/ui/Primitives";
import { CardRail } from "@/src/components/content/CardRail";
import { ExperienceCard } from "@/src/components/content/ExperienceCard";
import { MusicTrackCard } from "@/src/components/content/MusicTrackCard";
import { SoundCard } from "@/src/components/content/SoundCard";
import { CourseCard } from "@/src/components/content/CourseCard";
import { Shelf } from "@/src/components/content/Shelf";
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

const PREVIEW = 8;

/**
 * Library — stacked shelves with accordion + preview so the catalogue
 * first-paints as headers (and Suno soundtracks near the top) instead of
 * mounting every workshop card and cover image at once.
 */
export default function LibraryScreen() {
  const router = useRouter();
  const {
    playExperience,
    chooseSoundscape,
    soundscape,
    chooseMusic,
    toggleMusic,
    musicOn,
    musicTrack,
  } = usePlayer();
  const { tier } = useEntitlement();
  const { favorites, recent, toggle, isFavorite } = useFavorites();
  const [courses, setCourses] = useState<Course[]>([]);

  const scrollRef = useRef<ScrollView>(null);
  const scrollY = useRef(0);
  const sectionRefs = useRef<Record<string, View | null>>({});

  /** Expand state per shelf id — jump-nav can force a section open. */
  const [open, setOpen] = useState<Record<string, boolean>>({
    saved: true,
    recent: true,
    soundtracks: true,
  });

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

  const savedItems = useMemo(
    () => favorites.map(getExperience).filter(Boolean),
    [favorites]
  );
  const recentItems = useMemo(
    () => recent.map(getExperience).filter(Boolean),
    [recent]
  );

  const workshops = useMemo(() => workshopExperiences(), []);
  const workshopSeries = useMemo(() => {
    return workshops.reduce<{ name: string; items: typeof workshops }[]>(
      (groups, exp) => {
        const name = exp.series ?? "Workshops";
        const g = groups.find((x) => x.name === name);
        if (g) g.items.push(exp);
        else groups.push({ name, items: [exp] });
        return groups;
      },
      []
    );
  }, [workshops]);

  const scapes = useMemo(
    () => SOUNDS.filter((s) => s.category !== "Noise"),
    []
  );

  const jumpTargets = useMemo(() => {
    const chips: { id: string; label: string }[] = [];
    if (savedItems.length) chips.push({ id: "saved", label: "Saved" });
    if (recentItems.length) chips.push({ id: "recent", label: "Recent" });
    chips.push({ id: "soundtracks", label: "Soundtracks" });
    if (courses.length) chips.push({ id: "courses", label: "Courses" });
    for (const series of workshopSeries) {
      chips.push({ id: `series:${series.name}`, label: series.name });
    }
    chips.push({ id: "soundscapes", label: "Soundscapes" });
    return chips;
  }, [savedItems.length, recentItems.length, courses.length, workshopSeries]);

  const setShelfOpen = useCallback((id: string, value: boolean) => {
    setOpen((prev) => (prev[id] === value ? prev : { ...prev, [id]: value }));
  }, []);

  const isOpen = (id: string, fallback = false) =>
    open[id] !== undefined ? open[id] : fallback;

  const openExp = async (id: string) => {
    const exp = getExperience(id);
    if (!exp) return;
    await playExperience(exp);
    router.push(`/player/${exp.id}`);
  };

  const openWorkshop = async (id: string) => {
    const exp = workshops.find((e) => e.id === id);
    if (!exp) return;
    await playExperience(exp);
    router.push(`/player/${exp.id}`);
  };

  const toggleTrack = (id: string) => {
    if (musicOn && musicTrack === id) {
      void toggleMusic();
    } else if (musicTrack !== id) {
      void chooseMusic(id);
    } else {
      void toggleMusic();
    }
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollY.current = e.nativeEvent.contentOffset.y;
  };

  const jumpTo = (id: string) => {
    setShelfOpen(id, true);

    // Wait a frame so the shelf mounts before measuring.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const section = sectionRefs.current[id];
        const scroll = scrollRef.current;
        if (!section || !scroll) return;

        // ScrollView's host view supports measureInWindow at runtime.
        const scrollHost = scroll as unknown as View;
        section.measureInWindow((_x, sectionY) => {
          scrollHost.measureInWindow((_sx, scrollWindowY) => {
            const target = scrollY.current + (sectionY - scrollWindowY) - 12;
            scroll.scrollTo({ y: Math.max(0, target), animated: true });
          });
        });
      });
    });
  };

  const bindSection = (id: string) => (node: View | null) => {
    sectionRefs.current[id] = node;
  };

  return (
    <Screen
      title="Library"
      subtitle="Your whole practice, in one place"
      scrollRef={scrollRef}
      onScroll={onScroll}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        style={styles.chipsScroll}
      >
        {jumpTargets.map((chip) => (
          <Chip
            key={chip.id}
            label={chip.label}
            onPress={() => jumpTo(chip.id)}
          />
        ))}
      </ScrollView>

      {savedItems.length > 0 ? (
        <View ref={bindSection("saved")} collapsable={false}>
          <Shelf
            title="Saved"
            caption="Tap the heart while listening to add more"
            count={savedItems.length}
            expanded={isOpen("saved", true)}
            onExpandedChange={(v) => setShelfOpen("saved", v)}
          >
            <CardRail minCardWidth={240}>
              {savedItems.map((exp) =>
                exp ? (
                  <ExperienceCard
                    key={exp.id}
                    experience={exp}
                    onPress={() => openExp(exp.id)}
                    isFavorite={isFavorite(exp.id)}
                    onToggleFavorite={() => toggle(exp.id)}
                  />
                ) : null
              )}
            </CardRail>
          </Shelf>
        </View>
      ) : null}

      {recentItems.length > 0 ? (
        <View ref={bindSection("recent")} collapsable={false}>
          <Shelf
            title="Recently played"
            caption="Pick up where you left off"
            count={recentItems.length}
            expanded={isOpen("recent", true)}
            onExpandedChange={(v) => setShelfOpen("recent", v)}
          >
            <CardRail minCardWidth={240}>
              {recentItems.map((exp) =>
                exp ? (
                  <ExperienceCard
                    key={exp.id}
                    experience={exp}
                    onPress={() => openExp(exp.id)}
                  />
                ) : null
              )}
            </CardRail>
          </Shelf>
        </View>
      ) : null}

      <View ref={bindSection("soundtracks")} collapsable={false}>
        <Shelf
          title="Soundtracks"
          caption={`${MUSIC_TRACKS.length} temple lofi tracks to layer or play alone`}
          count={MUSIC_TRACKS.length}
          expanded={isOpen("soundtracks", true)}
          onExpandedChange={(v) => setShelfOpen("soundtracks", v)}
          previewLimit={PREVIEW}
        >
          {({ limit, showAll }) => (
            <CardRail minCardWidth={180} wrap={showAll || limit == null}>
              {(limit != null ? MUSIC_TRACKS.slice(0, limit) : MUSIC_TRACKS).map(
                (t) => (
                  <MusicTrackCard
                    key={t.id}
                    track={t}
                    active={musicOn && musicTrack === t.id}
                    onPress={() => router.push(`/music/${t.id}`)}
                    onTogglePlay={() => toggleTrack(t.id)}
                  />
                )
              )}
            </CardRail>
          )}
        </Shelf>
      </View>

      {courses.length > 0 ? (
        <View ref={bindSection("courses")} collapsable={false}>
          <Shelf
            title="Courses"
            caption="Multi-day journeys from LofiBuddha"
            count={courses.length}
            expanded={isOpen("courses", false)}
            onExpandedChange={(v) => setShelfOpen("courses", v)}
            previewLimit={PREVIEW}
          >
            {({ limit, showAll }) => (
              <CardRail minCardWidth={260} wrap={showAll || limit == null}>
                {(limit != null ? courses.slice(0, limit) : courses).map((c) => (
                  <CourseCard
                    key={c.id}
                    course={c}
                    locked={!!c.premium && tier !== "enlightened"}
                    onPress={() =>
                      router.push(
                        c.premium && tier !== "enlightened"
                          ? "/deepen"
                          : `/course/${c.slug}`
                      )
                    }
                  />
                ))}
              </CardRail>
            )}
          </Shelf>
        </View>
      ) : null}

      {workshopSeries.map((series) => {
        const id = `series:${series.name}`;
        return (
          <View key={series.name} ref={bindSection(id)} collapsable={false}>
            <Shelf
              title={series.name}
              caption={`${series.items.length} sessions`}
              count={series.items.length}
              expanded={isOpen(id, false)}
              onExpandedChange={(v) => setShelfOpen(id, v)}
              previewLimit={PREVIEW}
            >
              {({ limit, showAll }) => (
                <CardRail minCardWidth={240} wrap={showAll || limit == null}>
                  {(limit != null
                    ? series.items.slice(0, limit)
                    : series.items
                  ).map((exp) => (
                    <ExperienceCard
                      key={exp.id}
                      experience={exp}
                      onPress={() => openWorkshop(exp.id)}
                    />
                  ))}
                </CardRail>
              )}
            </Shelf>
          </View>
        );
      })}

      <View ref={bindSection("soundscapes")} collapsable={false}>
        <Shelf
          title="Soundscapes"
          caption="Ambient texture to layer under anything"
          count={scapes.length}
          expanded={isOpen("soundscapes", false)}
          onExpandedChange={(v) => setShelfOpen("soundscapes", v)}
        >
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
        </Shelf>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  chipsScroll: { marginBottom: space.xl, marginHorizontal: -space.xs },
  chips: {
    gap: space.sm,
    paddingHorizontal: space.xs,
    paddingBottom: space.xs,
  },
  scapeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.md,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    paddingTop: space.lg,
  },
});
