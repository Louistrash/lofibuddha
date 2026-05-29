import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "../utils";

const TIKTOK_PUBLISH_URL = "https://open.tiktokapis.com/v2/post/publish/video/init/";

export async function POST(req: NextRequest) {
  try {
    const { videoPath, caption } = await req.json();

    if (!videoPath) {
      return NextResponse.json({ error: "Missing videoPath" }, { status: 400 });
    }

    const accessToken = await getAccessToken();
    if (!accessToken) {
      return NextResponse.json({ error: "TikTok account not connected or failed to refresh token. Please connect/reconnect your account." }, { status: 401 });
    }

    // Construct the public URL of the video
    const host = process.env.NEXT_PUBLIC_BODHI_URL || "https://bodhi.aibuddha.net";
    const videoUrl = `${host}${videoPath}`;

    // Prepare payload for Direct Post v2 API
    const payload = {
      post_info: {
        title: caption || "Zen Meditation and Lofi Beats #mindfulness #lofi",
        privacy_level: "PUBLIC_TO_EVERYONE",
        disable_duet: false,
        disable_comment: false,
        disable_stitch: false,
        video_cover_timestamp_ms: 1000
      },
      source_info: {
        source: "PULL_FROM_URL",
        video_url: videoUrl
      }
    };

    console.log("Publishing to TikTok with payload:", JSON.stringify(payload));

    const response = await fetch(TIKTOK_PUBLISH_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log("TikTok API response:", data);

    if (data.error) {
      return NextResponse.json({
        error: data.error.message || `TikTok API error: ${data.error.code}`
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      publish_id: data.data?.publish_id || null
    });

  } catch (error: any) {
    console.error("Error publishing to TikTok:", error);
    return NextResponse.json({ error: error.message || "Failed to publish video" }, { status: 500 });
  }
}
