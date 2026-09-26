# @eristack/payment-instrument

Primitive **payment instrument** values — credit/debit **display** and **gateway tokens**, not primary account numbers.

## Hard rules

- **Never persist PAN or CVV** through this library — `CardPan` is transient; `toPersistable()` only returns token + display.
- **PSP tokenization** (Stripe, Xendit, …) happens in `@eristack/payment-manager` (planned) or your PCI scope; this package models what may be stored in Postgres.

## Exports

```text
@eristack/payment-instrument           core types, CardPan, toPersistable, pan detect
        └── /zod                       persistablePaymentInstrumentSchema
        └── /express                   createRejectRawPanMiddleware
```

Next: [Getting started](./getting-started.md) · [Security & PCI scope](./security.md)
