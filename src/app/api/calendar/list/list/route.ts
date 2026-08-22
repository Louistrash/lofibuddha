import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";

const CALENDAR_PATH = join(process.cwd(), "public", "data", "calendar.json");

export async function GET() {
  try {
    const data = await readFile(CALENDAR_PATH, "utf-8");
    const posts = JSON.parse(data);
    return NextResponse.json({ posts });
  } catch {
    return NextResponse.json({ posts: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await writeFile(CALENDAR_PATH, JSON.stringify(body.posts || body, null, 2));
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
