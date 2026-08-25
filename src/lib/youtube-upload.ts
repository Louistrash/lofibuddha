// Gedeelde YouTube-upload logica (single + bulk).
// Leest tokens & video uit process.cwd() (= .next/standalone in prod).

import { readFileSync, existsSync } from "fs";
import path from "path";
import { buildYouTubeMeta } from "./youtube-meta";

function getTokens() {
  const p = path.join(process.cwd(), "data", "youtube-tokens.json");
  if (existsSync(p)) return JSON.parse(readFileSync(p, "utf-8"));
  return {};
}

function buildDeeplink(content: string): string {
  const c = content.toLowerCase();
  if (/(breath|breathe|box|pranayama)/.test(c)) return "https://lofibuddha.com/mindfulness/breathe";
  if (/(sleep|night|drift|rain|unwind|evening)/.test(c)) return "https://lofibuddha.com/mindfulness/sleep";
  if (/(relax|body scan|release|unwind|zen)/.test(c)) return "https://lofibuddha.com/mindfulness/relax";
  if (/(focus|study|work|deep|lofi|beat)/.test(c)) return "https://lofibuddha.com/mindfulness/focus";
  return "https://lofibuddha.com/mindfulness";
}

export interface UploadInput {
  videoPath: string;
  title?: string;
  description?: string;
  tags?: string[];
}

export interface UploadResult {
  videoPath?: string;
  success: boolean;
  videoId?: string;
  url?: string;
  title?: string;
  error?: string;
}

export async function uploadToYouTube(input: UploadInput): Promise<UploadResult> {
  try {
    const { videoPath } = input;
    if (!videoPath) return { success: false, error: "videoPath required" };

    const cId = process.env.GOOGLE_CLIENT_ID || "";
    const cSec = process.env.GOOGLE_CLIENT_SECRET || "";
    const tokens = getTokens();
    const refreshToken = tokens.refresh_token || "";

    if (!cId || !cSec || !refreshToken) {
      return { success: false, error: "YouTube not connected. Visit /api/youtube/auth?action=login first" };
    }

    // Refresh access token
    const tr = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: cId,
        client_secret: cSec,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });
    const td = await tr.json();
    const accessToken = td.access_token;
    if (!accessToken) return { success: false, error: "Token refresh failed. Reconnect YouTube." };

    // Resolve video file (prod cwd = .next/standalone)
    const filePath = path.join(process.cwd(), "public", videoPath.replace(/^\//, ""));
    if (!existsSync(filePath)) return { success: false, error: "Video file not found: " + filePath };
    const videoBuffer = readFileSync(filePath);

    // Rijke meta als fallback (title/description/tags uit youtube-meta.ts)
    const meta = buildYouTubeMeta(videoPath);
    const finalTitle = input.title || meta.title;
    const finalTags = input.tags && input.tags.length ? input.tags : meta.tags;

    // Description: custom (met deeplink-aanvulling als die nog geen link bevat)
    // of de rijke "yoga Buddha" template.
    const baseDescription = input.description || meta.description;
    const fullDescription = baseDescription.includes("lofibuddha.com")
      ? baseDescription
      : [
          baseDescription,
          "",
          "🌿 " + buildDeeplink(finalTitle + " " + (finalTags || []).join(" ")),
          "",
          "🎧 More calm: https://lofibuddha.com/mindfulness",
          "💬 Chat with Buddha: https://lofibuddha.com/chat",
        ].join("\n");

    const boundary = "BODHI-" + Date.now();
    const CRLF = "\r\n";
    const metadata = {
      snippet: {
        title: finalTitle || "Lofi Buddha — Daily Calm",
        description: fullDescription,
        tags: finalTags,
        categoryId: "22",
      },
      status: { privacyStatus: "private" }, // private = review in Studio vóór publiceren
    };

    const bodyParts = [
      "--" + boundary + CRLF + "Content-Type: application/json; charset=UTF-8" + CRLF + CRLF + JSON.stringify(metadata) + CRLF,
      "--" + boundary + CRLF + "Content-Type: video/mp4" + CRLF + "Content-Transfer-Encoding: binary" + CRLF + CRLF,
    ];
    const header = Buffer.from(bodyParts[0]);
    const middle = Buffer.from(bodyParts[1]);
    const footer = Buffer.from(CRLF + "--" + boundary + "--" + CRLF);
    const body = Buffer.concat([header, middle, videoBuffer, footer]);

    const res = await fetch("https://www.googleapis.com/upload/youtube/v3/videos?part=snippet,status", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + accessToken,
        "Content-Type": "multipart/related; boundary=" + boundary,
        "Content-Length": String(body.length),
      },
      body,
    });

    const result = await res.json();
    if (result.error) return { success: false, error: result.error.message };

    return {
      success: true,
      videoId: result.id,
      url: "https://youtube.com/watch?v=" + result.id,
      title: finalTitle,
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
