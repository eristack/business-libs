export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
};

export type RateLimiter = {
  check(key: string, nowMs?: number): RateLimitResult;
};

export type CreateRateLimiterOptions = {
  windowMs: number;
  max: number;
};

type Bucket = { count: number; windowStart: number };

export function createRateLimiter(options: CreateRateLimiterOptions): RateLimiter {
  const { windowMs, max } = options;
  const buckets = new Map<string, Bucket>();

  return {
    check(key: string, nowMs = Date.now()): RateLimitResult {
      let bucket = buckets.get(key);
      if (!bucket || nowMs - bucket.windowStart >= windowMs) {
        bucket = { count: 0, windowStart: nowMs };
        buckets.set(key, bucket);
      }

      const resetAt = bucket.windowStart + windowMs;
      if (bucket.count >= max) {
        return {
          allowed: false,
          limit: max,
          remaining: 0,
          resetAt,
        };
      }

      bucket.count += 1;
      return {
        allowed: true,
        limit: max,
        remaining: Math.max(0, max - bucket.count),
        resetAt,
      };
    },
  };
}
