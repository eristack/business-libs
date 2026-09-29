---
title: Getting started
description: Wire E.164 normalization into request schemas and Drizzle columns, handle national-number forms, and use the branded type to prove normalization.
---

# Getting started

## Install

```bash
pnpm add @eristack/phone zod
```

## Boundary wiring

```ts
// routes/contacts.ts
import { z } from "zod";
import { e164PhoneSchema } from "@eristack/phone/zod";

const body = z.object({
  name: z.string().min(1),
  mobile: e164PhoneSchema,                 // "+1 (415) 555-0100" → "+14155550100"
  landline: e164PhoneSchema.optional(),
});

app.post("/contacts", async (req, res) => {
  const input = body.parse(req.body);       // ZodError → 400 via your mapper
  await db.insert(contacts).values({ id: generateEntityId(), ...input });
  res.status(201).json(input);
});
```

```ts
// schema.ts
import { pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";

export const contacts = pgTable(
  "contacts",
  {
    id: entityIdColumn("pgsql", "id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    name: text("name").notNull(),
    mobile: text("mobile").notNull(),        // E.164, max 16 chars incl. "+"
    landline: text("landline"),
  },
  (t) => [uniqueIndex("contacts_tenant_mobile_uq").on(t.tenantId, t.mobile)],
);
```

## Forms that collect national numbers

The package refuses to guess a country. Give it the `+CC` yourself:

```ts
import { normalizeE164, PhoneParseError } from "@eristack/phone";

// UI sends { country: "ID", national: "0812-3456-7890" }
const DIAL: Record<string, string> = { ID: "+62", US: "+1", GB: "+44" }; // app-owned

function toE164(country: string, national: string) {
  const digits = national.replace(/\D/g, "").replace(/^0+/, ""); // trunk-prefix strip is app policy
  return normalizeE164(`${DIAL[country]}${digits}`);
}

toE164("ID", "0812-3456-7890"); // "+6281234567890"
```

If you need real per-country rules (trunk prefixes, length tables), run `libphonenumber-js` in the **frontend** and send E.164 to the API — the server still normalizes with this package as the single gate.

## Using the branded type

`E164Phone` is `string & { __brand }`. Functions that accept it cannot be called with a raw string, so "did anyone normalize this?" becomes a compile error:

```ts
import type { E164Phone } from "@eristack/phone";

async function sendOtp(to: E164Phone) { /* comms.send({ channel: "sms", to }) */ }

sendOtp("+14155550100");                  // TS error: string is not E164Phone
sendOtp(normalizeE164("+14155550100"));   // OK
```

Drizzle returns plain `string` from the DB; cast with `as E164Phone` at the repository boundary — the column is trusted because only normalized values enter it.

## Gotchas

- Formatting characters removed: space, `(`, `)`, `.`, `-`. Anything else (`x123`, letters, `/`) throws — reject extensions or store them in their own column.
- A leading `00` or national trunk `0` is **not** converted; `"+0…"` fails the E.164 regex. Strip it before prepending the dial code.
- Minimum is 2 digits after `+` (the regex `\d{1,14}` following `[1-9]`); the package does not know per-country lengths, so `"+1234"` is accepted. Real length validation belongs to the frontend picker.
- `isValidE164` is for filters and UI hints; for persistence use `normalizeE164` so you also get the canonical string.

## Testing

```ts
import { normalizeE164, isValidE164, PhoneParseError } from "@eristack/phone";
import { expect, it } from "vitest";

it("strips formatting", () => {
  expect(normalizeE164("+1 (415) 555-0100")).toBe("+14155550100");
});

it("requires plus", () => {
  expect(isValidE164("415-555-0100")).toBe(false);
  expect(() => normalizeE164("415-555-0100")).toThrow(PhoneParseError);
});
```
