import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Choose Your Path — LofiBuddha",
  description:
    "Start your mindfulness journey with LofiBuddha. Choose from free and premium plans — lofi music, guided meditation, breathwork, and spiritual guidance.",
  openGraph: {
    title: "Choose Your Path — LofiBuddha",
    description:
      "Start your mindfulness journey with LofiBuddha. Choose from free and premium plans for lofi music, meditation, and spiritual guidance.",
  },
  twitter: {
    title: "Choose Your Path — LofiBuddha",
    description:
      "Start your mindfulness journey with LofiBuddha. Free and premium plans available.",
  },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
