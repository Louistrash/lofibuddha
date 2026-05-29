import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";

const DB = join(process.cwd(), "public", "data", "newsletters.json");

const LANGUAGES = ["en", "nl", "es", "de", "fr", "hi"] as const;

async function readDB(): Promise<any[]> {
  try {
    return JSON.parse(await readFile(DB, "utf-8"));
  } catch {
    return [];
  }
}

// GET — List newsletters (with optional language filter)
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const lang = url.searchParams.get("lang");
    const newsletters = await readDB();
    
    let result = newsletters;
    if (lang) {
      result = newsletters.filter((n: any) => n.language === lang);
    }

    return NextResponse.json({ newsletters: result, total: result.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST — Create a newsletter draft
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subject, content, language, issueNumber } = body;

    if (!subject || !content) {
      return NextResponse.json({ error: "subject and content required" }, { status: 400 });
    }

    const newsletters = await readDB();
    const issue = {
      id: `nl-${Date.now()}`,
      subject,
      content,
      language: language || "en",
      issueNumber: issueNumber || newsletters.length + 1,
      status: "draft",
      createdAt: new Date().toISOString(),
      sentAt: null,
      subscriberCount: 0,
    };

    newsletters.push(issue);
    await mkdir(join(process.cwd(), "public", "data"), { recursive: true });
    await writeFile(DB, JSON.stringify(newsletters, null, 2));

    return NextResponse.json({ success: true, issue });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT — Mark as sent
export async function PUT(request: NextRequest) {
  try {
    const { id, status } = await request.json();
    const newsletters = await readDB();
    const issue = newsletters.find((n: any) => n.id === id);
    
    if (!issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    issue.status = status || "sent";
    issue.sentAt = new Date().toISOString();
    
    // Count subscribers for this language
    try {
      const subsRaw = await readFile(join(process.cwd(), "public", "data", "subscribers.json"), "utf-8");
      const subs = JSON.parse(subsRaw);
      issue.subscriberCount = subs.filter((s: any) => 
        s.language === issue.language && s.status === "active"
      ).length;
    } catch {}

    await writeFile(DB, JSON.stringify(newsletters, null, 2));
    return NextResponse.json({ success: true, issue });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
