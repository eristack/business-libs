---
title: Overview
description: Length × width × height as positive decimal strings with an optional unit label — normalise once, compute cubic volume at an explicit scale, format for display, validate with Zod. Unit conversion stays in @eristack/uom.
---

# @eristack/dimension

Carton sizes, pallet footprints, product packaging, and shipment parcels are all an L×W×H triple. Stored as floats they multiply into `72000.00000000001`; stored as three unrelated columns they get mixed units. `@eristack/dimension` fixes the **shape**: a `Dimension` is three positive decimal strings plus an optional `unit` label, normalised once, with volume computed in `decimal.js` and rounded to a scale you choose.

It deliberately does **not** convert units or validate the label — that is `@eristack/uom`'s job, composed at the app boundary so this primitive has no sibling dependencies.

## Use it when

- Product master: package dimensions per SKU / per packaging level.
- Shipments: parcel or pallet dims for volumetric weight and carrier rating.
- Warehouse: bin/slot sizes for fit checks.

## Not for

- Converting cm ↔ in or cm³ ↔ L — `@eristack/uom` (`convertUom`).
- Weight — a single `uom` quantity, not a dimension.
- Irregular shapes or dimensional-weight divisors — app rules (carrier-specific).

## Install

```bash
pnpm add @eristack/dimension
pnpm add zod        # only for @eristack/dimension/zod
```

No `@eristack/*` peers.

## 30-second example

```ts
import { normalizeDimension, dimensionVolume, formatDimension } from "@eristack/dimension";

const box = normalizeDimension({ length: "60.0", width: "40", height: "30", unit: " cm " });
// → { length: "60", width: "40", height: "30", unit: "cm" }

dimensionVolume(box);               // "72000.000000"   (6 dp default; cm³ if sides are cm)
dimensionVolume(box, { scale: 0 }); // "72000"
formatDimension(box);               // "60 × 40 × 30 cm"
```

## API

| Export | Signature | Notes |
| --- | --- | --- |
| `normalizeDimension` | `(input: Dimension) => Dimension` | Trims each side, parses via `decimal.js`, requires **positive finite** values, returns canonical `toFixed()` strings (no trailing zeros); `unit` trimmed, dropped when blank. Throws `DimensionParseError`. |
| `dimensionVolume` | `(d: Dimension, { scale? = 6 }) => string` | `L × W × H`, `ROUND_HALF_UP` to `scale`, zero-padded. Unit of result is `unit³` — you label it. |
| `formatDimension` | `(d: Dimension) => string` | `"L × W × H"` + `" unit"` when present (U+00D7 multiplication sign). |
| `DimensionParseError` | `class extends Error { code: "DIMENSION_PARSE_ERROR" }` | Messages: `length is required`, `length must be a decimal string`, `length must be a positive finite number` (same for width/height). |
| `Dimension` | `{ length: string; width: string; height: string; unit?: string }` | |
| `DimensionVolumeOptions` | `{ scale?: number }` | |
| `@eristack/dimension/zod` → `dimensionSchema` | `z.object({ length, width, height: z.string(), unit: z.string().optional() }).transform(normalizeDimension)` | Transform throws `DimensionParseError` on bad values. |

## Works with

- `@eristack/uom` — validate `unit` against your unit master and convert sides before comparing dimensions in different units.
- `@eristack/stock-movement` / product tables — store the normalised triple + `unit` on packaging rows.
- `@eristack/geo` — route distance × freight volume for rate cards, composed in the app.
- `@eristack/money` — volumetric price = `Money.of(rate).multiply(volume)` in the app.

## For agents

- Skill: `pnpm dlx @tanstack/intent@latest load @eristack/dimension#dimension-core`
- Recipe: `dimension-logistics`. Measure composition: `@eristack/ai-knowledge#party-and-platform-compose`.

## Next

- [Getting started](./getting-started.md) — Drizzle columns, Zod handling, volumetric weight with uom conversion, fit checks, and multi-level packaging.
