---
title: Getting started
description: Persist Dimension triples in Drizzle, validate with dimensionSchema, compute volumetric weight with a carrier divisor, convert units through @eristack/uom, and run bin fit checks — all with decimal strings.
---

# Getting started

## Install

```bash
pnpm add @eristack/dimension
```

## Normalise at the boundary

```ts
import { normalizeDimension, DimensionParseError } from "@eristack/dimension";

try {
  const dims = normalizeDimension({ length: body.l, width: body.w, height: body.h, unit: "cm" });
  await db.insert(skuPackaging).values({ skuId, level: "carton", ...dims });
} catch (e) {
  if (e instanceof DimensionParseError) return res.status(400).json({ code: e.code, message: e.message });
  throw e;
}
```

## Drizzle columns

```ts
import { numeric, pgTable, text } from "drizzle-orm/pg-core";
import { entityIdColumn } from "@eristack/entity-id/drizzle";

export const skuPackaging = pgTable("sku_packaging", {
  id: entityIdColumn("pgsql", "id").primaryKey(),
  skuId: text("sku_id").notNull(),
  level: text("level").notNull(),                       // "each" | "inner" | "carton" | "pallet"
  length: numeric("length", { precision: 12, scale: 4 }).notNull(),
  width: numeric("width", { precision: 12, scale: 4 }).notNull(),
  height: numeric("height", { precision: 12, scale: 4 }).notNull(),
  unit: text("unit").notNull(),                          // validated against your uom master
});
```

`numeric` round-trips as strings. Keep `unit` **not null** in your table even though the primitive makes it optional — mixed-unit rows are the classic bug.

## Zod

```ts
import { dimensionSchema } from "@eristack/dimension/zod";
import { DimensionParseError } from "@eristack/dimension";

const bodySchema = z.object({ skuId: z.string(), carton: dimensionSchema });

try {
  const { carton } = bodySchema.parse(req.body);          // carton is normalised
} catch (e) {
  if (e instanceof DimensionParseError) return res.status(400).json({ code: e.code, message: e.message });
  if (e instanceof z.ZodError) return res.status(400).json({ code: "VALIDATION", issues: e.issues });
  throw e;
}
```

## Volumetric weight (carrier rating)

Carriers divide cm³ by a divisor (5000 or 6000) to get kg:

```ts
import { dimensionVolume } from "@eristack/dimension";
import Decimal from "decimal.js";

const cm3 = dimensionVolume(carton, { scale: 0 });                       // "72000"
const volumetricKg = new Decimal(cm3).div(5000).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toFixed(2); // "14.40"
const chargeableKg = Decimal.max(volumetricKg, actualKg).toFixed(2);
```

The divisor is a carrier/contract rule — keep it in the app's rate table, not in the primitive.

## Units via @eristack/uom

Compare or sum dimensions given in different units by converting the **sides** first:

```ts
import { convertUom } from "@eristack/uom";                         // fixed-ratio, string decimals
import { normalizeDimension } from "@eristack/dimension";

function toCm(d: Dimension): Dimension {
  if (d.unit === "cm") return d;
  const side = (v: string) => convertUom({ amount: v, unit: d.unit! }, "cm").amount;
  return normalizeDimension({ length: side(d.length), width: side(d.width), height: side(d.height), unit: "cm" });
}
```

Validate `unit` against your uom catalog at write time; the primitive only trims it.

## Fit check

Does a carton fit a bin (any orientation)?

```ts
import Decimal from "decimal.js";

function fits(item: Dimension, bin: Dimension): boolean {
  const sort = (d: Dimension) => [d.length, d.width, d.height].map((s) => new Decimal(s)).sort((a, b) => a.cmp(b));
  const [i1, i2, i3] = sort(toCm(item));
  const [b1, b2, b3] = sort(toCm(bin));
  return i1.lte(b1) && i2.lte(b2) && i3.lte(b3);
}
```

## Multi-level packaging

```ts
const levels = await db.select().from(skuPackaging).where(eq(skuPackaging.skuId, skuId));
for (const lvl of levels) console.log(lvl.level, formatDimension(lvl), dimensionVolume(lvl, { scale: 2 }));
// each   10 × 8 × 5 cm   400.00
// carton 60 × 40 × 30 cm 72000.00
```

## Gotchas

- Zero or negative sides throw (`must be a positive finite number`); a "flat" item still needs `height: "0.1"`, not `"0"`.
- `normalizeDimension` output is unpadded (`"60"`), `dimensionVolume` output is padded to `scale` (`"72000.000000"`) — compare with `Decimal`, not `===`.
- `unit` is a label; `"CM"` and `"cm"` are different strings here. Normalise case through your uom catalog.
- Volume unit is `unit³`; converting cm³ → L (÷1000) or m³ (÷1,000,000) is a uom concern.
- The `×` in `formatDimension` is U+00D7 — fine for UI, but use your own formatter for CSV/EDI that expects ASCII `x`.

## Testing

```ts
import { dimensionVolume, formatDimension, normalizeDimension, DimensionParseError } from "@eristack/dimension";
import { expect, it } from "vitest";

it("normalises, formats, measures", () => {
  const d = normalizeDimension({ length: "1.50", width: "2", height: "3", unit: " m " });
  expect(d).toEqual({ length: "1.5", width: "2", height: "3", unit: "m" });
  expect(formatDimension(d)).toBe("1.5 × 2 × 3 m");
  expect(dimensionVolume(d, { scale: 2 })).toBe("9.00");
  expect(() => normalizeDimension({ length: "0", width: "1", height: "1" })).toThrow(DimensionParseError);
});
```

## Works with

| Package | Role |
| --- | --- |
| `@eristack/uom` | App picks canonical unit codes and converts sides; dimension stores the label only |
| `@eristack/money` | Volumetric pricing in the app — `Money.of(rate).multiply(volume)` |

Load recipe **`dimension-logistics`** when wiring carton sizes on product or shipment rows.
