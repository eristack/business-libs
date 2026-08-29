---
name: uom-core
description: >
  @eristack/uom fixed-ratio unit conversion with string decimal amounts — kg/g/L/pcs
  and custom units. Use for inventory qty before qups or stock-movement, not float math.
metadata:
  author: eristack
  version: "0.1"
sources:
  - packages/primitive/uom/docs/index.md
---

# @eristack/uom

String-first `{ amount, unit }` quantities with **fixed-ratio conversion** within mass/volume/count/length.

```ts
import { uomQty, convertUom } from "@eristack/uom";

convertUom(uomQty("1.5", "kg"), "g"); // { amount: "1500", unit: "g" }
```

## Checklist

1. Store amount + unit as strings in Drizzle — no silent `Number()`.
2. `registerUomDefinitions` at bootstrap for app-specific units (box, pallet).
3. `convertUom` at receive/issue boundaries; QUPS keeps line math in `@eristack/qups`.
4. Validate API JSON with `@eristack/uom/zod` — then `convertUom` for catalog errors.
5. Cross-dimension (kg → L) is **app density** — uom throws; do not hack around it.

## Built-in units

`mg`, `g`, `kg`, `t`, `mL`, `L`, `pcs`, `ea`, `mm`, `m` — see docs catalog table.

## Do not

- Use JS number literals for amounts
- Replace `@eristack/qups` line calculator
- Expect BPM or dimensional analysis beyond fixed ratios
