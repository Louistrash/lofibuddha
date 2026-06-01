import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// ── Content mapping ────────────────────────────
const CONTENT_FILES: Record<string, string> = {
  "breathwork-essentials": "breathwork-essentials.md",
  "beginners-mindfulness": "beginners-mindfulness.md",
  "yoga-foundations": "yoga-foundations.md",
  "lofi-deep-focus": "lofi-deep-focus.md",
  "monthly-reflection-journal": "monthly-reflection-journal.md",
  "spiritual-roadmap-template": "spiritual-roadmap-template.md",
};

const CONTENT_DIR = path.join(process.cwd(), "data", "drip-content");
const SUBSCRIBERS_FILE = path.join(process.cwd(), "data", "subscribers.json");

function getRequiredTier(contentId: string): string | null {
  switch (contentId) {
    case "spiritual-roadmap-template":
    case "monthly-reflection-journal":
      return "enlightened";
    default:
      return "mindful"; // mindful+ can access
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  const slug = params.slug?.[0] || "";
  const contentFile = CONTENT_FILES[slug];
  const email = request.nextUrl.searchParams.get("email");

  if (!contentFile) {
    return NextResponse.json({ error: "Content not found" }, { status: 404 });
  }

  // Check access
  if (email) {
    const requiredTier = getRequiredTier(slug);
    try {
      if (fs.existsSync(SUBSCRIBERS_FILE)) {
        const subs = JSON.parse(fs.readFileSync(SUBSCRIBERS_FILE, "utf-8"));
        const sub = subs.find((s: any) => s.email === email);
        if (!sub || (requiredTier === "enlightened" && sub.tier !== "enlightened")) {
          return NextResponse.json(
            { error: "Upgrade to access this content" },
            { status: 403 }
          );
        }
      }
    } catch {}
  }

  const filePath = path.join(CONTENT_DIR, contentFile);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const filename = contentFile.replace(".md", ".md");

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
