import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Lofi Music & Meditation Content — LofiBuddha",
  description:
    "Explore free lofi music sessions, yoga flows, guided breathwork, and meditation content. Start your mindfulness practice with curated calm.",
  openGraph: {
    title: "Free Lofi Music & Meditation Content — LofiBuddha",
    description:
      "Explore free lofi music sessions, yoga flows, guided breathwork, and meditation content. Start your mindfulness practice with curated calm.",
  },
  twitter: {
    title: "Free Lofi Music & Meditation Content — LofiBuddha",
    description:
      "Explore free lofi music sessions, yoga flows, guided breathwork, and meditation content.",
  },
};

export default function BrowseLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
