# @eristack/logger

**JSON-lines structured logging** for Node services — request context, levels, Express middleware, Nest interceptor.

## Install

```bash
pnpm add @eristack/logger
```

## Quick example

```ts
import { createLogger } from "@eristack/logger";

const log = createLogger({ name: "orders" });
log.info("order.created", { orderId: "ord_1" });
```

Express:

```ts
import { createLoggerMiddleware, getRequestLogger } from "@eristack/logger/express";

app.use(createLoggerMiddleware({
  resolveContext: (req) => ({ userId: req.user?.id }),
}));
```

## Docs

- [Overview](./docs/index.md)
- [Getting started](./docs/getting-started.md)

Intent: `@eristack/logger#logger-core`
