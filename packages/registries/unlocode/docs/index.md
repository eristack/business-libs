---
title: UN/LOCODE
description: Five-character trade location codes — normalize, parse, display; country via iso-3166.
---

# @eristack/unlocode

**Registries layer** — UN/LOCODE (United Nations Code for Trade and Transport Locations).

## When to use

- Validate `portOfLoading` / `portOfDischarge` on bills of lading, forwarding jobs, cost sheets
- Normalize user input (`ID JKT` → `IDJKT`) before Drizzle insert
- Extract country from locode (first two chars validated via `@eristack/iso-3166`)

## When not to use

- **Your company's enabled ports master** — app table + data-grid (which locodes you operate)
- **Full UN/LOCODE database** — `@eristack/reference-data` (planned) for bulk seeds
- **Geographic coordinates** — `@eristack/geo` (planned primitive)

## Depends on

`@eristack/iso-3166` — country prefix must be an assigned alpha-2 code.

## Exports

| Import | Role |
| --- | --- |
| `@eristack/unlocode` | `normalizeUnlocode`, `parseUnlocode`, `formatUnlocodeDisplay`, `isSampleUnlocode` |
| `@eristack/unlocode/zod` | `unlocodeSchema` |

Next: [Getting started](./getting-started.md) · [Concepts](./concepts.md)
