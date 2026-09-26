---
title: ISO 3166
description: Assigned ISO 3166-1/2 country and subdivision codes — validate, normalize, alpha-3 convert.
---

# @eristack/iso-3166

**Registries layer** — assigned ISO 3166-1 country codes and ISO 3166-2 subdivision **format** rules.

## When to use

- Validate API `countryCode` against the **assigned** alpha-2 list (not just two letters)
- Convert alpha-3 ↔ alpha-2 for integrations (SWIFT, customs, legacy feeds)
- Normalize `US-CA` / `ID-JK` subdivision ids before Drizzle insert
- Country prefix checks for [`@eristack/unlocode`](/docs/unlocode) port codes

## When not to use

- **Postal address shape** — `@eristack/address` (format-only country uppercase there; strict assignment here)
- **Country display names or full subdivision membership** — app i18n or `@eristack/reference-data` (planned)
- **Currency metadata** — `@eristack/money` for amounts; `@eristack/iso-4217` (planned) for ISO 4217 fields

## Exports

| Import | Role |
| --- | --- |
| `@eristack/iso-3166` | `normalizeAlpha2`, `alpha3ToAlpha2`, `normalizeSubdivisionCode`, … |
| `@eristack/iso-3166/zod` | `countryAlpha2Schema`, `countryAlpha3Schema` |

Next: [Getting started](./getting-started.md) · [Concepts](./concepts.md)
