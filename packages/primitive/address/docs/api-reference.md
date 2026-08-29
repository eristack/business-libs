# API reference

## Types

| Export | Description |
| --- | --- |
| `PostalAddress` | `{ line1, line2?, locality, region?, postalCode?, countryCode }` |
| `CountryCode` | ISO 3166-1 alpha-2 string |
| `RegionCode` | ISO 3166-2 subdivision when known |
| `AddressFormatOptions` | `{ separator? }` for one-line format |

## Core API

| Export | Description |
| --- | --- |
| `normalizeCountryCode(code)` | Trim, uppercase, validate alpha-2 |
| `normalizeAddress(input)` | Trim fields, normalize country |
| `formatAddressOneLine(address, options?)` | Comma-separated single line |
| `formatAddressLines(address)` | Array for invoice/print blocks |
| `isSameCountry(a, b)` | Compare normalized country codes |
| `AddressParseError` | Invalid country code |

## Zod (`@eristack/address/zod`)

| Export | Description |
| --- | --- |
| `countryCodeSchema` | Two-letter country |
| `postalAddressSchema` | Full address object |
| `PostalAddressJson` | Inferred JSON type |

## Boundaries

No exports for geocoding, country name lookup, or postal authority validation. App owns partner tables and Drizzle columns.
