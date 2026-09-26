---
name: payment-manager-adapters
description: >
  @eristack/payment-manager adapters: drizzle tables/store, express
  createPaymentManagerRouter, stripe/xendit drivers, client, react hooks, backseat.
metadata:
  type: adapters
  library: "@eristack/payment-manager"
  library_version: "0.0.0"
sources:
  - "eristack/business-libs:packages/service/payment-manager/docs/wiring-production.md"
---

# Payment manager adapters

## Express

```ts
import { createPaymentManagerRouter } from "@eristack/payment-manager/express";

app.use("/payments", requireAuth, createPaymentManagerRouter({ paymentManager }));
```

Stripe webhooks need raw body on the webhook route — see `docs/security.md`.

## Client + React

```ts
import { createPaymentManagerClient } from "@eristack/payment-manager/client";
import { useCreatePaymentIntent, usePaymentIntent } from "@eristack/payment-manager/react";

const client = createPaymentManagerClient({
  baseUrl: "/api/payments",
  headers: { Authorization: `Bearer ${token}` },
});
```

## Xendit

```ts
import { createXenditPaymentDriver } from "@eristack/payment-manager/xendit";
```

Supply `createPaymentRequest` wrapping your Xendit REST calls; verify via `x-callback-token`.

## Backseat

```ts
import { registerPaymentManagerBackseat } from "@eristack/payment-manager/backseat";
registerPaymentManagerBackseat(api, { basePath: "/payments" });
```
