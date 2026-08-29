---
name: address-core
description: >
  @eristack/address normalized PostalAddress with ISO alpha-2 country codes — trim,
  formatAddressOneLine/Lines, isSameCountry. App owns partner tables; no geocoding.
metadata:
  author: eristack
  version: "0.1"
sources:
  - packages/primitive/address/docs/index.md
---

# @eristack/address

String-first **postal addresses** — trim on normalize, **ISO 3166-1 alpha-2** country codes uppercased.

```ts
import { normalizeAddress, formatAddressOneLine } from "@eristack/address";

const addr = normalizeAddress({ line1: "Jl. Sudirman 1", locality: "Jakarta", countryCode: "id" });
formatAddressOneLine(addr); // "Jl. Sudirman 1, Jakarta, ID"
```

## Checklist

1. `normalizeAddress` on every write to Drizzle — canonical uppercase country + trimmed fields.
2. `postalAddressSchema` from `@eristack/address/zod` on APIs — normalize after parse.
3. `formatAddressLines` for invoice PDFs; `formatAddressOneLine` for shipping labels.
4. Tax/freight: `isSameCountry(billTo, shipTo)` — app owns rate tables.
5. Optional `region` (ISO 3166-2) — validate subdivision in app when required.

## Exports

`normalizeAddress`, `normalizeCountryCode`, `formatAddressOneLine`, `formatAddressLines`, `isSameCountry`, `AddressParseError`, `PostalAddress` type, `./zod` `postalAddressSchema`.

## Do not

- Store display country names in place of codes
- Pass `"USA"` — alpha-2 only (`US`)
- Expect geocoding or postal authority validation in core
- Reinvent trim/uppercase — use exported normalize helpers
