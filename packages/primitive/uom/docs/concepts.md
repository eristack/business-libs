# Concepts

## UomQuantity

```ts
type UomQuantity = { amount: string; unit: UomCode };
```

- **amount** — decimal string (`"1.5"`, not `1.5`)
- **unit** — code from catalog (`kg`, `L`, `pcs`)

Construct with `uomQty(amount, unit)` — validates known unit and normalizes decimal formatting via `decimal.js`.

## Dimensions

Units belong to one **dimension**:

| Dimension | Base unit | Examples |
| --- | --- | --- |
| `mass` | `g` | `mg`, `kg`, `t` |
| `volume` | `mL` | `L` |
| `count` | `pcs` | `ea`, custom `box` |
| `length` | `mm` | `m` |

Conversion is only defined **within** the same dimension. kg → L requires app-specific density — not in this package.

## toBaseFactor

Each unit defines how to reach the dimension base:

```
amount_in_base = amount * toBaseFactor
amount_in_target = amount_in_base / target.toBaseFactor
```

Example: `1.5 kg` → base `1500 g` → `1500000 mg`.

## Registry

Built-ins ship in `BUILTIN_UOM`. Extend once at startup with `registerUomDefinitions`. Tests may call `resetUomRegistry()`.

## String-first rule

Same as `@eristack/money`: never pass JS number literals for amounts in domain code. Parse user input to string before `uomQty`.
