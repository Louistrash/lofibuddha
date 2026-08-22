import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import path from 'path';

function getTokens() {
  const p = path.join(process.cwd(), 'data', 'youtube-tokens.json');
  if (existsSync(p)) return JSON.parse(readFileSync(p, 'utf-8'));
  return {};
}

/** Bepaalt een deeplink naar de juiste experience op basis van content keywords. */
function buildDeeplink(content: string): string {
  const c = content.toLowerCase();
  if (/(breath|breathe|box|pranayama)/.test(c)) return "https://lofibuddha.com/mindfulness/breathe";
  if (/(sleep|night|drift|rain|unwind|evening)/.test(c)) return "https://lofibuddha.com/mindfulness/sleep";
  if (/(relax|body scan|release|unwind|zen)/.test(c)) return "https://lofibuddha.com/mindfulness/relax";
  if (/(focus|study|work|deep|lofi|beat)/.test(c)) return "https://lofibuddha.com/mindfulness/focus";
  return "https://lofibuddha.com/mindfulness";
}

export async function POST(request: NextRequest) {
  try {
    const { videoPath, title, description, tags } = await request.json();
    if (!videoPath) return NextResponse.json({ error: 'videoPath required' }, { status: 400 });

    const cId = process.env.GOOGLE_CLIENT_ID || '';
    const cSec = process.env.GOOGLE_CLIENT_SECRET || '';
    const tokens = getTokens();
    const refreshToken = tokens.refresh_token || '';

    if (!cId || !cSec || !refreshToken) {
      return NextResponse.json({
        error: 'YouTube not connected. Visit /api/youtube/auth?action=login first',
      }, { status: 400 });
    }

    // Refresh access token
    const tr = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: cId, client_secret: cSec,
        refresh_token: refreshToken, grant_type: 'refresh_token',
      }),
    });
    const td = await tr.json();
    const accessToken = td.access_token;
    if (!accessToken) {
      return NextResponse.json({ error: 'Token refresh failed. Reconnect YouTube.' }, { status: 401 });
    }

    // Read video file directly (not via URL)
    const filePath = path.join(process.cwd(), 'public', videoPath.replace(/^\//, ''));
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'Video file not found: ' + filePath }, { status: 404 });
    }
    const videoBuffer = readFileSync(filePath);

    // Multipart upload to YouTube
    const boundary = 'BODHI-' + Date.now();
    const CRLF = '\r\n';

    // Deeplink op basis van content (title/tags)
    const deeplink = buildDeeplink((title || "") + " " + (tags || []).join(" "));
    const fullDescription = [
      description || "Lofi music for meditation, focus and calm. ✨",
      "",
      "🌿 " + deeplink,
      "",
      "🎧 More calm: https://lofibuddha.com/mindfulness",
      "💬 Chat with Buddha: https://lofibuddha.com/chat",
    ].join("\n");

    const metadata = {
      snippet: {
        title: title || 'LofiBuddha - Daily Calm',
        description: fullDescription,
        tags: tags || ['lofi', 'meditation', 'mindfulness'],
        categoryId: '22',
      },
      status: { privacyStatus: 'draft' }, // Altijd draft — Louis reviewed eerst in YouTube Studio
    };

    const bodyParts = [
      '--' + boundary + CRLF + 'Content-Type: application/json; charset=UTF-8' + CRLF + CRLF + JSON.stringify(metadata) + CRLF,
      '--' + boundary + CRLF + 'Content-Type: video/mp4' + CRLF + 'Content-Transfer-Encoding: binary' + CRLF + CRLF,
    ];

    const header = Buffer.from(bodyParts[0]);
    const middle = Buffer.from(bodyParts[1]);
    const footer = Buffer.from(CRLF + '--' + boundary + '--' + CRLF);
    const body = Buffer.concat([header, middle, videoBuffer, footer]);

    const res = await fetch(
      'https://www.googleapis.com/upload/youtube/v3/videos?part=snippet,status',
      {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + accessToken,
          'Content-Type': 'multipart/related; boundary=' + boundary,
          'Content-Length': String(body.length),
        },
        body,
      }
    );

    const result = await res.json();
    console.log('[YouTube] Response:', JSON.stringify(result).substring(0, 200));

    if (result.error) {
      return NextResponse.json({ success: false, error: result.error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      videoId: result.id,
      url: 'https://youtube.com/watch?v=' + result.id,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
