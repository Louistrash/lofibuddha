import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "@/src/components/ui/Screen";
import { Badge } from "@/src/components/ui/Primitives";
import { Button } from "@/src/components/ui/Button";
import { Icon } from "@/src/components/ui/Icon";
import { apiFetch } from "@/src/lib/api";
import { useEntitlement } from "@/src/providers/EntitlementProvider";
import { usePlayer } from "@/src/providers/PlayerProvider";
import { useCourseProgress } from "@/src/lib/useCourseProgress";
import { getExperience } from "@lofibuddha/shared";
import { colors, radius, space, tint, type } from "@/src/theme/tokens";

type Module = {
  day: number;
  title: string;
  type: string;
  content: string;
  experience?: string;
};

type Course = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;
  duration?: string;
  level?: string;
  moduleCount?: number;
  modules?: Module[];
  premium?: boolean;
  availableLanguages?: string[];
};

export default function CourseScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const { tier } = useEntitlement();
  const { playExperience } = usePlayer();
  const router = useRouter();
  const { completed, toggle, isComplete } = useCourseProgress(course?.slug ?? String(slug));

  useEffect(() => {
    let active = true;
    apiFetch(`/api/courses/public?slug=${encodeURIComponent(slug)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (active && data && !data.error) setCourse(data);
        if (active) setLoading(false);
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug]);

  const locked = !!course?.premium && tier !== "enlightened";

  const modules = course?.modules ?? [];
  const doneCount = modules.filter((m) => isComplete(m.day)).length;
  const pct = modules.length ? doneCount / modules.length : 0;
  const nextUp = useMemo(
    () => modules.find((m) => !isComplete(m.day)) ?? null,
    [modules, completed]
  );

  const playModule = async (m: Module) => {
    if (!m.experience) return;
    const exp = getExperience(m.experience);
    if (!exp) return;
    await playExperience(exp);
    router.push(`/player/${exp.id}`);
  };

  return (
    <Screen title={course?.title ?? "Course"} subtitle={course?.subtitle} scroll>
      {loading ? (
        <Text style={styles.muted}>Loading…</Text>
      ) : !course ? (
        <Text style={styles.muted}>Course not found.</Text>
      ) : locked ? (
        <View style={styles.lock}>
          <View style={styles.lockIcon}>
            <Icon name="crown" size={26} color={colors.gold} />
          </View>
          <Text style={styles.lockTitle}>This course is part of Enlightened</Text>
          <Text style={styles.lockText}>
            {course.moduleCount
              ? `A ${course.moduleCount}-lesson guided journey. Upgrade to Enlightened to unlock the full course library.`
              : "Upgrade to Enlightened to unlock the full course library."}
          </Text>
          <Button
            label="Unlock Enlightened"
            variant="primary"
            accent={colors.gold}
            fullWidth
            onPress={() => router.push("/deepen")}
          />
        </View>
      ) : (
        <View style={styles.body}>
          {course.description ? <Text style={styles.desc}>{course.description}</Text> : null}

          <View style={styles.metaRow}>
            {course.duration ? <Badge label={course.duration} /> : null}
            {course.level ? <Badge label={course.level} /> : null}
            {course.moduleCount ? <Badge label={`${course.moduleCount} lessons`} /> : null}
          </View>

          {modules.length > 0 ? (
            <View style={styles.progressCard}>
              <View style={styles.progressHead}>
                <Text style={styles.progressLabel}>
                  {doneCount} of {modules.length} lessons complete
                </Text>
                <Text style={styles.progressPct}>{Math.round(pct * 100)}%</Text>
              </View>
              <View style={styles.track}>
                <View
                  style={[styles.fill, { width: `${Math.min(100, pct * 100)}%`, backgroundColor: colors.gold }]}
                />
              </View>
              {nextUp ? (
                <Text style={styles.nextUp}>
                  Next up · Day {nextUp.day} — {nextUp.title}
                </Text>
              ) : (
                <Text style={styles.nextUp}>Journey complete — you've finished every lesson. 🌙</Text>
              )}
            </View>
          ) : null}

          {modules.length > 0 ? (
            <View style={styles.modules}>
              {modules.map((m) => {
                const done = isComplete(m.day);
                return (
                  <View
                    key={`${m.day}-${m.title}`}
                    style={[styles.module, done && styles.moduleDone]}
                  >
                    <View style={styles.moduleHead}>
                      <Pressable
                        onPress={() => toggle(m.day)}
                        hitSlop={8}
                        style={[styles.check, done && styles.checkDone]}
                        accessibilityLabel={done ? "Mark as not complete" : "Mark as complete"}
                      >
                        {done ? <Icon name="check" size={16} color={colors.ink} /> : null}
                      </Pressable>
                      <View style={styles.dayBadge}>
                        <Text style={styles.dayText}>Day {m.day}</Text>
                      </View>
                      <Text style={[styles.moduleTitle, done && styles.moduleTitleDone]}>
                        {m.title}
                      </Text>
                    </View>
                    <Text style={styles.moduleType}>{m.type}</Text>
                    {m.content ? <Text style={styles.moduleContent}>{m.content}</Text> : null}
                    {m.experience ? (
                      <Pressable
                        style={({ pressed }: any) => [styles.playBtn, pressed && { opacity: 0.85 }]}
                        onPress={() => playModule(m)}
                      >
                        <Icon name="play" size={14} color={colors.ink} />
                        <Text style={styles.playText}>Play practice</Text>
                      </Pressable>
                    ) : null}
                  </View>
                );
              })}
            </View>
          ) : null}

          {course.availableLanguages?.length ? (
            <View style={styles.block}>
              <Text style={styles.label}>Available in</Text>
              <View style={styles.langRow}>
                {course.availableLanguages.map((lang) => (
                  <Text key={lang} style={styles.lang}>
                    {lang.toUpperCase()}
                  </Text>
                ))}
              </View>
            </View>
          ) : null}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { gap: space.lg },
  desc: { ...type.body, color: colors.textSecondary, lineHeight: 24 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
  block: { marginTop: space.lg },
  label: { ...type.label, color: colors.textMuted, marginBottom: space.sm },
  langRow: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
  lang: { ...type.caption, color: colors.textSecondary },
  muted: { ...type.bodySmall, color: colors.textMuted },

  progressCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: space.lg,
    gap: space.sm,
  },
  progressHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  progressLabel: { ...type.label, color: colors.text },
  progressPct: { ...type.label, color: colors.gold },
  track: { height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.1)", overflow: "hidden" },
  fill: { height: 4, borderRadius: 2 },
  nextUp: { ...type.caption, color: colors.textMuted, marginTop: space.xs },

  modules: { marginTop: space.md, gap: space.md },
  module: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: space.lg,
    gap: space.sm,
  },
  moduleDone: { borderColor: tint(colors.gold, 0.3), backgroundColor: tint(colors.gold, 0.05) },
  moduleHead: { flexDirection: "row", alignItems: "center", gap: space.sm },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.hairline,
    alignItems: "center",
    justifyContent: "center",
  },
  checkDone: { borderColor: colors.gold, backgroundColor: colors.gold },
  dayBadge: {
    paddingHorizontal: space.md,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  dayText: { ...type.caption, color: colors.textSecondary },
  moduleTitle: { ...type.headline, color: colors.text, flex: 1 },
  moduleTitleDone: { color: colors.textMuted, textDecorationLine: "line-through" },
  moduleType: { ...type.caption, color: colors.gold, textTransform: "uppercase", letterSpacing: 1 },
  moduleContent: { ...type.bodySmall, color: colors.textSecondary, lineHeight: 20 },
  playBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: space.sm,
    marginTop: space.xs,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.gold,
  },
  playText: { ...type.label, color: colors.ink },

  lock: {
    alignItems: "center",
    gap: space.lg,
    paddingVertical: space["3xl"],
    paddingHorizontal: space.xl,
  },
  lockIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(184,146,88,0.12)",
    borderWidth: 1,
    borderColor: "rgba(184,146,88,0.35)",
  },
  lockTitle: { ...type.section, color: colors.text, textAlign: "center" },
  lockText: {
    ...type.bodySmall,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 340,
  },
});
