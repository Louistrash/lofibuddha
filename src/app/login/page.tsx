"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Mail, Lock, LogIn } from "lucide-react";
import Image from "next/image";
import { Button, Card, Input, Spinner } from "@/components/ui";

const ADMIN_EMAIL = "infoappsnl@gmail.com";

const REDIRECT_AFTER_LOGIN = {
  admin: "/studio",
  member: "/app",
};

function LoginFallback() {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <Spinner size={28} />
    </div>
  );
}

export default function LoginPageWrapper() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRedirect = (userEmail: string) => {
    if (redirect && redirect !== "/login" && !redirect.startsWith("/signup")) {
      router.push(redirect);
    } else if (userEmail === ADMIN_EMAIL) {
      router.push(REDIRECT_AFTER_LOGIN.admin);
    } else {
      router.push(REDIRECT_AFTER_LOGIN.member);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      handleRedirect(result.user.email || "");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message.replace("Firebase: ", "").replace("auth/", "").replace(/-/g, " "));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      handleRedirect(result.user.email || "");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Google login failed";
      setError(message.replace("Firebase: ", "").replace("auth/", "").replace(/-/g, " "));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-8 relative overflow-hidden">
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[200px] opacity-[0.06] pointer-events-none"
        style={{ background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)" }}
      />

      <div className="relative z-10 w-full max-w-[420px]">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-[14px] bg-accent/15 mb-4">
            <Image src="/icon-transparent.png" alt="LofiBuddha" width={32} height={32} className="rounded-lg" />
          </div>
          <h2 className="text-[26px] font-semibold text-text-primary tracking-tight mb-1.5">
            Welcome back
          </h2>
          <p className="text-sm text-text-muted">
            Sign in to your LofiBuddha account
          </p>
        </div>

        {error && (
          <Card className="p-3.5 mb-4 border-error/30 bg-error/5">
            <p className="text-sm text-error">{error}</p>
          </Card>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-3 mb-4">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            icon={<Mail size={16} />}
          />
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            icon={<Lock size={16} />}
          />
          <Button
            type="submit"
            disabled={loading}
            fullWidth
            size="lg"
            icon={<LogIn size={15} />}
          >
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[11px] text-text-muted">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <Button
          variant="secondary"
          size="lg"
          fullWidth
          disabled={loading}
          onClick={handleGoogleLogin}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          }
        >
          Continue with Google
        </Button>

        <p className="text-center text-xs text-text-muted mt-6">
          New here?{" "}
          <a href="/signup" className="text-accent-light hover:text-accent transition-colors no-underline">
            Explore free content first
          </a>
        </p>
      </div>
    </div>
  );
}
