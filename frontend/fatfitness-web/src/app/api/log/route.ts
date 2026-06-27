import { type NextRequest, NextResponse } from "next/server";
import { clientLogger } from "@/lib/server-logger";

type LogBody = {
  level?: unknown;
  message?: unknown;
  meta?: unknown;
  url?: unknown;
  userAgent?: unknown;
};

// Simple in-memory sliding-window rate limiter: 30 requests/IP/minute
const ipWindows = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 30;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (ipWindows.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  ipWindows.set(ip, hits);
  return hits.length > MAX_PER_WINDOW;
}

const VALID_LEVELS = new Set(["info", "warn", "error"]);

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: LogBody;
  try {
    body = (await request.json()) as LogBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const level =
    typeof body.level === "string" && VALID_LEVELS.has(body.level)
      ? body.level
      : "info";
  const message =
    typeof body.message === "string" && body.message.trim()
      ? body.message.trim().slice(0, 500)
      : "(no message)";
  const meta =
    body.meta && typeof body.meta === "object" && !Array.isArray(body.meta)
      ? (body.meta as Record<string, unknown>)
      : undefined;

  clientLogger.log(level, message, {
    ip,
    url: typeof body.url === "string" ? body.url.slice(0, 300) : undefined,
    userAgent:
      typeof body.userAgent === "string"
        ? body.userAgent.slice(0, 200)
        : undefined,
    ...meta,
  });

  return NextResponse.json({ ok: true });
}
