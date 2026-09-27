---
name: person-core
description: >
  @eristack/person normalizePerson, formatPersonDisplay/Sortable, GENDER_IDENTITIES,
  personSchema — Wave 13 party spine. Compose with phone/email/contact at app boundary.
metadata:
  author: eristack
  version: "0.0"
sources:
  - packages/primitive/person/docs/getting-started.md
---

# @eristack/person

```ts
import { normalizePerson, formatPersonDisplay } from "@eristack/person";

const person = normalizePerson({
  name: { given: "Ada", family: "Lovelace" },
  gender: "woman",
});
formatPersonDisplay(person);
```

## Checklist

1. `normalizePerson` on every write — trim given/family, validate gender.
2. `gender: "other"` requires `genderOther` text.
3. Lists: `formatPersonSortable` — "Family, Given".
4. Compose with `@eristack/phone`, `@eristack/email-address`, `@eristack/contact` — **no imports between packages**.
5. Load `#party-and-platform-compose` for handler snippet.

## Do not

- Store display strings instead of structured `Person`
- Use for legal entity names — app org master
