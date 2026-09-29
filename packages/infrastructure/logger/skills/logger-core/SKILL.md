---
name: logger-core
description: >
  @eristack/logger JSON-lines logger: createLogger({ name, level default info, context, sink }) →
  debug/info/warn(msg, data), error(msg, err, data), child(context); record { level, message,
  timestamp, name, context, data, error{name,message,stack} }. Express createLoggerMiddleware
  ({ logger, requestIdHeader x-request-id, resolveContext }) + getRequestLogger(req) logs
  request.start/finish with status+durationMs; Nest LoggerModule.forRoot + LoggingInterceptor
  (APP_INTERCEPTOR) adds request.error. Sink defaults console.log or __ERISTACK_LOGGER_SINK__.
  Server-only; no redaction/transport.
metadata:
  author: eristack
  version: "0.1"
  type: core
  library: "@eristack/logger"
sources:
  - packages/infrastructure/logger/docs/getting-started.md
---

# @eristack/logger

One JSON object per line; context via `child`.

```ts
import { createLogger } from "@eristack/logger";
import { createLoggerMiddleware, getRequestLogger } from "@eristack/logger/express";

export const log = createLogger({ name: "api", level: process.env.LOG_LEVEL === "debug" ? "debug" : "info" });
app.use(auth);
app.use(createLoggerMiddleware({ logger: log, resolveContext: (req) => ({ userId: req.user?.id, tenantId: req.header("x-tenant-id") }) }));
app.post("/orders", (req, res) => { getRequestLogger(req)!.info("order.create", { partnerId: req.body.partnerId }); … });
app.use((err, req, res, _n) => { getRequestLogger(req)?.error("request.failed", err); res.status(500).json({ error: { code: "INTERNAL" } }); });
// Nest: LoggerModule.forRoot({ createOptions, resolveContext }) + { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor }
```

## Checklist

1. Middleware after auth (for `userId`), before routes; error middleware logs once with the stack.
2. Dotted event names (`order.posted`), variables in `data`; `error(msg, err, data)` argument order.
3. Workers: `log.child({ worker, jobId })` per unit of work.
4. Tests: `createLogger({ sink: (l) => lines.push(l) })` or `globalThis.__ERISTACK_LOGGER_SINK__` before creating loggers.
5. Redact at call site or via a wrapping sink; log `money.toJSON()` not numbers.

## Do not

- Use in browser bundles.
- Expect transports, rotation, sampling, or pretty output — stdout → platform drain.
- Rely on `request.finish` for aborted connections (no `finish` event).
