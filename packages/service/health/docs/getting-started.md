---
title: Getting started
description: A production check set (Postgres, outbox lag, S3), timeouts around slow checks, Express and Nest mounting with correct 503s, and probe settings.
---

# Getting started

## Install

```bash
pnpm add @eristack/health express
```

## A realistic check set

```ts
// health.ts
import { createHealthRegistry, type CheckResult } from "@eristack/health";
import { sql } from "drizzle-orm";

export const health = createHealthRegistry();

health.registerCheck("postgres", async () => {
  await db.execute(sql`select 1`);
  return { status: "up" };
});

health.registerCheck("outbox", async () => {
  const [{ pending, oldest }] = await db
    .select({ pending: sql<number>`count(*)`, oldest: sql<string | null>`min(created_at)` })
    .from(outboxTables.messages)
    .where(eq(outboxTables.messages.status, "pending"));
  const ageMs = oldest ? Date.now() - Date.parse(oldest) : 0;
  return ageMs > 5 * 60_000
    ? { status: "down", message: `oldest pending ${Math.round(ageMs / 1000)}s, ${pending} total` }
    : { status: "up", message: `${pending} pending` };
});

health.registerCheck("s3", async () => {
  await s3.send(new HeadBucketCommand({ Bucket: process.env.S3_BUCKET }));
  return { status: "up" };
});
```

## Checks must not throw — and must not hang

`runReadiness` awaits each check in order and does **not** catch exceptions; a throwing check turns `/ready` into a 500 with no body. Wrap every check:

```ts
function safe(check: () => Promise<CheckResult>, timeoutMs = 2_000): () => Promise<CheckResult> {
  return async () => {
    const timeout = new Promise<CheckResult>((resolve) =>
      setTimeout(() => resolve({ status: "down", message: `timeout after ${timeoutMs}ms` }), timeoutMs),
    );
    try {
      return await Promise.race([check(), timeout]);
    } catch (err) {
      return { status: "down", message: err instanceof Error ? err.message : String(err) };
    }
  };
}

health.registerCheck("postgres", safe(async () => { await db.execute(sql`select 1`); return { status: "up" }; }));
```

Sequential execution means total readiness time is the **sum** of check durations. Keep each under ~1s and cap with a timeout; three 2s timeouts is a 6s probe, which most orchestrators will fail.

## Express

```ts
import { createHealthRouter } from "@eristack/health/express";
import { health } from "./health.js";

const { liveness, readiness } = createHealthRouter(health);
app.get("/health", liveness);   // 200 always — "process is up"
app.get("/ready", readiness);   // 200 or 503 with per-check body
```

Mount these **before** auth middleware — probes do not carry tokens.

## Nest

```ts
import { Module, Inject } from "@nestjs/common";
import { HealthModule, HEALTH_REGISTRY } from "@eristack/health/nest";
import type { HealthRegistry } from "@eristack/health";

@Module({ imports: [HealthModule.forRoot()] })
export class AppModule {
  constructor(@Inject(HEALTH_REGISTRY) registry: HealthRegistry) {
    registry.registerCheck("postgres", async () => { /* … */ return { status: "up" }; });
  }
}
```

`HealthController` returns the readiness body with an extra `httpStatus` field but Nest still sends **200**. If your probe needs a real 503, add a tiny interceptor:

```ts
@Injectable()
export class HealthStatusInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      tap((body) => {
        if (body?.httpStatus) ctx.switchToHttp().getResponse().status(body.httpStatus);
      }),
    );
  }
}
// app.useGlobalInterceptors(new HealthStatusInterceptor()) — or bind to HealthController only
```

## Probe settings that match this package

| Platform | Liveness | Readiness |
| --- | --- | --- |
| Kubernetes | `httpGet /health`, `periodSeconds: 10`, `failureThreshold: 3` | `httpGet /ready`, `periodSeconds: 5`, `timeoutSeconds: 3`, `failureThreshold: 2` |
| ECS / ALB | target group health check `/ready`, interval 10s, healthy 2 / unhealthy 3 | |
| Vercel | no probes — point an external uptime monitor at `/ready` | |

Liveness should be dumb on purpose: if it ran the DB check too, a database outage would make the orchestrator restart healthy processes in a loop.

## Gotchas

- Uncaught check exceptions → 500 with no JSON. Always wrap (`safe()` above).
- Checks run sequentially; the body's `durationMs` is per check, the probe sees the sum.
- `"degraded"` is the only non-ok state — there is no "partial". If some checks are informational only, return `"up"` with a `message` instead of `"down"`.
- Re-registering a name replaces the check silently; use distinct names.
- Nest controller paths are `health` and `ready` relative to your global prefix.

## Testing

```ts
import { createHealthRegistry, aggregateStatus } from "@eristack/health";
import { expect, it } from "vitest";

it("degrades when any check is down", async () => {
  const h = createHealthRegistry();
  h.registerCheck("a", () => ({ status: "up" }));
  h.registerCheck("b", async () => ({ status: "down", message: "boom" }));
  const body = await h.runReadiness();
  expect(body.status).toBe("degraded");
  expect(aggregateStatus(body)).toBe(503);
  expect(body.checks.b.durationMs).toBeGreaterThanOrEqual(0);
});
```
