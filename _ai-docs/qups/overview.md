# @eristack/qups

## Problem

Line items couple quantity, unit price, and subtotal. Naïve `qty = subtotal / unitPrice` with floats loses truth (10 ÷ 3 → 3.333…). Same pattern repeats for discount/surcharge vs net, and tax.

## Model

Every triad has **exactly two sources of truth**; the third is **derived** and stored as exact decimal string (via Money / Decimal paths), not a rounded display guess until an explicit round.

### QUPS

| Mode (SoT) | Derived |
| --- | --- |
| `quantity` + `unitPrice` | `subtotal = qty × unitPrice` |
| `quantity` + `subtotal` | `unitPrice = subtotal ÷ qty` |
| `unitPrice` + `subtotal` | `quantity = subtotal ÷ unitPrice` |

### Modifiers (discount | surcharge)

Stacked modifiers on base subtotal. Each modifier is `%` or nominal Money. Pair modes: base+modifier → result, or base+result → implied modifier, etc.

### Tax

Exclusive/inclusive patterns using `@eristack/money` Tax ops, still 2-of-3 where applicable (net, rate, tax amount).

## Dependency

Depends on `@eristack/money` (+ optional `drizzle-orm` peer for `./drizzle`).

## Primary API (forms + BE)

```ts
calculateLine({ truth, currency, quantity, unitPrice, … }) → CalculatedLine
patchLine(line, { unitPrice })  // TanStack Form onChange
withQupsColumns({ itemId }, line) // DB insert payload
```

Classes `Qups` / `PricingLine` remain for Money-native domain code.

## Optional persistence

- `qupsLineColumns("pgsql")` injected into app detail tables
- Optional profile/side stores — not required for everyday calc

