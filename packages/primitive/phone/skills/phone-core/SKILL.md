---
name: phone-core
description: >
  @eristack/phone normalizeE164, isValidE164, e164PhoneSchema, branded E164Phone —
  strict "+CC…" normalization at the API boundary for contacts and @eristack/comms SMS/WhatsApp.
  No country inference or libphonenumber; national-number forms add the dial code in the app/UI.
metadata:
  author: eristack
  version: "0.1"
  type: core
  library: "@eristack/phone"
sources:
  - packages/primitive/phone/docs/getting-started.md
---

# @eristack/phone

One gate for every phone string: strip `( ) . -` and spaces, require `+`, validate `^\+[1-9]\d{1,14}$`.

```ts
import { normalizeE164, isValidE164, type E164Phone } from "@eristack/phone";
import { e164PhoneSchema } from "@eristack/phone/zod";

normalizeE164("+1 (415) 555-0100");  // "+14155550100" | throws PhoneParseError (code "PHONE_PARSE")
isValidE164("415-555-0100");         // false — no "+"
z.object({ mobile: e164PhoneSchema }); // transforms; handler receives canonical E164Phone
```

## Checklist

1. Request schema: `e164PhoneSchema`; Drizzle `text` column + unique index `(tenant_id, phone)`.
2. National input (`0812…` + country) → app prepends dial code, strips trunk `0`, then `normalizeE164`. Heavy rules (`libphonenumber-js`) run in the frontend; the server still normalizes.
3. Accept `E164Phone` (branded) in service signatures so un-normalized strings are compile errors; cast DB reads at the repository.
4. `@eristack/comms` SMS/WhatsApp `to` and `@eristack/contact` `channel.phone` take this string.

## Do not

- Infer country from a bare national number.
- Store extensions inside the number — separate column.
- Trust per-country length: the regex only enforces E.164 bounds (2–15 digits).
