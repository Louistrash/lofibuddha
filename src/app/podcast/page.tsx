import Link from "next/link";
import { Headphones, ArrowLeft } from "lucide-react";

export default function PodcastPage() {
  return (
    <div className="min-h-screen editorial-theme flex items-center justify-center px-6">
      <div className="text-center max-w-md space-y-10">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-stone-100 border border-stone-200 mx-auto">
          <Headphones size={32} className="text-stone-400" />
        </div>

        {/* Text */}
        <div className="space-y-4">
          <span className="text-[10px] tracking-[0.3em] uppercase text-amber-700 font-medium">
            Coming Soon
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-light text-stone-800">
            The Mindful Creative
          </h1>
          <p className="text-stone-500 leading-relaxed">
            Weekly conversations about mindfulness, creativity, and intentional
            living. We&apos;re crafting something special — stay tuned.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-col items-center gap-3">
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-stone-800 text-white text-sm tracking-wide hover:bg-stone-700 transition-all"
          >
            Explore content
            <ArrowLeft size={14} className="rotate-180" />
          </Link>
          <Link
            href="/landing"
            className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
          >
            ← LofiBuddha Home
          </Link>
        </div>
      </div>
    </div>
  );
}
