---
title: Getting started
description: Persist tokens after PSP tokenization, transient CardPan, Express PAN guard, Zod.
---

# Getting started

## Install

```bash
pnpm add @eristack/payment-instrument
```

Optional adapters:

```bash
pnpm add zod express   # /zod and /express peers
```

## 1. Persist after PSP tokenization

Your checkout calls Stripe/Xendit client-side or server-side tokenization, then the API stores:

```ts
import { toPersistable } from "@eristack/payment-instrument";

const saved = toPersistable({
  display: {
    last4: "4242",
    brand: "visa",
    funding: "credit",
    expMonth: 12,
    expYear: 2030,
  },
  gateway: {
    gateway: "stripe",
    tokenId: "pm_1abc",
    fingerprint: "fp_optional",
  },
});
// Drizzle insert JSON column or normalized columns — app-owned customer_payment_methods table
```

## 2. Transient PAN (client-side Luhn only)

```ts
import { CardPan } from "@eristack/payment-instrument";

const pan = CardPan.parse("4242 4242 4242 4242");
pan.last4; // "4242" — send full PAN only to PSP SDK, not your API
```

## 3. Block raw PAN on Express JSON bodies

Mount **before** payment routes:

```ts
import express from "express";
import { createRejectRawPanMiddleware } from "@eristack/payment-instrument/express";

const app = express();
app.use(express.json());
app.use(createRejectRawPanMiddleware());
```

## 4. Zod on API payloads

```ts
import { persistablePaymentInstrumentSchema } from "@eristack/payment-instrument/zod";

const body = persistablePaymentInstrumentSchema.parse(req.body);
```

## 5. With @eristack/payment-manager

| Concern | Package |
| --- | --- |
| Saved card rows | **payment-instrument** (this package) |
| Charge invoice, webhooks, intent history | [@eristack/payment-manager](/docs/payment-manager/getting-started) |
| Money on invoice lines | `@eristack/money` + `@eristack/qups` |

See [Security & PCI scope](./security.md).
