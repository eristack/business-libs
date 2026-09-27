# @eristack/fraction

Exact **rational** numbers as reduced fractions — integer string numerators and denominators, BigInt normalization, no JS float literals.

Use when recipes, yields, allocations, or BOM ratios must stay exact (`1/3 + 1/6 = 1/2`). For tax **rates** use `@eristack/percent`; for **units** use `@eristack/uom`; for **money** use `@eristack/money` at invoice boundaries.

**Irrational** values (√2, π) cannot be stored exactly as fractions. This package gives **best rational approximations** with an explicit `maxDenominator` — not symbolic algebra.

## Install

```bash
pnpm add @eristack/fraction
```

## Quick example

```ts
import { parseFraction, addFraction, formatFraction } from "@eristack/fraction";

const a = parseFraction("1/3");
const b = parseFraction("1/6");
formatFraction(addFraction(a, b)); // "1/2"
```

## Exports

| Entry | Purpose |
| --- | --- |
| `@eristack/fraction` | Parse, arithmetic, compare, format, approximate |
| `@eristack/fraction/zod` | Zod 4 schemas (optional peer) |

## Next

- [Getting started](./getting-started.md)
- [Concepts — rational vs percent vs ratio](./concepts.md)
- [Approximation — decimals & irrationals](./approximate.md)
