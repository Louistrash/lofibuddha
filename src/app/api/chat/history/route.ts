import { NextRequest, NextResponse } from "next/server";
import { getChatMessages } from "@/lib/db";
import { corsPreflight, withCors } from "@/lib/cors";

export async function OPTIONS(request: NextRequest) {
  return corsPreflight(request);
}

export async function GET(req: NextRequest) {
  const fbUid = req.headers.get("x-fb-uid");
  if (fbUid) {
    const messages = getChatMessages(fbUid);
    return withCors(req, NextResponse.json({ messages }));
  }

  const sessionCookie = req.cookies.get("lofibuddha_session");
  if (!sessionCookie) {
    return withCors(req, NextResponse.json({ messages: [] }));
  }

  try {
    const data = JSON.parse(Buffer.from(sessionCookie.value, "base64").toString());
    const messages = getChatMessages(data.userId);
    return withCors(req, NextResponse.json({ messages }));
  } catch {
    return withCors(req, NextResponse.json({ messages: [] }));
  }
}
