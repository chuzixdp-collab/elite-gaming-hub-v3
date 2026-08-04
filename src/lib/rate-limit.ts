// Simple in-memory rate limiter (sliding window)
// Production: replace with Redis-backed limiter for multi-instance Vercel

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Cleanup stale entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}, 60_000).unref?.();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { success: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (existing.count >= limit) {
    return { success: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return { success: true, remaining: limit - existing.count, resetAt: existing.resetAt };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const real = request.headers.get('x-real-ip');
  if (real) return real;
  return 'unknown';
}

// Preset limiters
export const rateLimitAuth = (ip: string) => rateLimit(`auth:${ip}`, 10, 60_000); // 10/min
export const rateLimitApi = (ip: string) => rateLimit(`api:${ip}`, 120, 60_000); // 120/min
export const rateLimitContact = (ip: string) => rateLimit(`contact:${ip}`, 5, 60_000); // 5/min
