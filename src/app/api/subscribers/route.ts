import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";

const DB = join(process.cwd(), "public", "data", "subscribers.json");

async function readDB(): Promise<any[]> {
  try {
    const raw = await readFile(DB, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeDB(data: any[]) {
  await mkdir(join(process.cwd(), "public", "data"), { recursive: true });
  await writeFile(DB, JSON.stringify(data, null, 2));
}

// GET — List all subscribers (dashboard) OR handle unsubscribe
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const action = url.searchParams.get("action");
  const email = url.searchParams.get("email");

  // Unsubscribe flow (public)
  if (action === "unsubscribe" && email) {
    try {
      const subs = await readDB();
      const filtered = subs.filter((s: any) => s.email !== email);
      await writeDB(filtered);
      return new NextResponse(
        `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Unsubscribed — LofiBuddha</title></head>
        <body style="margin:0;padding:60px 20px;background:#0f0f0f;color:#f0ebe0;font-family:Georgia,serif;text-align:center">
          <h1 style="color:#c49464;font-size:28px;font-weight:400">You've been unsubscribed 🧘</h1>
          <p style="color:#9a9488;margin-top:16px">Peace will always be here when you're ready to return.</p>
          <a href="/" style="display:inline-block;margin-top:24px;color:#c49464;text-decoration:underline">Back to LofiBuddha</a>
        </body></html>`,
        { headers: { "Content-Type": "text/html" } }
      );
    } catch {
      return NextResponse.json({ error: "Failed to unsubscribe" }, { status: 500 });
    }
  }
  try {
    const subs = await readDB();
    return NextResponse.json({
      subscribers: subs,
      total: subs.length,
      byLanguage: (["en","nl","es","de","fr","hi"] as const).reduce((acc, lang) => {
        acc[lang] = subs.filter((s: any) => s.language === lang).length;
        return acc;
      }, {} as Record<string, number>),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST — Subscribe (public) or update
export async function POST(request: NextRequest) {
  try {
    const { email, language, name } = await request.json();
    
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const subs = await readDB();
    const existing = subs.find((s: any) => s.email === email);

    if (existing) {
      // Update language/preferences
      existing.language = language || existing.language || "en";
      existing.name = name || existing.name;
      existing.updatedAt = new Date().toISOString();
      await writeDB(subs);
      return NextResponse.json({ success: true, message: "Preferences updated", subscriber: existing });
    }

    const subscriber = {
      email,
      language: language || "en",
      name: name || "",
      subscribedAt: new Date().toISOString(),
      confirmed: false,
      status: "active",
    };

    subs.push(subscriber);
    await writeDB(subs);

    return NextResponse.json({ success: true, message: "Subscribed!", subscriber });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE — Unsubscribe
export async function DELETE(request: NextRequest) {
  try {
    const { email } = await request.json();
    const subs = await readDB();
    const filtered = subs.filter((s: any) => s.email !== email);
    await writeDB(filtered);
    return NextResponse.json({ success: true, message: "Unsubscribed" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
