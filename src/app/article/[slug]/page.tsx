import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

async function getArticle(slug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const res = await fetch(baseUrl + "/api/articles/" + slug, { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  return data.article;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: "Article Not Found" };

  return {
    title: article.title + " — LofiBuddha",
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      images: [article.imageUrl],
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) notFound();

  return (
    <div className="min-h-screen editorial-theme bg-[#faf8f5]">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#faf8f5]/80 backdrop-blur-xl border-b border-stone-200/60">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/landing" className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
            </svg>
            Back to LofiBuddha
          </Link>
          <Link href="/mindfulness" className="text-xs tracking-[0.2em] uppercase text-amber-700 font-medium hover:text-amber-800">
            All Articles
          </Link>
        </div>
      </nav>

      {/* Article Header */}
      <header className="pt-32 pb-12 px-6 text-center max-w-3xl mx-auto">
        <span className="text-[10px] tracking-[0.3em] uppercase text-amber-700 font-medium">
          {article.category}
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-stone-800 mt-4 mb-6 leading-[1.15]">
          {article.title}
        </h1>
        <div className="flex items-center justify-center gap-4 text-xs text-stone-400 tracking-wide">
          <span>LofiBuddha Editorial</span>
          <span>·</span>
          <span>{article.readTime}</span>
          <span>·</span>
          <span>{new Date(article.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
        </div>
      </header>

      {/* Featured Image */}
      {article.imageUrl && (
        <div className="max-w-3xl mx-auto px-6 mb-12">
          <div className="aspect-[16/9] rounded-2xl overflow-hidden">
            <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
          </div>
        </div>
      )}

      {/* Article Content */}
      <article className="max-w-2xl mx-auto px-6 pb-24">
        <div className="prose prose-stone prose-lg max-w-none font-light leading-relaxed text-stone-700
          prose-headings:font-serif prose-headings:text-stone-800 prose-headings:font-normal
          prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6
          prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
          prose-p:leading-[1.85] prose-p:mb-6
          prose-strong:text-stone-800 prose-strong:font-medium
          prose-a:text-amber-700 prose-a:no-underline hover:prose-a:text-amber-800"
          dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, "<br/>") }}
        />
      </article>

      {/* Back */}
      <div className="text-center pb-24">
        <Link href="/mindfulness" className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
          </svg>
          Back to all articles
        </Link>
      </div>
    </div>
  );
}
