---
name: vercel-adapters-core
description: >
  @eristack/vercel-adapters createVercelExpressHandler(app) as the single Vercel Node function
  default export + defaultVercelDeployNotes (60s maxDuration, ~4.5MB body, singleton/lazy-pool
  cold-start rules). Use when deploying an Express + Drizzle Eristack API to Vercel: one rewrite
  to the function, module-scope app and pool, outbox via cron route, uploads via presigned S3. No Vercel SDK.
metadata:
  author: eristack
  version: "0.1"
  type: core
  library: "@eristack/vercel-adapters"
sources:
  - packages/infrastructure/vercel-adapters/docs/getting-started.md
---

# @eristack/vercel-adapters

The wrapper is a type assertion; the discipline is the deliverable.

```ts
// api/index.ts
import { createVercelExpressHandler } from "@eristack/vercel-adapters";
import { app } from "../src/app.js";          // built ONCE at module scope
export default createVercelExpressHandler(app);
```

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/api" }],
  "functions": { "api/index.ts": { "maxDuration": 60, "memory": 1024 } },
  "crons": [{ "path": "/api/internal/outbox/run", "schedule": "* * * * *" }] }
```

## Checklist

1. `src/app.ts` exports a module-scope Express app; `src/db.ts` lazy Drizzle `Pool` singleton (`max` small, pooler in front).
2. `app.set("trust proxy", 1)`; `express.json({ limit: "4mb" })` under the platform cap.
3. `@eristack/health` `/health` + `/ready` mounted before auth; external uptime monitor (no Vercel probes).
4. `@eristack/outbox` worker = `POST /api/internal/outbox/run` guarded by `CRON_SECRET`, scheduled in `vercel.json` crons.
5. Uploads → `@eristack/file-manager` presigned PUT, never through the function.
6. Lazy-import heavy libs (Puppeteer, ExcelJS) or move to a worker; keep cold start lean.

## Do not

- Build the app or open pools per request.
- Rely on in-memory state across instances (`@eristack/rate-limit` counters are per instance).
- Do work after `res.end()` — enqueue instead.
- Use Edge runtime or expect WebSockets/SSE.
