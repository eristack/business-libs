---
name: payment-instrument-core
description: >
  @eristack/payment-instrument token-safe card/debit display + gateway refs.
  CardPan is transient; toPersistable for Drizzle. Use before payment-manager
  or when modeling saved payment methods — never store PAN/CVV in SQL.
metadata:
  type: core
  library: "@eristack/payment-instrument"
  library_version: "0.1.0"
sources:
  - "eristack/business-libs:packages/primitive/payment-instrument/docs/getting-started.md"
---

# Payment instrument (primitive)

```ts
import { toPersistable, CardPan } from "@eristack/payment-instrument";
```

- **`toPersistable`** — `{ display, gateway }` safe for Postgres
- **`CardPan.parse`** — Luhn in browser; **never** POST full PAN to your API
- **`@eristack/payment-instrument/express`** — `createRejectRawPanMiddleware()`
- **`/zod`** — `persistablePaymentInstrumentSchema`
- Checkout/intents/webhooks → **`@eristack/payment-manager`** — load `payment-manager-core` after this skill for Stripe/Xendit

Security: `docs/security.md` — PCI scope reduction, not certification.
