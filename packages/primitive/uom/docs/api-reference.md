# API reference

## Types

| Export | Description |
| --- | --- |
| `UomCode` | Unit code string |
| `UomDimension` | `mass` \| `volume` \| `count` \| `length` |
| `UomQuantity` | `{ amount, unit }` |
| `UomDefinition` | Catalog entry with `toBaseFactor` |

## Catalog

| Export | Description |
| --- | --- |
| `BUILTIN_UOM` | Default unit definitions |
| `registerUomDefinitions(defs)` | Extend registry |
| `resetUomRegistry()` | Reset to built-ins (tests) |
| `getUomDefinition(code)` | Lookup |
| `listUomDefinitions()` | All registered |
| `assertKnownUom(code)` | Lookup or throw |

## Conversion

| Export | Description |
| --- | --- |
| `uomQty(amount, unit)` | Construct quantity |
| `convertUom(qty, targetUnit)` | Fixed-ratio convert |
| `sameDimension(a, b)` | Boolean |
| `UomConversionError` | Error class |

## Zod (`@eristack/uom/zod`)

| Export | Description |
| --- | --- |
| `uomCodeSchema` | Unit code |
| `uomQuantitySchema` | Quantity object |
| `UomQuantityJson` | Inferred type |
