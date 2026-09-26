---
name: fraction-core
description: >
  @eristack/fraction exact rationals as reduced num/den strings — parse n/d and mixed numbers,
  exact arithmetic, approximateFraction for irrationals/decimals with max denominator. Not float math.
metadata:
  author: eristack
  version: "0.1"
sources:
  - packages/primitive/fraction/docs/index.md
---

# @eristack/fraction

Store **rationals** as `{ num, den }` integer strings in lowest terms. Irrationals (√2, π) are **not** exact — use `approximateFraction` or `convergentFraction` with an explicit `maxDenominator`.

```ts
import { parseFraction, addFraction, approximateFraction } from "@eristack/fraction";

addFraction(parseFraction("1/3"), parseFraction("1/6")); // { num: "1", den: "2" }
approximateFraction("1.4142135623730951", { maxDenominator: "1000" }); // best √2 under cap
```

## vs sibling packages

| Ask | Package |
| --- | --- |
| Tax rate 11%, bps | `@eristack/percent` |
| kg → g qty | `@eristack/uom` |
| 1/3 + 1/6 exact, recipe yields | `@eristack/fraction` |
| Invoice money | `@eristack/money` |

## Checklist

1. Never use JS number literals for num/den — integer strings only.
2. `parseFraction` for human `n/d` input; not for loose decimals.
3. `approximateFraction` at API boundary when users enter decimals; document error vs exact value.
4. Round to money only at ledger boundaries with `@eristack/money`.
5. Optional `@eristack/fraction/zod` on HTTP payloads.

## Do not

- Expect exact storage of π or √2 without a denominator cap
- Duplicate `@eristack/percent` for VAT fields
- Use `toDecimal` for GL posting without money rounding rules
