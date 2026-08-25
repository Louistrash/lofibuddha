import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { corsPreflight, withCors } from "@/lib/cors";

const SUBSCRIBERS_FILE = path.join(process.cwd(), "data", "subscribers.json");

export async function OPTIONS(request: NextRequest) {
  return corsPreflight(request);
}

/** Sync mobile IAP (RevenueCat) into subscribers.json alongside Stripe. */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = String(body.email || "").toLowerCase().trim();
    const tier = String(body.tier || "mindful");
    const source = String(body.source || "revenuecat");
    const uid = String(body.uid || request.headers.get("x-fb-uid") || "");

    if (!email && !uid) {
      return withCors(
        request,
        NextResponse.json({ error: "email or uid required" }, { status: 400 })
      );
    }

    const record = {
      email: email || `${uid}@lofibuddha.app`,
      tier,
      source,
      uid: uid || undefined,
      status: "active",
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    let list: any[] = [];
    if (fs.existsSync(SUBSCRIBERS_FILE)) {
      try {
        list = JSON.parse(fs.readFileSync(SUBSCRIBERS_FILE, "utf8"));
      } catch {
        list = [];
      }
    }

    const idx = list.findIndex(
      (s) => s.email?.toLowerCase() === record.email || (uid && s.uid === uid)
    );
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...record, createdAt: list[idx].createdAt || record.createdAt };
    } else {
      list.push(record);
    }

    fs.mkdirSync(path.dirname(SUBSCRIBERS_FILE), { recursive: true });
    fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(list, null, 2));

    return withCors(request, NextResponse.json({ ok: true, tier: record.tier }));
  } catch (err: any) {
    return withCors(
      request,
      NextResponse.json({ error: err.message || "sync failed" }, { status: 500 })
    );
  }
}
