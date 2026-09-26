---
title: Getting started
description: Wire Drizzle, Stripe or Xendit, Express, and React in a few files — pairs with payment-instrument.
---

# Getting started

## Install

```bash
pnpm add @eristack/payment-manager @eristack/money drizzle-orm
```

Peers for production adapters (install what you use):

```bash
pnpm add express stripe          # Stripe
# Xendit: no required npm peer — you supply fetch wrappers (see below)
```

## 1. Drizzle tables + manager

```ts
import { createPaymentManager } from "@eristack/payment-manager";
import { createStripePaymentDriver } from "@eristack/payment-manager/stripe";
import Stripe from "stripe";
import {
  createDrizzlePaymentManagerStore,
  createPaymentManagerTables,
} from "@eristack/payment-manager/drizzle";

const tables = createPaymentManagerTables("pgsql", "payment_manager");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const paymentManager = createPaymentManager({
  store: createDrizzlePaymentManagerStore({ db, tables }),
  drivers: {
    stripe: createStripePaymentDriver({
      stripe,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
    }),
  },
});
```

Run migrations for `payment_manager_payment_intents` and `payment_manager_gateway_events` — see [Database](./database.md).

## 2. Express — intents (authenticated)

```ts
import { createPaymentManagerRouter } from "@eristack/payment-manager/express";

app.use(express.json());
app.use("/payments", requireAuth, createPaymentManagerRouter({ paymentManager }));
```

Routes: `POST /payments/intents`, `GET /payments/intents/:id`, `POST /payments/webhooks/:gateway` — see [HTTP](./http.md).

## 3. Stripe webhooks (raw body)

Mount **raw** parser on the webhook path only, before `express.json()` on that route — details in [Security](./security.md).

## 4. Create an intent (server)

```ts
const intent = await paymentManager.createIntent({
  gateway: "stripe",
  amount: { currency: "USD", amount: "199.00" },
  idempotencyKey: `invoice-${invoiceId}`,
  ownerId: userId,
  metadata: { invoiceId },
});
await db.update(invoices).set({ paymentIntentId: intent.id }).where(eq(invoices.id, invoiceId));
// If requires_action: pass intent.clientSecret to Stripe.js on the client
```

Amounts are **decimal strings** — same shape as `@eristack/money` `toJSON()`.

## 5. Browser client + React (optional)

```ts
import { createPaymentManagerClient } from "@eristack/payment-manager/client";
import { useCreatePaymentIntent } from "@eristack/payment-manager/react";

const client = createPaymentManagerClient({
  baseUrl: "/api/payments",
  headers: { Authorization: `Bearer ${token}` },
});
```

## 6. Saved cards (@eristack/payment-instrument)

This package does **not** store card rows. After PSP tokenization, persist [`toPersistable()`](/docs/payment-instrument/getting-started) on your `customer_payment_methods` table; reference `tokenId` when extending charge flows.

## Xendit (Indonesia / SEA)

```ts
import { createXenditPaymentDriver } from "@eristack/payment-manager/xendit";

const xendit = createXenditPaymentDriver({
  callbackToken: process.env.XENDIT_CALLBACK_TOKEN!,
  createPaymentRequest: async (input) => {
    const res = await fetch("https://api.xendit.co/v2/invoices", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(process.env.XENDIT_SECRET_KEY! + ":").toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        external_id: input.referenceId,
        amount: Number(input.amount.amount),
        currency: input.amount.currency,
      }),
    });
    return res.json();
  },
});

// drivers: { stripe, xendit }
```

## Tests only

```ts
import {
  createMemoryPaymentDriver,
  createMemoryPaymentManagerStore,
} from "@eristack/payment-manager/testing";

const paymentManager = createPaymentManager({
  store: createMemoryPaymentManagerStore(),
  drivers: { memory: createMemoryPaymentDriver() },
});
```

Production checklist: [wiring-production.md](./wiring-production.md) · Horizon A mock: [backseat.md](./backseat.md)
