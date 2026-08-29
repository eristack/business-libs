# @eristack/uom

Unit-of-measure quantities with fixed-ratio conversion — string decimal amounts for ERP inventory and line qty.

```ts
import { uomQty, convertUom } from "@eristack/uom";

convertUom(uomQty("1.5", "kg"), "g"); // { amount: "1500", unit: "g" }
```

Docs: [packages/primitive/uom/docs/index.md](./docs/index.md)
