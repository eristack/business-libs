# Gotchas

## Negative amounts

`uomQty` **rejects negative** amounts. Use absolute qty with uom; apply sign in stock-movement or app ledger.

## Cross-dimension conversion

No kg ↔ L without app density table. uom will throw — implement in app service layer.

## Float literals

```ts
uomQty(1.5, "kg"); // wrong — use uomQty("1.5", "kg")
```

## Unknown codes at runtime

Register custom units before handling requests. Seed registry in same module as Drizzle migrations for new UOM codes.

## QUPS integration

QUPS line qty fields stay strings. Use uom to normalize UOM before `calculateLine` when PO UOM ≠ stock UOM — convert qty, not unit price.

## ea vs pcs

Both are count dimension with factor 1 — interchangeable for conversion; pick one canonical code per app for reporting.

## Overriding built-ins

`registerUomDefinitions` replaces by code — avoid changing `toBaseFactor` for built-in codes in production; migrate data instead.
