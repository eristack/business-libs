---
title: Getting started
description: Normalize once in the request schema, store the canonical string, and let a plain unique index do the rest.
---

# Getting started

## Install

```bash
pnpm add @eristack/email-address zod
```

## Normalize at the boundary, never in the database

The whole point is that **every path** into the `email` column goes through the same function, so a plain `UNIQUE` index is enough.

```ts
// schema.ts (app-owned)
import { pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";
import { entityIdColumn } from "@eristack/entity-id/drizzle";

export const partners = pgTable(
  "partners",
  {
    id: entityIdColumn("pgsql", "id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    name: text("name").notNull(),
    email: text("email"),                    // always normalized
  },
  (t) => [uniqueIndex("partners_tenant_email_uq").on(t.tenantId, t.email)],
);
```

```ts
// routes/partners.ts
import { z } from "zod";
import { emailAddressSchema } from "@eristack/email-address/zod";

const createPartnerBody = z.object({
  name: z.string().min(1),
  email: emailAddressSchema.optional(),      // "  Ops@Acme.COM " → "ops@acme.com"
});

app.post("/partners", async (req, res) => {
  const body = createPartnerBody.parse(req.body); // ZodError → your 400 mapper
  await db.insert(partners).values({ id: generateEntityId(), tenantId: req.tenantId, ...body });
  res.status(201).json(body);
});
```

Because `emailAddressSchema` **transforms**, `body.email` is already canonical — no second `normalizeEmail` call in the handler.

## Duplicate check before insert (friendlier than a unique-violation 500)

```ts
import { normalizeEmail, EmailParseError } from "@eristack/email-address";

async function assertEmailFree(tenantId: string, raw: string) {
  let email: string;
  try {
    email = normalizeEmail(raw);
  } catch (err) {
    if (err instanceof EmailParseError) throw new HttpError(400, err.message);
    throw err;
  }
  const existing = await db.query.partners.findFirst({
    where: (t, { and, eq }) => and(eq(t.tenantId, tenantId), eq(t.email, email)),
  });
  if (existing) throw new HttpError(409, "PARTNER_EMAIL_TAKEN");
}
```

Keep the unique index anyway — the check is a UX nicety, the index is the guarantee.

## Composing a contact channel

```ts
import { normalizeEmail } from "@eristack/email-address";
import { normalizeE164 } from "@eristack/phone";
import { normalizeContactList } from "@eristack/contact";

const contacts = normalizeContactList({
  channels: [
    { role: "billing", email: normalizeEmail(input.billingEmail), isPrimary: true },
    { role: "shipping", phone: normalizeE164(input.warehousePhone) },
  ],
});
```

`@eristack/contact` stores whatever strings you give it — normalization is your job at the handler, by design (no sibling imports between primitives).

## Gotchas

- `parseEmailAddress` splits on the **last** `@`, so a quoted local part like `"a@b"@example.com` parses as `local: "\"a"`… — exotic RFC forms are out of scope; reject them upstream if you care.
- The local part is lower-cased. If you must preserve display casing, store the raw value in a separate `email_display` column.
- `emailEquals` swallows parse errors and returns `false`; use `normalizeEmail` when you want the error.
- No Unicode normalization (IDN domains, NFKC). Punycode conversion belongs in the app if you accept internationalized domains.

## Testing

```ts
import { normalizeEmail, emailEquals, EmailParseError } from "@eristack/email-address";
import { expect, it } from "vitest";

it("folds case and trims", () => {
  expect(normalizeEmail("  Ops@Acme.COM ")).toBe("ops@acme.com");
  expect(emailEquals("a@b.co", "A@B.CO")).toBe(true);
});

it("rejects obvious garbage with a stable code", () => {
  try {
    normalizeEmail("nope");
  } catch (e) {
    expect((e as EmailParseError).code).toBe("EMAIL_PARSE");
  }
});
```
