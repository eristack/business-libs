---
title: Overview
description: JSON-lines structured logger for Eristack APIs — createLogger with levels, child context (requestId/userId/tenantId), error normalisation, pluggable sink, plus Express middleware and a Nest interceptor that emit request.start/finish with durations.
---

# @eristack/logger

Platform log drains (Vercel, Datadog, Loki) want **one JSON object per line** with stable keys. `@eristack/logger` is a dependency-free logger that emits exactly that — `{ level, message, timestamp, name, context, data, error }` — and attaches per-request context so every line inside a request carries `requestId` (and `userId` / `tenantId` when you resolve them). The Express middleware and Nest interceptor log `request.start` / `request.finish` with `status` and `durationMs`, and echo the request id back in `x-request-id`.

No transports, no formatting, no sampling. Point the sink at stdout (default) or your own function.

## Use it when

- Any Express or Nest service on Eristack; especially serverless where stdout → drain is the pipeline.
- You need request correlation across services (`x-request-id` in → same id out).
- Tests should assert on emitted events without console noise (custom `sink`).

## Not for

- Browser logging — server only.
- Log shipping, rotation, or pretty printing — the platform or `pino-pretty`-style tools in dev.
- Tracing/metrics — complements OpenTelemetry; put `traceId` in context if you have one.

## Install

```bash
pnpm add @eristack/logger
pnpm add express               # for /express
pnpm add @nestjs/common rxjs   # for /nest
```

Peers (optional per adapter): `express ^4 || ^5`, `@nestjs/common ^10 || ^11`, `rxjs ^7`.

## 30-second example

```ts
import { createLogger } from "@eristack/logger";
import { createLoggerMiddleware, getRequestLogger } from "@eristack/logger/express";

export const log = createLogger({ name: "api", level: process.env.LOG_LEVEL === "debug" ? "debug" : "info" });

app.use(createLoggerMiddleware({ logger: log, resolveContext: (req) => ({ tenantId: req.header("x-tenant-id") }) }));

app.post("/orders", async (req, res) => {
  const reqLog = getRequestLogger(req)!;                    // child with requestId + tenantId
  reqLog.info("order.create", { partnerId: req.body.partnerId });
  try { res.status(201).json(await orders.create(req.body)); }
  catch (e) { reqLog.error("order.create.failed", e, { partnerId: req.body.partnerId }); throw e; }
});
```

```json
{"level":"info","message":"request.start","timestamp":"2026-09-29T07:00:00.000Z","name":"api","context":{"requestId":"6f1c…","tenantId":"acme"},"data":{"method":"POST","path":"/orders"}}
{"level":"info","message":"order.create","timestamp":"…","name":"api","context":{"requestId":"6f1c…","tenantId":"acme"},"data":{"partnerId":"p1"}}
{"level":"info","message":"request.finish","timestamp":"…","name":"api","context":{…},"data":{"method":"POST","path":"/orders","status":201,"durationMs":42}}
```

## API

| Import | Export | Notes |
| --- | --- | --- |
| `@eristack/logger` | `createLogger({ name?, level? = "info", context?, sink? })` | Returns `Logger`. `sink` defaults to `defaultSink()`. |
| | `Logger` | `debug/info/warn(message, data?)`, `error(message, error?, data?)`, `child(context)` (merges context; new logger, same sink/level). |
| | `LogLevel` / `LOG_LEVEL_ORDER` | `"debug" < "info" < "warn" < "error"`; records below `level` are dropped before serialisation. |
| | `LogRecord` | `{ level, message, timestamp (ISO), name?, context?, data?, error?: { name, message, stack? } }` — keys omitted when empty. |
| | `LogContext` | `{ requestId?, userId?, tenantId?, [k: string]: unknown }`. |
| | `defaultSink()` | `globalThis.__ERISTACK_LOGGER_SINK__` if set (test harness / platform override), else `console.log`. |
| | `levelEnabled(current, minimum)` | helper. |
| | `normalizeError(err)` | `Error` → `{ name, message, stack }`; string → `{ name: "Error", message }`; other → JSON-stringified message. |
| | `createRequestId()` | `crypto.randomUUID()` (fallback `req_<ts>_<rand>`). |
| | `LOGGER_REQUEST_KEY`, `RequestLoggerHolder` | `"eristackLogger"` property name the adapters set on `req`. |
| `@eristack/logger/express` | `createLoggerMiddleware({ logger?, requestIdHeader? = "x-request-id", resolveContext?(req) })` | Reads/generates request id, sets it on the response header, `req.eristackLogger` + `req.requestId`, logs `request.start` and `request.finish` (`status`, `durationMs`) on `res.finish`. |
| | `getRequestLogger(req)` | `Logger \| undefined`. |
| `@eristack/logger/nest` | `LoggerModule.forRoot({ logger?, createOptions?, requestIdHeader?, resolveContext? })` | Global module; provides `LOGGER` token and `LoggingInterceptor`. |
| | `LoggingInterceptor` | Register as `APP_INTERCEPTOR`; logs `request.start`, `request.finish`, and `request.error` (with normalised error) via RxJS `tap`. |
| | `getRequestLogger(req)`, `LOGGER`, `LOGGER_RESOLVE_CONTEXT`, `LOGGER_REQUEST_ID_HEADER` | |

## Works with

- `@eristack/vercel-adapters` — stdout JSON lines are exactly what Vercel's log drains forward; Vercel's own id is in `x-vercel-id` (add via `resolveContext`).
- `@eristack/jwt-auth` — `resolveContext: (req) => ({ userId: req.user?.id })` after the auth middleware.
- `@eristack/rest` — handlers are framework-free; log at the middleware boundary or pass `requestId` via headers.
- `@eristack/outbox` / workers — `log.child({ jobId, outboxId })` per message.
- `@eristack/money` — log `money.toJSON()` (strings), never `Number` amounts.

## For agents

- Skill: `pnpm dlx @tanstack/intent@latest load @eristack/logger#logger-core`
- Recipes: `structured-logging`, `vercel-express-deploy`.

## Next

- [Getting started](./getting-started.md) — Express and Nest wiring with user/tenant context, error middleware, worker loggers, redaction, test sinks, and drain configuration.
