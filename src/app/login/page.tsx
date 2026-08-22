"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Moon, Mail, Lock, LogIn } from "lucide-react";

const ADMIN_EMAIL = "infoappsnl@gmail.com";

const REDIRECT_AFTER_LOGIN = {
  admin: "/studio",           // Admin → CMS dashboard
  member: "/app",             // Users/clients/students → AI Buddha chat
};

export default function LoginPageWrapper() {
  return (
    <Suspense fallback={<div style={{ minHeight:"100vh",background:"#0a0a0a",display:"flex",alignItems:"center",justifyContent:"center" }}><div style={{ width:24,height:24,border:"2px solid rgba(196,148,100,0.15)",borderTopColor:"#c49464",borderRadius:"50%",animation:"spin 0.8s linear infinite" }} /></div>}>
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
    // Expliciete redirect (bv. /social, /mindfulness) wint altijd
    if (redirect && redirect !== "/login" && !redirect.startsWith("/signup")) {
      router.push(redirect);
    } else if (userEmail === ADMIN_EMAIL) {
      router.push(REDIRECT_AFTER_LOGIN.admin); // Admin → /studio
    } else {
      router.push(REDIRECT_AFTER_LOGIN.member); // Users → /app
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      handleRedirect(result.user.email || "");
    } catch (err: any) {
      setError(err.message?.replace("Firebase: ", "").replace("auth/", "").replace(/-/g, " ") || "Login failed");
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
    } catch (err: any) {
      setError(err.message?.replace("Firebase: ", "").replace("auth/", "").replace(/-/g, " ") || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0a",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "2rem", fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        width: "600px", height: "600px", borderRadius: "50%", filter: "blur(200px)", opacity: 0.04,
        background: "radial-gradient(circle, rgba(196,148,100,0.5) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "420px" }}>
        {/* Logo — LofiBuddha brand */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "14px",
            background: "linear-gradient(135deg, rgba(196,148,100,0.2), rgba(180,130,80,0.1))",
            display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
            <Moon size={24} color="#d4b48a" strokeWidth={1.5} />
          </div>
          <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "26px", fontWeight: 400, color: "#f5ede0", marginBottom: "6px" }}>
            Welcome back
          </h2>
          <p style={{ fontSize: "13px", color: "#6b655a" }}>
            Sign in to your LofiBuddha account
          </p>
        </div>

        {error && (
          <div style={{ background: "rgba(176,96,80,0.1)", border: "1px solid rgba(176,96,80,0.2)",
            borderRadius: "12px", padding: "12px 16px", marginBottom: "16px", fontSize: "13px", color: "#c08070" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleEmailLogin} style={{ marginBottom: "16px" }}>
          <div style={{ marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px",
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "12px", padding: "12px 16px" }}>
              <Mail size={16} color="#6b655a" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com" required
                style={{ flex: 1, background: "transparent", border: "none", outline: "none",
                  color: "#e8e2d8", fontSize: "14px", fontFamily: "'Inter', system-ui, sans-serif" }} />
            </div>
          </div>
          <div style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px",
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "12px", padding: "12px 16px" }}>
              <Lock size={16} color="#6b655a" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Password" required
                style={{ flex: 1, background: "transparent", border: "none", outline: "none",
                  color: "#e8e2d8", fontSize: "14px", fontFamily: "'Inter', system-ui, sans-serif" }} />
            </div>
          </div>
          <button type="submit" disabled={loading} style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            background: "linear-gradient(135deg, #c49464, #b08050)", color: "#0a0a0a",
            border: "none", borderRadius: "14px", padding: "14px", fontSize: "14px", fontWeight: 600,
            cursor: loading ? "wait" : "pointer", fontFamily: "'Inter', system-ui, sans-serif",
            opacity: loading ? 0.7 : 1, transition: "all 0.2s ease",
          }}>
            <LogIn size={15} /> {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
          <span style={{ fontSize: "11px", color: "#4a4540" }}>or</span>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
        </div>

        <button onClick={handleGoogleLogin} disabled={loading} style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "14px", padding: "14px", fontSize: "14px", fontWeight: 500,
          color: "#e8e2d8", cursor: loading ? "wait" : "pointer",
          fontFamily: "'Inter', system-ui, sans-serif", transition: "all 0.2s ease",
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <p style={{ textAlign: "center", fontSize: "12px", color: "#4a4540", marginTop: "24px" }}>
          New here?{" "}
          <a href="/signup" style={{ color: "#d4b48a", textDecoration: "none" }}>Explore free content first</a>
        </p>
      </div>
    </div>
  );
}
