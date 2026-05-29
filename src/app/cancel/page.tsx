"use client";

import { XCircle, ArrowLeft, Moon } from "lucide-react";
import Link from "next/link";

export default function CancelPage() {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="w-20 h-20 rounded-full bg-error/10 flex items-center justify-center mx-auto">
          <XCircle size={36} className="text-error" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-text-primary">No worries 🧘</h1>
          <p className="text-text-muted">
            You didn&apos;t complete the payment. Take your time — we&apos;re here when you&apos;re ready.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/landing#pricing"
            className="btn-zen flex items-center justify-center gap-2 py-3 px-6 mx-auto w-fit"
          >
            <ArrowLeft size={18} />
            Back to Plans
          </Link>
          <p className="text-xs text-text-muted">
            <Link href="/landing" className="text-accent-light hover:text-accent">
              ← LofiBuddha Home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
