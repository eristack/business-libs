# Getting started

Convert quantities with string decimals — no float literals.

## Install

```bash
pnpm add @eristack/uom
```

## First conversion

```ts
import { uomQty, convertUom } from "@eristack/uom";

const orderLine = uomQty("1.5", "kg");
const stockQty = convertUom(orderLine, "g");
// { amount: "1500", unit: "g" }
```

## Custom unit (app bootstrap)

```ts
import { registerUomDefinitions, uomQty, convertUom } from "@eristack/uom";

registerUomDefinitions([
  { code: "box", dimension: "count", toBaseFactor: "12", label: "Box of 12 ea" },
]);

convertUom(uomQty("2", "box"), "pcs"); // { amount: "24", unit: "pcs" }
```

## Zod on APIs

```ts
import { uomQuantitySchema } from "@eristack/uom/zod";

const body = uomQuantitySchema.parse(req.body.qty);
```

## Production path

1. Store `amount` + `unit` as text columns in Drizzle (or numeric decimal + text unit).
2. Convert at boundaries (PO receive, pick list) with `convertUom`.
3. Keep QUPS line math in `@eristack/qups` — uom only normalizes qty UOM.

## Next

- [Catalog & dimensions](./catalog-and-dimensions.md) — built-in units
- [Conversion](./conversion.md) — errors and rounding
- [Recipes](./recipes.md) — receive flow, stock on hand
