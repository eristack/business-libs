# Conversion

## convertUom

```ts
import { convertUom, uomQty } from "@eristack/uom";

convertUom(uomQty("2.5", "kg"), "g");
// { amount: "2500", unit: "g" }
```

Returns new `UomQuantity` — does not mutate input.

## Errors

`UomConversionError` when:

- Unknown unit code
- Invalid amount string
- Cross-dimension conversion (`kg` → `L`)

Catch at API boundary and map to `400` validation error.

## Rounding

Conversion uses `decimal.js` `toFixed()` default precision. For display rounding, format in UI layer. For ledger qty boundaries, round **after** conversion in app policy (e.g. 3 decimal places for kg).

## Identity conversion

`convertUom(qty, qty.unit)` returns normalized amount — useful after parsing messy input.

## Performance

Registry lookup is O(1). Safe for per-line conversion in large grids — still prefer batching DB reads over per-row convert in hot paths.

## uomQty validation

```ts
uomQty("  1.5  ", "kg"); // normalizes
uomQty("", "kg");        // throws
uomQty("abc", "kg");     // throws
```

Negative amounts are not rejected at primitive layer — app policy may forbid negative stock.
