import Link from "next/link";
import { Moon } from "lucide-react";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen theme-buddha bg-bg-primary text-text-primary">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-bg-primary/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/landing" className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 100 100" className="transition-transform duration-700 hover:rotate-12">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#d4a44a" strokeWidth="2.5" strokeDasharray="230" strokeDashoffset="20" strokeLinecap="round" />
              <circle cx="50" cy="50" r="10" fill="#d4a44a" opacity="0.85" />
              <path d="M50 15 C65 15 75 25 78 40 C80 25 70 15 50 15Z" fill="#e0b860" opacity="0.5" />
            </svg>
            <span className="font-semibold text-text-primary text-sm">LofiBuddha</span>
          </Link>
          <Link href="/landing" className="text-sm text-text-muted hover:text-accent-light transition-colors">
            ← Back
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-12 sm:py-16">
        <div className="prose prose-invert prose-sm max-w-none
          prose-headings:text-text-primary prose-headings:font-bold
          prose-h1:text-2xl prose-h1:sm:text-3xl
          prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4
          prose-h3:text-lg prose-h3:text-accent-light
          prose-p:text-text-secondary prose-p:leading-relaxed
          prose-a:text-accent-light prose-a:no-underline hover:prose-a:underline
          prose-strong:text-text-primary
          prose-ul:text-text-secondary
          prose-li:marker:text-accent">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 py-8 text-center">
        <div className="max-w-3xl mx-auto px-6 space-y-2">
          <p className="text-xs text-text-muted">&copy; {new Date().getFullYear()} LofiBuddha. All rights reserved.</p>
          <div className="flex items-center justify-center gap-4 text-xs text-text-muted">
            <Link href="/legal/privacy" className="hover:text-accent-light transition-colors">Privacy</Link>
            <Link href="/legal/terms" className="hover:text-accent-light transition-colors">Terms</Link>
            <Link href="/legal/disclaimer" className="hover:text-accent-light transition-colors">Disclaimer</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
