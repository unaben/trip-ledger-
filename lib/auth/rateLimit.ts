/**
 * A simple in-memory rate limiter, used to slow down brute-force login
 * attempts. Important limitation: this only throttles within a single
 * warm server instance. On serverless (Vercel), multiple instances can
 * exist in parallel, each with its own memory - so the real-world limit
 * is roughly (this limit) x (number of warm instances), not a hard global
 * cap. It's still a worthwhile basic speed bump; a limit that holds up
 * under real abuse needs a shared store (Redis/Vercel KV) instead.
 */

const attempts = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 10;

/** Returns true if `key` (e.g. an IP address) has exceeded the attempt limit for the current window. */
export function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}
