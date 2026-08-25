import { NextRequest, NextResponse } from "next/server";
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import path from "path";

function getTokensPath() { return path.join(process.cwd(), "data", "youtube-tokens.json"); }

function loadTokens() {
  const p = getTokensPath();
  if (!existsSync(p)) return {};
  return JSON.parse(readFileSync(p, "utf-8"));
}

function saveTokens(tokens: any) {
  const dir = path.join(process.cwd(), "data");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(getTokensPath(), JSON.stringify(tokens, null, 2));
}

export async function GET(request: NextRequest) {
  const action = request.nextUrl.searchParams.get("action");
  const env = process.env;
  const cId = env.GOOGLE_CLIENT_ID || "";
  const cSec = env.GOOGLE_CLIENT_SECRET || "";

  if (!cId || !cSec) {
    return NextResponse.json({
      error: "YouTube not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local",
      setup: "https://console.cloud.google.com/apis/credentials",
    }, { status: 400 });
  }

  const host = env.NEXT_PUBLIC_BODHI_URL || "https://lofibuddha.com";
  const redirectUri = host + "/api/youtube/auth?action=callback";
  const scope = "https://www.googleapis.com/auth/youtube.upload";

  // Status check (gebruikt door de social pagina)
  if (action === "status") {
    const tokens = loadTokens();
    const connected = !!(tokens.connected && tokens.refresh_token);
    return NextResponse.json({
      connected,
      expiresAt: tokens.expires_at || null,
      channelTitle: tokens.channel_title || null,
    });
  }

  if (action === "login") {
    const qs = new URLSearchParams({
      client_id: cId, redirect_uri: redirectUri, response_type: "code",
      scope, access_type: "offline", prompt: "consent select_account",
    });
    return NextResponse.redirect("https://accounts.google.com/o/oauth2/v2/auth?" + qs);
  }

  if (action === "callback") {
    const code = request.nextUrl.searchParams.get("code");
    if (!code) return NextResponse.json({ error: "No code" }, { status: 400 });
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: cId, client_secret: cSec,
        code, grant_type: "authorization_code", redirect_uri: redirectUri,
      }),
    });
    const data = await res.json();
    if (data.error) return NextResponse.json({ error: data.error_description }, { status: 400 });
    saveTokens({
      access_token: data.access_token, refresh_token: data.refresh_token,
      expires_at: Date.now() + (data.expires_in || 3600) * 1000, connected: true,
    });
    return NextResponse.redirect(host + "/social?youtube=connected");
  }

  if (action === "status") {
    return NextResponse.json({ connected: !!loadTokens().connected });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
