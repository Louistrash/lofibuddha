import React, { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, IconButton } from "@/src/components/ui/Button";
import { Logo } from "@/src/components/ui/Logo";
import { LegalFooter } from "@/src/components/shell/LegalFooter";
import { useAuth } from "@/src/providers/AuthProvider";
import { colors, gradients, radius, space, tint, type } from "@/src/theme/tokens";
import { useLayout } from "@/src/theme/useLayout";
import { Icon, type IconName } from "@/src/components/ui/Icon";
import { useDismiss } from "@/src/lib/useDismiss";

type Mode = "login" | "signup";

export function AuthForm({ mode }: { mode: Mode }) {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const router = useRouter();
  const dismiss = useDismiss();
  const l = useLayout();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isSignup = mode === "signup";

  async function submit() {
    setError(null);
    if (!email.trim() || password.length < 6) {
      setError("Enter your email and a password of at least 6 characters.");
      return;
    }
    setBusy(true);
    try {
      if (isSignup) await signUp(email.trim(), password);
      else await signIn(email.trim(), password);
      dismiss();
    } catch (e: any) {
      setError(readableError(e?.code) ?? e?.message ?? "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.root}>
      <LinearGradient colors={gradients.page} style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={[tint(colors.gold, 0.16), "transparent"]}
        style={styles.halo}
        pointerEvents="none"
      />

      <View style={[styles.close, { top: insets.top + space.md }]}>
        <IconButton icon="close" onPress={() => dismiss()} accessibilityLabel="Close" />
      </View>

      <View style={[styles.center, { paddingHorizontal: l.gutter }]}>
        <View style={styles.card}>
          <Logo size={52} />

          <Text style={styles.title}>{isSignup ? "Begin your practice" : "Welcome back"}</Text>
          <Text style={styles.subtitle}>
            {isSignup
              ? "Your favorites, history and membership follow you everywhere."
              : "Sign in to continue where your breath left off."}
          </Text>

          <View style={styles.fields}>
            <Field
              icon="mail"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
            />
            <Field
              icon="lock"
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              secureTextEntry
              onSubmitEditing={submit}
            />
          </View>

          {error ? (
            <View style={styles.error}>
              <Icon name="alert" size={15} color={colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Button
            label={isSignup ? "Create account" : "Sign in"}
            onPress={submit}
            loading={busy}
            fullWidth
            size="lg"
          />

          {Platform.OS === "web" ? (
            <>
              <View style={styles.divider}>
                <View style={styles.line} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.line} />
              </View>
              <Button
                label="Continue with Google"
                variant="secondary"
                icon="google"
                fullWidth
                onPress={async () => {
                  setError(null);
                  try {
                    await signInWithGoogle();
                    dismiss();
                  } catch (e: any) {
                    setError(e?.message ?? "Google sign-in failed.");
                  }
                }}
              />
            </>
          ) : null}

          <Pressable
            onPress={() => router.replace(isSignup ? "/auth/login" : "/auth/signup")}
            style={styles.switch}
          >
            <Text style={styles.switchText}>
              {isSignup ? "Already practicing? " : "New here? "}
              <Text style={styles.switchLink}>{isSignup ? "Sign in" : "Create an account"}</Text>
            </Text>
          </Pressable>
        </View>

        <LegalFooter />
      </View>
    </View>
  );
}

function Field({
  icon,
  ...props
}: React.ComponentProps<typeof TextInput> & { icon: IconName }) {
  return (
    <View style={styles.field}>
      <Icon name={icon} size={17} color={colors.textMuted} />
      <TextInput
        {...props}
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
      />
    </View>
  );
}

function readableError(code?: string) {
  switch (code) {
    case "auth/invalid-email":
      return "That email address doesn't look right.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
      return "Email or password is incorrect.";
    case "auth/email-already-in-use":
      return "There is already an account with this email.";
    case "auth/weak-password":
      return "Choose a password of at least 6 characters.";
    case "auth/too-many-requests":
      return "Too many attempts. Take a breath and try again shortly.";
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  halo: { position: "absolute", top: 0, left: 0, right: 0, height: 320 },
  close: { position: "absolute", right: space.lg, zIndex: 10 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: space["3xl"],
    gap: space.lg,
  },
  title: { ...type.title, color: colors.text },
  subtitle: { ...type.bodySmall, color: colors.textSecondary, marginTop: -space.md },
  fields: { gap: space.md },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    height: 50,
    paddingHorizontal: space.lg,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontFamily: type.body.fontFamily,
    fontSize: 15,
    outlineStyle: "none",
  } as any,
  error: { flexDirection: "row", alignItems: "center", gap: space.sm },
  errorText: { ...type.bodySmall, color: colors.danger, flex: 1 },
  divider: { flexDirection: "row", alignItems: "center", gap: space.md },
  line: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.hairline },
  dividerText: { ...type.caption, color: colors.textMuted },
  switch: { alignItems: "center", paddingTop: space.sm },
  switchText: { ...type.bodySmall, color: colors.textMuted },
  switchLink: { color: colors.gold },
});
