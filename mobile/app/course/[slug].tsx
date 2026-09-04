import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Screen } from "@/src/components/ui/Screen";
import { Badge } from "@/src/components/ui/Primitives";
import { apiFetch } from "@/src/lib/api";
import { colors, space, type } from "@/src/theme/tokens";

type Course = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;
  duration?: string;
  level?: string;
  moduleCount?: number;
  availableLanguages?: string[];
};

export default function CourseScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    apiFetch("/api/courses/public")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const list = data?.courses ?? data;
        if (active && Array.isArray(list)) {
          setCourse(list.find((c: Course) => c.slug === slug) ?? null);
        }
        if (active) setLoading(false);
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug]);

  return (
    <Screen title={course?.title ?? "Course"} subtitle={course?.subtitle} scroll>
      {loading ? (
        <Text style={styles.muted}>Loading…</Text>
      ) : course ? (
        <View style={styles.body}>
          {course.description ? <Text style={styles.desc}>{course.description}</Text> : null}

          <View style={styles.metaRow}>
            {course.duration ? <Badge label={course.duration} /> : null}
            {course.level ? <Badge label={course.level} /> : null}
            {course.moduleCount ? <Badge label={`${course.moduleCount} modules`} /> : null}
          </View>

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
      ) : (
        <Text style={styles.muted}>Course not found.</Text>
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
});
