---
title: Overview
description: Liveness and readiness endpoints for Kubernetes, Vercel, and load balancers — register named checks (database, queue, S3), get one aggregate status with the right HTTP code.
---

# @eristack/health

Every deployment target asks two questions: *is the process alive?* (`/health`) and *can it serve traffic?* (`/ready`). The first is trivial; the second means "run my dependency checks and give me a 200 or a 503". `@eristack/health` is the registry that holds those checks and the two Express handlers / one Nest module that expose them.

## Use it when

- Deploying behind anything with a readiness probe (K8s, ECS, Vercel cron warm-up, Railway).
- You want the DB ping, outbox lag check, and S3 head request in one place rather than ad hoc in `server.ts`.
- Operators need per-check timings in the response body to see *which* dependency is slow.

## Not for

- Metrics / Prometheus — emit those from your own middleware; this returns JSON.
- Alerting logic — the 503 is the signal; the pager is your infra.
- Deep synthetic transactions — keep checks fast and read-only (a `SELECT 1`, not a full order posting).

## Install

```bash
pnpm add @eristack/health
# plus the framework you mount into
pnpm add express          # for @eristack/health/express
pnpm add @nestjs/common   # for @eristack/health/nest
```

Peers (optional, per subpath): `express ^4 || ^5`, `@nestjs/common ^10 || ^11`.

## 30-second example

```ts
import { createHealthRegistry } from "@eristack/health";
import { createHealthRouter } from "@eristack/health/express";

const health = createHealthRegistry();
health.registerCheck("postgres", async () => {
  await db.execute(sql`select 1`);
  return { status: "up" };
});
health.registerCheck("outbox-lag", async () => {
  const pending = await countPendingOutbox();
  return pending > 1000 ? { status: "down", message: `${pending} pending` } : { status: "up" };
});

const { liveness, readiness } = createHealthRouter(health);
app.get("/health", liveness);   // always 200 { status: "ok" }
app.get("/ready", readiness);   // 200 { status: "ok", checks: {…} } or 503 { status: "degraded", checks: {…} }
```

Readiness body:

```json
{
  "status": "degraded",
  "checks": {
    "postgres":   { "status": "up",   "durationMs": 3 },
    "outbox-lag": { "status": "down", "message": "1204 pending", "durationMs": 11 }
  }
}
```

## API

### Core (`@eristack/health`)

| Export | Signature | Notes |
| --- | --- | --- |
| `createHealthRegistry` | `() => HealthRegistry` | Checks stored in insertion order in a `Map` (re-registering a name replaces it). |
| `HealthRegistry.registerCheck` | `(name: string, check: HealthCheck) => void` | `HealthCheck = () => CheckResult \| Promise<CheckResult>`. |
| `HealthRegistry.runLiveness` | `() => Promise<{ status: "ok" }>` | Never runs checks. |
| `HealthRegistry.runReadiness` | `() => Promise<AggregateHealth>` | Runs checks **sequentially**, adds `durationMs` to each. Any `"down"` → `status: "degraded"`. A check that **throws** is not caught — see gotchas. |
| `aggregateStatus` | `(body: AggregateHealth) => 200 \| 503` | `"ok"` → 200, `"degraded"` → 503. |
| `CheckResult` | `{ status: "up" \| "down"; message?: string; durationMs?: number }` | |
| `AggregateHealth` | `{ status: "ok" \| "degraded"; checks: Record<string, CheckResult> }` | |

### Express (`@eristack/health/express`)

| Export | Notes |
| --- | --- |
| `createHealthRouter(registry)` | `{ liveness, readiness }` request handlers. |
| `livenessHandler(registry)` / `readinessHandler(registry)` | The same two, individually. Readiness sets the status via `aggregateStatus`. |

### Nest (`@eristack/health/nest`)

| Export | Notes |
| --- | --- |
| `HealthModule.forRoot({ registry? })` | Provides `HEALTH_REGISTRY` and `HealthController`. Omit `registry` to get a fresh empty one (inject `HEALTH_REGISTRY` elsewhere to register checks). |
| `HealthController` | `GET health` → liveness; `GET ready` → readiness body **plus `httpStatus`** field (Nest returns 200; use an interceptor/filter if you need the real 503 — see Getting started). |
| `HEALTH_REGISTRY` | Injection token (`Symbol`). |

## Works with

- `@eristack/outbox` — a lag check (`pending` count, oldest `createdAt`) is the most useful readiness signal in an ERP.
- `@eristack/file-manager` — `HEAD` the bucket in a check.
- `@eristack/vercel-adapters` — mount `/health` on the wrapped Express app; Vercel has no probe, but uptime monitors do.
- `@eristack/logger` — log a warn with the failing check names when readiness flips to degraded.

## For agents

- Skill: `pnpm dlx @tanstack/intent@latest load @eristack/health#health-core`
- Recipe: `health-readiness`.

## Next

- [Getting started](./getting-started.md) — production check set, timeouts, Nest 503 mapping, and probe configuration.
