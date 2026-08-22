import { NextRequest, NextResponse } from "next/server";
import { writeFileSync } from "fs";
import { join } from "path";

const VEO_MODEL = "veo-3.1-generate-preview";
const BASE = "https://generativelanguage.googleapis.com/v1beta";
const MAX_WAIT = 300000;

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();
    if (!prompt) return NextResponse.json({ error: "prompt required" }, { status: 400 });

    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || "";
    if (!apiKey) return NextResponse.json({ error: "API key not configured" }, { status: 400 });

    // Step 1: Start long-running operation
    console.log("[Veo] Starting:", prompt.substring(0, 80));
    const opRes = await fetch(`${BASE}/models/${VEO_MODEL}:predictLongRunning?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ instances: [{ prompt }], parameters: { sampleCount: 1 } }),
    });
    const opData = await opRes.json();
    if (opData.error) return NextResponse.json({ error: opData.error.message }, { status: opRes.status });

    const opName = opData.name;
    if (!opName) return NextResponse.json({ error: "No operation name" }, { status: 500 });

    // Step 2: Poll
    const startTime = Date.now();
    let videoUri = "";
    while (Date.now() - startTime < MAX_WAIT) {
      await sleep(8000);
      const pollRes = await fetch(`${BASE}/${opName}?key=${apiKey}`);
      const pollData = await pollRes.json();
      if (pollData.done) {
        // Response format: response.generateVideoResponse.generatedSamples[0].video.uri
        const gs = pollData.response?.generateVideoResponse?.generatedSamples;
        if (gs?.[0]?.video?.uri) videoUri = gs[0].video.uri;
        break;
      }
      console.log("[Veo] Polling...", Math.round((Date.now() - startTime) / 1000), "s");
    }

    if (!videoUri) return NextResponse.json({ error: "No video generated or timed out" }, { status: 504 });

    // Step 3: Download
    const downloadUrl = videoUri.includes("?") ? `${videoUri}&key=${apiKey}` : `${videoUri}?key=${apiKey}`;
    const dlRes = await fetch(downloadUrl);
    const buffer = Buffer.from(await dlRes.arrayBuffer());
    const name = "veo-" + Date.now().toString(36) + ".mp4";
    writeFileSync(join(process.cwd(), "public", "videos", name), buffer);

    console.log(`[Veo] Done: ${name} (${buffer.length} bytes)`);
    return NextResponse.json({ success: true, video: "/videos/" + name, size: buffer.length });
  } catch (err: any) {
    console.error("[Veo]", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
