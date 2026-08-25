import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
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
import { apiFetch } from "@/src/lib/api";
import { colors, gradients, layout, radius, space, tint, type } from "@/src/theme/tokens";
import { useLayout } from "@/src/theme/useLayout";
import { Icon } from "@/src/components/ui/Icon";

type Message = { id: string; role: "user" | "assistant"; content: string };

const WELCOME: Message[] = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "Namaste. I am here, and there is no hurry.\n\nTell me how you feel right now — or ask for breath, focus, sleep, or stillness.",
  },
];

const PROMPTS = [
  "My mind won't slow down",
  "Help me breathe",
  "I need to focus",
  "Guide me to sleep",
];

export default function BuddhaScreen() {
  const { user } = useAuth();
  const { experience } = usePlayer();
  const router = useRouter();
  const l = useLayout();
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState<Message[]>(WELCOME);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
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
            }))
          );
        }
      })
      .catch(() => {});
  }, [user]);

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || sending) return;
    setInput("");
    setMessages((m) => [...m, { id: `u-${Date.now()}`, role: "user", content }]);
    setSending(true);

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
        data.reply || data.message || data.content || "Sit with the breath for a moment.";
      setMessages((m) => [...m, { id: `a-${Date.now()}`, role: "assistant", content: reply }]);

      const url: string | undefined = data.deepLink?.url;
      if (url) {
        if (url.includes("breathe")) router.push("/category/breathe");
        else if (url.includes("focus")) router.push("/category/focus");
        else if (url.includes("sleep")) router.push("/category/sleep");
        else if (url.includes("mindfulness")) router.push("/explore");
      }
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: `e-${Date.now()}`,
          role: "assistant",
          content: "The connection is quiet right now. Breathe — and try again in a moment.",
        },
      ]);
    } finally {
      setSending(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
    }
  }

  const bottomPad =
    (l.isDesktop ? space["2xl"] : layout.tabBarHeight + insets.bottom + space.md) +
    (experience ? layout.miniPlayerHeight + space.sm : 0);

  return (
    <View style={styles.root}>
      <LinearGradient colors={gradients.page} style={StyleSheet.absoluteFill} />

      <View style={[styles.header, { paddingTop: l.isDesktop ? space["2xl"] : insets.top + space.sm }]}>
        <View style={styles.headerInner}>
          <Logo size={40} />
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Buddha AI</Text>
            <Text style={styles.subtitle}>Stillness · guidance · presence</Text>
          </View>
          {messages.length > 1 ? (
            <Pressable onPress={() => setMessages(WELCOME)} hitSlop={8}>
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
          ListHeaderComponent={
            !user ? (
              <Pressable style={styles.signin} onPress={() => router.push("/auth/login")}>
                <Icon name="unlock" size={15} color={colors.gold} />
                <Text style={styles.signinText}>Sign in to keep your conversation</Text>
                <Icon name="forward" size={14} color={colors.gold} />
              </Pressable>
            ) : null
          }
          ListFooterComponent={
            sending ? (
              <View style={[styles.bubble, styles.assistant, styles.typing]}>
                <ActivityIndicator size="small" color={colors.gold} />
                <Text style={styles.typingText}>reflecting…</Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <View
              style={[
                styles.bubble,
                item.role === "user" ? styles.user : styles.assistant,
                { maxWidth: l.isMedium ? 560 : "88%" },
              ]}
            >
              <Text style={[styles.bubbleText, item.role === "user" && { color: colors.ink }]}>
                {item.content}
              </Text>
            </View>
          )}
        />

        <View style={[styles.composerWrap, { paddingBottom: bottomPad, paddingHorizontal: l.gutter }]}>
          {messages.length <= 2 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.prompts}
            >
              {PROMPTS.map((p) => (
                <Pressable
                  key={p}
                  onPress={() => send(p)}
                  style={({ hovered, pressed }: any) => [
                    styles.prompt,
                    (hovered || pressed) && { borderColor: colors.goldEdge },
                  ]}
                >
                  <Text style={styles.promptText}>{p}</Text>
                </Pressable>
              ))}
            </ScrollView>
          ) : null}

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
    paddingBottom: space.lg,
    maxWidth: layout.maxContentWidth,
    width: "100%",
    alignSelf: "center",
  },
  title: { ...type.section, color: colors.text },
  subtitle: { ...type.caption, color: colors.textMuted },

  list: {
    paddingTop: space.xl,
    gap: space.md,
    maxWidth: layout.maxContentWidth,
    width: "100%",
    alignSelf: "center",
  },
  signin: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    alignSelf: "flex-start",
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderRadius: radius.pill,
    backgroundColor: colors.goldSoft,
    borderWidth: 1,
    borderColor: colors.goldEdge,
    marginBottom: space.md,
  },
  signinText: { ...type.label, color: colors.gold },

  bubble: {
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderRadius: radius.lg,
  },
  user: {
    alignSelf: "flex-end",
    backgroundColor: colors.gold,
    borderBottomRightRadius: radius.sm,
  },
  assistant: {
    alignSelf: "flex-start",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderBottomLeftRadius: radius.sm,
  },
  bubbleText: { ...type.body, color: colors.text },
  typing: { flexDirection: "row", alignItems: "center", gap: space.sm },
  typingText: { ...type.caption, color: colors.textMuted },

  composerWrap: {
    maxWidth: layout.maxContentWidth,
    width: "100%",
    alignSelf: "center",
    paddingTop: space.md,
  },
  prompts: { gap: space.sm, paddingBottom: space.md },
  prompt: {
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  promptText: { ...type.label, color: colors.textSecondary },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: space.sm,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: space.sm,
    paddingLeft: space.lg,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontFamily: type.body.fontFamily,
    fontSize: 15,
    lineHeight: 21,
    paddingVertical: space.md,
    maxHeight: 120,
    outlineStyle: "none",
  } as any,
  send: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
});
