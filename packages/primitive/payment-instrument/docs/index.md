---
title: Payment instrument
description: Token-safe card display and gateway refs — PAN transient only, PCI-minded guards.
---

# @eristack/payment-instrument

Primitive **payment instrument** values — credit/debit **display** and **gateway tokens**, not primary account numbers.

## Hard rules

- **Never persist PAN or CVV** through this library — `CardPan` is transient; `toPersistable()` only returns token + display.
- **Checkout and webhooks** — `@eristack/payment-manager` owns intents, PSP drivers, and gateway event history; this package models what may live in Postgres after tokenization.

## Exports

| Import | Role |
| --- | --- |
| `@eristack/payment-instrument` | `toPersistable`, `CardPan`, PAN detect, gateway ref types |
| `@eristack/payment-instrument/zod` | `persistablePaymentInstrumentSchema` |
| `@eristack/payment-instrument/express` | `createRejectRawPanMiddleware` |

## Typical stack

```text
Browser PSP.js → your API stores toPersistable() → charge via payment-manager + saved tokenId
```

## Compose with sibling packages

| Need | Package |
| --- | --- |
| Charge intents + webhooks | [`@eristack/payment-manager`](/docs/payment-manager/getting-started) |
| Line totals on invoices | [`@eristack/money`](/docs/money) + [`@eristack/qups`](/docs/qups) |
| PAN rejection middleware | `createRejectRawPanMiddleware` on Express before payment routes |

Next: [Getting started](./getting-started.md) · [Security & PCI scope](./security.md)
