import { NextResponse } from "next/server";

const TIKTOK_API = "https://open.tiktokapis.com/v2/user/info/";

function loadTokens(): Record<string, unknown> {
  try {
    const fs = require("fs");
    const path = "/opt/data/bodhi-dashboard/.tiktok-tokens.json";
    if (fs.existsSync(path)) return JSON.parse(fs.readFileSync(path, "utf-8"));
  } catch {}
  return {};
}

export async function GET() {
  const tokens = loadTokens();

  if (!tokens.access_token || !tokens.open_id) {
    return NextResponse.json({ connected: false, error: "Not connected" }, { status: 401 });
  }

  try {
    const res = await fetch(`${TIKTOK_API}?fields=open_id,union_id,avatar_url,display_name,follower_count,likes_count,video_count,bio_description`, {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    const data = await res.json();

    if (data.error) {
      return NextResponse.json({ connected: false, error: data.error.message || "Failed" });
    }

    const user = data.data?.user || {};
    return NextResponse.json({
      connected: true,
      displayName: user.display_name || "",
      avatar: user.avatar_url || "",
      bio: user.bio_description || "",
      followers: user.follower_count || 0,
      likes: user.likes_count || 0,
      videos: user.video_count || 0,
    });
  } catch {
    return NextResponse.json({ connected: false, error: "Network error" });
  }
}
