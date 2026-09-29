---
title: Overview
description: Structured person names (given/family/middle/prefix/suffix) and an optional gender identity enum, normalised once and formatted for display or sorting — the party primitive for contacts and employees, not an HRIS.
---

# @eristack/person

Partner contacts, employees, drivers, signatories — every ERP stores people, and every ERP eventually regrets storing them as one `full_name` column. `@eristack/person` fixes the **shape**: a `Person` is a structured `PersonName` (given/family required, middle/prefix/suffix optional) plus an optional `gender` from a small canonical enum with an `other` free-text escape hatch. `normalizePerson` trims and validates once; `formatPersonDisplay` and `formatPersonSortable` render the two orders you actually need.

No sibling imports: phone, email, and address are separate primitives composed at the app boundary (`@eristack/ai-knowledge#party-and-platform-compose`).

## Use it when

- Contact/employee/customer-person rows in Drizzle tables.
- API bodies that carry a person (`@eristack/person/zod`).
- Directory lists ("Lovelace, Ada") vs. document headers ("Ms Ada Lovelace").

## Not for

- Legal entity / company names — partner or org master (a string, not a `Person`).
- Culture-specific name order rules beyond family-first — v0 formats Western display order; add locale rules in the app.
- HR facts (DOB, national id, employment) — app tables keyed by the person row.
- Titles vs. honorifics semantics — `prefix`/`suffix` are free text.

## Install

```bash
pnpm add @eristack/person
pnpm add zod        # only for @eristack/person/zod (peer ^4)
```

No `@eristack/*` peers.

## 30-second example

```ts
import { normalizePerson, formatPersonDisplay, formatPersonSortable } from "@eristack/person";

const ada = normalizePerson({ name: { given: " Ada ", family: "Lovelace", prefix: "Ms", middle: "" }, gender: "Woman" });
// → { name: { given: "Ada", family: "Lovelace", prefix: "Ms" }, gender: "woman" }

formatPersonDisplay(ada);                      // "Ms Ada Lovelace"
formatPersonDisplay(ada, { familyFirst: true }); // "Lovelace, Ada"
formatPersonSortable(ada);                     // "Lovelace, Ada"
```

## API

| Export | Signature | Notes |
| --- | --- | --- |
| `normalizePerson` | `(input: Person) => Person` | Normalises name + gender; enforces `genderOther` **only and always** with `gender: "other"`. Throws `PersonParseError`. |
| `normalizePersonName` | `(input: PersonName) => PersonName` | Trims; `given`/`family` required (`name.given is required`); blank optionals become `undefined`. |
| `normalizeGenderIdentity` | `(value: string) => GenderIdentity` | Trim, lower-case, `-`→`_` (`"Non-Binary"` → `"non_binary"`); throws `Invalid gender identity "…"`. |
| `isGenderIdentity` | `(value: string) => value is GenderIdentity` | Exact-match guard (no normalisation). |
| `GENDER_IDENTITIES` | `readonly ["unknown","woman","man","non_binary","prefer_not_to_say","other"]` | Export for `<select>` options and CHECK constraints. |
| `formatPersonDisplay` | `(person, { familyFirst? = false }) => string` | `prefix given middle family suffix` joined by spaces (blank parts skipped); `familyFirst` delegates to sortable. Normalises first. |
| `formatPersonSortable` | `(person) => string` | `"Family Suffix, Given Middle"` — e.g. `"King Jr, Martin Luther"`. |
| `PersonParseError` | `class extends Error { code: "PERSON_PARSE" }`; `PERSON_PARSE_CODE` | Map to 400 at the boundary. |
| `Person`, `PersonName`, `GenderIdentity`, `PersonFormatOptions` | types | |
| `@eristack/person/zod` → `personSchema` | `z.object({ name: {...}, gender: z.enum(GENDER_IDENTITIES).optional(), genderOther: z.string().optional() }).transform(normalizePerson)` | Enum check is exact (lower-case snake) **before** the transform; the transform can still throw `PersonParseError` for `genderOther` rules or blank names. |

## Works with

- `@eristack/contact` — channels reference the person row; `formatPersonDisplay` for the contact label.
- `@eristack/phone`, `@eristack/email-address` — separate columns/tables, composed in the same handler.
- `@eristack/entity-id` — `entityIdColumn` PK for `persons`.
- `@eristack/data-grid` — sort by `family_name, given_name` columns, not by a formatted string.

## For agents

- Skill: `pnpm dlx @tanstack/intent@latest load @eristack/person#person-core`
- Recipes: `person-normalize`, `party-contact-normalize`. Composition guide: `@eristack/ai-knowledge#party-and-platform-compose`.

## Next

- [Getting started](./getting-started.md) — Drizzle table with CHECK on gender, Zod at the boundary, party handler composing person + phone + email, display/sort in lists, and gotchas.
