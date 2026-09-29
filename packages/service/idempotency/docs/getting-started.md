---
title: Getting started
description: "Production path, ledger dedup, outbox, and PO UNIQUE: one guide — load @eristack/ai-knowledge#idempotency-and-outbox (knowledge/idempotency-and-outbox.md)."
---

# Getting started

```bash
pnpm add @eristack/idempotency
```

```ts
import {
  createIdempotencyGuard,
  createMemoryIdempotencyStore,
} from "@eristack/idempotency";

const store = createMemoryIdempotencyStore(); // tests only — use Drizzle in prod
const guard = createIdempotencyGuard(store);

await guard.run("pay-1", async () => chargePayment());
```

Production path, ledger dedup, outbox, and PO UNIQUE: one guide — load `@eristack/ai-knowledge#idempotency-and-outbox` (`knowledge/idempotency-and-outbox.md`).

## Adapters

- `@eristack/idempotency/drizzle` — `createIdempotencyTables`, `createDrizzleIdempotencyStore`
- `@eristack/idempotency/express` — `wrapIdempotentHandler`
- `@eristack/idempotency/client` — `createIdempotencyClientFetch`
- `@eristack/idempotency/nest` — `IdempotencyInterceptor`
