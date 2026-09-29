---
title: Overview
description: Run an Express app as a Vercel Node function — a typed handler wrapper plus the deployment notes (durations, body limits, cold starts, singletons) that stop serverless ERP APIs from misbehaving.
---

# @eristack/vercel-adapters

Express apps built on the Eristack spine (`@eristack/rest`, `@eristack/jwt-auth`, `@eristack/data-grid`, …) deploy to Vercel as **one Node function** that receives every request. The adapter is tiny — an Express app already *is* a `(req, res)` handler — so the value of this package is mostly **agreement**: one export shape every Eristack app uses, and the deployment facts (`defaultVercelDeployNotes`) encoded next to it rather than rediscovered per project.

No Vercel SDK is imported. The wrapper is a type assertion; the notes are data.

## Use it when

- Deploying an Express API to Vercel (`api/index.ts` → default export).
- You want the standard `vercel.json` rewrite + function settings for an Eristack app.
- You are deciding what must be a singleton (Drizzle pool, Puppeteer, epoch cache) across warm invocations.

## Not for

- Next.js apps — `apps/web` style; Next has its own routing.
- Edge runtime — Express needs Node; use Node functions.
- Long-running workers (outbox loop, PDF batches) — Vercel Cron hitting an authenticated route, or a separate always-on service.

## Install

```bash
pnpm add @eristack/vercel-adapters express
```

Peer: `express ^4 || ^5`.

## 30-second example

```ts
// api/index.ts — the only file Vercel invokes
import { createVercelExpressHandler } from "@eristack/vercel-adapters";
import { app } from "../src/app.js";     // your Express app, built once at module scope

export default createVercelExpressHandler(app);
```

```json
// vercel.json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/api" }],
  "functions": { "api/index.ts": { "maxDuration": 60, "memory": 1024 } }
}
```

Every path is rewritten to the single function; Express does the routing.

## API

| Export | Signature | Notes |
| --- | --- | --- |
| `createVercelExpressHandler` | `(app: Express) => VercelNodeHandler` | Returns the app itself, typed as `(req, res) => void \| Promise<void>`. Exists so `api/index.ts` reads the same in every Eristack repo. |
| `VercelNodeHandler` | `(req: unknown, res: unknown) => void \| Promise<void>` | Vercel's `@vercel/node` signature (IncomingMessage/ServerResponse) without importing its types. |
| `defaultVercelDeployNotes` | `VercelDeployNotes` | `{ maxDurationSeconds: 60, bodySizeLimit: "4.5mb on Hobby — configure in vercel.json", coldStart: "Keep Express app singleton; lazy-init Drizzle pool on first request" }`. Use in a `/health` body or README generator. |
| `VercelDeployNotes` | `{ maxDurationSeconds: number; bodySizeLimit: string; coldStart: string }` | |

## Works with

- `@eristack/logger` — request-id middleware inside `app`; Vercel's own request id is in `x-vercel-id`.
- `@eristack/health` — mount `/health` + `/ready` on the app; point an uptime monitor at them (Vercel has no probes).
- `@eristack/outbox` — expose `runOutboxOnce` behind an authenticated route, schedule with Vercel Cron.
- `@eristack/rate-limit` — in-memory limits are **per function instance**; see its docs.
- `@eristack/drizzle-kit-helpers` — same `DATABASE_URL` env; pool must be a module-level singleton.

## For agents

- Skill: `pnpm dlx @tanstack/intent@latest load @eristack/vercel-adapters#vercel-adapters-core`
- Recipe: `vercel-express-deploy`.

## Next

- [Getting started](./getting-started.md) — project layout, singletons and lazy pools, body size, cron for outbox, local dev parity, and what not to do in a function.
