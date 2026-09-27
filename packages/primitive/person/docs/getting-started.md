# Getting started

```bash
pnpm add @eristack/person
```

```ts
import {
  normalizePerson,
  formatPersonDisplay,
  formatPersonSortable,
  GENDER_IDENTITIES,
} from "@eristack/person";

const person = normalizePerson({
  name: { given: "Ada", family: "Lovelace", prefix: "Ms" },
  gender: "woman",
});

formatPersonDisplay(person); // "Ms Ada Lovelace"
formatPersonSortable(person); // "Lovelace, Ada"
```

## Zod

```ts
import { personSchema } from "@eristack/person/zod";

personSchema.parse(body);
```

## Works with

| Package | Role |
| --- | --- |
| `@eristack/contact` | Channels reference `personId` FK + formatted display |
| `@eristack/entity-id` | Person row PK |

Party normalize handler: `#party-and-platform-compose`.
