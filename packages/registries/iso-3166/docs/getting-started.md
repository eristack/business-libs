---
title: Getting started
description: Install, validate country codes on API input, subdivisions, Zod, and address pairing.
---

# Getting started

## Install

```bash
pnpm add @eristack/iso-3166
```

Optional Zod 4:

```bash
pnpm add zod
```

## 1. Validate country on API input

```ts
import { normalizeAlpha2 } from "@eristack/iso-3166";

export function parseCountryQuery(raw: string) {
  return normalizeAlpha2(raw); // throws CountryCodeError when unassigned
}
```

Use on write paths (forms, imports) — not only on read — so bad codes never reach Postgres.

## 2. Alpha-3 legacy feed

```ts
import { alpha3ToAlpha2 } from "@eristack/iso-3166";

const country = alpha3ToAlpha2(row.countryAlpha3); // "IDN" → "ID"
```

## 3. Subdivision (ISO 3166-2 shape)

```ts
import { normalizeSubdivisionCode } from "@eristack/iso-3166";

const region = normalizeSubdivisionCode("ID", "jk"); // "ID-JK"
```

The library checks **format + country prefix**, not whether `ID-JK` exists in the official subdivision table (use `@eristack/reference-data` later for membership).

## 4. With @eristack/address

`@eristack/address` uppercases any two-letter country. Use **iso-3166** when you need **assigned-code** validation:

```ts
import { normalizeAddress } from "@eristack/address";
import { normalizeAlpha2 } from "@eristack/iso-3166";

const countryCode = normalizeAlpha2(input.countryCode);
const addr = normalizeAddress({ ...input, countryCode });
```

## 5. Zod on HTTP bodies

```ts
import { countryAlpha2Schema } from "@eristack/iso-3166/zod";

countryAlpha2Schema.parse("id"); // "ID"
```

## Related packages

| Need | Package |
| --- | --- |
| UN/LOCODE ports | `@eristack/unlocode` |
| Bulk country/port seeds | `@eristack/reference-data` (planned) |
