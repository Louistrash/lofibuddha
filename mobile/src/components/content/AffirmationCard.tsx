import React, { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Audio } from "expo-av";
import { Mandala } from "@/src/components/content/Mandala";
import { Icon } from "@/src/components/ui/Icon";
import { apiFetch, audioUrl } from "@/src/lib/api";
import { colors, radius, space, tint, type } from "@/src/theme/tokens";

type Today = { id: string; text: string; theme: string; audioUrl: string | null };

const THEME_ACCENT: Record<string, string> = {
  Calm: colors.jade,
  Strength: colors.saffron,
  "Self-compassion": colors.lotus,
  Focus: colors.saffron,
  "Letting go": colors.indigo,
  Gratitude: colors.gold,
  Presence: colors.indigo,
  Confidence: colors.gold,
  Breath: colors.jade,
  Rest: colors.indigo,
};

/**
 * A short, local audio player — deliberately separate from the global
 * PlayerProvider, because an affirmation is a ~10s clip, not a full session.
 */
export function AffirmationCard() {
  const [today, setToday] = useState<Today | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    let mounted = true;
    apiFetch("/api/affirmations/today")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (mounted && d?.text) setToday(d);
      })
      .catch(() => {});
    return () => {
      mounted = false;
      // clean up any playing sound on unmount
      soundRef.current?.unloadAsync().catch(() => {});
      soundRef.current = null;
    };
  }, []);

  const toggle = useCallback(async () => {
    if (!today || loading) return;

    if (playing) {
      try {
        await soundRef.current?.stopAsync();
        await soundRef.current?.unloadAsync();
      } catch {}
      soundRef.current = null;
      setPlaying(false);
      return;
    }

    setLoading(true);
    try {
      // Absolute URL via the helper — the API returns a relative path, which
      // expo-av does not resolve on web.
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl("affirmations", today.id) },
        { shouldPlay: true }
      );
      soundRef.current = sound;
      setPlaying(true);
      sound.setOnPlaybackStatusUpdate((s: any) => {
        if (s.didJustFinish) {
          setPlaying(false);
          sound.unloadAsync().catch(() => {});
          soundRef.current = null;
        }
      });
    } catch {
      setPlaying(false);
    } finally {
      setLoading(false);
    }
  }, [today, playing, loading]);

  if (!today) return null;

  const accent = THEME_ACCENT[today.theme] ?? colors.gold;

  return (
    <View style={[styles.card, { borderColor: tint(accent, 0.28) }]}>
      <LinearGradient
        colors={[tint(accent, 0.18), "rgba(15,14,23,0.85)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.mandala} pointerEvents="none">
        <Mandala
          size={230}
          opacity={0.34}
          speed={0.32}
          detail="simple"
          colors={[accent, accent, colors.goldBright]}
        />
      </View>

      <View style={styles.top}>
        <View style={[styles.badge, { backgroundColor: tint(accent, 0.18) }]}>
          <Icon name="lotus" size={13} color={accent} />
          <Text style={[styles.badgeText, { color: accent }]}>Affirmation of the day</Text>
        </View>
        <Text style={styles.theme}>{today.theme}</Text>
      </View>

      <Text style={styles.text}>“{today.text}”</Text>

      <Pressable
        onPress={toggle}
        accessibilityRole="button"
        accessibilityLabel={playing ? "Stop affirmation" : "Listen to affirmation"}
        style={({ hovered, pressed }: any) => [
          styles.play,
          { backgroundColor: tint(accent, 0.2), borderColor: tint(accent, 0.4) },
          hovered && { borderColor: tint(accent, 0.65) },
          pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
        ]}
      >
        <Icon name={playing ? "pause" : "play"} size={16} color={accent} />
        <Text style={[styles.playText, { color: accent }]}>
          {loading ? "…" : playing ? "Stop" : "Listen"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: "hidden",
    padding: space.xl,
    gap: space.lg,
    marginBottom: space["3xl"],
    cursor: "pointer",
  } as any,
  mandala: { position: "absolute", top: -90, right: -70 },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: space.md },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: space.md,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  badgeText: { ...type.label, fontSize: 12 },
  theme: { ...type.caption, color: colors.textMuted, letterSpacing: 1, textTransform: "uppercase" },
  text: { ...type.headline, fontSize: 19, lineHeight: 28, color: colors.text, maxWidth: 560 },
  play: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    paddingHorizontal: space.lg,
    paddingVertical: 9,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  playText: { ...type.label },
});
