"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function BreathePage() {
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale" | "rest">("inhale");
  const [running, setRunning] = useState(false);
  const [count, setCount] = useState(4);
  const [cycles, setCycles] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const phaseLabels: Record<string, { text: string; subtext: string }> = {
    inhale: { text: "Breathe in", subtext: "through your nose" },
    hold: { text: "Hold", subtext: "let it settle" },
    exhale: { text: "Breathe out", subtext: "through your mouth" },
    rest: { text: "Rest", subtext: "feel the stillness" },
  };

  const startBreathing = () => {
    if (running) return;
    setRunning(true);
    setPhase("inhale");
    setCount(4);
    setCycles(0);

    let currentPhase = "inhale";
    let currentCount = 4;
    let cycleCount = 0;

    timerRef.current = setInterval(() => {
      currentCount--;
      setCount(currentCount);

      if (currentCount <= 0) {
        // Transition to next phase
        if (currentPhase === "inhale") {
          currentPhase = "hold";
          currentCount = 4;
          setPhase("hold");
        } else if (currentPhase === "hold") {
          currentPhase = "exhale";
          currentCount = 4;
          setPhase("exhale");
        } else if (currentPhase === "exhale") {
          currentPhase = "rest";
          currentCount = 4;
          setPhase("rest");
        } else {
          // rest → inhale (new cycle)
          currentPhase = "inhale";
          currentCount = 4;
          cycleCount++;
          setCycles(cycleCount);
          setPhase("inhale");
        }
        setCount(currentCount);
      }
    }, 1000);
  };

  const stopBreathing = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRunning(false);
    setPhase("inhale");
    setCount(4);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const circleScale =
    phase === "inhale"
      ? 1 + (4 - count) * 0.25
      : phase === "exhale"
        ? 2 - (4 - count) * 0.25
        : phase === "hold"
          ? 2
          : 1;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{
        background: "#faf8f5",
        color: "#1c1917",
        fontFamily: '"Inter", system-ui, sans-serif',
      }}
    >
      <nav
        className="fixed top-0 left-0 right-0 z-50 border-b"
        style={{
          background: "rgba(250,248,245,0.85)",
          backdropFilter: "blur(20px)",
          borderColor: "rgba(0,0,0,0.06)",
        }}
      >
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/landing" className="flex items-center gap-2.5 no-underline">
            <img src="/lofibuddha.png" alt="LofiBuddha" className="h-[31px] w-auto" style={{ borderRadius: 8 }} />
            <span style={{ fontFamily: '"Playfair Display", serif', fontSize: "1.1rem", color: "#1c1917", fontWeight: 500 }}>
              LofiBuddha
            </span>
          </Link>
          <Link href="/landing" style={{ color: "#78716c", fontSize: "0.8rem", letterSpacing: "0.08em", textTransform: "uppercase", textDecoration: "none" }}>
            ← Back
          </Link>
        </div>
      </nav>

      <main className="text-center px-6">
        <p style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.3em", color: "#b08050", marginBottom: "2rem" }}>
          4-4-4 Box Breathing
        </p>

        {/* Breathing circle */}
        <div className="relative flex items-center justify-center mb-8" style={{ width: 280, height: 280, margin: "0 auto" }}>
          {/* Outer ring */}
          <div
            className="absolute rounded-full"
            style={{
              width: 280,
              height: 280,
              border: "1px solid rgba(176,128,80,0.15)",
              transition: "none",
            }}
          />
          {/* Animated circle */}
          <div
            className="rounded-full flex items-center justify-center transition-all duration-1000 ease-in-out"
            style={{
              width: `${140 * circleScale}px`,
              height: `${140 * circleScale}px`,
              background: running
                ? "rgba(176,128,80,0.08)"
                : "rgba(176,128,80,0.04)",
              border: "1px solid rgba(176,128,80,0.2)",
            }}
          >
            <span style={{ fontSize: "3rem", fontWeight: 300, color: "#1c1917", fontFamily: '"Playfair Display", serif' }}>
              {count}
            </span>
          </div>
        </div>

        {/* Phase label */}
        <div className="mb-2" style={{ minHeight: 70 }}>
          <p
            className="transition-all duration-500"
            style={{
              fontFamily: '"Playfair Display", serif',
              fontSize: "1.8rem",
              fontWeight: 300,
              color: "#1c1917",
              margin: 0,
            }}
          >
            {phaseLabels[phase].text}
          </p>
          <p style={{ color: "#78716c", fontSize: "0.85rem", fontWeight: 300, marginTop: "0.25rem" }}>
            {phaseLabels[phase].subtext}
          </p>
        </div>

        {/* Cycle counter */}
        {cycles > 0 && (
          <p style={{ color: "#b08050", fontSize: "0.75rem", letterSpacing: "0.1em", marginBottom: "2rem" }}>
            {cycles} cycle{cycles !== 1 ? "s" : ""} completed
          </p>
        )}

        {/* Controls */}
        <div className="flex gap-3 justify-center">
          {!running ? (
            <button
              onClick={startBreathing}
              style={{
                padding: "0.9rem 2.5rem",
                borderRadius: "100px",
                border: "none",
                background: "#1c1917",
                color: "white",
                fontFamily: '"Inter", sans-serif',
                fontSize: "0.9rem",
                cursor: "pointer",
              }}
            >
              Begin
            </button>
          ) : (
            <button
              onClick={stopBreathing}
              style={{
                padding: "0.9rem 2.5rem",
                borderRadius: "100px",
                border: "1px solid rgba(0,0,0,0.1)",
                background: "transparent",
                color: "#1c1917",
                fontFamily: '"Inter", sans-serif',
                fontSize: "0.9rem",
                cursor: "pointer",
              }}
            >
              Stop
            </button>
          )}
        </div>

        {/* Instructions */}
        <div
          className="mt-12 max-w-sm mx-auto text-left"
          style={{ color: "#78716c", fontSize: "0.8rem", lineHeight: 1.8, fontWeight: 300 }}
        >
          <p style={{ fontFamily: '"Playfair Display", serif', fontSize: "1rem", color: "#1c1917", fontWeight: 500, marginBottom: "0.5rem" }}>
            How it works
          </p>
          <p>Box breathing is a technique used by Navy SEALs, first responders, and meditators to calm the nervous system.</p>
          <ul style={{ marginTop: "0.5rem", paddingLeft: "1.25rem" }}>
            <li>Inhale for 4 seconds</li>
            <li>Hold for 4 seconds</li>
            <li>Exhale for 4 seconds</li>
            <li>Rest for 4 seconds</li>
          </ul>
          <p style={{ marginTop: "0.5rem" }}>Repeat for 5-10 cycles. Use this anytime you feel stress, anxiety, or need to refocus.</p>
        </div>
      </main>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap');
        body { background: #faf8f5 !important; color: #1c1917 !important; }
      `}</style>
    </div>
  );
}
