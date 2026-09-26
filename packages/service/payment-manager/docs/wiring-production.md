---
title: Wiring production
description: Drizzle migrations, drivers, invoice FK pattern.
---

# Wiring production

## 1. Drizzle tables

```ts
import { createPaymentManagerTables } from "@eristack/payment-manager/drizzle";

export const paymentTables = createPaymentManagerTables("pgsql", "payment_manager");
// payment_manager_payment_intents, payment_manager_gateway_events
```

Run migrations in your app. Unique index on `(gateway, idempotency_key)`.

## 2. Store + manager

```ts
const paymentManager = createPaymentManager({
  store: createDrizzlePaymentManagerStore({ db, tables: paymentTables }),
  drivers: {
    stripe: createStripePaymentDriver({ stripe, webhookSecret }),
    xendit: createXenditPaymentDriver({ callbackToken, createPaymentRequest }),
  },
});
```

## 3. Link to business documents

```ts
// invoices.payment_intent_id → payment_manager_payment_intents.id
await db.update(invoices).set({ paymentIntentId: intent.id }).where(eq(invoices.id, invoiceId));
```

On webhook `succeeded`, post to `@eristack/financial-ledger` in **your** transaction — the library does not post GL entries.

## 4. HTTP

Mount `createPaymentManagerRouter` behind auth for intent APIs. Webhooks are **unauthenticated** but signature-verified — see [security.md](./security.md).

## 5. Saved cards

When charging a saved method, pass PSP `payment_method` ids from `@eristack/payment-instrument` `GatewayPaymentMethodRef` in your service layer when extending drivers (app-specific metadata) — never persist PAN in Postgres.
