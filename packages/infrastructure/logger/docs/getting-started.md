---
title: Getting started
description: Wire JSON-lines logging in Express (middleware + error handler) and Nest (LoggerModule + APP_INTERCEPTOR), add user/tenant context, log domain events and errors, use child loggers in workers, redact secrets, and capture lines in tests.
---

# Getting started

## Install

```bash
pnpm add @eristack/logger
```

## Core

```ts
import { createLogger } from "@eristack/logger";

export const log = createLogger({
  name: "api",
  level: process.env.LOG_LEVEL === "debug" ? "debug" : "info",
  context: { service: "erp-api", env: process.env.VERCEL_ENV ?? "local" },
});

log.info("boot.complete", { node: process.version });
log.error("db.down", new Error("connection refused"), { host: "db" });
```

Each call emits **one line** of JSON:

```json
{"level":"info","message":"boot.complete","timestamp":"2026-09-29T05:00:00.000Z","name":"api","context":{"service":"erp-api","env":"local"},"data":{"node":"v22.0.0"}}
{"level":"error","message":"db.down","timestamp":"…","name":"api","context":{…},"data":{"host":"db"},"error":{"name":"Error","message":"connection refused","stack":"Error: connection refused\n    at …"}}
```

Message naming: use dotted event names (`order.posted`, `payment.webhook.duplicate`) — they group cleanly in drains; put variable parts in `data`.

## Express

```ts
import express from "express";
import { createLoggerMiddleware, getRequestLogger } from "@eristack/logger/express";
import { log } from "./log.js";

const app = express();
app.use(express.json());
app.use(authMiddleware);                                       // sets req.user first…
app.use(createLoggerMiddleware({
  logger: log,
  resolveContext: (req) => ({
    userId: (req as any).user?.id,
    tenantId: req.header("x-tenant-id"),
    vercelId: req.header("x-vercel-id"),
  }),
}));

app.post("/orders", async (req, res) => {
  const reqLog = getRequestLogger(req)!;
  reqLog.info("order.create", { partnerId: req.body.partnerId });
  res.status(201).json(await orders.create(req.body));
});

// error middleware — log once, here, not in every handler
app.use((err, req, res, _next) => {
  getRequestLogger(req)?.error("request.failed", err, { path: req.originalUrl });
  res.status(500).json({ error: { code: "INTERNAL" } });
});
```

Order matters: put the logger **after** auth if you want `userId` in context (or resolve lazily via a child later); put it **before** routes so `request.start` covers them. The middleware does not log errors itself — `request.finish` will show `status: 500`; your error middleware adds the stack.

## NestJS

```ts
import { Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { LoggerModule, LoggingInterceptor } from "@eristack/logger/nest";

@Module({
  imports: [
    LoggerModule.forRoot({
      createOptions: { name: "api", level: "info" },
      resolveContext: (req) => ({ userId: (req as any).user?.id, tenantId: (req as any).headers?.["x-tenant-id"] }),
    }),
  ],
  providers: [{ provide: APP_INTERCEPTOR, useClass: LoggingInterceptor }],
})
export class AppModule {}
```

```ts
// inside a controller/service
import { Inject } from "@nestjs/common";
import { LOGGER, getRequestLogger } from "@eristack/logger/nest";
import type { Logger } from "@eristack/logger";

constructor(@Inject(LOGGER) private readonly log: Logger) {}
// request-scoped: getRequestLogger(req) from @Req(), or this.log.child({ requestId: req.requestId })
```

The interceptor logs `request.error` with the normalised exception when the handler observable errors, in addition to `request.start`/`finish`.

## Workers and jobs

```ts
const jobLog = log.child({ worker: "outbox", batchId });
for (const msg of batch) {
  const l = jobLog.child({ outboxId: msg.id, type: msg.type });
  l.info("outbox.deliver");
  try { await deliver(msg); l.info("outbox.delivered"); }
  catch (e) { l.error("outbox.failed", e, { attempts: msg.attempts }); }
}
```

`child` is cheap (no I/O); create one per unit of work.

## Redaction

The logger does not redact. Keep secrets out of `data` at the call site:

```ts
const safeBody = ({ password, cardNumber, ...rest }: Body) => rest;
reqLog.info("login.attempt", { body: safeBody(req.body) });
```

For a global guard, wrap the sink:

```ts
const redacting = (line: string) => console.log(line.replace(/"authorization":"[^"]+"/gi, '"authorization":"[redacted]"'));
export const log = createLogger({ name: "api", sink: redacting });
```

## Drains and platforms

- **Vercel**: stdout lines are ingested as-is; enable a Log Drain to Datadog/Axiom/Better Stack. Keep lines < 4 KB (truncate stacks if needed).
- **Docker/K8s**: stdout → Fluent Bit / Promtail; parse as JSON.
- **Local dev**: pipe through `pino-pretty`-style tools (`node app.js | npx pino-pretty`) — the shape is compatible enough (`level` is a string, not a number).

## Tests

Capture lines without stdout noise:

```ts
import { createLogger } from "@eristack/logger";

const lines: string[] = [];
const log = createLogger({ level: "debug", sink: (line) => lines.push(line) });
log.child({ requestId: "r1" }).warn("test.event", { a: 1 });

const rec = JSON.parse(lines[0]);
expect(rec).toMatchObject({ level: "warn", message: "test.event", context: { requestId: "r1" }, data: { a: 1 } });
```

Or set a global sink once for the whole test process (affects loggers created **after** it):

```ts
globalThis.__ERISTACK_LOGGER_SINK__ = (line) => captured.push(line);
```

## Gotchas

- `level` filters at write time; a `debug` child of an `info` root still drops debug lines — level comes from the root options.
- `error(message, error, data)` — the second argument is the error, third is data. `warn`/`info` take `(message, data)`.
- `defaultSink()` is resolved when `createLogger` runs; set `__ERISTACK_LOGGER_SINK__` before creating loggers.
- Express `request.finish` fires on `res.finish` — aborted client connections emit no finish line (listen to `close` yourself if needed).
- Context keys are merged shallowly; `child({ userId })` overrides a parent `userId`.
- Never log `Money`/amount numbers — use `money.toJSON()`.

## Exports

`@eristack/logger`: `createLogger`, `createRequestId`, `defaultSink`, `levelEnabled`, `normalizeError`, `LOG_LEVEL_ORDER`, `LOGGER_REQUEST_KEY`, types.
`@eristack/logger/express`: `createLoggerMiddleware`, `getRequestLogger`.
`@eristack/logger/nest`: `LoggerModule`, `LoggingInterceptor`, `getRequestLogger`, `LOGGER`, `LOGGER_RESOLVE_CONTEXT`, `LOGGER_REQUEST_ID_HEADER`.
