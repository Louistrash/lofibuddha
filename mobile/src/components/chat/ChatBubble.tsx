import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Logo } from "@/src/components/ui/Logo";
import { colors, gradients, radius, space, type } from "@/src/theme/tokens";

export type ChatRole = "user" | "assistant";

/**
 * Chat bubbles with the asymmetry people expect: the assistant sits left with
 * an avatar and a squared-off corner near it, the user sits right in gold. The
 * previous version used the same neutral card for both, so a conversation read
 * as a list of notes rather than an exchange.
 */
export function ChatBubble({
  role,
  content,
  time,
  maxWidth,
  showAvatar = true,
  children,
}: {
  role: ChatRole;
  content: string;
  time?: string;
  maxWidth: number | string;
  showAvatar?: boolean;
  children?: React.ReactNode;
}) {
  const mine = role === "user";

  return (
    <View style={[styles.row, mine ? styles.rowMine : styles.rowTheirs]}>
      {!mine ? (
        <View style={styles.avatar}>{showAvatar ? <Logo size={28} /> : null}</View>
      ) : null}

      <View style={[styles.stack, { maxWidth: maxWidth as any }]}>
        <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
          {mine ? (
            <LinearGradient
              colors={gradients.gold}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          ) : null}
          <Text style={[styles.text, mine && styles.textMine]}>{content}</Text>
        </View>

        {children}

        {time ? (
          <Text style={[styles.time, mine ? styles.timeMine : styles.timeTheirs]}>{time}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-end", gap: space.sm, marginBottom: space.lg },
  rowMine: { justifyContent: "flex-end" },
  rowTheirs: { justifyContent: "flex-start" },
  avatar: { width: 28, alignItems: "center" },
  stack: { flexShrink: 1, gap: space.sm },

  bubble: {
    borderRadius: radius.lg,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    overflow: "hidden",
  },
  theirs: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.hairline,
    // Squared corner pointing at the avatar.
    borderBottomLeftRadius: radius.sm,
  },
  mine: {
    borderBottomRightRadius: radius.sm,
  },

  text: { ...type.body, color: colors.text, lineHeight: 23 },
  textMine: { color: colors.ink, fontFamily: "Manrope_500Medium" },

  time: { ...type.caption, color: colors.textMuted, fontSize: 10, letterSpacing: 0.4 },
  timeTheirs: { marginLeft: space.xs },
  timeMine: { alignSelf: "flex-end", marginRight: space.xs },
});
