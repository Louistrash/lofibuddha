import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";

const DB = join(process.cwd(), "public", "data", "subscribers.json");

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const action = url.searchParams.get("action");
  const email = url.searchParams.get("email");

  if (action === "unsubscribe" && email) {
    try {
      const subs = JSON.parse(await readFile(DB, "utf-8"));
      const filtered = subs.filter((s: any) => s.email !== email);
      await writeFile(DB, JSON.stringify(filtered, null, 2));
      
      // Return a nice HTML confirmation page
      return new NextResponse(
        `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Unsubscribed — LofiBuddha</title></head>
        <body style="margin:0;padding:60px 20px;background:#0f0f0f;color:#f0ebe0;font-family:Georgia,serif;text-align:center">
          <h1 style="color:#c49464;font-size:28px;font-weight:400">You've been unsubscribed 🧘</h1>
          <p style="color:#9a9488;margin-top:16px">Peace and calm will always be here when you're ready to return.</p>
          <a href="/" style="display:inline-block;margin-top:24px;color:#c49464;text-decoration:underline">Back to LofiBuddha</a>
        </body></html>`,
        { headers: { "Content-Type": "text/html" } }
      );
    } catch {
      return NextResponse.json({ error: "Failed to unsubscribe" }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
