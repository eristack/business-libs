---
name: contact-core
description: >
  @eristack/contact normalizeContactList, primaryContact, CONTACT_ROLES — validate a party's
  contact channels (role, personId/phone/email, one isPrimary max) as a JSON value on app-owned
  partner rows. Normalize phone/email upstream with @eristack/phone / @eristack/email-address.
metadata:
  author: eristack
  version: "0.1"
  type: core
  library: "@eristack/contact"
sources:
  - packages/primitive/contact/docs/getting-started.md
---

# @eristack/contact

Value type for "how do we reach this party". App owns the partner table; this validates the channel list and picks the primary.

```ts
import { normalizeContactList, primaryContact, CONTACT_ROLES } from "@eristack/contact";

const list = normalizeContactList({
  channels: [
    { role: "billing", email: normalizeEmail(raw.email), isPrimary: true },
    { role: "shipping", phone: normalizeE164(raw.phone) },
    { role: "technical", personId: person.id },
  ],
});                       // throws ContactParseError (code "CONTACT_PARSE"): no channels, unknown role,
                          // channel with no personId/phone/email, or >1 isPrimary
primaryContact(list);     // isPrimary channel, else channels[0]
```

## Checklist

1. Zod: `role: z.enum(CONTACT_ROLES)`, `phone: e164PhoneSchema`, `email: emailAddressSchema` — never a parallel role list.
2. Call `normalizeContactList` in the handler; map `ContactParseError` → 400.
3. Persist as `jsonb` on the party row (default) or explode to `party_contacts` rows with a partial unique index on `is_primary`.
4. Outbound (`@eristack/comms`): `primaryContact(list).email ?? .phone`; role-specific picks (`billing`) are a one-line `find` in the app.

## Do not

- Import phone/email normalizers inside contact — compose at the boundary (`#party-and-platform-compose`).
- Put postal addresses here (`@eristack/address`) or person names (`@eristack/person`).
- Expect dedup of identical channels — app rule.
