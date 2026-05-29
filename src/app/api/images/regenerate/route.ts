import { NextRequest, NextResponse } from "next/server";
import { writeFile, readFile, mkdir } from "fs/promises";
import { join } from "path";

interface PromptEntry {
  prompt: string;
  style: string;
  aspectRatio: string;
}

async function getKey(): Promise<string> {
  // Read from environment
  const key = process.env.GEMINI_API_KEY;
  if (key && key.length > 10) return key;
  throw new Error("GEMINI_API_KEY not configured");
}

async function callImagen(prompt: string): Promise<Buffer> {
  const key = await getKey();
  const url = "https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=" + key;
  const body = JSON.stringify({
    instances: [{ prompt }],
    parameters: { sampleCount: 1 },
  });

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    signal: AbortSignal.timeout(90000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Imagen API error ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  const prediction = data?.predictions?.[0];
  if (!prediction?.bytesBase64Encoded) {
    throw new Error("No image in Imagen response");
  }

  return Buffer.from(prediction.bytesBase64Encoded, "base64");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filename, prompt: customPrompt } = body;

    if (!filename) {
      return NextResponse.json({ error: "filename is required" }, { status: 400 });
    }

    // Load prompts database
    const promptsPath = join(process.cwd(), "public", "images", "generated", "_prompts.json");
    let promptData: Record<string, PromptEntry> = {};
    try {
      promptData = JSON.parse(await readFile(promptsPath, "utf-8"));
    } catch {
      return NextResponse.json({ error: "No prompts database found" }, { status: 404 });
    }

    // Find the entry
    const baseName = filename.replace(/\.(png|jpg|jpeg|webp)$/i, "");
    const entry = promptData[baseName];
    if (!entry && !customPrompt) {
      return NextResponse.json(
        { error: `No prompt found for "${baseName}". Provide a custom prompt.` },
        { status: 404 }
      );
    }

    const finalPrompt = customPrompt || entry.prompt;

    console.log(`[Imagen] Regenerating: ${baseName}`);
    console.log(`[Imagen] Prompt: ${finalPrompt.slice(0, 100)}...`);

    // Generate
    const imageBuffer = await callImagen(finalPrompt);

    // Save with timestamp
    const timestamp = Date.now();
    const ext = filename.includes(".") ? filename.split(".").pop() : "png";
    const newName = `${baseName}-${timestamp}.${ext}`;
    const outputPath = join(process.cwd(), "public", "images", "generated", newName);
    
    const dir = join(process.cwd(), "public", "images", "generated");
    await mkdir(dir, { recursive: true });
    await writeFile(outputPath, imageBuffer);

    // Update prompts db with the new entry
    promptData[`${baseName}-${timestamp}`] = {
      prompt: finalPrompt,
      style: entry?.style || "custom",
      aspectRatio: entry?.aspectRatio || "1:1",
    };
    await writeFile(promptsPath, JSON.stringify(promptData, null, 2));

    const url = `/images/generated/${newName}`;

    console.log(`[Imagen] Saved: ${url} (${imageBuffer.length} bytes)`);

    return NextResponse.json({
      success: true,
      image: {
        name: newName,
        path: url,
        url,
        size: imageBuffer.length,
        sizeFormatted: formatSize(imageBuffer.length),
        prompt: finalPrompt,
      },
    });
  } catch (err: any) {
    console.error("[Imagen] Error:", err);
    return NextResponse.json(
      { error: err.message || "Image generation failed" },
      { status: 500 }
    );
  }
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}
