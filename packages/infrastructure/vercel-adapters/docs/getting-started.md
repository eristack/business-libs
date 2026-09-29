---
title: Getting started
description: Project layout for an Express + Drizzle ERP API on Vercel — module-scope singletons, lazy pool, body limits, cron-driven outbox, health endpoints, and local parity with `vercel dev`.
---

# Getting started

## Install

```bash
pnpm add @eristack/vercel-adapters express
```

## Layout

```
api/
  index.ts          ← default export = createVercelExpressHandler(app)
src/
  app.ts            ← builds the Express app ONCE (module scope)
  db.ts             ← Drizzle pool singleton
  routes/…
vercel.json
```

## `src/db.ts` — one pool per warm instance

```ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

let pool: Pool | undefined;

export function getDb() {
  pool ??= new Pool({ connectionString: process.env.DATABASE_URL, max: 3 }); // small: many instances share the DB
  return drizzle(pool);
}
```

Module scope survives across invocations of a **warm** instance; a new instance re-runs it. `max: 3` because you may have dozens of instances — use a pooler (Neon/Supabase/PgBouncer) in front of Postgres.

## `src/app.ts` — build once

```ts
import express from "express";
import { createLoggerMiddleware } from "@eristack/logger/express";
import { createHealthRouter } from "@eristack/health/express";
import { health } from "./health.js";

export const app = express();
app.set("trust proxy", 1);                              // req.ip from Vercel's proxy
app.use(express.json({ limit: "4mb" }));                // under Vercel's body cap
app.use(createLoggerMiddleware());                      // x-request-id in/out, JSON lines

const { liveness, readiness } = createHealthRouter(health);
app.get("/health", liveness);
app.get("/ready", readiness);

app.use("/api", apiRouter);                             // jwt-auth, data-grid, opinion routes…
```

Anything expensive (Puppeteer browser, tax/rounding registries, `@eristack/epoch` client) should be a lazy module-level singleton the same way as the pool.

## `api/index.ts`

```ts
import { createVercelExpressHandler } from "@eristack/vercel-adapters";
import { app } from "../src/app.js";

export default createVercelExpressHandler(app);
```

## `vercel.json`

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/api" }],
  "functions": { "api/index.ts": { "maxDuration": 60, "memory": 1024 } },
  "crons": [{ "path": "/api/internal/outbox/run", "schedule": "* * * * *" }]
}
```

- `maxDuration` 60 s matches `defaultVercelDeployNotes.maxDurationSeconds`; Hobby caps lower, Pro allows more. Anything that might run longer (PDF batch, large export) goes through the outbox and a cron, not a request.
- Request body limit is ~4.5 MB on Hobby (`defaultVercelDeployNotes.bodySizeLimit`). File uploads must use `@eristack/file-manager` presigned PUT straight to S3 — never through the function.

## Outbox worker as a cron route

```ts
app.post("/api/internal/outbox/run", requireCronSecret, async (_req, res) => {
  const n = await runOutboxOnce(50);                    // @eristack/outbox processBatch
  res.json({ processed: n });
});

function requireCronSecret(req, res, next) {
  if (req.header("authorization") !== `Bearer ${process.env.CRON_SECRET}`) return res.status(401).end();
  next();
}
```

Vercel Cron sends `Authorization: Bearer $CRON_SECRET` when the env var is set. One-minute schedule + `processBatch(50)` is a fine default; the outbox tolerates overlap because handlers use `outbox:${id}` keys.

## Expose the deploy notes

```ts
import { defaultVercelDeployNotes } from "@eristack/vercel-adapters";

app.get("/api/internal/deploy-notes", requireAuth, (_req, res) => res.json(defaultVercelDeployNotes));
```

Useful when an agent or a new engineer asks "why did my 6 MB import fail?".

## Local parity

```bash
pnpm dlx vercel dev        # runs api/index.ts with the same rewrites
# or plain Node for speed:
node -e 'import("./src/app.js").then(m => m.app.listen(3000))'
```

Both paths use the same `app`; the adapter adds nothing at runtime, so plain Express tests (`supertest(app)`) cover production behaviour.

## Gotchas

- **Do not create the app per request.** `export default (req, res) => buildApp()(req, res)` re-registers routes and re-opens pools on every call. Build at module scope.
- **In-memory state is per instance**: `@eristack/rate-limit` counters, memory stores, caches. Assume N instances.
- **No background work after `res.end()`** — the instance may freeze immediately. Enqueue to `@eristack/outbox` inside the transaction and let the cron deliver.
- Cold starts include your module graph. Keep `app.ts` imports lean; lazy-import Puppeteer/ExcelJS inside handlers or move them to a worker.
- `req.ip` is the proxy unless `trust proxy` is set. Same for `req.protocol` when building absolute URLs (presigned callbacks, email links).
- WebSockets/SSE are not supported on Node functions; poll or use a separate service.
- `express.json({ limit })` must be under Vercel's cap or you get a platform 413 before Express sees the request.

## Testing

```ts
import request from "supertest";
import { app } from "../src/app.js";
import { createVercelExpressHandler } from "@eristack/vercel-adapters";
import { expect, it } from "vitest";

it("handler is the app", async () => {
  const handler = createVercelExpressHandler(app);
  expect(handler).toBe(app);
  await request(app).get("/health").expect(200);
});
```
