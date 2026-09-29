---
title: Overview
description: Normalize a party's contact channels — roles, one primary, at least one reachable field — as a plain JSON value the app stores on its own partner/customer rows.
---

# @eristack/contact

A party (customer, supplier, employee) has **channels**: "billing → ops@acme.com", "shipping → +6281…", "technical → person 0192…". `@eristack/contact` validates that list and answers the one question every screen asks: *who do I contact first?*

It is a value type, not a table. The app persists `ContactList` as JSON (or explodes it into its own `party_contacts` table) — the package never owns partner data.

## Use it when

- A partner/customer/supplier form collects several contact points with roles.
- You need exactly-one-primary semantics enforced before persistence.
- You want `primaryContact()` to pick the right channel for an invoice email or delivery SMS without repeating the "primary else first" rule in every service.

## Not for

- Normalizing the phone or email strings themselves — `@eristack/phone` / `@eristack/email-address` do that **before** you build the list.
- People data (names, gender) — `@eristack/person`.
- Postal addresses — `@eristack/address`.
- CRM features (activity history, opt-in flags) — app tables.

## Install

```bash
pnpm add @eristack/contact
```

No peers, no sibling imports — compose with the other party primitives at your request handler.

## 30-second example

```ts
import { normalizeContactList, primaryContact, CONTACT_ROLES } from "@eristack/contact";

const list = normalizeContactList({
  channels: [
    { role: "Billing", email: "ops@acme.com", isPrimary: true },   // role folded to "billing"
    { role: "shipping", phone: "+6281234567890" },
    { role: "technical", personId: "0192f1a0-…" },                   // FK to the app's persons table
  ],
});

primaryContact(list); // { role: "billing", email: "ops@acme.com", isPrimary: true, … }
CONTACT_ROLES;        // ["general","billing","shipping","technical","sales","other"]
```

## API

| Export | Signature | Notes |
| --- | --- | --- |
| `normalizeContactList` | `(input: ContactList) => ContactList` | Requires ≥1 channel. Per channel: role normalized (trim, lower-case, `-`→`_`, must be in `CONTACT_ROLES`), `personId`/`phone`/`email` trimmed (empty → `undefined`), at least one of the three present, `isPrimary` coerced to boolean. At most **one** `isPrimary`. |
| `primaryContact` | `(list: ContactList) => ContactChannel \| undefined` | Normalizes, then returns the `isPrimary` channel, else the first channel. `undefined` only if normalization would throw — in practice always a channel. |
| `CONTACT_ROLES` | `readonly ContactRole[]` | Export for `<select>` options and Zod enums — do not copy the list into the app. |
| `ContactRole` | `"general" \| "billing" \| "shipping" \| "technical" \| "sales" \| "other"` | |
| `ContactChannel` | `{ role; personId?; phone?; email?; isPrimary? }` | Strings are opaque; normalize phone/email upstream. |
| `ContactList` | `{ channels: ContactChannel[] }` | Store as JSON or explode into rows. |
| `ContactParseError` | `Error` with `code: "CONTACT_PARSE"` | Also `CONTACT_PARSE_CODE`. |

## Works with

- `@eristack/phone` → `channel.phone`, `@eristack/email-address` → `channel.email`, `@eristack/person` → `channel.personId`.
- `@eristack/comms` — `primaryContact(list).email` / `.phone` is the `to`.
- `@eristack/address` — postal addresses are a sibling value on the same party row, not a channel.

## For agents

- Skill: `pnpm dlx @tanstack/intent@latest load @eristack/contact#contact-core`
- Recipe: `party-contact-normalize`; canonical composition guide `@eristack/ai-knowledge#party-and-platform-compose`.

## Next

- [Getting started](./getting-started.md) — full partner handler composing phone/email/contact, JSON vs table persistence, and Zod.
