---
name: iso-3166-core
description: >
  @eristack/iso-3166 assigned ISO 3166-1 alpha-2/alpha-3 and ISO 3166-2 subdivision
  normalization. Use when validating country codes beyond two-letter format — not
  for postal address shape (address) or port codes (unlocode).
metadata:
  type: core
  library: "@eristack/iso-3166"
  library_version: "0.1.0"
sources:
  - "eristack/business-libs:packages/registries/iso-3166/docs/getting-started.md"
---

# ISO 3166 registry

```ts
import {
  normalizeAlpha2,
  alpha3ToAlpha2,
  normalizeSubdivisionCode,
  isAssignedAlpha2,
} from "@eristack/iso-3166";
```

- **`normalizeAlpha2`** — assigned alpha-2 only; throws `CountryCodeError`
- **`alpha3ToAlpha2` / `alpha2ToAlpha3`** — ISO 3166-1 conversions
- **`normalizeSubdivisionCode(country, sub)`** — `ID-JK` form; prefix must match country
- **`@eristack/address`** — postal fields; add iso-3166 when API must reject unassigned codes

Zod: `@eristack/iso-3166/zod` — `countryAlpha2Schema`, `countryAlpha3Schema`
