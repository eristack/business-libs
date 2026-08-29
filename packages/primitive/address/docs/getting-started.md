# Getting started

Normalize postal addresses and format for labels or print.

## Install

```bash
pnpm add @eristack/address
```

## Normalize and format

```ts
import {
  normalizeAddress,
  formatAddressOneLine,
  formatAddressLines,
} from "@eristack/address";

const raw = {
  line1: "  Jl. Sudirman 1  ",
  locality: "Jakarta",
  countryCode: "id",
};

const address = normalizeAddress(raw);
// { line1: "Jl. Sudirman 1", locality: "Jakarta", countryCode: "ID", ... }

formatAddressOneLine(address);
// "Jl. Sudirman 1, Jakarta, ID"

formatAddressLines(address);
// ["Jl. Sudirman 1", "Jakarta", "ID"]
```

`normalizeAddress` trims strings, drops empty optionals, and uppercases `countryCode` via `normalizeCountryCode`.

## Country code only

```ts
import { normalizeCountryCode } from "@eristack/address";

normalizeCountryCode("us"); // "US"
```

Invalid codes (not exactly two letters) throw `AddressParseError`.

## Zod on APIs

```ts
import { postalAddressSchema } from "@eristack/address/zod";

const body = postalAddressSchema.parse(req.body.shipTo);
const shipTo = normalizeAddress(body);
await db.insert(partnerAddresses).values({ ...shipTo, partnerId });
```

## Production path

1. Store address fields as text columns in Drizzle (JSON column optional for `{ line1, … }`).
2. **Always** `normalizeAddress` on write (create/update) — canonical form in DB.
3. Use `formatAddressOneLine` for shipping labels; `formatAddressLines` for PDF/print templates.
4. Tax/freight rules: `isSameCountry(billTo, shipTo)` — app owns rate tables; this package only compares codes.

## Next

- [Concepts](./concepts.md) — PostalAddress fields
- [Country & regions](./country-and-regions.md) — ISO alpha-2 and optional region
- [Recipes](./recipes.md) — partner address CRUD
