# Getting started

## Install

```bash
pnpm add @eristack/fraction
```

## Parse exact rationals

```ts
import { parseFraction, fraction, formatFraction } from "@eristack/fraction";

parseFraction("3/4");       // { num: "3", den: "4" }
parseFraction("1 1/2");     // { num: "3", den: "2" }
parseFraction("7");         // { num: "7", den: "1" }
fraction("6", "9");         // reduces to { num: "2", den: "3" }

formatFraction(parseFraction("3/4")); // "3/4"
```

## Exact arithmetic

```ts
import {
  addFraction,
  subtractFraction,
  multiplyFraction,
  divideFraction,
  compareFraction,
  parseFraction,
} from "@eristack/fraction";

const third = parseFraction("1/3");
const sixth = parseFraction("1/6");

addFraction(third, sixth);              // { num: "1", den: "2" }
multiplyFraction(parseFraction("2/3"), parseFraction("3/5")); // { num: "2", den: "5" }
compareFraction(third, sixth);          // 1  (1/3 > 1/6)
```

## Decimals and irrationals

`parseFraction` does **not** accept `"0.333"`. Use approximation when input is decimal:

```ts
import { approximateFraction, convergentFraction } from "@eristack/fraction";

approximateFraction("0.3333333333", { maxDenominator: "1000" });
// → { num: "1", den: "3" }

convergentFraction("3.141592653589793", "10000");
// → { num: "355", den: "113" }
```

Document the chosen `maxDenominator` in your API — approximations are intentional, not exact irrationals.

## Zod

```ts
import { fractionInputSchema } from "@eristack/fraction/zod";

fractionInputSchema.parse("3/4");
```

## Production path

1. Store `{ num, den }` in SQL as two integer/text columns or a single display column plus normalized pair.
2. Parse user `n/d` or mixed input at the API with `parseFraction`.
3. Run recipe/BOM math with fraction operators; convert to `@eristack/money` only when costing lines.
4. For decimal-only user input, call `approximateFraction` once at the boundary.
