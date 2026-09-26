---
title: Security & PCI scope
description: What to store, library enforcement, app responsibilities, payment-manager boundary.
---

# Security & PCI scope

This library **does not** make your app PCI compliant. It encodes Eristack defaults:

| Data | Store in your DB? |
| --- | --- |
| Gateway `tokenId`, `fingerprint` | Yes (protect like secrets; encrypt at rest if policy requires) |
| `last4`, `brand`, `funding`, exp | Yes, after tokenization |
| Full PAN, CVV, track | **No** — reject at API boundary |

## Library enforcement

- `toPersistable` / Zod schemas reject PAN-shaped `tokenId` values.
- `createRejectRawPanMiddleware` scans JSON bodies for PAN-like strings.
- `CardPan.toJSON()` throws — do not pass PAN through `JSON.stringify` into logs.

## App responsibilities

- Use PSP-hosted fields or tokenization APIs for card entry.
- Do not log request bodies on payment routes.
- Mount [`@eristack/payment-manager`](/docs/payment-manager/security) webhooks with signature verification; intents and gateway events live in `payment_manager_*` tables — **customer** rows stay app-owned.

## Agent checklist

1. Load `@eristack/payment-instrument#payment-instrument-core` before modeling card columns.
2. Load `@eristack/payment-manager#payment-manager-core` before Stripe/Xendit wiring.
3. Never suggest storing PAN in Drizzle schemas or API examples.
