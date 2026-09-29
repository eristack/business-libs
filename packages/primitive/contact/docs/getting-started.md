---
title: Getting started
description: Compose phone, email, and contact at the request handler, persist ContactList as JSON or rows, and pick the primary channel for outbound messages.
---

# Getting started

## Install

```bash
pnpm add @eristack/contact @eristack/phone @eristack/email-address zod
```

## The handler composes; the primitives stay independent

`@eristack/contact` does not import `@eristack/phone` or `@eristack/email-address`. Normalize the strings first, then build the list:

```ts
import { z } from "zod";
import { e164PhoneSchema } from "@eristack/phone/zod";
import { emailAddressSchema } from "@eristack/email-address/zod";
import { normalizeContactList, CONTACT_ROLES, ContactParseError } from "@eristack/contact";

const channelBody = z.object({
  role: z.enum(CONTACT_ROLES),                 // exported registry — no parallel list in the app
  personId: z.string().min(1).optional(),
  phone: e164PhoneSchema.optional(),           // "+1 (415) 555-0100" → "+14155550100"
  email: emailAddressSchema.optional(),        // "Ops@Acme.COM" → "ops@acme.com"
  isPrimary: z.boolean().optional(),
});

const partnerBody = z.object({
  name: z.string().min(1),
  contacts: z.object({ channels: z.array(channelBody).min(1) }),
});

app.post("/partners", async (req, res) => {
  const input = partnerBody.parse(req.body);
  let contacts;
  try {
    contacts = normalizeContactList(input.contacts);   // roles folded, one primary max
  } catch (err) {
    if (err instanceof ContactParseError) return res.status(400).json({ error: err.code, message: err.message });
    throw err;
  }
  await db.insert(partners).values({
    id: generateEntityId(),
    name: input.name,
    contactsJson: JSON.stringify(contacts),
  });
  res.status(201).json({ contacts });
});
```

## Persistence: JSON column or child table

**JSON (default, simplest).** One `text`/`jsonb` column on the party row; read → `JSON.parse` → `normalizeContactList` if you want to re-validate legacy data.

```ts
export const partners = pgTable("partners", {
  id: entityIdColumn("pgsql", "id").primaryKey(),
  name: text("name").notNull(),
  contactsJson: jsonb("contacts_json").$type<ContactList>().notNull(),
});
```

**Child table (when you filter/report by channel).** Explode `channels` into `partner_contacts(partner_id, role, person_id, phone, email, is_primary)` with a partial unique index on `(partner_id) WHERE is_primary` to mirror the one-primary rule in SQL. Reassemble with `{ channels: rows }` before calling `primaryContact`.

## Picking who to message

```ts
import { primaryContact } from "@eristack/contact";

const contact = primaryContact(partner.contacts);
if (contact.email) {
  await comms.send({ channel: "email", to: contact.email, /* … */ });
} else if (contact.phone) {
  await comms.send({ channel: "sms", to: contact.phone, /* … */ });
}
```

Need a role-specific pick (billing for invoices)? That is a one-liner in the app — the package only encodes the *default* rule:

```ts
const billing = partner.contacts.channels.find((c) => c.role === "billing") ?? primaryContact(partner.contacts);
```

## Gotchas

- Role matching is lenient (`"Billing"`, `"billing"`, `"BILLING"` → `"billing"`; `"tech-nical"` → `"technical"`), but unknown roles throw. Put `CONTACT_ROLES` in the UI select so users cannot type free text.
- Empty strings become `undefined`; a channel with only `""` fields throws "requires at least one of personId, phone, or email".
- Two `isPrimary: true` channels throw — the UI should enforce a radio, not checkboxes.
- `primaryContact` calls `normalizeContactList` internally, so it can throw on bad stored data. When reading legacy JSON, wrap it once at the repository.
- The package does not deduplicate channels; two identical billing emails are allowed. Add that rule in the app if you need it.

## Testing

```ts
import { normalizeContactList, primaryContact, ContactParseError } from "@eristack/contact";
import { expect, it } from "vitest";

it("primary wins, else first", () => {
  const list = normalizeContactList({
    channels: [{ role: "general", email: "a@b.co" }, { role: "billing", email: "c@d.co", isPrimary: true }],
  });
  expect(primaryContact(list)?.email).toBe("c@d.co");
});

it("rejects two primaries", () => {
  expect(() =>
    normalizeContactList({
      channels: [{ role: "general", email: "a@b.co", isPrimary: true }, { role: "sales", email: "c@d.co", isPrimary: true }],
    }),
  ).toThrow(ContactParseError);
});
```
