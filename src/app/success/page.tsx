"use client";

import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function SuccessContent() {
  const params = useSearchParams();
  const sessionId = params?.get("session_id") || "";

  return (
    <div className="min-h-screen editorial-theme flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-10">
        {/* Checkmark */}
        <div className="w-20 h-20 rounded-full bg-amber-100/50 flex items-center justify-center mx-auto">
          <Check size={36} className="text-amber-600" />
        </div>

        <div className="space-y-3">
          <h1 className="font-serif text-3xl sm:text-4xl font-light text-stone-800">
            Welcome to the community
          </h1>
          <p className="text-stone-500 leading-relaxed">
            Your subscription is active. A calm space awaits — explore your new
            practice.
          </p>
          {sessionId && (
            <p className="text-xs text-stone-400 font-mono">
              Session: {sessionId.slice(0, 18)}...
            </p>
          )}
        </div>

        <div className="space-y-4">
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-stone-800 text-white text-sm tracking-wide hover:bg-stone-700 transition-all"
          >
            Begin your practice
            <ArrowRight size={16} />
          </Link>
          <p className="text-xs text-stone-400">
            <Link
              href="/landing"
              className="hover:text-stone-600 transition-colors"
            >
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
    <Suspense
      fallback={
        <div className="min-h-screen editorial-theme flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-stone-300 border-t-amber-500 rounded-full animate-spin" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
