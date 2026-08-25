import { NextRequest, NextResponse } from "next/server";

const DEFAULT_ORIGINS = [
  "https://lofibuddha.com",
  "https://www.lofibuddha.com",
  "http://localhost:8081",
  "http://localhost:19006",
  "http://127.0.0.1:8081",
  "http://127.0.0.1:19006",
];

export function middleware(request: NextRequest) {
  const origin = request.headers.get("origin") || "";
  const extra = (process.env.EXPO_CORS_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const allowed = [...DEFAULT_ORIGINS, ...extra];
  const allowOrigin = allowed.includes(origin) ? origin : allowed[0];

  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": allowOrigin,
        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, x-fb-uid",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  const response = NextResponse.next();
  response.headers.set("Access-Control-Allow-Origin", allowOrigin);
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Vary", "Origin");
  return response;
}

export const config = {
  matcher: ["/api/:path*"],
};
