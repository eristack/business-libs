---
name: logger-core
description: >
  @eristack/logger: JSON-lines structured logging with requestId/userId/tenantId
  context, debug/info/warn/error levels, Express middleware and Nest interceptor.
metadata:
  type: core
  library: "@eristack/logger"
  library_version: "0.1.0"
sources:
  - "eristack/business-libs:packages/infrastructure/logger/docs/getting-started.md"
---

# Logger core

Production visibility for Eristack APIs — **one JSON line per event**.

## When to use

- Express or Nest services need request-scoped logs
- Vercel / platform log drains expect JSON lines
- You want `requestId`, `userId`, `tenantId` on every HTTP event

## Default wiring

```ts
import { createLogger } from "@eristack/logger";
import { createLoggerMiddleware } from "@eristack/logger/express";

const root = createLogger({ name: "api" });
app.use(createLoggerMiddleware({ logger: root }));
```

Nest: `LoggerModule.forRoot()` + global `LoggingInterceptor`.

## Do not

- Log money amounts as JS numbers — stringify or use `@eristack/money` JSON helpers
- Ship secrets in `data` fields
- Use in browser bundles
