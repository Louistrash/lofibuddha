"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CancelPage() {
  return (
    <div className="min-h-screen editorial-theme flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-10">
        {/* Enso circle */}
        <div className="mx-auto">
          <svg viewBox="0 0 120 120" className="w-20 h-20">
            <circle
              cx="60"
              cy="60"
              r="48"
              fill="none"
              stroke="#d6d3d1"
              strokeWidth="0.6"
              strokeDasharray="85 300"
              strokeLinecap="round"
              transform="rotate(-20 60 60)"
            />
          </svg>
        </div>

        <div className="space-y-3">
          <h1 className="font-serif text-3xl sm:text-4xl font-light text-stone-800">
            No hurry
          </h1>
          <p className="text-stone-500 leading-relaxed">
            You didn&apos;t complete the payment. Take your time — this space is
            here whenever you&apos;re ready.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-stone-800 text-white text-sm tracking-wide hover:bg-stone-700 transition-all"
          >
            <ArrowLeft size={16} />
            Return to plans
          </Link>
          <p className="text-xs text-stone-400">
            <Link
              href="/landing"
              className="hover:text-stone-600 transition-colors"
            >
              ← LofiBuddha Home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
