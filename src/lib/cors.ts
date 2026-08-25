import { NextResponse } from "next/server";

const DEFAULT_ORIGINS = [
  "https://lofibuddha.com",
  "https://www.lofibuddha.com",
  "http://localhost:8081",
  "http://localhost:19006",
  "http://127.0.0.1:8081",
  "http://127.0.0.1:19006",
];

function allowedOrigins(): string[] {
  const extra = (process.env.EXPO_CORS_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return [...DEFAULT_ORIGINS, ...extra];
}

export function corsHeaders(request: Request): HeadersInit {
  const origin = request.headers.get("origin") || "";
  const allow = allowedOrigins().includes(origin) ? origin : allowedOrigins()[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-fb-uid",
    "Access-Control-Allow-Credentials": "true",
    "Vary": "Origin",
  };
}

export function withCors(request: Request, response: NextResponse): NextResponse {
  const headers = corsHeaders(request);
  Object.entries(headers).forEach(([k, v]) => response.headers.set(k, String(v)));
  return response;
}

export function corsPreflight(request: Request): NextResponse {
  return new NextResponse(null, { status: 204, headers: corsHeaders(request) });
}
