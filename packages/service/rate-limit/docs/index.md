---
title: Overview
description: Fixed-window, in-process rate limiter with a one-method API — check(key) → { allowed, remaining, resetAt } — for single-instance APIs, dev, and as the contract a Redis adapter implements.
---

# @eristack/rate-limit

`createRateLimiter({ windowMs, max })` returns an object with one method. Call `check(key)` per request; it tells you whether to proceed and what to put in the `X-RateLimit-*` headers. Counters live in a `Map` in the current process.

That last sentence is the whole scope decision: this is the **right default for a single Node process** (a Vercel function instance, a dev server, an internal tool) and the **wrong tool for a horizontally scaled fleet** — each instance would have its own counters. The `RateLimiter` type is the contract; a Redis-backed implementation drops in without touching call sites.

## Use it when

- Protecting partner routes before `@eristack/api-key` (per IP) and after (per key).
- Throttling expensive endpoints (exports, PDF renders, search) on a single-instance deployment.
- Tests and Backseat prototypes that need real 429 behaviour.

## Not for

- Multi-instance production without sticky routing — implement `RateLimiter` over Redis (`INCR` + `PEXPIRE`) in the app; same `check()` shape.
- Sliding windows, token buckets, or per-route cost weighting — fixed window only.
- Quotas that must survive a restart — in-memory resets on deploy.

## Install

```bash
pnpm add @eristack/rate-limit
```

No peers.

## 30-second example

```ts
import { createRateLimiter } from "@eristack/rate-limit";

const limiter = createRateLimiter({ windowMs: 60_000, max: 100 });

const r = limiter.check("ip:203.0.113.7");
// { allowed: true, limit: 100, remaining: 99, resetAt: 1790000060000 }

if (!r.allowed) {
  res.setHeader("Retry-After", String(Math.ceil((r.resetAt - Date.now()) / 1000)));
  return res.status(429).json({ error: "RATE_LIMITED" });
}
```

## API

| Export | Signature | Notes |
| --- | --- | --- |
| `createRateLimiter` | `({ windowMs: number; max: number }) => RateLimiter` | One limiter per policy (e.g. "partner writes", "exports"). |
| `RateLimiter.check` | `(key: string, nowMs = Date.now()) => RateLimitResult` | Increments on allow; does **not** increment once over the limit. `nowMs` injectable for tests. |
| `RateLimitResult` | `{ allowed: boolean; limit: number; remaining: number; resetAt: number }` | `resetAt` is epoch ms when the current window ends. |
| `CreateRateLimiterOptions` | `{ windowMs; max }` | |

### Window semantics

Fixed window anchored at the **first request** for a key: the first `check("k")` at `t0` opens `[t0, t0 + windowMs)`; the `max`-th request in that span is allowed, the `max+1`-th is not; at `t0 + windowMs` the next request opens a new window with a fresh count. Bursts of `2 × max` are possible across a window boundary — acceptable for abuse protection, not for billing quotas.

## Works with

- `@eristack/api-key` — `rate-limit (IP) → api-key → rate-limit (keyId) → idempotency` on partner routes (`platform-api-guard`).
- `@eristack/vercel-adapters` — a Vercel function instance is a single process; in-memory is fine per instance, but limits are per-instance.
- `@eristack/logger` — log `key` + `remaining` on 429 for tuning.

## For agents

- Skill: `pnpm dlx @tanstack/intent@latest load @eristack/rate-limit#rate-limit-core`
- Recipes: `rate-limit-edge`, `platform-api-guard`.

## Next

- [Getting started](./getting-started.md) — Express middleware with standard headers, per-IP vs per-key, memory bounds, and a Redis adapter sketch.
