---
name: rate-limit-core
description: >
  @eristack/rate-limit createRateLimiter({ windowMs, max }).check(key, nowMs?) → { allowed,
  limit, remaining, resetAt } — fixed-window, in-process limiter for single-instance APIs,
  dev, and tests; first guard on partner routes before @eristack/api-key. Per-process counters:
  implement the same RateLimiter contract over Redis for multi-instance production.
metadata:
  author: eristack
  version: "0.1"
  type: core
  library: "@eristack/rate-limit"
sources:
  - packages/service/rate-limit/docs/getting-started.md
---

# @eristack/rate-limit

One limiter per policy; one `check()` per request; you write the headers.

```ts
import { createRateLimiter } from "@eristack/rate-limit";

const perIp = createRateLimiter({ windowMs: 60_000, max: 60 });
const r = perIp.check(`ip:${req.ip}`);           // increments only while allowed
// r: { allowed, limit, remaining, resetAt (epoch ms) }
if (!r.allowed) { res.setHeader("Retry-After", secs(r.resetAt)); return res.status(429).json({ error: "RATE_LIMITED" }); }
```

## Checklist

1. Partner routes: `rateLimit(perIp)` → `requireApiKey` (`@eristack/api-key`) → `rateLimit(perKey, keyId)` → `@eristack/idempotency` → handler (`platform-api-guard`).
2. Headers: `X-RateLimit-Limit/Remaining`, `X-RateLimit-Reset` (seconds), `Retry-After` on 429.
3. `app.set("trust proxy", 1)` behind a load balancer so `req.ip` is the client.
4. Separate limiter instances for separate budgets (exports vs reads).
5. Multi-instance prod: same `RateLimiter` shape over Redis `INCR`+`PEXPIRE`; call sites unchanged.
6. Tests: pass `nowMs` — no sleeps.

## Do not

- Assume shared counters across processes/instances.
- Bill or enforce hard quotas on a fixed window (2×max burst at edges).
- Let IP-keyed maps grow forever on public routes — recycle the limiter or use Redis TTLs.
