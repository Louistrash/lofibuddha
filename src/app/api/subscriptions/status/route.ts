import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const SUBSCRIBERS_FILE = path.join(process.cwd(), "data", "subscribers.json");

interface Subscriber {
  email: string;
  tier: string;
  status: string;
  createdAt: string;
}

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  try {
    if (!fs.existsSync(SUBSCRIBERS_FILE)) {
      return NextResponse.json({ active: false, tier: null });
    }

    const subscribers: Subscriber[] = JSON.parse(
      fs.readFileSync(SUBSCRIBERS_FILE, "utf-8")
    );

    const sub = subscribers.find(
      (s) => s.email.toLowerCase() === email.toLowerCase()
    );

    if (!sub) {
      return NextResponse.json({ active: false, tier: null });
    }

    return NextResponse.json({
      active: sub.status === "active",
      tier: sub.tier,
      status: sub.status,
      since: sub.createdAt,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to check subscription" },
      { status: 500 }
    );
  }
}
