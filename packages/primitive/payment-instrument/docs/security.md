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
- `@eristack/payment-manager` (service) will own webhooks and intent history — still app-owned customer tables.
