# Catalog & dimensions

## Built-in units

| Code | Dimension | toBaseFactor | Label |
| --- | --- | --- | --- |
| `mg` | mass | 0.001 | Milligram |
| `g` | mass | 1 | Gram |
| `kg` | mass | 1000 | Kilogram |
| `t` | mass | 1000000 | Metric ton |
| `mL` | volume | 1 | Millilitre |
| `L` | volume | 1000 | Litre |
| `pcs` | count | 1 | Pieces |
| `ea` | count | 1 | Each |
| `mm` | length | 1 | Millimetre |
| `m` | length | 1000 | Metre |

Source: `BUILTIN_UOM` export.

## Listing catalog

```ts
import { listUomDefinitions } from "@eristack/uom";

listUomDefinitions(); // sorted by code
```

Use for admin UOM pickers and validation messages.

## Custom units

```ts
registerUomDefinitions([
  {
    code: "pallet",
    dimension: "count",
    toBaseFactor: "48",
    label: "Pallet (48 ea)",
  },
]);
```

Custom codes must not collide with built-ins unless intentionally overriding (discouraged — use distinct codes).

## sameDimension check

```ts
import { sameDimension } from "@eristack/uom";

sameDimension("kg", "g"); // true
sameDimension("kg", "L"); // false
```

Use before showing convert UI or accepting alternate UOM on a line.

## assertKnownUom

Throws when code missing from registry — use in strict API paths.
