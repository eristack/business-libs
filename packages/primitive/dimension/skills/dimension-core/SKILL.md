---
name: dimension-core
description: >
  @eristack/dimension Dimension { length, width, height, unit? } positive decimal strings:
  normalizeDimension (trim, positive finite, canonical toFixed, unit label trimmed,
  DimensionParseError code DIMENSION_PARSE_ERROR), dimensionVolume (L×W×H HALF_UP to scale
  default 6, padded), formatDimension "L × W × H unit", zod dimensionSchema. Use for SKU
  packaging levels, parcel/pallet dims, volumetric weight, bin fit; unit conversion via
  @eristack/uom in the app. Drizzle numeric columns.
metadata:
  author: eristack
  version: "0.1"
  type: core
  library: "@eristack/dimension"
sources:
  - packages/primitive/dimension/docs/getting-started.md
---

# @eristack/dimension

Three sides + a label; volume with explicit scale.

```ts
import { normalizeDimension, dimensionVolume, formatDimension, DimensionParseError } from "@eristack/dimension";

const box = normalizeDimension({ length: "60.0", width: "40", height: "30", unit: " cm " }); // { "60","40","30","cm" }
dimensionVolume(box, { scale: 0 });   // "72000"  (cm³)
formatDimension(box);                 // "60 × 40 × 30 cm"
new Decimal(dimensionVolume(box, { scale: 0 })).div(5000).toFixed(2);   // volumetric kg — divisor is a carrier rule
```

## Checklist

1. `normalizeDimension` on every write; Drizzle `numeric(12,4)` sides + `unit text NOT NULL`.
2. Validate/convert `unit` through `@eristack/uom` (`convertUom` per side) before comparing across units.
3. Zod transform throws `DimensionParseError` (not ZodError) — catch both → 400.
4. Compare volumes with `Decimal`, not `===` (normalize output unpadded, volume padded).
5. Sides must be > 0 — flat items use a small positive height.

## Do not

- Import `@eristack/uom` into this package or convert units here.
- Use `Number()` on sides or volume.
- Put carrier divisors or dim-weight rules in the primitive.
