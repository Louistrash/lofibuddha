import { NextRequest, NextResponse } from "next/server";
import { getChatMessages } from "@/lib/db";

export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get("lofibuddha_session");
  if (!sessionCookie) {
    return NextResponse.json({ messages: [] });
  }

  try {
    const data = JSON.parse(Buffer.from(sessionCookie.value, "base64").toString());
    const messages = getChatMessages(data.userId);
    return NextResponse.json({ messages });
  } catch {
    return NextResponse.json({ messages: [] });
  }
}
