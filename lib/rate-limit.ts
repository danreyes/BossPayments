/**
 * Simple in-memory sliding-window rate limiter.
 *
 * On Vercel serverless, each instance has its own memory so this won't share
 * state across instances — but it still protects against rapid successive
 * requests hitting the same hot instance, which covers the common attack
 * vector. Combined with Vercel's built-in DDoS protection, this is adequate
 * for MVP.
 */

const buckets = new Map<string, number[]>();

/** Prune expired entries periodically to prevent memory leaks. */
const PRUNE_INTERVAL_MS = 60_000;
let lastPrune = Date.now();

function prune(windowMs: number) {
  const now = Date.now();
  if (now - lastPrune < PRUNE_INTERVAL_MS) return;
  lastPrune = now;

  const cutoff = now - windowMs;
  for (const [key, timestamps] of buckets) {
    const valid = timestamps.filter((t) => t > cutoff);
    if (valid.length === 0) {
      buckets.delete(key);
    } else {
      buckets.set(key, valid);
    }
  }
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number | null;
}

/**
 * Check and consume a rate limit token.
 *
 * @param key - Unique identifier (e.g. IP address, user ID)
 * @param maxRequests - Maximum requests allowed in the window
 * @param windowMs - Time window in milliseconds
 */
export function rateLimit(key: string, maxRequests: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  prune(windowMs);

  const cutoff = now - windowMs;
  const timestamps = (buckets.get(key) ?? []).filter((t) => t > cutoff);

  if (timestamps.length >= maxRequests) {
    const oldestInWindow = timestamps[0]!;
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: oldestInWindow + windowMs - now
    };
  }

  timestamps.push(now);
  buckets.set(key, timestamps);

  return {
    allowed: true,
    remaining: maxRequests - timestamps.length,
    retryAfterMs: null
  };
}
