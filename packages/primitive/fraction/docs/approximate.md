# Approximation

## When to use

- User enters a **decimal** in the UI
- You ingest **irrational** constants (√2, π) from geometry or science
- You import CSV floats and need a **stable rational** for repeat arithmetic

Do **not** use approximation for values that are already exact rationals — use `parseFraction`.

## approximateFraction

Scans denominators `1 … maxDenominator` and picks the pair with smallest absolute error vs the decimal input.

```ts
import { approximateFraction, formatFraction } from "@eristack/fraction";

formatFraction(
  approximateFraction("1.4142135623730951", { maxDenominator: "1000" }),
);
```

Default `maxDenominator` is `"10000"`. Pass a smaller cap for coarser grids (e.g. `"64"` for sixteenths).

## convergentFraction

Uses continued-fraction convergents until the denominator exceeds `maxDenominator`. Often finds classic approximations quickly (355/113 for π).

```ts
import { convergentFraction } from "@eristack/fraction";

convergentFraction("3.141592653589793", "10000");
// { num: "355", den: "113" }
```

## Display vs storage

- **Storage:** keep `{ num, den }` after approximation so later math stays exact within the chosen error.
- **Display:** `toDecimal(f, scale)` for UI; `@eristack/money` for currency after you apply a fraction to a price.

## Honesty in APIs

If the user typed π, return or persist metadata that the value is **approximate** (your app field), not an exact irrational. This library only supplies the rational pair.
