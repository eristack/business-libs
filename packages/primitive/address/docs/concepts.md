# Concepts

## PostalAddress

```ts
type PostalAddress = {
  line1: string;
  line2?: string;
  locality: string;
  region?: RegionCode;
  postalCode?: string;
  countryCode: CountryCode;
};
```

| Field | Required | Notes |
| --- | --- | --- |
| `line1` | yes | Street / building — trimmed on normalize |
| `line2` | no | Suite, floor — omitted when empty after trim |
| `locality` | yes | City or town |
| `region` | no | ISO 3166-2 when known, e.g. `US-CA`, `ID-JK` |
| `postalCode` | no | App validates format per country if needed |
| `countryCode` | yes | ISO 3166-1 alpha-2, uppercased on normalize |

All values are **strings**. No structured street parsing — apps that need it layer validation on top.

## Normalization

`normalizeAddress`:

1. Trims all present string fields
2. Converts empty optional strings to `undefined`
3. Uppercases `countryCode` through `normalizeCountryCode`

Normalization is **idempotent** — safe to call on read and write.

## Formatting vs storage

- **Storage** — normalized `PostalAddress` in Drizzle
- **Display** — `formatAddressOneLine` (comma-separated default) or `formatAddressLines` (invoice block)

Formatting always normalizes first — callers may pass raw form values.

## CountryCode and RegionCode

Both are typed as `string` with documented conventions:

- `CountryCode` — exactly two ASCII letters after normalize (`US`, `ID`, `DE`)
- `RegionCode` — typically ISO 3166-2 (`US-CA`); library does not validate subdivision membership

## Errors

`AddressParseError` — invalid country code (not alpha-2 after trim/uppercase).

## Boundaries

This package does **not** ship country name lookup, address autocomplete, or USPS/JP postal validation. Export helpers so apps do not duplicate trim + ISO uppercase logic.
