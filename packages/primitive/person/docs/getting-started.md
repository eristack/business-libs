---
title: Getting started
description: Persist Person in Drizzle (structured columns + gender CHECK), validate with personSchema, compose person + phone + email in one party handler, render display vs. sortable names in lists, and handle gender identity correctly.
---

# Getting started

## Install

```bash
pnpm add @eristack/person
```

## Normalise at the boundary

```ts
import { normalizePerson, PersonParseError } from "@eristack/person";

try {
  const person = normalizePerson(body.person);
  await db.insert(persons).values({ tenantId, ...flatten(person) });
} catch (e) {
  if (e instanceof PersonParseError) return res.status(400).json({ code: e.code, message: e.message });
  throw e;
}
```

## Drizzle table

```ts
import { pgTable, text, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { entityIdColumn } from "@eristack/entity-id/drizzle";
import { GENDER_IDENTITIES } from "@eristack/person";

export const persons = pgTable("persons", {
  id: entityIdColumn("pgsql", "id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  givenName: text("given_name").notNull(),
  familyName: text("family_name").notNull(),
  middleName: text("middle_name"),
  namePrefix: text("name_prefix"),
  nameSuffix: text("name_suffix"),
  gender: text("gender"),
  genderOther: text("gender_other"),
}, (t) => [
  check("persons_gender_check", sql`${t.gender} IS NULL OR ${t.gender} IN (${sql.join(GENDER_IDENTITIES.map((g) => sql`${g}`), sql`, `)})`),
  check("persons_gender_other_check", sql`(${t.gender} = 'other') = (${t.genderOther} IS NOT NULL)`),
]);

// map helpers
export const flatten = (p: Person) => ({
  givenName: p.name.given, familyName: p.name.family, middleName: p.name.middle ?? null,
  namePrefix: p.name.prefix ?? null, nameSuffix: p.name.suffix ?? null,
  gender: p.gender ?? null, genderOther: p.genderOther ?? null,
});
export const toPerson = (r: typeof persons.$inferSelect): Person => ({
  name: { given: r.givenName, family: r.familyName, middle: r.middleName ?? undefined, prefix: r.namePrefix ?? undefined, suffix: r.nameSuffix ?? undefined },
  gender: (r.gender as GenderIdentity | null) ?? undefined,
  genderOther: r.genderOther ?? undefined,
});
```

Structured columns (not JSON) so `ORDER BY family_name, given_name` and `WHERE family_name ILIKE` work in `@eristack/data-grid`.

## Zod at the API boundary

```ts
import { z } from "zod";
import { personSchema } from "@eristack/person/zod";
import { PersonParseError } from "@eristack/person";

const createContactBody = z.object({
  person: personSchema,              // → normalised Person
  email: emailAddressSchema.optional(),   // @eristack/email-address/zod
  phone: e164PhoneSchema.optional(),      // @eristack/phone/zod
});

try {
  const input = createContactBody.parse(req.body);
} catch (e) {
  if (e instanceof z.ZodError) return res.status(400).json({ code: "VALIDATION", issues: e.issues });   // bad enum / missing fields
  if (e instanceof PersonParseError) return res.status(400).json({ code: e.code, message: e.message });  // genderOther rules, blank names
  throw e;
}
```

The Zod enum is **exact** (`"woman"`, not `"Woman"`); if your UI sends labels, run `normalizeGenderIdentity` first or use a `z.preprocess`.

## Party handler (compose, don't import)

```ts
// POST /contacts — person + channels in one transaction
import { normalizePerson, formatPersonDisplay } from "@eristack/person";
import { normalizeEmail } from "@eristack/email-address";
import { normalizeE164 } from "@eristack/phone";

await db.transaction(async (tx) => {
  const person = normalizePerson(input.person);
  const [row] = await tx.insert(persons).values({ tenantId, ...flatten(person) }).returning();
  await tx.insert(contactChannels).values([
    input.email && { personId: row.id, kind: "email", value: normalizeEmail(input.email), primary: true },
    input.phone && { personId: row.id, kind: "phone", value: normalizeE164(input.phone) },
  ].filter(Boolean));
  return { id: row.id, display: formatPersonDisplay(person) };
});
```

Full pattern: `@eristack/ai-knowledge#party-and-platform-compose`.

## Display vs. sort

```ts
formatPersonDisplay(p);                       // "Dr Grace Brewster Hopper"   — document headers, greetings
formatPersonSortable(p);                      // "Hopper, Grace Brewster"     — directory lists, pickers
formatPersonDisplay(p, { familyFirst: true }); // same as sortable
```

For list APIs, return both (`displayName`, `sortName`) computed at read time — don't persist formatted strings, they go stale on edits.

## Gender identity

```ts
GENDER_IDENTITIES  // ["unknown","woman","man","non_binary","prefer_not_to_say","other"]
normalizeGenderIdentity("Prefer-Not-To-Say")  // "prefer_not_to_say"
normalizePerson({ name, gender: "other", genderOther: "genderfluid" })  // ok
normalizePerson({ name, gender: "other" })                              // throws: genderOther is required when gender is other
normalizePerson({ name, gender: "woman", genderOther: "x" })            // throws: genderOther is only allowed when gender is other
```

Only collect gender where you have a business reason (uniform sizing, statutory reporting); default the field to absent, not `"unknown"`.

## Gotchas

- `given` and `family` are both required — mononymous people need a convention (e.g. family = given, or `"-"`); document it in your app.
- Blank optionals normalise to `undefined`, so `{ middle: "" }` round-trips as absent — compare normalised objects, not raw input.
- `formatPersonSortable` places `suffix` after family (`"King Jr, Martin Luther"`); `prefix` is dropped from the sortable form.
- Display order is fixed Western (`prefix given middle family suffix`); East-Asian family-first display needs `familyFirst: true` or app-level locale logic.
- Company names are not `Person`s — use a text column on the partner/org row.
- Ship-to/bill-to addresses are `@eristack/address`, not name fields.

## Testing

```ts
import { formatPersonSortable, normalizePerson, PersonParseError } from "@eristack/person";
import { expect, it } from "vitest";

it("normalises and formats", () => {
  const p = normalizePerson({ name: { given: " Martin ", family: "King", middle: "Luther", suffix: "Jr" }, gender: "Man" });
  expect(p.gender).toBe("man");
  expect(formatPersonSortable(p)).toBe("King Jr, Martin Luther");
  expect(() => normalizePerson({ name: { given: "A", family: "B" }, gender: "other" })).toThrow(PersonParseError);
});
```

## Works with

| Package | Role |
| --- | --- |
| `@eristack/contact` | Channels reference `personId` FK + formatted display |
| `@eristack/phone`, `@eristack/email-address` | Channel values, normalised in the same handler |
| `@eristack/entity-id` | Person row PK |

Party normalize handler: `#party-and-platform-compose`.
