"use client";

import type { ReactNode } from "react";
import CmsTopNav from "./CmsTopNav";

interface CmsShellProps {
  children: ReactNode;
  /** Hermes runs fullscreen without chrome. */
  bare?: boolean;
}

/** Expo-style page shell: gradient backdrop + centered content column. */
export default function CmsShell({ children, bare }: CmsShellProps) {
  if (bare) {
    return <div className="h-screen overflow-hidden bg-bg-primary text-text-primary">{children}</div>;
  }

  return (
    <div className="relative min-h-screen bg-bg-primary text-text-primary">
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "linear-gradient(180deg, #08070C 0%, #0B0A12 45%, #0E0D17 100%), radial-gradient(ellipse 90% 55% at 50% -5%, rgba(228,184,114,0.14), transparent 58%), radial-gradient(ellipse 50% 35% at 100% 100%, rgba(108,116,255,0.05), transparent 55%)",
        }}
        aria-hidden
      />

      <div className="relative z-10 flex min-h-screen flex-col">
        <CmsTopNav />
        <main className="mx-auto w-full max-w-[1180px] flex-1 px-5 py-6 sm:px-6 sm:py-8 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
