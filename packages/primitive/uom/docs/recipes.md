# Recipes

## PO receive (convert to stock UOM)

```ts
import { convertUom, uomQty } from "@eristack/uom";

function receiveLine(poLine: { qty: string; uom: string }, product: { stockUom: string }) {
  const received = uomQty(poLine.qty, poLine.uom);
  return convertUom(received, product.stockUom);
}
```

## Stock on hand display

Store canonical qty in warehouse base UOM; convert for UI:

```ts
const onHand = uomQty(row.qty, "g");
const display = convertUom(onHand, userPreferredUom);
```

## QUPS line with alternate UOM

```ts
import { calculateLine } from "@eristack/qups";
import { convertUom, uomQty } from "@eristack/uom";

const qtyInEach = convertUom(uomQty(line.qty, line.uom), "ea");
calculateLine({ ...line, qty: qtyInEach.amount, uom: "ea" });
```

## API validation pipeline

```ts
const qty = uomQuantitySchema.parse(body.qty);
assertKnownUom(qty.unit);
const normalized = convertUom(qty, warehouse.defaultUom);
await db.insert(stockMovements).values({ qty: normalized.amount, uom: normalized.unit });
```
