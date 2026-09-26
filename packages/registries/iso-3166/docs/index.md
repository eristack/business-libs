# @eristack/iso-3166

**Registries layer** — assigned ISO 3166-1 country codes and ISO 3166-2 subdivision **format** rules.

## When to use

- Validate API `countryCode` against the **assigned** alpha-2 list (not just two letters)
- Convert alpha-3 ↔ alpha-2 for integrations (SWIFT, customs, legacy feeds)
- Normalize `US-CA` / `ID-JK` subdivision ids before Drizzle insert

## When not to use

- **Postal address shape** — `@eristack/address` (format-only country uppercase there; strict assignment here)
- **Country display names or full subdivision membership** — app i18n or `@eristack/reference-data` (planned)
- **UN/LOCODE ports** — `@eristack/unlocode` (planned)

## Exports

```text
@eristack/iso-3166          normalizeAlpha2, alpha3ToAlpha2, normalizeSubdivisionCode, …
        └── /zod             countryAlpha2Schema, countryAlpha3Schema
```

Next: [Getting started](./getting-started.md).
