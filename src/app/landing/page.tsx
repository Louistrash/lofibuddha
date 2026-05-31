"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Play, ChevronDown, Menu, X, Heart, Send, Quote } from "lucide-react";

// ─── Language ─────────────────────────────────
type Lang = "en" | "nl" | "es" | "de" | "fr" | "hi";
const LANGS: Lang[] = ["en", "nl", "es", "de", "fr", "hi"];
const LANG_FLAGS: Record<Lang, string> = { en: "🇬🇧", nl: "🇳🇱", es: "🇪🇸", de: "🇩🇪", fr: "🇫🇷", hi: "🇮🇳" };
const LANG_LABELS: Record<Lang, string> = { en: "EN", nl: "NL", es: "ES", de: "DE", fr: "FR", hi: "HI" };

const detectLang = (): Lang => {
  if (typeof window === "undefined") return "en";
  const stored = localStorage.getItem("lofibuddha-lang") as Lang;
  if (stored && LANGS.includes(stored)) return stored;
  const browser = navigator.language.toLowerCase().split("-")[0] as Lang;
  return LANGS.includes(browser) ? browser : "en";
};

// ─── Translations ─────────────────────────────
const t = {
  navFeatures: { en: "Journal", nl: "Journaal", es: "Diario", de: "Journal", fr: "Journal", hi: "पत्रिका" },
  navMusic: { en: "Music", nl: "Muziek", es: "Música", de: "Musik", fr: "Musique", hi: "संगीत" },
  navWisdom: { en: "Wisdom", nl: "Wijsheid", es: "Sabiduría", de: "Weisheit", fr: "Sagesse", hi: "ज्ञान" },
  heroTag: { en: "A mindful space for slow living", nl: "Een mindful plek voor slow living", es: "Un espacio consciente para vivir despacio", de: "Ein achtsamer Ort für langsames Leben", fr: "Un espace conscient pour vivre lentement", hi: "धीमे जीवन के लिए एक सचेत स्थान" },
  heroTitle1: { en: "Find your", nl: "Vind jouw", es: "Encuentra tu", de: "Finde deinen", fr: "Trouve ton", hi: "अपनी खोजें" },
  heroTitle2: { en: "rhythm", nl: "ritme", es: "ritmo", de: "Rhythmus", fr: "rythme", hi: "लय" },
  heroTitle3: { en: "of calm", nl: "van rust", es: "de calma", de: "der Ruhe", fr: "de calme", hi: "शांति की" },
  heroSub: { en: "Lofi music, guided breathwork, yoga flows, and mindful stories — curated for your daily dose of peace.", nl: "Lofi muziek, geleide ademhaling, yoga flows en mindful verhalen — samengesteld voor jouw dagelijkse dosis rust.", es: "Música lofi, respiración guiada, yoga y historias conscientes — seleccionadas para tu dosis diaria de paz.", de: "Lofi-Musik, geführte Atemübungen, Yoga und achtsame Geschichten — kuratiert für deine tägliche Dosis Ruhe.", fr: "Musique lofi, respiration guidée, yoga et histoires conscientes — organisées pour votre dose quotidienne de paix.", hi: "लोफाई संगीत, निर्देशित श्वास, योग प्रवाह और सचेत कहानियाँ — आपकी दैनिक शांति के लिए।" },
  ctaExplore: { en: "Begin your journey", nl: "Begin je reis", es: "Comienza tu viaje", de: "Beginne deine Reise", fr: "Commence ton voyage", hi: "अपनी यात्रा शुरू करें" },
  ctaListen: { en: "Listen now", nl: "Luister nu", es: "Escuchar ahora", de: "Jetzt anhören", fr: "Écouter", hi: "अभी सुनें" },
  sectionJournal: { en: "The Journal", nl: "Het Journaal", es: "El Diario", de: "Das Journal", fr: "Le Journal", hi: "पत्रिका" },
  sectionJournalSub: { en: "Stories on mindfulness, creativity, and the art of slow living.", nl: "Verhalen over mindfulness, creativiteit en de kunst van slow living.", es: "Historias sobre mindfulness, creatividad y el arte de vivir despacio.", de: "Geschichten über Achtsamkeit, Kreativität und die Kunst des langsamen Lebens.", fr: "Histoires sur la pleine conscience, la créativité et l'art de vivre lentement.", hi: "माइंडफुलनेस, रचनात्मकता और धीमे जीवन की कला पर कहानियाँ।" },
  sectionMusic: { en: "The Soundtrack", nl: "De Soundtrack", es: "La Banda Sonora", de: "Der Soundtrack", fr: "La Bande Sonore", hi: "संगीत" },
  sectionMusicSub: { en: "Handpicked lofi beats for focus, relaxation, and deep work.", nl: "Met zorg geselecteerde lofi beats voor focus, ontspanning en deep work.", es: "Beats lofi seleccionados para concentración, relajación y trabajo profundo.", de: "Handverlesene Lofi-Beats für Fokus, Entspannung und tiefe Arbeit.", fr: "Beats lofi sélectionnés pour la concentration, la relaxation et le travail profond.", hi: "फोकस, विश्राम और गहन कार्य के लिए चयनित लोफाई बीट्स।" },
  sectionWisdom: { en: "Words of Wisdom", nl: "Woorden van Wijsheid", es: "Palabras de Sabiduría", de: "Worte der Weisheit", fr: "Paroles de Sagesse", hi: "ज्ञान के शब्द" },
  wisdom1: { en: "\"Peace comes from within. Do not seek it without.\"", nl: "\"Rust komt van binnen. Zoek het niet buiten jezelf.\"", es: "\"La paz viene de dentro. No la busques fuera.\"", de: "\"Frieden kommt von innen. Suche ihn nicht außen.\"", fr: "\"La paix vient de l'intérieur. Ne la cherchez pas à l'extérieur.\"", hi: "\"शांति भीतर से आती है। इसे बाहर मत खोजो।\"" },
  wisdom1author: { en: "Buddha", nl: "Boeddha", es: "Buda", de: "Buddha", fr: "Bouddha", hi: "बुद्ध" },
  wisdom2: { en: "\"Almost everything will work again if you unplug it for a few minutes, including you.\"", nl: "\"Bijna alles werkt weer als je het een paar minuten loskoppelt, inclusief jijzelf.\"", es: "\"Casi todo volverá a funcionar si lo desenchufas unos minutos, incluido tú.\"", de: "\"Fast alles funktioniert wieder, wenn man es ein paar Minuten aussteckt — dich eingeschlossen.\"", fr: "\"Presque tout fonctionnera à nouveau si vous le débranchez quelques minutes, y compris vous.\"", hi: "\"लगभग सब कुछ फिर से काम करेगा यदि आप इसे कुछ मिनटों के लिए अनप्लग करें, जिसमें आप भी शामिल हैं।\"" },
  wisdom2author: { en: "Anne Lamott", nl: "Anne Lamott", es: "Anne Lamott", de: "Anne Lamott", fr: "Anne Lamott", hi: "ऐन लैमट" },
  wisdom3: { en: "\"The present moment is filled with joy and happiness. If you are attentive, you will see it.\"", nl: "\"Het huidige moment is gevuld met vreugde en geluk. Als je oplettend bent, zul je het zien.\"", es: "\"El momento presente está lleno de alegría y felicidad. Si estás atento, lo verás.\"", de: "\"Der gegenwärtige Moment ist erfüllt von Freude und Glück. Wenn du aufmerksam bist, wirst du es sehen.\"", fr: "\"Le moment présent est rempli de joie et de bonheur. Si vous êtes attentif, vous le verrez.\"", hi: "\"वर्तमान क्षण आनंद और खुशी से भरा है। यदि आप चौकस हैं, तो आप इसे देखेंगे।\"" },
  wisdom3author: { en: "Thich Nhat Hanh", nl: "Thich Nhat Hanh", es: "Thich Nhat Hanh", de: "Thich Nhat Hanh", fr: "Thich Nhat Hanh", hi: "थिच नहात हान्ह" },
  sectionNewsletter: { en: "A letter of calm, once a week", nl: "Een brief van rust, één keer per week", es: "Una carta de calma, una vez por semana", de: "Ein Brief der Ruhe, einmal pro Woche", fr: "Une lettre de calme, une fois par semaine", hi: "शांति का एक पत्र, सप्ताह में एक बार" },
  sectionNewsletterSub: { en: "No spam. No noise. Just a gentle reminder to breathe, a new lofi mix, and something to reflect on.", nl: "Geen spam. Geen ruis. Alleen een zachte herinnering om te ademen, een nieuwe lofi mix en iets om over na te denken.", es: "Sin spam. Sin ruido. Solo un suave recordatorio para respirar, un nuevo mix lofi y algo en qué reflexionar.", de: "Kein Spam. Kein Lärm. Nur eine sanfte Erinnerung zu atmen, ein neuer Lofi-Mix und etwas zum Nachdenken.", fr: "Pas de spam. Pas de bruit. Juste un doux rappel de respirer, un nouveau mix lofi et quelque chose à méditer.", hi: "कोई स्पैम नहीं। कोई शोर नहीं। बस सांस लेने की एक कोमल याद, एक नया लोफाई मिक्स, और कुछ विचार करने के लिए।" },
  newsletterPlaceholder: { en: "your@email.com", nl: "jouw@email.com", es: "tu@email.com", de: "deine@email.com", fr: "ton@email.com", hi: "आपका@ईमेल.com" },
  newsletterButton: { en: "Subscribe", nl: "Abonneren", es: "Suscribirse", de: "Abonnieren", fr: "S'abonner", hi: "सदस्यता लें" },
  footerRights: { en: "A space for calm in a busy world.", nl: "Een plek voor rust in een drukke wereld.", es: "Un espacio para la calma en un mundo ocupado.", de: "Ein Ort der Ruhe in einer geschäftigen Welt.", fr: "Un espace de calme dans un monde occupé.", hi: "व्यस्त दुनिया में शांति का एक स्थान।" },
};

// ─── Journal articles ──────────────────────────
const journalArticles = [
  { title: "The Art of Doing Nothing", category: "Slow Living", readTime: "4 min read", image: "/images/generated/thumb-yoga.png", slug: "/learn" },
  { title: "Why Lofi Music Helps You Focus", category: "Science", readTime: "6 min read", image: "/images/generated/thumb-focus.png", slug: "/learn" },
  { title: "A Beginner's Guide to Breathwork", category: "Wellness", readTime: "5 min read", image: "/images/generated/thumb-breath.png", slug: "/learn" },
];

// ─── Album-style music cards ──────────────────
const albums = [
  { title: "Morning Calm", artist: "LofiBuddha", mood: "Peaceful • 24 tracks", image: "/images/generated/album-morning-calm.png" },
  { title: "Deep Focus", artist: "LofiBuddha", mood: "Concentration • 18 tracks", image: "/images/generated/album-deep-focus.png" },
  { title: "Sunset Yoga", artist: "LofiBuddha", mood: "Flow • 16 tracks", image: "/images/generated/album-sunset-yoga.png" },
];

// ─── Editorial featured story ─────────────────
const featuredStory = {
  title: "The Science of Stillness",
  subtitle: "How moments of silence reshape your brain and unlock creativity",
  author: "LofiBuddha Editorial",
  readTime: "8 min read",
  excerpt: "In a world that rewards constant motion, the most radical act might be staying perfectly still. Neuroscience now confirms what ancient traditions have known for millennia: silence is not empty — it is full of answers.",
};

export default function LandingPage() {
  const [lang, setLang] = useState<Lang>(() => detectLang());
  const [langOpen, setLangOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const rafRef = useRef<number | null>(null);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    localStorage.setItem("lofibuddha-lang", lang);
  }, [lang]);

  // Throttled scroll handler using requestAnimationFrame
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        rafRef.current = requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const tFn = (key: Record<Lang, string>) => key[lang] || key.en;

  const handleSubscribe = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      await fetch("/api/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, language: lang }),
      });
      setSubscribed(true);
    } catch {
      setSubscribed(true);
    }
  }, [email, lang]);

  return (
    <div className="min-h-screen editorial-theme">
      {/* ═══════════════════════════════════════════════════════════
          HERO — Cinematic editorial experience
          ═══════════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden">
        {/* Atmospheric background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-stone-50 via-amber-50/30 to-white" />
          <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full blur-[180px] opacity-20"
            style={{ background: "radial-gradient(circle, rgba(180,130,80,0.3) 0%, transparent 70%)" }} />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full blur-[150px] opacity-15"
            style={{ background: "radial-gradient(circle, rgba(140,180,160,0.3) 0%, transparent 70%)" }} />
        </div>

        {/* Enso circle — slow breathing animation */}
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
          <svg viewBox="0 0 400 400" className="w-[500px] h-[500px] max-w-[90vw] max-h-[90vw] opacity-[0.06]"
            style={{ transform: `scale(${1 + scrollY * 0.0003}) rotate(${scrollY * 0.02}deg)` }}>
            <circle cx="200" cy="200" r="180" fill="none" stroke="#b08050" strokeWidth="0.8" strokeDasharray="8 12" />
            <circle cx="200" cy="200" r="170" fill="none" stroke="#b08050" strokeWidth="0.4" strokeDasharray="3 20" opacity="0.5" />
            <circle cx="200" cy="200" r="190" fill="none" stroke="#b08050" strokeWidth="0.3" opacity="0.3" />
          </svg>
        </div>

        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-700"
          style={{
            background: scrollY > 50 ? "rgba(250,248,245,0.92)" : "rgba(250,248,245,0.75)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderBottom: scrollY > 50 ? "1px solid rgba(0,0,0,0.06)" : "1px solid transparent"
          }}>
          <div className="max-w-7xl mx-auto px-6 sm:px-10 h-16 sm:h-20 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <Image
                src="/lofibuddha.png"
                alt="LofiBuddha"
                width={35}
                height={35}
                priority
                unoptimized
                className="h-[35px] w-auto"
              />
              <span className="font-serif text-lg tracking-wide text-stone-800">LofiBuddha</span>
            </Link>

            <div className="hidden md:flex items-center gap-10">
              <a href="#journal" className="text-sm text-stone-500 hover:text-stone-800 transition-colors tracking-wide">{tFn(t.navFeatures)}</a>
              <a href="#music" className="text-sm text-stone-500 hover:text-stone-800 transition-colors tracking-wide">{tFn(t.navMusic)}</a>
              <a href="#wisdom" className="text-sm text-stone-500 hover:text-stone-800 transition-colors tracking-wide">{tFn(t.navWisdom)}</a>
            </div>

            <div className="hidden md:flex items-center gap-4">
              {/* Language dropdown */}
              <div className="relative">
                <button onClick={() => setLangOpen(!langOpen)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs tracking-wide text-stone-500 hover:text-stone-800 transition-colors">
                  <span>{LANG_FLAGS[lang]} {LANG_LABELS[lang]}</span>
                  <ChevronDown size={12} className={`transition-transform ${langOpen ? "rotate-180" : ""}`} />
                </button>
                {langOpen && (
                  <div className="absolute top-full right-0 mt-1 bg-white border border-stone-200 rounded-lg shadow-xl p-1 z-50 min-w-[110px]">
                    {LANGS.map((l) => (
                      <button key={l} onClick={() => { setLang(l); setLangOpen(false); }}
                        className={`flex items-center gap-2 w-full px-3 py-2 rounded-md text-xs transition-colors ${lang === l ? "bg-stone-100 text-stone-800" : "text-stone-500 hover:text-stone-800 hover:bg-stone-50"}`}>
                        <span>{LANG_FLAGS[l]}</span> {LANG_LABELS[l]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Link href="/signup" className="text-xs tracking-wide px-5 py-2.5 rounded-full bg-stone-800 text-white hover:bg-stone-700 transition-all">
                {tFn(t.ctaExplore)}
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-stone-600" aria-label="Menu">
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="absolute inset-0 bg-white/95 backdrop-blur-xl" onClick={() => setMenuOpen(false)} />
            <div className="absolute top-20 right-4 w-64 bg-white border border-stone-100 rounded-2xl shadow-2xl p-6 space-y-4">
              <a href="#journal" onClick={() => setMenuOpen(false)} className="block text-stone-600 hover:text-stone-900 py-2">{tFn(t.navFeatures)}</a>
              <a href="#music" onClick={() => setMenuOpen(false)} className="block text-stone-600 hover:text-stone-900 py-2">{tFn(t.navMusic)}</a>
              <a href="#wisdom" onClick={() => setMenuOpen(false)} className="block text-stone-600 hover:text-stone-900 py-2">{tFn(t.navWisdom)}</a>
              <div className="pt-3 border-t border-stone-100">
                <Link href="/signup" className="block w-full text-center px-5 py-2.5 rounded-full bg-stone-800 text-white text-sm">{tFn(t.ctaExplore)}</Link>
              </div>
            </div>
          </div>
        )}

        {/* Hero content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-10 pt-32 pb-20 text-center">
          <p className="text-xs sm:text-sm tracking-[0.3em] uppercase text-stone-400 mb-8 animate-fade-in">
            {tFn(t.heroTag)}
          </p>
          <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-light tracking-tight leading-[1.05] text-stone-800 mb-8"
            style={{ opacity: Math.max(0, 1 - scrollY * 0.002) }}>
            {tFn(t.heroTitle1)}<br />
            <span className="italic text-amber-700">{tFn(t.heroTitle2)}</span>{" "}
            {tFn(t.heroTitle3)}
          </h1>
          <p className="text-base sm:text-lg text-stone-500 max-w-xl mx-auto leading-relaxed mb-10 font-light"
            style={{ opacity: Math.max(0, 1 - scrollY * 0.003) }}>
            {tFn(t.heroSub)}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-stone-800 text-white text-sm tracking-wide hover:bg-stone-700 transition-all">
              {tFn(t.ctaExplore)}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#music" className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-stone-500 text-sm tracking-wide hover:text-stone-800 transition-colors">
              <Play size={16} />
              {tFn(t.ctaListen)}
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 animate-bounce opacity-40">
          <ChevronDown size={20} className="text-stone-400" />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FEATURED STORY — Magazine editorial layout
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-24 sm:py-36 px-6 sm:px-10 bg-stone-50/50">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16 items-center">
            {/* Image side — spans 3 columns */}
            <div className="lg:col-span-3 relative">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden relative">
                <Image
                  src="/images/generated/featured-story.png"
                  alt="The Science of Stillness"
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 via-transparent to-transparent" />
              </div>
            </div>
            {/* Text side — spans 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              <span className="text-[10px] tracking-[0.3em] uppercase text-amber-700 font-medium">Featured</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-light leading-tight text-stone-800">
                {featuredStory.title}
              </h2>
              <p className="text-sm text-stone-500 font-light tracking-wide uppercase">{featuredStory.author} · {featuredStory.readTime}</p>
              <p className="text-stone-600 leading-relaxed text-sm">
                {featuredStory.excerpt}
              </p>
              <a href="/browse" className="inline-flex items-center gap-2 text-sm text-amber-700 hover:text-amber-800 transition-colors font-medium">
                Read the story <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          MUSIC — Album-style presentation
          ═══════════════════════════════════════════════════════════ */}
      <section id="music" className="py-24 sm:py-36 px-6 sm:px-10 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16 sm:mb-20">
            <span className="text-[10px] tracking-[0.3em] uppercase text-amber-700 font-medium">{tFn(t.sectionMusic)}</span>
            <h2 className="font-serif text-3xl sm:text-5xl font-light text-stone-800 mt-4 mb-4">{tFn(t.sectionMusic)}</h2>
            <p className="text-stone-500 text-sm max-w-md">{tFn(t.sectionMusicSub)}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {albums.map((album, i) => (
              <div key={i} className="group cursor-pointer">
                {/* Album artwork */}
                <div className="aspect-square rounded-2xl mb-5 relative overflow-hidden transition-transform duration-700 group-hover:scale-[1.02]">
                  <Image
                    src={album.image}
                    alt={album.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/50 via-stone-900/10 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-white/80 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-100 scale-75">
                      <Play size={28} className="text-stone-700 ml-1" />
                    </div>
                  </div>
                </div>
                <h3 className="font-serif text-xl text-stone-800 mb-1">{album.title}</h3>
                <p className="text-xs text-stone-400 tracking-wide uppercase">{album.artist}</p>
                <p className="text-xs text-stone-400 mt-1">{album.mood}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          WISDOM — Typographic pull quotes
          ═══════════════════════════════════════════════════════════ */}
      <section id="wisdom" className="py-24 sm:py-36 px-6 sm:px-10 bg-stone-50/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-[10px] tracking-[0.3em] uppercase text-amber-700 font-medium">{tFn(t.sectionWisdom)}</span>
            <h2 className="font-serif text-3xl sm:text-5xl font-light text-stone-800 mt-4">{tFn(t.sectionWisdom)}</h2>
          </div>

          <div className="space-y-20 sm:space-y-28">
            {[
              { quote: tFn(t.wisdom1), author: tFn(t.wisdom1author) },
              { quote: tFn(t.wisdom2), author: tFn(t.wisdom2author) },
              { quote: tFn(t.wisdom3), author: tFn(t.wisdom3author) },
            ].map((item, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                <div className={`max-w-lg ${i % 2 === 0 ? "text-left" : "text-right"}`}>
                  <Quote size={20} className={`text-amber-300/40 mb-4 ${i % 2 === 0 ? "" : "ml-auto"}`} />
                  <p className="font-serif text-2xl sm:text-3xl font-light italic text-stone-700 leading-relaxed">
                    {item.quote}
                  </p>
                  <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mt-4">
                    — {item.author}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          JOURNAL — Editorial cards inspired by luxury magazines
          ═══════════════════════════════════════════════════════════ */}
      <section id="journal" className="py-24 sm:py-36 px-6 sm:px-10 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 sm:mb-20 gap-4">
            <div>
              <span className="text-[10px] tracking-[0.3em] uppercase text-amber-700 font-medium">{tFn(t.sectionJournal)}</span>
              <h2 className="font-serif text-3xl sm:text-5xl font-light text-stone-800 mt-4">{tFn(t.sectionJournal)}</h2>
              <p className="text-stone-500 text-sm mt-3 max-w-sm">{tFn(t.sectionJournalSub)}</p>
            </div>
            <a href="/browse" className="text-sm text-stone-500 hover:text-stone-800 transition-colors flex items-center gap-1">
              View all <ArrowRight size={14} />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {journalArticles.map((article, i) => (
              <a key={i} href={article.slug} className="group block">
                <div className="aspect-[3/4] rounded-xl mb-5 overflow-hidden relative">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/30 via-transparent to-transparent" />
                </div>
                <span className="text-[10px] tracking-[0.2em] uppercase text-amber-700 font-medium">{article.category}</span>
                <h3 className="font-serif text-lg sm:text-xl text-stone-800 mt-2 mb-1 group-hover:text-amber-700 transition-colors leading-snug">{article.title}</h3>
                <p className="text-xs text-stone-400">{article.readTime}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          NEWSLETTER — Elegant and understated
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-24 sm:py-36 px-6 sm:px-10 bg-stone-50/50">
        <div className="max-w-lg mx-auto text-center">
          <Send size={20} className="text-amber-300 mx-auto mb-6" />
          <h2 className="font-serif text-3xl sm:text-4xl font-light text-stone-800 mb-4">{tFn(t.sectionNewsletter)}</h2>
          <p className="text-stone-500 text-sm mb-8 leading-relaxed">{tFn(t.sectionNewsletterSub)}</p>

          {subscribed ? (
            <div className="py-8">
              <Heart size={32} className="text-amber-400 mx-auto mb-3" />
              <p className="font-serif text-xl text-stone-700">Thank you for joining.</p>
              <p className="text-sm text-stone-400 mt-1">A letter of calm is on its way.</p>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-3 max-w-md mx-auto">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                placeholder={tFn(t.newsletterPlaceholder)}
                className="flex-1 bg-white border border-stone-200 rounded-full px-5 py-3 text-sm text-stone-700 placeholder:text-stone-300 outline-none focus:border-stone-400 transition-colors" />
              <button type="submit" className="px-6 py-3 rounded-full bg-stone-800 text-white text-sm tracking-wide hover:bg-stone-700 transition-all flex-shrink-0">
                {tFn(t.newsletterButton)}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* SOCIAL — Connect */}
      <section className="py-20 px-6 sm:px-10 bg-stone-100/50">
        <div className="max-w-2xl mx-auto text-center">
          <Heart size={20} className="text-amber-400 mx-auto mb-4" />
          <h2 className="font-serif text-3xl sm:text-4xl font-light text-stone-800 mb-3">Follow the journey</h2>
          <p className="text-stone-500 text-sm mb-10 leading-relaxed max-w-md mx-auto">Daily doses of calm. Lofi mixes, meditation clips, and behind-the-scenes moments.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="https://www.youtube.com/channel/UC6HTx93z0PErx1CbqT-ZO1A?sub_confirmation=1" target="_blank" rel="noopener"
              className="group flex items-center gap-3 px-6 py-4 rounded-2xl bg-white border border-stone-200 hover:border-red-200 hover:shadow-lg transition-all duration-300">
              <span className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">▶</span>
              <div className="text-left"><div className="text-sm font-medium text-stone-700">YouTube</div><div className="text-xs text-stone-400">Lofi mixes & meditations</div></div>
            </a>
            <a href="https://www.tiktok.com/@lofibuddha" target="_blank" rel="noopener"
              className="group flex items-center gap-3 px-6 py-4 rounded-2xl bg-white border border-stone-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300">
              <span className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">♪</span>
              <div className="text-left"><div className="text-sm font-medium text-stone-700">TikTok</div><div className="text-xs text-stone-400">Short zen moments</div></div>
            </a>
            <a href="https://www.instagram.com/lofibuddha" target="_blank" rel="noopener"
              className="group flex items-center gap-3 px-6 py-4 rounded-2xl bg-white border border-stone-200 hover:border-pink-200 hover:shadow-lg transition-all duration-300">
              <span className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">◎</span>
              <div className="text-left"><div className="text-sm font-medium text-stone-700">Instagram</div><div className="text-xs text-stone-400">Visual mindfulness</div></div>
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FOOTER — Magazine-inspired
          ═══════════════════════════════════════════════════════════ */}
      <footer className="py-16 px-6 sm:px-10 bg-stone-900 text-stone-400">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
            <div className="col-span-2 md:col-span-1 space-y-4">
              <Link href="/" className="flex items-center gap-2.5">
                <Image
                  src="/lofibuddha.png"
                  alt="LofiBuddha"
                  width={31}
                  height={31}
                  loading="lazy"
                  unoptimized
                  className="h-[31px] w-auto"
                />
                <span className="font-serif text-base tracking-wide text-stone-200">LofiBuddha</span>
              </Link>
              <p className="text-xs leading-relaxed text-stone-500">{tFn(t.footerRights)}</p>
            </div>
            <div className="space-y-3">
              <h4 className="text-xs tracking-[0.2em] uppercase text-stone-300 font-medium">Explore</h4>
              <a href="#journal" className="block text-xs text-stone-500 hover:text-stone-300 transition-colors">{tFn(t.navFeatures)}</a>
              <a href="#music" className="block text-xs text-stone-500 hover:text-stone-300 transition-colors">{tFn(t.navMusic)}</a>
              <a href="#wisdom" className="block text-xs text-stone-500 hover:text-stone-300 transition-colors">{tFn(t.navWisdom)}</a>
            </div>
            <div className="space-y-3">
              <h4 className="text-xs tracking-[0.2em] uppercase text-stone-300 font-medium">Legal</h4>
              <Link href="/legal/privacy" className="block text-xs text-stone-500 hover:text-stone-300 transition-colors">Privacy Policy</Link>
              <Link href="/legal/terms" className="block text-xs text-stone-500 hover:text-stone-300 transition-colors">Terms & Conditions</Link>
              <Link href="/legal/disclaimer" className="block text-xs text-stone-500 hover:text-stone-300 transition-colors">Disclaimer</Link>
            </div>
            <div className="space-y-3">
              <h4 className="text-xs tracking-[0.2em] uppercase text-stone-300 font-medium">Connect</h4>
              <a href="https://www.youtube.com/channel/UC6HTx93z0PErx1CbqT-ZO1A?sub_confirmation=1" target="_blank" rel="noopener" className="block text-xs text-stone-500 hover:text-stone-300 transition-colors">YouTube</a>
              <a href="https://www.tiktok.com/@lofibuddha" target="_blank" rel="noopener" className="block text-xs text-stone-500 hover:text-stone-300 transition-colors">TikTok</a>
              <a href="https://www.instagram.com/lofibuddha" target="_blank" rel="noopener" className="block text-xs text-stone-500 hover:text-stone-300 transition-colors">Instagram</a>
            </div>
          </div>
          <div className="pt-8 border-t border-stone-800 text-center">
            <p className="text-[11px] text-stone-600">&copy; {new Date().getFullYear()} LofiBuddha</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
