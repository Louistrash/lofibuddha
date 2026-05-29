"use client";

import { Check, ArrowRight, Sparkles, Moon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function SuccessContent() {
  const params = useSearchParams();
  const sessionId = params?.get("session_id") || "";

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto">
          <Check size={36} className="text-success" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-text-primary">Welcome to the community! 🧘</h1>
          <p className="text-text-muted">
            Your payment was successful. You now have full access to all premium content.
          </p>
          {sessionId && (
            <p className="text-xs text-text-muted">Session: {sessionId.slice(0, 12)}...</p>
          )}
        </div>

        <div className="space-y-3">
          <Link
            href="/browse"
            className="btn-zen flex items-center justify-center gap-2 py-3 px-6 mx-auto w-fit"
          >
            <Sparkles size={18} />
            Start Exploring
            <ArrowRight size={18} />
          </Link>
          <p className="text-xs text-text-muted">
            <Link href="/landing" className="text-accent-light hover:text-accent">
              ← Back to LofiBuddha
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg-primary flex items-center justify-center"><Moon size={24} className="text-accent-light animate-spin" /></div>}>
      <SuccessContent />
    </Suspense>
  );
}
