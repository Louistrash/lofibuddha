import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { getProjectRoot } from "@/lib/paths";
import { corsHeaders, corsPreflight, withCors } from "@/lib/cors";

export async function OPTIONS(request: NextRequest) {
  return corsPreflight(request);
}

/**
 * GET /api/meditations/duck/[id] — duck-timeline (pauzes) voor een geleide stem.
 * Retourneert { pauses: [[start, end], ...] } in seconden. Als er geen timeline
 * bestaat, retourneert hij { pauses: [] } (geen ducking) i.p.v. een 404, zodat
 * de player nooit kapotgaat op een ontbrekende timeline.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const safeId = id.replace(/[^a-zA-Z0-9._-]/g, "").replace(/\.(mp3|json)$/, "");
    if (!safeId) {
      return withCors(request, NextResponse.json({ error: "Invalid id" }, { status: 400 }));
    }

    const filePath = join(getProjectRoot(), "data", "meditations", "audio", `${safeId}.duck.json`);
    let raw: string;
    try {
      raw = await readFile(filePath, "utf-8");
    } catch {
      return withCors(request, NextResponse.json({ pauses: [] }, { status: 200 }));
    }

    return withCors(
      request,
      new NextResponse(raw, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          ...corsHeaders(request),
        },
      })
    );
  } catch (err: any) {
    console.error("[Meditation Duck]", err);
    return withCors(request, NextResponse.json({ error: err.message }, { status: 500 }));
  }
}
