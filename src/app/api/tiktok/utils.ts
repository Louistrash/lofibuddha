import fs from "fs";

const TIKTOK_TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/";

export function tokenPath() {
  return "/opt/data/bodhi-dashboard/.tiktok-tokens.json";
}

export function loadTokens(): Record<string, any> {
  try {
    if (fs.existsSync(tokenPath())) {
      return JSON.parse(fs.readFileSync(tokenPath(), "utf-8"));
    }
  } catch {}
  return {};
}

export function saveTokens(tokens: Record<string, any>) {
  try {
    fs.writeFileSync(tokenPath(), JSON.stringify(tokens, null, 2));
  } catch {}
}

export async function getAccessToken(): Promise<string | null> {
  const tokens = loadTokens();

  if (!tokens.access_token) {
    return null;
  }

  const now = Date.now();
  // If token is expired or expires in less than 5 minutes (300000ms), refresh it!
  const isExpired = !tokens.expires_at || (tokens.expires_at - now < 300000);

  if (isExpired && tokens.refresh_token) {
    console.log("TikTok access token is expired or close to expiring, refreshing...");
    try {
      const clientKey = process.env.TIKTOK_CLIENT_KEY || "";
      const clientSecret = process.env.TIKTOK_CLIENT_SECRET || "";

      const response = await fetch(TIKTOK_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_key: clientKey,
          client_secret: clientSecret,
          grant_type: "refresh_token",
          refresh_token: tokens.refresh_token,
        }),
      });

      const data = await response.json();

      if (data.error) {
        console.error("TikTok token refresh failed:", data);
        return null;
      }

      const updatedTokens = {
        ...tokens,
        access_token: data.access_token,
        refresh_token: data.refresh_token || tokens.refresh_token, // Keep old if new one not provided
        expires_at: Date.now() + (data.expires_in || 86400) * 1000,
      };

      saveTokens(updatedTokens);
      console.log("TikTok access token successfully refreshed!");
      return data.access_token;
    } catch (err) {
      console.error("TikTok token refresh error:", err);
      return null;
    }
  }

  return tokens.access_token;
}
