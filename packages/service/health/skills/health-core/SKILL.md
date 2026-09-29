---
name: health-core
description: >
  @eristack/health createHealthRegistry + registerCheck(name, fn) → runLiveness / runReadiness
  with per-check durationMs; aggregateStatus maps ok→200, degraded→503. Express
  createHealthRouter {liveness, readiness}; Nest HealthModule.forRoot + HEALTH_REGISTRY.
  Use for /health and /ready probes (Postgres, outbox lag, S3). Checks must be wrapped so
  they never throw or hang; they run sequentially.
metadata:
  author: eristack
  version: "0.1"
  type: core
  library: "@eristack/health"
sources:
  - packages/service/health/docs/getting-started.md
---

# @eristack/health

Registry of named dependency checks + framework mounts. Liveness is always ok; readiness is the aggregate.

```ts
import { createHealthRegistry } from "@eristack/health";
import { createHealthRouter } from "@eristack/health/express";

const health = createHealthRegistry();
health.registerCheck("postgres", safe(async () => { await db.execute(sql`select 1`); return { status: "up" }; }));
health.registerCheck("outbox", safe(async () => lagMs > 300_000 ? { status: "down", message } : { status: "up" }));

const { liveness, readiness } = createHealthRouter(health);
app.get("/health", liveness);   // 200 { status: "ok" }
app.get("/ready", readiness);   // 200 | 503 { status, checks: { name: { status, message?, durationMs } } }
```

## Checklist

1. Wrap every check with try/catch + `Promise.race` timeout (~2s) returning `{ status: "down", message }` — `runReadiness` does not catch throws.
2. Keep checks read-only and fast; they run **sequentially**, probe time = sum.
3. Mount before auth middleware. Liveness must not touch dependencies.
4. Nest: `HealthModule.forRoot()`, inject `HEALTH_REGISTRY` to register; add an interceptor that sets `res.status(body.httpStatus)` if the probe needs a real 503.
5. Best ERP signal: `@eristack/outbox` pending count / oldest age.

## Do not

- Put the DB check in liveness (restart loops during outages).
- Return `"down"` for informational checks — use `"up"` + `message`.
- Expect parallel execution or a "partial" state.
