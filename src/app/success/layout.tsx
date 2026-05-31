import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Welcome to LofiBuddha — Your Journey Begins",
  description:
    "Your subscription is confirmed. Access unlimited lofi music, guided meditation, breathwork, and AI Buddha spiritual guidance.",
  openGraph: {
    title: "Welcome to LofiBuddha — Your Journey Begins",
    description:
      "Subscription confirmed — access lofi music, guided meditation, and AI Buddha spiritual guidance.",
  },
  twitter: {
    title: "Welcome to LofiBuddha — Your Journey Begins",
    description: "Subscription confirmed — your mindful journey begins now.",
  },
};

export default function SuccessLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
