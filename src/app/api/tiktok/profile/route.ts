import { NextResponse } from "next/server";
import { getAccessToken, loadTokens } from "../utils";

const TIKTOK_API = "https://open.tiktokapis.com/v2/user/info/";

export async function GET() {
  const accessToken = await getAccessToken();
  const tokens = loadTokens();

  if (!accessToken || !tokens.open_id) {
    return NextResponse.json({ connected: false, error: "Not connected" }, { status: 401 });
  }

  try {
    const res = await fetch(`${TIKTOK_API}?fields=open_id,union_id,avatar_url,display_name,follower_count,likes_count,video_count,bio_description`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
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
