import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync, existsSync, unlinkSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data", "articles");

// GET /api/articles/[slug] — get single article
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const filePath = join(DATA_DIR, slug + ".json");

  if (!existsSync(filePath)) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  const raw = readFileSync(filePath, "utf-8");
  const article = JSON.parse(raw);

  return NextResponse.json({ article });
}

// PATCH /api/articles/[slug] — update article
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const filePath = join(DATA_DIR, slug + ".json");

    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const raw = readFileSync(filePath, "utf-8");
    const article = JSON.parse(raw);
    const body = await request.json();

    const updated = {
      ...article,
      ...body,
      slug: article.slug, // never change slug
      updatedAt: new Date().toISOString(),
    };

    writeFileSync(filePath, JSON.stringify(updated, null, 2));

    return NextResponse.json({ success: true, article: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/articles/[slug] — delete article
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const filePath = join(DATA_DIR, slug + ".json");

  if (!existsSync(filePath)) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  unlinkSync(filePath);
  return NextResponse.json({ success: true, slug });
}
