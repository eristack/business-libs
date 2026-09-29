---
name: person-core
description: >
  @eristack/person Person { name { given, family, middle?, prefix?, suffix? }, gender?, genderOther? }:
  normalizePerson / normalizePersonName (trim, required given+family, genderOther iff gender
  "other", PersonParseError code PERSON_PARSE), GENDER_IDENTITIES [unknown, woman, man, non_binary,
  prefer_not_to_say, other], normalizeGenderIdentity ("Non-Binary" → non_binary), formatPersonDisplay
  "Prefix Given Middle Family Suffix", formatPersonSortable "Family Suffix, Given Middle", zod
  personSchema. Use for contact/employee rows with structured Drizzle columns; compose with
  phone/email/contact in the handler — no sibling imports. Not org names or HRIS.
metadata:
  author: eristack
  version: "0.1"
  type: core
  library: "@eristack/person"
sources:
  - packages/primitive/person/docs/getting-started.md
---

# @eristack/person

Structured name + canonical gender; format at read time.

```ts
import { normalizePerson, formatPersonDisplay, formatPersonSortable, GENDER_IDENTITIES, PersonParseError } from "@eristack/person";
import { personSchema } from "@eristack/person/zod";

const p = normalizePerson({ name: { given: " Ada ", family: "Lovelace", prefix: "Ms" }, gender: "Woman" }); // gender → "woman"
formatPersonDisplay(p);   // "Ms Ada Lovelace"
formatPersonSortable(p);  // "Lovelace, Ada"
```

## Checklist

1. Drizzle: `given_name`, `family_name`, `middle_name`, `name_prefix`, `name_suffix`, `gender`, `gender_other` columns; CHECK `gender IN (GENDER_IDENTITIES)` and `(gender='other') = (gender_other IS NOT NULL)`.
2. Boundary: `personSchema` (exact lower-case enum) or `normalizePerson`; catch `ZodError` and `PersonParseError` → 400.
3. Party handler: person + `normalizeEmail` + `normalizeE164` in one transaction (`#party-and-platform-compose`).
4. Lists: sort by `family_name, given_name`; return `displayName` + `sortName` computed, never persisted.
5. Gender optional by default; collect only with a business reason.

## Do not

- Store `full_name` strings or formatted output.
- Put company/legal names in `Person`.
- Import phone/email/address into person code — compose in the app.
