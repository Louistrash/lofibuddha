import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/providers/AuthProvider";
import { usePlayer } from "@/src/providers/PlayerProvider";
import { Logo } from "@/src/components/ui/Logo";
import { ChatBubble } from "@/src/components/chat/ChatBubble";
import { ThinkingDots } from "@/src/components/chat/ThinkingDots";
import { SuggestionCard } from "@/src/components/chat/SuggestionCard";
import { apiFetch } from "@/src/lib/api";
import {
  OPENING_PROMPTS,
  detectJourney,
  followUpsFor,
  suggestionFor,
  type Journey,
  type JourneySuggestion,
} from "@/src/lib/chat-intent";
import { colors, gradients, layout, radius, space, tint, type } from "@/src/theme/tokens";
import { useLayout } from "@/src/theme/useLayout";
import { Icon } from "@/src/components/ui/Icon";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  at: number;
  /** Practice offered with this reply, rendered under the bubble. */
  suggestion?: JourneySuggestion;
};

const WELCOME: Message = {
  id: "welcome",
  role: "assistant",
  at: Date.now(),
  content:
    "Namaste. I am here, and there is no hurry.\n\nTell me how you feel right now — or ask for breath, focus, sleep, or stillness.",
};

function clockOf(at: number) {
  try {
    return new Date(at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export default function BuddhaScreen() {
  const { user } = useAuth();
  const { experience } = usePlayer();
  const router = useRouter();
  const l = useLayout();
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [journey, setJourney] = useState<Journey | null>(null);
  const listRef = useRef<FlatList<Message>>(null);

  useEffect(() => {
    if (!user) return;
    apiFetch("/api/chat/history", {}, user.uid)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.messages?.length) {
          setMessages(
            data.messages.map((m: any, i: number) => ({
              id: m.id || `h-${i}`,
              role: m.role,
              content: m.content,
              at: m.createdAt ? Date.parse(m.createdAt) : Date.now(),
            }))
          );
        }
      })
      .catch(() => {});
  }, [user]);

  const scrollToEnd = useCallback(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 60);
  }, []);

  const send = useCallback(
    async (text?: string) => {
      const content = (text ?? input).trim();
      if (!content || sending) return;

      setInput("");
      const mine: Message = { id: `u-${Date.now()}`, role: "user", content, at: Date.now() };
      setMessages((m) => [...m, mine]);
      setSending(true);
      scrollToEnd();

      try {
        const res = await apiFetch(
          "/api/chat",
          {
            method: "POST",
            body: JSON.stringify({
              message: content,
              fbUid: user?.uid,
              fbName: user?.displayName,
              fbEmail: user?.email,
            }),
          },
          user?.uid
        );
        const data = await res.json();
        const reply =
          data.message || data.reply || data.content || "Sit with the breath for a moment.";

        // The server's deepLink url still points at pre-Expo pages, so it is
        // used only as an extra signal alongside the actual language used.
        const detected = detectJourney(content, reply, data?.deepLink?.url);
        if (detected) setJourney(detected);

        setMessages((m) => [
          ...m,
          {
            id: `a-${Date.now()}`,
            role: "assistant",
            content: reply,
            at: Date.now(),
            suggestion: detected ? suggestionFor(detected) : undefined,
          },
        ]);
      } catch {
        setMessages((m) => [
          ...m,
          {
            id: `e-${Date.now()}`,
            role: "assistant",
            content: "The connection is quiet right now. Breathe — and try again in a moment.",
            at: Date.now(),
          },
        ]);
      } finally {
        setSending(false);
        scrollToEnd();
      }
    },
    [input, sending, user, scrollToEnd]
  );

  /** Openers before the first exchange, contextual follow-ups after it. */
  const chips = useMemo(() => {
    const started = messages.some((m) => m.role === "user");
    return started ? followUpsFor(journey) : OPENING_PROMPTS;
  }, [messages, journey]);

  const bottomPad =
    (l.isDesktop ? space["2xl"] : layout.tabBarHeight + insets.bottom + space.md) +
    (experience ? layout.miniPlayerHeight + space.sm : 0);

  const bubbleMax = l.isMedium ? 560 : "82%";

  return (
    <View style={styles.root}>
      <LinearGradient colors={gradients.page} style={StyleSheet.absoluteFill} />

      <View
        style={[styles.header, { paddingTop: l.isDesktop ? space["2xl"] : insets.top + space.sm }]}
      >
        <View style={styles.headerInner}>
          <Logo size={40} />
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Buddha AI</Text>
            <Text style={styles.subtitle}>
              {sending ? "reflecting…" : "Stillness · guidance · presence"}
            </Text>
          </View>
          {messages.length > 1 ? (
            <Pressable
              onPress={() => {
                setMessages([{ ...WELCOME, at: Date.now() }]);
                setJourney(null);
              }}
              hitSlop={8}
              accessibilityLabel="Start a new conversation"
            >
              <Icon name="refresh" size={18} color={colors.textMuted} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={insets.top + 60}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={[styles.list, { paddingHorizontal: l.gutter }]}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToEnd}
          ListHeaderComponent={
            !user ? (
              <Pressable style={styles.signin} onPress={() => router.push("/auth/login")}>
                <Icon name="unlock" size={15} color={colors.gold} />
                <Text style={styles.signinText}>Sign in to keep your conversation</Text>
                <Icon name="forward" size={14} color={colors.gold} />
              </Pressable>
            ) : null
          }
          ListFooterComponent={<View style={{ height: space.sm }} />}
          renderItem={({ item, index }) => {
            const prev = messages[index - 1];
            const grouped = prev?.role === item.role;
            return (
              <ChatBubble
                role={item.role}
                content={item.content}
                time={clockOf(item.at)}
                maxWidth={bubbleMax}
                showAvatar={!grouped}
              >
                {item.suggestion ? (
                  <SuggestionCard
                    suggestion={item.suggestion}
                    onPress={() => router.push(item.suggestion!.href as never)}
                  />
                ) : null}
              </ChatBubble>
            );
          }}
        />

        {/* Typing indicator lives outside the list so it never scrolls away. */}
        {sending ? (
          <View style={[styles.thinking, { paddingHorizontal: l.gutter }]}>
            <View style={styles.thinkingBubble}>
              <ThinkingDots />
            </View>
          </View>
        ) : null}

        <View
          style={[styles.composerWrap, { paddingBottom: bottomPad, paddingHorizontal: l.gutter }]}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.prompts}
            keyboardShouldPersistTaps="handled"
          >
            {chips.map((p) => (
              <Pressable
                key={p}
                onPress={() => send(p)}
                disabled={sending}
                style={({ hovered, pressed }: any) => [
                  styles.prompt,
                  (hovered || pressed) && { borderColor: colors.goldEdge },
                  sending && { opacity: 0.45 },
                ]}
              >
                <Text style={styles.promptText}>{p}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.composer}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Share what's on your mind…"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              multiline
              onSubmitEditing={() => send()}
              blurOnSubmit={false}
            />
            <Pressable
              onPress={() => send()}
              disabled={sending || !input.trim()}
              accessibilityLabel="Send"
              style={({ pressed }) => [
                styles.send,
                (!input.trim() || sending) && { opacity: 0.4 },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Icon name="arrowUp" size={18} color={colors.ink} />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.hairline },
  headerInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    paddingHorizontal: space.xl,
    paddingBottom: space.md,
    maxWidth: layout.maxContentWidth,
    width: "100%",
    alignSelf: "center",
  },
  title: { ...type.section, color: colors.text },
  subtitle: { ...type.caption, color: colors.textMuted },

  list: { paddingTop: space.xl, paddingBottom: space.md },

  signin: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    alignSelf: "flex-start",
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: tint(colors.gold, 0.3),
    backgroundColor: tint(colors.gold, 0.08),
    marginBottom: space.xl,
  },
  signinText: { ...type.label, color: colors.gold },

  thinking: { paddingBottom: space.sm },
  thinkingBubble: {
    alignSelf: "flex-start",
    marginLeft: 36,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    borderRadius: radius.lg,
    borderBottomLeftRadius: radius.sm,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.hairline,
  },

  composerWrap: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hairline,
    paddingTop: space.md,
    gap: space.md,
    maxWidth: layout.maxContentWidth,
    width: "100%",
    alignSelf: "center",
  },
  prompts: { gap: space.sm, paddingRight: space.lg },
  prompt: {
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.card,
    cursor: "pointer",
  } as any,
  promptText: { ...type.label, color: colors.textSecondary },

  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: space.sm,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    paddingLeft: space.lg,
    paddingRight: space.sm,
    paddingVertical: space.sm,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontFamily: type.body.fontFamily,
    fontSize: 15,
    lineHeight: 21,
    maxHeight: 120,
    paddingVertical: space.sm,
    outlineStyle: "none",
  } as any,
  send: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
});
