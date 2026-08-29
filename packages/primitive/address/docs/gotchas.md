# Gotchas

## Country code length

Only **ISO alpha-2** — `"USA"`, `"IND"`, numeric codes throw `AddressParseError`. Map legacy data in migrations before calling `normalizeAddress`.

## Normalize on write, not only on read

If you skip normalize at insert, DB may contain lowercase `"id"` and trailing spaces — reports and `isSameCountry` still work if you normalize on read, but canonical storage avoids drift.

## region without validation

`US-CA` in `region` with `countryCode: "ID"` is not rejected. Add app-level checks when region drives tax or compliance.

## formatAddressOneLine is not locale-aware

Order is fixed: line1, line2, locality, region, postalCode, country. Japanese or German postal conventions may need app-specific formatters for customer-facing PDFs — use this package for internal canonical strings.

## Empty optional strings

`line2: ""` becomes `undefined` after normalize. Forms that distinguish "not provided" vs "cleared" should omit the key or send null at API layer before Zod parse.

## Zod country case

`countryCodeSchema` accepts `"id"` or `"ID"`. Always call `normalizeAddress` after parse for uppercase storage.

## No deduplication

Two normalize-identical addresses are still two rows — dedupe keys (hash of normalized JSON) are app-owned.

## Required fields after trim

`normalizeAddress` throws **`AddressParseError`** when `line1` or `locality` is empty or whitespace-only after trim — validate before Drizzle insert. and deliverability

Invalid street names pass through. Shipping integration validates elsewhere — do not assume normalize implies mailable.

## Partner vs one-time ship-to

Same types for both. Remit-to addresses may omit `region`/`postalCode` when not used — optional fields exist for that reason.
