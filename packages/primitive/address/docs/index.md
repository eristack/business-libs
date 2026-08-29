---
title: "@eristack/address"
description: Normalized postal addresses with ISO country codes
sidebar_position: 1
---

# @eristack/address

`@eristack/address` models **postal addresses** for ERP partners, ship-to, bill-to, and print layouts. Fields are **strings** — trim on normalize, **ISO 3166-1 alpha-2** country codes uppercased. No geocoding, no float math.

## When to use it

Use this package when you need:

- Normalize partner/shipping address input before Drizzle insert
- Format one-line labels (shipping docs) or multi-line blocks (invoices)
- Compare country codes for tax or freight rules (`isSameCountry`)
- Validate `{ line1, locality, countryCode, … }` JSON on APIs with Zod 4

## What it is not

- **Not geocoding or validation against postal authorities** — app owns deliverability rules
- **Not a countries database** — country/region **codes** only; labels live in app i18n
- **Not persistence** — Drizzle columns and partner tables are app-owned

## Subpaths

```text
@eristack/address                      core — normalizeAddress, formatAddressOneLine, formatAddressLines
        └── /zod                       postalAddressSchema (peer zod ^4)
```

## Next steps

- [Getting started](./getting-started.md) — normalize and format an address
- [Concepts](./concepts.md) — PostalAddress shape, normalization rules
- [Country & regions](./country-and-regions.md) — ISO codes, region optional fields
- [Zod](./zod.md) — API validation
- [Gotchas](./gotchas.md) — invalid codes, empty optional fields, formatting locale
- [Recipes](./recipes.md) — partner CRUD, invoice ship-to, same-country tax check
- [API reference](./api-reference.md) — exports cheat-sheet
