import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Mindful Creative Podcast — LofiBuddha",
  description:
    "Weekly conversations about mindfulness, creativity, and intentional living. The Mindful Creative podcast — coming soon from LofiBuddha.",
  openGraph: {
    title: "The Mindful Creative Podcast — LofiBuddha",
    description:
      "Weekly conversations about mindfulness, creativity, and intentional living. Coming soon.",
  },
  twitter: {
    title: "The Mindful Creative Podcast — LofiBuddha",
    description:
      "Weekly conversations about mindfulness, creativity, and intentional living.",
  },
};

export default function PodcastLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
