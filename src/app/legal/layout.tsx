import type { Metadata } from "next";
import LegalLayoutClient from "./LegalLayoutClient";

export const metadata: Metadata = {
  title: "Legal — LofiBuddha",
  description:
    "LofiBuddha legal information — privacy policy, terms of service, and disclaimer for our lofi music and mindfulness platform.",
  openGraph: {
    title: "Legal — LofiBuddha",
    description:
      "LofiBuddha legal pages — privacy policy, terms of service, and disclaimer.",
  },
  twitter: {
    title: "Legal — LofiBuddha",
    description: "LofiBuddha legal pages — privacy policy, terms, and disclaimer.",
  },
};

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return <LegalLayoutClient>{children}</LegalLayoutClient>;
}
