import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mindfulness Courses — LofiBuddha",
  description:
    "Self-paced mindfulness courses: meditation, yoga, breathwork, and lofi focus. Beginner-friendly paths to inner calm. Available in 6 languages.",
  openGraph: {
    title: "Mindfulness Courses — LofiBuddha",
    description:
      "Self-paced mindfulness courses: meditation, yoga, breathwork, and lofi focus. Begin your journey to inner calm.",
  },
  twitter: {
    title: "Mindfulness Courses — LofiBuddha",
    description:
      "Self-paced mindfulness courses — meditation, yoga, breathwork, and lofi focus.",
  },
};

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
