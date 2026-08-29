# Country & regions

## ISO 3166-1 alpha-2 country codes

`countryCode` must be **exactly two letters** (ASCII). `normalizeCountryCode`:

- Trims whitespace
- Uppercases (`id` → `ID`)
- Throws `AddressParseError` if not `/^[A-Z]{2}$/` after normalize

```ts
import { normalizeCountryCode } from "@eristack/address";

normalizeCountryCode("  de "); // "DE"
normalizeCountryCode("USA");   // throws — use "US"
normalizeCountryCode("123");   // throws
```

Store **codes** in Drizzle, not display names. Country labels belong in app i18n (`ID` → "Indonesia" / "Indonesien").

## isSameCountry

Compare two addresses (or partial inputs) without full normalize:

```ts
import { isSameCountry } from "@eristack/address";

isSameCountry(
  { line1: "A", locality: "X", countryCode: "us" },
  { line1: "B", locality: "Y", countryCode: "US" },
); // true
```

Use for:

- Domestic vs export tax rules
- Freight zone selection
- Filtering partners by market

## Region (subdivision) field

`region` is optional `RegionCode` — conventionally **ISO 3166-2** (`US-CA`, `GB-ENG`, `ID-JK`).

The library:

- Trims and drops empty region on normalize
- Does **not** validate that region belongs to country
- Does **not** expand region to full state name

App responsibilities:

- Validate region against a lookup table when required (e.g. US/CA sales tax)
- Leave `region` undefined for countries where subdivision is not collected
- Keep region as string in forms/API — no enum in core (apps vary by rollout)

## postalCode

Optional string — formats differ globally (`90210`, `SW1A 1AA`, `10110`). `@eristack/address` trims only. Add per-country validators in app services if needed.

## Formatting and country placement

`formatAddressLines` always puts **country code on its own last line** — common on international invoices:

```text
Jl. Sudirman 1
Jakarta ID-JK 10110
ID
```

`formatAddressOneLine` appends country last with default `", "` separator:

```text
Jl. Sudirman 1, Jakarta, ID-JK, 10110, ID
```

Override separator for localized single-line labels:

```ts
formatAddressOneLine(address, { separator: " · " });
```

## Multi-address partners

ERP partners often have bill-to, ship-to, and remit-to. Each row is a `PostalAddress` — same normalize/format pipeline. `isSameCountry` helps when bill-to country drives tax but ship-to drives freight.

## What we deliberately omit

- CLDR or UN country name lists
- Geocoding / lat-long
- Automatic reordering of lines for JP vs US locale beyond the fixed line builder

Those stay in app or future adapter packages so core stays cheap to integrate.
