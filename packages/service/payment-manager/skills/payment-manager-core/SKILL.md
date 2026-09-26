---
name: payment-manager-core
description: >
  Pure @eristack/payment-manager: createPaymentManager, PaymentDriver, idempotency,
  webhook handleWebhook, Money JSON amounts. Memory driver tests only.
metadata:
  type: core
  library: "@eristack/payment-manager"
  library_version: "0.1.0"
sources:
  - "eristack/business-libs:packages/service/payment-manager/docs/getting-started.md"
---

# Payment manager core

## Defaults

- **Production:** Drizzle `payment_manager_*` tables + Stripe or Xendit driver — never `createMemory*` in prod.
- Amounts: `{ currency, amount }` strings via `@eristack/money` — no JS float literals.
- Saved cards: `@eristack/payment-instrument` tokens in app tables — not PAN in intents.

## Minimal wiring

```ts
import { createPaymentManager } from "@eristack/payment-manager";
import { createStripePaymentDriver } from "@eristack/payment-manager/stripe";
import {
  createDrizzlePaymentManagerStore,
  createPaymentManagerTables,
} from "@eristack/payment-manager/drizzle";

const paymentManager = createPaymentManager({
  store: createDrizzlePaymentManagerStore({
    db,
    tables: createPaymentManagerTables("pgsql"),
  }),
  drivers: {
    stripe: createStripePaymentDriver({ stripe, webhookSecret }),
  },
});
```

## Idempotency

```ts
await paymentManager.createIntent({
  gateway: "stripe",
  idempotencyKey: `inv-${invoiceId}`,
  amount: { currency: "USD", amount: "100.00" },
});
```

## Webhooks

```ts
await paymentManager.handleWebhook({
  gateway: "stripe",
  rawBody, // Buffer for Stripe
  headers: { get: (n) => req.headers[n] ?? null },
});
```

## Tests only

```ts
import {
  createMemoryPaymentDriver,
  createMemoryPaymentManagerStore,
} from "@eristack/payment-manager/testing";
```

Load `payment-manager-adapters` for Express, client, React, and Backseat.
