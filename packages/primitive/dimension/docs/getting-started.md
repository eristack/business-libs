---
title: Getting started
description: Load recipe dimension-logistics when wiring carton sizes on product or shipment rows.
---

# Getting started

```bash
pnpm add @eristack/dimension
```

```ts
import {
  normalizeDimension,
  dimensionVolume,
  formatDimension,
} from "@eristack/dimension";

const box = normalizeDimension({
  length: "60",
  width: "40",
  height: "30",
  unit: "cm",
});

formatDimension(box); // "60 × 40 × 30 cm"
dimensionVolume(box); // "72000.000000" (cm³ if sides are cm)
```

## Zod

```ts
import { dimensionSchema } from "@eristack/dimension/zod";

dimensionSchema.parse(body);
```

## Works with

| Package | Role |
| --- | --- |
| `@eristack/uom` | App picks canonical unit codes; dimension stores optional label only |
| `@eristack/percent` / `@eristack/money` | Not used in core — format weights/prices in the app |

Load recipe **`dimension-logistics`** when wiring carton sizes on product or shipment rows.
