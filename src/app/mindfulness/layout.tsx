import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Mindfulness — LofiBuddha",
  description:
    "Guided meditation, breathwork and mindful sound journeys for focus, calm and deep sleep.",
};

export default function MindfulnessLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
