# Getting started

Parse and apply tax/discount rates without float literals.

## Install

```bash
pnpm add @eristack/percent
```

## Parse rates

```ts
import { parsePercent, fromBasisPoints, percentOf } from "@eristack/percent";

parsePercent("11%");              // { ratio: "0.11" }
fromBasisPoints("1100");          // { ratio: "0.11" }
parsePercent({ kind: "ratio", value: "0.075" }); // 7.5%
```

## Apply to amounts

```ts
const vat = parsePercent("10%");
percentOf("100", vat);   // "10"
plusPercent("100", vat); // "110"
minusPercent("100", vat); // "90"
```

Round with `@eristack/money` at invoice boundaries after percent math on strings.

## Zod

```ts
import { percentSchema } from "@eristack/percent/zod";

percentSchema.parse({ ratio: "0.11" });
```

## Production path

1. Store rates in master data as basis points or ratio strings.
2. Parse with `@eristack/percent` at API boundary.
3. Pass ratio into QUPS modifiers or money operators after line calculation.

## Next

- [Basis points](./basis-points.md) — finance tables
- [Arithmetic](./arithmetic.md) — combining rates
- [Recipes](./recipes.md) — tax line, stacked discount
