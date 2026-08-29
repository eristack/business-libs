# Zod

Peer dependency `zod ^4`.

```bash
pnpm add @eristack/uom @eristack/uom/zod zod
```

## Schemas

```ts
import { uomQuantitySchema, uomCodeSchema } from "@eristack/uom/zod";

const line = uomQuantitySchema.parse({
  amount: "10",
  unit: "kg",
});
```

| Schema | Validates |
| --- | --- |
| `uomCodeSchema` | Non-empty unit code string (max 16) |
| `uomQuantitySchema` | `{ amount, unit }` object |

## REST handler

```ts
const qty = uomQuantitySchema.parse(body.receivedQty);
const inStockUom = convertUom(qty, product.stockUom);
```

Zod validates shape only — call `assertKnownUom` or `convertUom` for catalog membership.

## Type export

`UomQuantityJson` — inferred JSON type for OpenAPI / client codegen.
