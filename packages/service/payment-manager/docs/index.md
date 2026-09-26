---
title: Payment Manager
description: Headless payment intents, Stripe/Xendit drivers, webhooks, Drizzle history.
---

# @eristack/payment-manager

Service-layer orchestration for **payment intents**: create charges at a PSP, persist status + idempotency keys, verify webhooks, append gateway events. Amounts use **`@eristack/money`** JSON (`{ currency, amount }` strings). Saved cards use **`@eristack/payment-instrument`** in your app tables — not this package.

| Entry | Use |
| --- | --- |
| `@eristack/payment-manager` | `createPaymentManager`, memory driver (tests) |
| `@eristack/payment-manager/stripe` | `createStripePaymentDriver` |
| `@eristack/payment-manager/xendit` | `createXenditPaymentDriver` |
| `@eristack/payment-manager/drizzle` | Tables + `createDrizzlePaymentManagerStore` |
| `@eristack/payment-manager/express` | `createPaymentManagerRouter` |
| `@eristack/payment-manager/client` | `createPaymentManagerClient` |
| `@eristack/payment-manager/react` | `usePaymentIntent`, `useCreatePaymentIntent` |
| `@eristack/payment-manager/backseat` | Horizon A mock routes |

**Production default:** Drizzle store + real Stripe or Xendit driver. **Tests only:** `@eristack/payment-manager/testing` memory store/driver.

**Required peer:** `@eristack/money` — all intent amounts are `{ currency, amount }` JSON strings.

## Compose with sibling packages

| Need | Package |
| --- | --- |
| Saved card display + PSP token rows | [`@eristack/payment-instrument`](/docs/payment-instrument/getting-started) |
| Invoice line amounts | [`@eristack/money`](/docs/money) + [`@eristack/qups`](/docs/qups) |
| Receipt / failed-payment email | [`@eristack/comms`](/docs/comms/getting-started) (your app triggers after webhook) |
| Authenticated checkout API | [`@eristack/jwt-auth`](/docs/jwt-auth) guard on `/payments/*` |

Next: [Getting started](./getting-started.md) · [Security](./security.md) · [Production wiring](./wiring-production.md)
