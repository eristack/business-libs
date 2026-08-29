# Zod

Peer dependency `zod ^4`.

```bash
pnpm add @eristack/address @eristack/address/zod zod
```

## Schemas

```ts
import { postalAddressSchema, countryCodeSchema } from "@eristack/address/zod";

const shipTo = postalAddressSchema.parse({
  line1: "Jl. Sudirman 1",
  locality: "Jakarta",
  countryCode: "ID",
});
```

| Schema | Validates |
| --- | --- |
| `countryCodeSchema` | Two letters (any case — normalize after parse) |
| `postalAddressSchema` | Full address; `line1` and `locality` min length 1 |

## REST handler

```ts
import { normalizeAddress } from "@eristack/address";
import { postalAddressSchema } from "@eristack/address/zod";

const body = postalAddressSchema.parse(req.body.address);
const address = normalizeAddress(body); // uppercase country, trim
await db.update(partners).set({ shipTo: address }).where(eq(partners.id, id));
```

Zod validates shape — `normalizeAddress` applies canonical trim and country uppercase.

## Type export

`PostalAddressJson` — inferred JSON type for OpenAPI / client codegen from `@eristack/address/zod`.

Core type `PostalAddress` is exported from `@eristack/address` — use after normalize for domain logic.

## Optional fields

Zod allows omitted `line2`, `region`, `postalCode`. Empty strings fail `min(1)` on required fields only — send omit or non-empty strings from clients.
