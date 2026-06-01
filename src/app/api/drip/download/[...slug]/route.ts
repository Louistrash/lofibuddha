import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

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
  return (contentId === "spiritual-roadmap-template" || contentId === "monthly-reflection-journal")
    ? "enlightened"
    : "mindful";
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await context.params;
  const contentId = slug[0] || "";
  const contentFile = CONTENT_FILES[contentId];

  if (!contentFile) {
    return NextResponse.json({ error: "Content not found" }, { status: 404 });
  }

  const email = request.nextUrl.searchParams.get("email");

  // Check access
  if (email) {
    const requiredTier = getRequiredTier(contentId);
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
  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${contentFile}"`,
    },
  });
}
