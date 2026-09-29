---
title: Getting started
description: Express middleware with X-RateLimit headers, per-IP and per-API-key limiters, memory growth control, and swapping in a Redis implementation behind the same RateLimiter contract.
---

# Getting started

## Install

```bash
pnpm add @eristack/rate-limit
```

## Express middleware

```ts
import { createRateLimiter, type RateLimiter } from "@eristack/rate-limit";
import type { RequestHandler, Request } from "express";

export function rateLimit(limiter: RateLimiter, keyOf: (req: Request) => string): RequestHandler {
  return (req, res, next) => {
    const r = limiter.check(keyOf(req));
    res.setHeader("X-RateLimit-Limit", String(r.limit));
    res.setHeader("X-RateLimit-Remaining", String(r.remaining));
    res.setHeader("X-RateLimit-Reset", String(Math.ceil(r.resetAt / 1000))); // epoch seconds
    if (!r.allowed) {
      res.setHeader("Retry-After", String(Math.max(1, Math.ceil((r.resetAt - Date.now()) / 1000))));
      return res.status(429).json({ error: "RATE_LIMITED", resetAt: r.resetAt });
    }
    next();
  };
}
```

## Two limiters, two keys

Anonymous traffic is keyed by IP and kept tight; authenticated partners get a generous per-key budget:

```ts
const perIp = createRateLimiter({ windowMs: 60_000, max: 60 });
const perKey = createRateLimiter({ windowMs: 60_000, max: 1_000 });

app.use("/partner", rateLimit(perIp, (req) => `ip:${req.ip}`));            // before api-key
app.use("/partner", requireApiKey);                                        // @eristack/api-key
app.use("/partner", rateLimit(perKey, (req) => `key:${req.partner.keyId}`)); // after api-key
```

Behind a proxy set `app.set("trust proxy", 1)` so `req.ip` is the client, not the load balancer — otherwise every user shares one bucket.

## Expensive endpoints get their own policy

```ts
const exportsLimiter = createRateLimiter({ windowMs: 3_600_000, max: 20 }); // 20 exports/hour

app.post("/reports/export", requireAuth, rateLimit(exportsLimiter, (req) => `export:${req.user.id}`), exportHandler);
```

One limiter instance = one policy. Do not share a limiter between routes with different budgets.

## Memory growth

Buckets are never evicted; a key that hits once stays in the `Map` forever. For IP-keyed limiters on public routes, that is unbounded. Options:

- Recreate the limiter periodically (simple): `setInterval(() => (perIp = createRateLimiter(opts)), 6 * 60 * 60_000)` — resets all counters, acceptable for abuse protection.
- Key by something bounded (user id, api keyId) wherever you can.
- Use the Redis implementation below in production, where TTLs do the eviction.

## Redis implementation (same contract)

```ts
import type { RateLimiter, RateLimitResult } from "@eristack/rate-limit";

export function createRedisRateLimiter(redis: Redis, opts: { windowMs: number; max: number }): RateLimiter {
  return {
    check(key, nowMs = Date.now()): RateLimitResult {
      // Synchronous contract — use a sync Redis client, or wrap check() in your own async middleware.
      // Sketch (async form):
      //   const n = await redis.incr(`rl:${key}`);
      //   if (n === 1) await redis.pexpire(`rl:${key}`, opts.windowMs);
      //   const ttl = await redis.pttl(`rl:${key}`);
      //   return { allowed: n <= opts.max, limit: opts.max, remaining: Math.max(0, opts.max - n), resetAt: nowMs + ttl };
      throw new Error("see async sketch above");
    },
  };
}
```

`RateLimiter.check` is synchronous today. For an async store, write an `async` middleware that returns the same `RateLimitResult` shape — call sites reading `allowed/remaining/resetAt` stay identical.

## Gotchas

- Fixed window: `2 × max` is possible around a window edge. Fine for abuse control; do not bill on it.
- Over-limit calls **do not increment** — a client hammering you at 10× the limit sees `remaining: 0` but does not extend its own lockout.
- In-memory means **per process**. Two Vercel instances = two independent budgets. Multiply your intended limit accordingly or move to Redis.
- `resetAt` is epoch **milliseconds**; standard headers want seconds — convert as in the middleware above.
- `check(key, nowMs)` — pass a fake clock in tests rather than sleeping.

## Testing

```ts
import { createRateLimiter } from "@eristack/rate-limit";
import { expect, it } from "vitest";

it("allows max then blocks until the window resets", () => {
  const l = createRateLimiter({ windowMs: 1_000, max: 2 });
  expect(l.check("k", 0).allowed).toBe(true);
  expect(l.check("k", 10).allowed).toBe(true);
  expect(l.check("k", 20)).toMatchObject({ allowed: false, remaining: 0, resetAt: 1_000 });
  expect(l.check("k", 1_000).allowed).toBe(true); // new window
});
```
