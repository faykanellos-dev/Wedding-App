// Best-effort in-memory rate limiter for route handlers. On serverless hosts
// each instance keeps its own counters, so this slows down abuse (code
// guessing, runaway API spend) rather than providing a hard global limit.

type Entry = { count: number; resetAt: number };
const buckets = new Map<string, Entry>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();

  if (buckets.size > 5000) {
    for (const [k, v] of buckets) {
      if (v.resetAt <= now) buckets.delete(k);
    }
  }

  const entry = buckets.get(key);
  if (!entry || entry.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  entry.count += 1;
  return entry.count <= limit;
}
