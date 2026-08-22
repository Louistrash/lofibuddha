import { NextRequest, NextResponse } from "next/server";
import { loadTokens, saveTokens } from "../utils";

const TIKTOK_AUTH_URL = "https://www.tiktok.com/v2/auth/authorize/";
const TIKTOK_TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/";
const TIKTOK_REVOKE_URL = "https://open.tiktokapis.com/v2/oauth/revoke/";

function getRedirectUri() {
  const host = process.env.NEXT_PUBLIC_BODHI_URL || "https://lofibuddha.com";
  return `${host}/api/tiktok/auth?action=callback`;
}

function getCredentials() {
  return {
    clientKey: process.env.TIKTOK_CLIENT_KEY || "",
    clientSecret: process.env.TIKTOK_CLIENT_SECRET || "",
  };
}

export async function GET(req: NextRequest) {
  const action = req.nextUrl.searchParams.get("action");
  const { clientKey, clientSecret } = getCredentials();

  if (!clientKey || !clientSecret) {
    return NextResponse.json(
      { error: "TikTok credentials not configured. Set TIKTOK_CLIENT_KEY and TIKTOK_CLIENT_SECRET." },
      { status: 400 }
    );
  }

  // ── OAuth Step 1: Redirect to TikTok login ──
  if (action === "login") {
    const state = Math.random().toString(36).substring(2, 15);
    saveTokens({ ...loadTokens(), state, ts: Date.now() });

    const params = new URLSearchParams({
      client_key: clientKey,
      redirect_uri: getRedirectUri(),
      response_type: "code",
      scope: "user.info.basic,video.publish,video.upload",
      state,
    });

    const url = `${TIKTOK_AUTH_URL}?${params.toString()}`;
    return NextResponse.redirect(url);
  }

  // ── OAuth Step 2: Handle callback & exchange code ──
  if (action === "callback") {
    const code = req.nextUrl.searchParams.get("code");
    const returnedState = req.nextUrl.searchParams.get("state");
    const error = req.nextUrl.searchParams.get("error");
    const stored = loadTokens();

    if (error) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BODHI_URL || "https://lofibuddha.com"}/social?tiktok=error&msg=${encodeURIComponent(error)}`);
    }

    if (!code || returnedState !== stored.state) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BODHI_URL || "https://lofibuddha.com"}/social?tiktok=error&msg=invalid_state`);
    }

    try {
      const response = await fetch(TIKTOK_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_key: clientKey,
          client_secret: clientSecret,
          code,
          grant_type: "authorization_code",
          redirect_uri: getRedirectUri(),
        }),
      });

      const data = await response.json();

      if (data.error) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BODHI_URL || "https://lofibuddha.com"}/social?tiktok=error&msg=${encodeURIComponent(data.error_description || data.error)}`);
      }

      saveTokens({
        ...stored,
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        open_id: data.open_id,
        expires_at: Date.now() + (data.expires_in || 86400) * 1000,
        connected: true,
      });

      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BODHI_URL || "https://lofibuddha.com"}/social?tiktok=connected`);
    } catch (err) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BODHI_URL || "https://lofibuddha.com"}/social?tiktok=error&msg=token_exchange_failed`);
    }
  }

  // ── Check connection status ──
  if (action === "status") {
    const stored = loadTokens();
    const connected = stored.connected && stored.access_token;
    return NextResponse.json({
      connected: !!connected,
      open_id: stored.open_id || null,
      expires_at: stored.expires_at || null,
    });
  }

  // ── Disconnect ──
  if (action === "disconnect") {
    const stored = loadTokens();
    if (stored.access_token) {
      try {
        await fetch(TIKTOK_REVOKE_URL, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_key: clientKey,
            client_secret: clientSecret,
            token: stored.access_token as string,
          }),
        });
      } catch {}
    }
    saveTokens({});
    return NextResponse.json({ connected: false });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
