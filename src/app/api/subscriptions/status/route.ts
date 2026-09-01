import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { corsPreflight, withCors } from "@/lib/cors";

// Force dynamic: read subscribers.json fresh on every request (the file is
// updated at runtime by Stripe webhooks / admin sync, so it must not be
// prerendered into the build).
export const dynamic = "force-dynamic";

const SUBSCRIBERS_FILE = path.join(process.cwd(), "data", "subscribers.json");

interface Subscriber {
  email: string;
  tier: string;
  status: string;
  createdAt: string;
  dripDay?: number;
}

export async function OPTIONS(request: NextRequest) {
  return corsPreflight(request);
}

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email");

  if (!email) {
    return withCors(request, NextResponse.json({ error: "Email required" }, { status: 400 }));
  }

  try {
    if (!fs.existsSync(SUBSCRIBERS_FILE)) {
      return withCors(request, NextResponse.json({ active: false, tier: null }));
    }

    const subscribers: Subscriber[] = JSON.parse(
      fs.readFileSync(SUBSCRIBERS_FILE, "utf-8")
    );

    const sub = subscribers.find(
      (s) => s.email.toLowerCase() === email.toLowerCase()
    );

    if (!sub) {
      return withCors(request, NextResponse.json({ active: false, tier: null }));
    }

    return withCors(
      request,
      NextResponse.json({
        active: sub.status === "active",
        tier: sub.tier,
        status: sub.status,
        since: sub.createdAt,
        dripDay: sub.dripDay ?? null,
      })
    );
  } catch {
    return withCors(
      request,
      NextResponse.json({ error: "Failed to check subscription" }, { status: 500 })
    );
  }
}
