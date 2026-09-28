import type { Metadata } from "next";
import Link from "next/link";
import { MUSIC_TRACKS } from "@/lib/music";
import ExploreCatalogue from "@/components/ExploreCatalogue";

export const metadata: Metadata = {
  title: "Explore Lofi Music & Soundscapes — LofiBuddha",
  description:
    "Browse the full LofiBuddha library — beatless, dreamy lofi soundscapes for focus, sleep and meditation. Temple rain, moonlit ruins, ocean depth and more.",
  alternates: { canonical: "https://lofibuddha.com/explore" },
};

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <main className="mx-auto max-w-6xl px-6 py-12">
        <header>
          <Link href="/" className="text-sm text-text-muted transition-colors hover:text-accent">
            ← Home
          </Link>
          <h1 className="mt-4 text-3xl font-semibold sm:text-5xl">Explore soundscapes</h1>
          <p className="mt-3 max-w-2xl text-base text-text-secondary">
            {MUSIC_TRACKS.length} beatless lofi tracks — grouped by mood, collapsed by default so you
            can find the right temple sound without scrolling forever.
          </p>
        </header>

        <ExploreCatalogue />
      </main>
    </div>
  );
}
