---
title: Allocate & split
description: Split money across parties or invoices without losing or inventing cents
sidebar_position: 9
---

# Allocate & split

Dividing money is not dividing numbers. `10.00 / 3` is `3.333…`, and three payments of `3.33` are `9.99` — a cent short of what the customer actually paid. `@eristack/money` solves this with **largest-remainder allocation**: parts are computed in whole minor units and the leftover units are handed out one at a time, so the parts always sum back to the (rounded) original.

## Equal split

```ts
import { Money } from "@eristack/money";

const total = Money.of("10.00", "USD");
const parts = total.allocate(3);
// [3.34, 3.33, 3.33] — sums to 10.00
```

`allocate(n)` requires a positive integer. `allocate(0)`, `allocate(-1)`, and `allocate(2.5)` all throw `ArithmeticError: allocate(n) requires a positive integer`.

Internally `allocate(n)` is `allocateByRatios([1, 1, …])` — there is one algorithm, not two.

## Ratio split

```ts
const total = Money.of("100.00", "USD");

total.allocateByRatios([1, 2, 1]);        // [25, 50, 25]
total.allocateByRatios([1, 1, 1]);        // [33.34, 33.33, 33.33]
total.allocateByRatios([0.5, 0.25, 0.25]); // [50, 25, 25]
```

Ratios are **weights, not percentages** — they do not need to sum to 1 or 100. `[250, 400, 350]` and `[25, 40, 35]` allocate identically. That makes open balances, line amounts, quantities, and headcounts usable as-is:

```ts
const payment = Money.of("500.00", "USD");
const openBalances = [250, 400.55, 349.45]; // major units, any scale
payment.allocateByRatios(openBalances);
// [125, 200.28, 174.72] — sums to 500.00
```

Ratios must be finite and non-negative:

| Input | Result |
| --- | --- |
| `[-1, 2]` | `ArithmeticError: Allocation ratios must be finite and non-negative` |
| `[0, 0]` | `ArithmeticError: Sum of allocation ratios must be positive` |
| `[]` | `ArithmeticError: Allocation requires at least one ratio` |
| `[1, 0, 1]` | Allowed — the zero weight gets `0.00` |

## How the remainder is distributed

For `10.00 USD` across three equal shares:

1. Round the amount to currency scale → `1000` minor units.
2. Compute each raw share: `1000 × 1 / 3 = 333.333…` minor units.
3. Truncate each toward zero → `333, 333, 333` (999 allocated, **1 unit left**).
4. Sort slots by descending fractional part and give the leftover units out one per slot.

Result: `[334, 333, 333]` minor units → `3.34, 3.33, 3.33`.

Consequences worth knowing:

- **Earlier slots win ties.** With identical fractions the original order decides, so the first parties receive the extra cents. If your business rule says "the largest invoice absorbs the rounding," order the ratios accordingly — the library does not reorder for you.
- **Parts are never inflated.** The sum equals the rounded original exactly; there is no "distribute and hope" step.
- **Small totals can produce zeros.** Allocation cannot manufacture sub-cent money:

```ts
Money.of("0.07", "USD").allocate(5); // [0.02, 0.02, 0.01, 0.01, 0.01]
Money.of("0.03", "USD").allocate(4); // [0.01, 0.01, 0.01, 0.00]
```

A `0.00` part is a legitimate outcome, not a bug. If a zero share is meaningless in your domain (a payment row nobody should see), filter it after allocating — do not pre-divide.

## Amounts are rounded before splitting

Allocation happens in whole minor units, so the amount is first rounded to the currency's `defaultFractionDigits` using **HALF_EVEN**:

```ts
Money.of("10.005", "USD").allocate(2); // [5.00, 5.00]   ← 10.005 → 10.00 (HALF_EVEN)
Money.of("10.015", "USD").allocate(2); // [5.01, 5.01]   ← 10.015 → 10.02
```

If your rule needs a different mode, round explicitly first — then allocation only splits a number you already agreed on:

```ts
Money.of("10.005", "USD")
  .roundTo(2, "HALF_UP") // 10.01 by your rule
  .allocate(2);          // [5.01, 5.00]
```

See [rounding](./rounding.md) for mode selection.

## Zero-scale and negative amounts

Zero-decimal currencies allocate in whole units:

```ts
Money.of("1000", "JPY").allocateByRatios([1, 1, 1]); // [334, 333, 333]
```

Negative amounts allocate symmetrically, and the parts still sum to the original — useful for credit notes and reversals:

```ts
const credit = Money.of("-10.00", "USD");
credit.allocate(3);      // [-3.34, -3.33, -3.33]
Money.sum(credit.allocate(3), "USD"); // -10.00
```

Mixed-sign work (a negative total split by positive weights) is fine; **negative weights are not** — flip the amount's sign instead of the ratios.

Currencies registered with `defaultFractionDigits: -1` have no minor unit, so they cannot be allocated:

```ts
// ArithmeticError: Cannot allocate for currency XPT without fixed fraction digits
```

## Where allocation belongs

| Situation | Use |
| --- | --- |
| Split an invoice across cost centers | `allocateByRatios(costCenterWeights)` |
| Apply one payment pro-rata across open invoices | `allocateByRatios(openBalances)` |
| Settle open items oldest-first | Loop with `Money.min` — not allocation (see below) |
| Share a shipping fee across order lines | `allocateByRatios(lineNetAmounts)` |
| Split a subscription evenly per seat | `allocate(seatCount)` |
| Divide a rate or a quantity | Plain arithmetic — allocation is for money |

Pro-rata and oldest-first are different policies, and both are legitimate. Allocation is pro-rata; FIFO settlement is a loop:

```ts
let remaining = Money.of("500.00", "USD");
const applied = balances.map((balance) => {
  const take = Money.min(remaining, balance);
  remaining = remaining.subtract(take);
  return take;
});
// [250.00, 250.00, 0.00] for balances 250 / 400.55 / 349.45
```

The full walkthrough is in [recipes](./recipes.md#allocate-one-payment-across-open-invoices).

## Anti-pattern: divide then patch

```ts
// Wrong — leaks or invents cents, and the bug appears in production totals
const share = total.divide(3);
const parts = [share, share, total.subtract(share.multiply(2))];
```

`divide` keeps full precision (up to 40 significant digits), so `share` is not even a currency-scale amount. `allocate(3)` does the whole job in one call and is checkable in a test with a single `Money.sum` assertion:

```ts
const parts = total.allocate(3);
expect(Money.sum(parts, "USD").isEqualTo(total)).toBe(true);
```

## See also

- [Rounding](./rounding.md) — pick the mode before you split
- [ERP recipes](./recipes.md) — payment allocation end to end
- [Gotchas](./gotchas.md) — the mistakes this page prevents
