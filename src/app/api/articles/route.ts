import { NextRequest, NextResponse } from "next/server";
import { writeFileSync, readFileSync, readdirSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data", "articles");

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  imageUrl: string;
  readTime: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function stripMarkdown(md: string): string {
  return md
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/`{1,3}[^`]+`{1,3}/g, "")
    .replace(/>\s+/gm, "")
    .replace(/[-*+]\s+/g, "")
    .replace(/\n{2,}/g, ". ")
    .replace(/\n/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function calculateReadTime(content: string): string {
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.round(words / 200)) + " min read";
}

function getArticles(): Article[] {
  if (!existsSync(DATA_DIR)) return [];
  const files = readdirSync(DATA_DIR).filter(f => f.endsWith(".json"));
  return files.map(f => {
    const raw = readFileSync(join(DATA_DIR, f), "utf-8");
    return JSON.parse(raw) as Article;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const publishedOnly = url.searchParams.get("published") === "true";
  let articles = getArticles();
  if (publishedOnly) articles = articles.filter(a => a.published);
  return NextResponse.json({ articles });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, category, imageUrl, excerpt } = body;
    if (!title || !content) {
      return NextResponse.json({ error: "Title and content required" }, { status: 400 });
    }
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    const slug = slugify(title) + "-" + Date.now().toString(36);
    const now = new Date().toISOString();
    const readTime = calculateReadTime(content);
    const cleanExcerpt = excerpt || stripMarkdown(content).substring(0, 160).trim() + "...";
    const article: Article = {
      slug, title, excerpt: cleanExcerpt, content,
      category: category || "Mindfulness",
      imageUrl: imageUrl || "/images/generated/featured-story.png",
      readTime, published: body.published === true,
      createdAt: now, updatedAt: now,
    };
    writeFileSync(join(DATA_DIR, slug + ".json"), JSON.stringify(article, null, 2));
    return NextResponse.json({ success: true, article }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
