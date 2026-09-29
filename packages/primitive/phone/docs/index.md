---
title: Overview
description: Normalize phone numbers to strict E.164 ("+14155550100") at the API boundary — no country inference, no libphonenumber.
---

# @eristack/phone

Phone numbers arrive as `"+1 (415) 555-0100"`, `"+62 812-3456-7890"`, `"+44 20 7946 0958"`. `normalizeE164` strips the formatting and returns one canonical `"+14155550100"` — or throws. Store that; compare that; send that to `@eristack/comms`.

The package is deliberately strict and tiny: a **`+` is required**, so it never guesses a country. If your form collects national numbers, the app (or a UI library) adds the country code first.

## Use it when

- Persisting a phone on a party, user, or `@eristack/contact` channel.
- Deduplicating contacts — canonical strings make `UNIQUE` and `=` work.
- Validating request bodies (`e164PhoneSchema` from `./zod`).
- Preparing a `to` number for `@eristack/comms` SMS/WhatsApp (both need E.164).

## Not for

- Turning `"0812-3456-7890"` into `"+62812…"` — country inference is app/UI logic (a country picker, or `libphonenumber-js` in the frontend).
- Carrier lookup, number type (mobile/landline), or formatting for display.
- Extension numbers (`x123`) — reject or store separately.

## Install

```bash
pnpm add @eristack/phone
pnpm add zod            # only for @eristack/phone/zod
```

## 30-second example

```ts
import { normalizeE164, isValidE164 } from "@eristack/phone";

normalizeE164("+1 (415) 555-0100");   // "+14155550100"
normalizeE164("+62 812-3456-7890");   // "+6281234567890"
isValidE164("415-555-0100");          // false — no "+"

normalizeE164("415-555-0100");        // throws PhoneParseError: E.164 phone must start with "+"
normalizeE164("+0123");               // throws PhoneParseError: Invalid E.164 length or leading zero
```

## API

| Export | Signature | Notes |
| --- | --- | --- |
| `normalizeE164` | `(input: string) => E164Phone` | Trims, removes spaces `( ) . -`, requires leading `+`, digits only, 2–15 digits, first digit 1–9. |
| `isValidE164` | `(input: string) => boolean` | `normalizeE164` without the throw. |
| `E164Phone` | `string & { __brand }` | Branded string — accept it in function signatures to prove normalization happened. |
| `PhoneParseError` | `Error` with `code: "PHONE_PARSE"` | Also `PHONE_PARSE_CODE`. |
| `e164PhoneSchema` | `z.ZodType<E164Phone>` from `./zod` | `z.string()` → `normalizeE164`; parse errors become Zod issues. |

Accepted regex after cleanup: `^\+[1-9]\d{1,14}$` (ITU-T E.164).

## Works with

- `@eristack/contact` — `ContactChannel.phone` expects this string.
- `@eristack/comms` — SMS/WhatsApp `to` must be E.164; normalize before `send`.
- `@eristack/person`, `@eristack/email-address` — compose at the handler (`#party-and-platform-compose`).

## For agents

- Skill: `pnpm dlx @tanstack/intent@latest load @eristack/phone#phone-core`
- Recipe: `party-contact-normalize`.

## Next

- [Getting started](./getting-started.md) — Zod wiring, Drizzle column, national-number forms, and the branded type.
