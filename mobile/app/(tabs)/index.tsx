import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  CATEGORIES,
  EXPERIENCES,
  getCategoryExperiences,
  getExperience,
  type ExperienceCategory,
} from "@lofibuddha/shared";
import { Screen } from "@/src/components/ui/Screen";
import { SectionHeader, Badge } from "@/src/components/ui/Primitives";
import { Button } from "@/src/components/ui/Button";
import { CardRail } from "@/src/components/content/CardRail";
import { ExperienceCard } from "@/src/components/content/ExperienceCard";
import { JourneyCard, WorldCard } from "@/src/components/content/JourneyCard";
import { Mandala } from "@/src/components/content/Mandala";
import { usePlayer } from "@/src/providers/PlayerProvider";
import { useAuth } from "@/src/providers/AuthProvider";
import { useEntitlement } from "@/src/providers/EntitlementProvider";
import { useFavorites } from "@/src/lib/useFavorites";
import { WORLDS, greeting, suggestedCategory } from "@/src/lib/worlds";
import { accentByCategory, colors, radius, shadow, space, tint, type } from "@/src/theme/tokens";
import { useLayout } from "@/src/theme/useLayout";
import { Icon, type IconName } from "@/src/components/ui/Icon";

/** Copper on a warm card reads richer than flat gold. */
const COPPER_MANDALA = ["#E0A45E", "#B4712F", "#F6D6A8"] as const;

export default function TodayScreen() {
  const router = useRouter();
  const l = useLayout();
  const { playExperience } = usePlayer();
  const { user } = useAuth();
  const { isPro } = useEntitlement();
  const { recent, favorites, toggle, isFavorite } = useFavorites();

  const focusCategory = suggestedCategory();
  const featured = useMemo(() => {
    const pool = getCategoryExperiences(focusCategory);
    return pool[new Date().getDate() % pool.length] ?? EXPERIENCES[0];
  }, [focusCategory]);

  const recentExperiences = recent.map(getExperience).filter(Boolean).slice(0, 6);
  const name = user?.displayName?.split(" ")[0] || user?.email?.split("@")[0];

  const open = async (id: string) => {
    const exp = getExperience(id);
    if (!exp) return;
    await playExperience(exp);
    router.push(`/player/${exp.id}`);
  };

  return (
    <Screen
      title={name ? `${greeting()}, ${name}` : greeting()}
      subtitle={new Date().toLocaleDateString(undefined, {
        weekday: "long",
        day: "numeric",
        month: "long",
      })}
      actions={
        l.isMedium && !isPro ? (
          <Button label="Bodhi Pro" icon="guide" size="sm" onPress={() => router.push("/paywall")} />
        ) : null
      }
    >
      <View style={[styles.heroWrap, l.isDesktop && styles.heroRow]}>
        <FeaturedCard
          category={focusCategory}
          title={featured.title}
          description={featured.description}
          duration={featured.duration}
          onPlay={() => open(featured.id)}
        />
        <StatsPanel
          sessions={recent.length}
          favorites={favorites.length}
          catalog={EXPERIENCES.length}
        />
      </View>

      <View style={styles.block}>
        <SectionHeader title="Journeys" caption="Four paths, one stillness" />
        <CardRail minCardWidth={220} columns={l.isWide ? 4 : l.isDesktop ? 4 : 2}>
          {CATEGORIES.map((cat) => (
            <JourneyCard
              key={cat.id}
              id={cat.id as ExperienceCategory}
              name={cat.name}
              tagline={cat.tagline}
              script={cat.script}
              count={getCategoryExperiences(cat.id).length}
              onPress={() => router.push(`/category/${cat.id}`)}
            />
          ))}
        </CardRail>
      </View>

      {recentExperiences.length ? (
        <View style={styles.block}>
          <SectionHeader
            title="Pick up where you left"
            actionLabel="Library"
            onAction={() => router.push("/library")}
          />
          <CardRail minCardWidth={240}>
            {recentExperiences.map((exp) =>
              exp ? (
                <ExperienceCard key={exp.id} experience={exp} onPress={() => open(exp.id)} />
              ) : null
            )}
          </CardRail>
        </View>
      ) : null}

      <View style={styles.block}>
        <SectionHeader
          title="Worlds"
          caption="Step inside a place and stay a while"
          accent={colors.indigo}
        />
        <CardRail minCardWidth={280} columns={2}>
          {WORLDS.map((w) => (
            <WorldCard
              key={w.id}
              title={w.title}
              subtitle={w.subtitle}
              script={w.script}
              accent={w.accent}
              onPress={() => router.push(`/worlds/${w.id}`)}
            />
          ))}
        </CardRail>
      </View>

      <View style={styles.block}>
        <SectionHeader
          title={`For your ${focusCategory}`}
          caption="Chosen for this time of day"
          actionLabel="See all"
          onAction={() => router.push(`/category/${focusCategory}`)}
          accent={accentByCategory[focusCategory]}
        />
        <View style={styles.list}>
          {getCategoryExperiences(focusCategory)
            .slice(0, 5)
            .map((exp) => (
              <ExperienceCard
                key={exp.id}
                experience={exp}
                variant="row"
                onPress={() => open(exp.id)}
                isFavorite={isFavorite(exp.id)}
                onToggleFavorite={() => toggle(exp.id)}
              />
            ))}
        </View>
      </View>

      {!isPro ? <UpgradeBanner onPress={() => router.push("/paywall")} /> : null}
    </Screen>
  );
}

function FeaturedCard({
  category,
  title,
  description,
  duration,
  onPlay,
}: {
  category: ExperienceCategory;
  title: string;
  description: string;
  duration: string;
  onPlay: () => void;
}) {
  const accent = accentByCategory[category] ?? colors.gold;
  const l = useLayout();

  return (
    <View style={[styles.featured, l.isDesktop && { flex: 2 }]}>
      <LinearGradient
        colors={[tint(accent, 0.42), "rgba(14,13,22,0.95)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.featuredOrb, { backgroundColor: accent }]} />
      <View style={styles.featuredMandala} pointerEvents="none">
        <Mandala size={320} opacity={0.7} speed={0.6} colors={COPPER_MANDALA} />
      </View>

      <Badge label="Today's practice" accent={accent} />

      <View style={styles.featuredBody}>
        <Text style={styles.featuredTitle}>{title}</Text>
        <Text style={styles.featuredDesc} numberOfLines={2}>
          {description}
        </Text>
      </View>

      <View style={styles.featuredFooter}>
        <Button label="Begin" icon="play" accent={accent} onPress={onPlay} />
        <View style={styles.featuredMeta}>
          <Icon name="clock" size={14} color={colors.textMuted} />
          <Text style={styles.featuredMetaText}>{duration}</Text>
        </View>
      </View>
    </View>
  );
}

function StatsPanel({
  sessions,
  favorites,
  catalog,
}: {
  sessions: number;
  favorites: number;
  catalog: number;
}) {
  const l = useLayout();
  const stats: {
    label: string;
    caption: string;
    value: number;
    icon: IconName;
    accent: string;
    /** 0..1, fills the rail at the foot of the card. */
    fill: number;
  }[] = [
    {
      label: "Sessions",
      caption: "practices begun",
      value: sessions,
      icon: "meditation",
      accent: colors.jade,
      fill: Math.min(1, sessions / 20),
    },
    {
      label: "Saved",
      caption: "in your library",
      value: favorites,
      icon: "lotus",
      accent: colors.lotus,
      fill: Math.min(1, favorites / 10),
    },
    {
      label: "Catalog",
      caption: "ready to explore",
      value: catalog,
      icon: "catalog",
      accent: colors.gold,
      fill: 1,
    },
  ];

  return (
    <View style={[styles.stats, l.isDesktop && { flex: 1 }, !l.isDesktop && styles.statsRow]}>
      {stats.map((s) => (
        <View key={s.label} style={[styles.stat, !l.isDesktop && { flex: 1 }]}>
          <LinearGradient
            colors={[tint(s.accent, 0.16), "rgba(15,14,23,0.6)"]}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.statMandala} pointerEvents="none">
            <Mandala
              size={170}
              opacity={0.38}
              speed={0.4}
              detail="simple"
              colors={[s.accent, s.accent, s.accent]}
            />
          </View>

          <View style={styles.statTop}>
            <Icon name={s.icon} size={17} color={s.accent} />
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>

          <Text style={styles.statValue}>{s.value}</Text>
          <Text style={styles.statCaption}>{s.caption}</Text>

          <View style={styles.statRail}>
            <View
              style={[
                styles.statRailFill,
                { width: `${Math.max(6, s.fill * 100)}%`, backgroundColor: s.accent },
              ]}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

function UpgradeBanner({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ hovered }: any) => [styles.banner, hovered && { borderColor: colors.goldEdge }]}
    >
      <LinearGradient
        colors={[tint(colors.gold, 0.22), "rgba(15,14,23,0.9)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.bannerTitle}>Go deeper with Bodhi Pro</Text>
        <Text style={styles.bannerBody}>
          Every journey, all worlds, and unlimited guidance from Buddha AI.
        </Text>
      </View>
      <Icon name="arrowRightCircle" size={30} color={colors.gold} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  heroWrap: { gap: space.lg, marginBottom: space["3xl"] },
  heroRow: { flexDirection: "row", alignItems: "stretch" },

  featured: {
    minHeight: 250,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.hairline,
    overflow: "hidden",
    padding: space["2xl"],
    justifyContent: "space-between",
    gap: space.lg,
    ...shadow.float,
  },
  featuredOrb: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    top: -120,
    right: -80,
    opacity: 0.22,
  },
  featuredMandala: { position: "absolute", top: -104, right: -104 },
  featuredBody: { gap: space.sm },
  featuredTitle: { ...type.largeTitle, fontSize: 30, color: colors.text },
  featuredDesc: { ...type.body, color: colors.textSecondary, maxWidth: 460 },
  featuredFooter: { flexDirection: "row", alignItems: "center", gap: space.lg },
  featuredMeta: { flexDirection: "row", alignItems: "center", gap: 5 },
  featuredMetaText: { ...type.caption, color: colors.textMuted },

  stats: {
    gap: space.md,
    justifyContent: "space-between",
  },
  statsRow: { flexDirection: "row" },
  stat: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: space.lg,
    gap: 2,
    flexGrow: 1,
    justifyContent: "center",
    overflow: "hidden",
    ...shadow.card,
  },
  statMandala: { position: "absolute", top: -100, right: -84 },
  statTop: { flexDirection: "row", alignItems: "center", gap: space.sm, marginBottom: space.sm },
  statValue: { ...type.largeTitle, fontSize: 30, color: colors.text },
  statLabel: { ...type.caption, color: colors.textSecondary },
  statCaption: { ...type.bodySmall, fontSize: 12, color: colors.textMuted },
  statRail: {
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.07)",
    overflow: "hidden",
    marginTop: space.md,
  },
  statRailFill: { height: 3, borderRadius: 2 },

  block: { marginBottom: space["3xl"] },
  list: { gap: 2 },

  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    overflow: "hidden",
    padding: space.xl,
    marginBottom: space.xl,
  },
  bannerTitle: { ...type.section, color: colors.goldBright },
  bannerBody: { ...type.bodySmall, color: colors.textSecondary, marginTop: 4, maxWidth: 460 },
});
