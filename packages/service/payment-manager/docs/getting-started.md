---
title: Getting started
description: Install, createPaymentManager, Express router, Drizzle store.
---

# Getting started

## Install

```bash
pnpm add @eristack/payment-manager @eristack/money drizzle-orm
# Optional adapters
pnpm add express stripe   # Stripe driver
```

## Core

```ts
import { createPaymentManager } from "@eristack/payment-manager";
import { createStripePaymentDriver } from "@eristack/payment-manager/stripe";
import Stripe from "stripe";
import {
  createDrizzlePaymentManagerStore,
  createPaymentManagerTables,
} from "@eristack/payment-manager/drizzle";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const paymentManager = createPaymentManager({
  store: createDrizzlePaymentManagerStore({
    db,
    tables: createPaymentManagerTables("pgsql"),
  }),
  drivers: {
    stripe: createStripePaymentDriver({
      stripe,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
    }),
  },
});

const intent = await paymentManager.createIntent({
  gateway: "stripe",
  amount: { currency: "USD", amount: "199.00" },
  idempotencyKey: `invoice-${invoiceId}`,
  ownerId: userId,
  metadata: { invoiceId },
});
// Persist intent.id on your invoice row; use clientSecret in Stripe.js when requires_action
```

## Express

```ts
import express from "express";
import { createPaymentManagerRouter } from "@eristack/payment-manager/express";

const app = express();
app.use(express.json());
app.use("/payments", requireAuth, createPaymentManagerRouter({ paymentManager }));
// Mount raw body for Stripe webhooks — see security.md
```

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

// Register alongside stripe: drivers: { stripe, xendit }
```

## Tests only

```ts
import { createPaymentManager } from "@eristack/payment-manager";
import {
  createMemoryPaymentDriver,
  createMemoryPaymentManagerStore,
} from "@eristack/payment-manager/testing";

const paymentManager = createPaymentManager({
  store: createMemoryPaymentManagerStore(),
  drivers: { memory: createMemoryPaymentDriver() },
});
```

Production wiring: [wiring-production.md](./wiring-production.md).
