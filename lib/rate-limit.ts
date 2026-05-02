import { NextRequest, NextResponse } from "next/server";

interface RateLimitConfig {
  windowMs: number;   // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  auth: { windowMs: 60_000, maxRequests: 20 },    // 20 req/min for auth
  api: { windowMs: 60_000, maxRequests: 100 },     // 100 req/min general
  trade: { windowMs: 60_000, maxRequests: 30 },    // 30 req/min for trades
};

/**
 * In-memory rate limiter (for serverless, fallback).
 * For production at scale, use Redis. This is sufficient for Neon + Vercel.
 */
const memoryStore = new Map<string, { count: number; resetAt: number }>();

export function getRateLimitKey(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "127.0.0.1";
  return ip;
}

export async function checkRateLimit(
  req: NextRequest,
  category: keyof typeof RATE_LIMITS = "api"
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const config = RATE_LIMITS[category];
  const ip = getRateLimitKey(req);
  const key = `${ip}:${category}`;
  const now = Date.now();

  const entry = memoryStore.get(key);

  if (!entry || now > entry.resetAt) {
    // New window
    memoryStore.set(key, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true, remaining: config.maxRequests - 1, resetAt: now + config.windowMs };
  }

  if (entry.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: config.maxRequests - entry.count, resetAt: entry.resetAt };
}

/**
 * Rate limit middleware wrapper.
 */
export function withRateLimit(
  category: keyof typeof RATE_LIMITS,
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (req: NextRequest, context?: any) => {
    const result = await checkRateLimit(req, category);

    if (!result.allowed) {
      return NextResponse.json(
        {
          error: "Too Many Requests",
          message: `Rate limit exceeded. Try again in ${Math.ceil((result.resetAt - Date.now()) / 1000)} seconds.`,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
            "Retry-After": String(Math.ceil((result.resetAt - Date.now()) / 1000)),
          },
        }
      );
    }

    const response = await handler(req, context);
    response.headers.set("X-RateLimit-Remaining", String(result.remaining));
    response.headers.set("X-RateLimit-Reset", String(Math.ceil(result.resetAt / 1000)));
    return response;
  };
}

// Periodically clean up expired entries (every 5 min)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of memoryStore.entries()) {
      if (now > entry.resetAt) memoryStore.delete(key);
    }
  }, 5 * 60 * 1000);
}
