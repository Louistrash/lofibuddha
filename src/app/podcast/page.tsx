import Link from "next/link";
import { Headphones, Sparkles, ArrowLeft } from "lucide-react";

export default function PodcastPage() {
  return (
    <div className="min-h-screen bg-bg-primary theme-buddha flex items-center justify-center px-6">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-20 blur-[100px]" style={{ background: "radial-gradient(circle, rgba(196,148,100,0.3) 0%, transparent 70%)" }} />
      </div>

      <div className="relative z-10 text-center max-w-md space-y-8">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-accent/10 border border-accent/20 animate-pulse" style={{ animationDuration: "3s" }}>
          <Headphones size={32} className="text-accent-light" />
        </div>

        {/* Text */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent-light text-xs border border-accent/20">
            <Sparkles size={12} /> Coming Soon
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary">The Mindful Creative</h1>
          <p className="text-text-muted leading-relaxed">
            Weekly conversations about mindfulness, creativity, and intentional living. We're crafting something special — stay tuned.
          </p>
        </div>

        {/* Back link */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-accent-light hover:text-accent transition-colors">
          <ArrowLeft size={16} /> Back to LofiBuddha
        </Link>
      </div>
    </div>
  );
}
