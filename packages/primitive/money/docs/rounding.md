---
title: Rounding
description: Rounding modes, currency-default rounding, and where ledger boundaries belong
sidebar_position: 8
---

# Rounding

Rounding is where money libraries earn or lose trust. `@eristack/money` keeps intermediate math exact (up to 40 significant digits on the decimal path) and asks **you** to say when a value becomes a posted number.

## Two ways to round

```ts
import { Money, Rounding } from "@eristack/money";

const raw = Money.of("19.99", "USD").multiply("0.07"); // 1.3993 USD

raw.roundTo(2, "HALF_EVEN");            // method — explicit scale
raw.with(Rounding.of(2, "HALF_EVEN"));  // operator — same result
raw.with(Rounding.currencyDefault());   // operator — scale from the currency
```

`roundTo` is the primitive; `Rounding` is a [`MonetaryOperator`](./concepts.md) so it composes with `Discount`, `Tax`, and `Conversion` in one `.with()` chain.

## Currency default is the ledger default

```ts
const round = Rounding.currencyDefault();

Money.of("1.3993", "USD").with(round);  // 1.4   (2 digits)
Money.of("1500.6", "JPY").with(round);  // 1501  (0 digits)
Money.of("1.23456", "KWD").with(round); // 1.235 (3 digits)
```

Two forms:

| Call | Scale comes from |
| --- | --- |
| `Rounding.currencyDefault()` | The amount being rounded, at apply time |
| `Rounding.currencyDefault("USD")` | The currency you name, fixed when the operator is built |

Use the second form when you convert first and want the *target* currency's scale to be obvious in the code:

```ts
local
  .with(Conversion.of({ base: "IDR", term: "USD", factor: "0.000064" }))
  .with(Rounding.currencyDefault("USD"));
```

Both forms throw `ArithmeticError` for currencies registered with `defaultFractionDigits: -1` — those units have no ledger scale, so you must pass one explicitly with `Rounding.of(scale, mode)`. See [gotchas](./gotchas.md#scale--1-currencies-cannot-use-currency-default-helpers).

## Every mode, on one number

`2.675` rounded to 2 digits, and the same value negated:

| Mode | `2.675` | `-2.675` | Meaning |
| --- | --- | --- | --- |
| `UP` | `2.68` | `-2.68` | Away from zero |
| `DOWN` | `2.67` | `-2.67` | Toward zero (truncate) |
| `CEILING` | `2.68` | `-2.67` | Toward +∞ |
| `FLOOR` | `2.67` | `-2.68` | Toward −∞ |
| `HALF_UP` | `2.68` | `-2.68` | Ties away from zero |
| `HALF_DOWN` | `2.67` | `-2.67` | Ties toward zero |
| `HALF_EVEN` | `2.68` | `-2.68` | Ties to the even last digit |
| `UNNECESSARY` | throws | throws | Assert no rounding is needed |

`UP`/`DOWN` are sign-symmetric; `CEILING`/`FLOOR` are not. That difference only shows up on credit notes, refunds, and reversals — which is exactly where a wrong choice becomes an audit finding.

Ties are where `HALF_EVEN` differs from `HALF_UP`:

```ts
Money.of("1.005", "USD").roundTo(2, "HALF_EVEN"); // 1.00 → 0 is even
Money.of("1.015", "USD").roundTo(2, "HALF_EVEN"); // 1.02 → 2 is even
Money.of("1.005", "USD").roundTo(2, "HALF_UP");   // 1.01
```

## Why HALF_EVEN is the default

`HALF_UP` pushes every tie in the same direction, so a long run of ties drifts upward. `HALF_EVEN` splits ties between up and down and the drift cancels:

```ts
let halfEven = Money.zero("USD");
let halfUp = Money.zero("USD");

for (let i = 0; i < 10; i++) {
  const value = Money.of(`1.${i}5`, "USD"); // 1.05, 1.15, … 1.95
  halfEven = halfEven.add(value.roundTo(1, "HALF_EVEN"));
  halfUp = halfUp.add(value.roundTo(1, "HALF_UP"));
}

halfEven.toString(); // 15 USD
halfUp.toString();   // 15.5 USD  ← 50 cents of bias in ten rows
```

Half a currency unit per ten rows is invisible in a demo and material in a general ledger. That is why `roundTo`, `Rounding.of`, and `Rounding.currencyDefault` all default to `HALF_EVEN`, and why display rounding is a separate decision (see below).

## UNNECESSARY asserts instead of rounds

`UNNECESSARY` never changes a value. It verifies the amount already fits the requested scale and throws `ArithmeticError` if it does not:

```ts
Money.of("1.50", "USD").roundTo(2, "UNNECESSARY");  // 1.5 USD — fine
Money.of("1.005", "USD").roundTo(2, "UNNECESSARY");
// ArithmeticError: Rounding unnecessary but amount has more than 2 decimal places
```

Use it as a tripwire at persistence boundaries when your invariant is "this value was rounded upstream." An amount with *fewer* decimals than the scale passes; only extra precision fails.

## Rounding can demote the internal representation

Amounts carry an adaptive representation. Non-integer factors push a value onto the decimal path; rounding back to currency scale lets it return to exact `bigint` minor units:

```ts
const raw = Money.of("19.99", "USD").multiply("0.07");
raw.getContext();
// { representation: "decimal", precision: 5, maxScale: 4 }

raw.with(Rounding.currencyDefault()).getContext();
// { representation: "bigint", precision: 3, maxScale: 2 }
```

This is an implementation detail — equality and arithmetic behave the same either way — but it is a useful signal in tests and debugging: a `decimal` representation at a persistence boundary usually means somebody forgot to round.

## When to round

Round at **boundaries**, not between every operation.

| Boundary | Round? | Mode |
| --- | --- | --- |
| Persisting a journal line, invoice total, tax line | Yes | `HALF_EVEN` (or the jurisdiction's rule) |
| Returning money in an API response | Yes | Currency default |
| Before `allocate` when a specific mode matters | Yes | Your business rule — see [allocate](./allocate.md#amounts-are-rounded-before-splitting) |
| After FX conversion | Automatic | Term currency scale, `HALF_EVEN` unless overridden |
| Between `multiply` and `add` in one formula | No | Keep the intermediate exact |
| Display in the UI | Formatting concern | Often `HALF_UP` locally — see below |

Rounding early and often is the classic source of "the invoice is off by one cent." Compute the whole expression, then round once per posted number:

```ts
// Prefer: one rounding per posted value
const net = subtotal.with(Discount.ofPercent("5")).with(round);
const tax = net.with(Tax.onExclusive("11")).with(round);
const total = Money.sum([net, tax]);
```

The choice of *which* values are posted is a domain decision. Per-line tax and tax-on-subtotal can legitimately differ by a cent; pick one, document it, and be consistent. [Recipes](./recipes.md#invoice-lines--discount--tax--total) shows both.

## Ledger mode vs display mode

`formatMoney` uses `Intl.NumberFormat`, which applies its own (half-expand) rounding for display and does **not** mutate your amount:

```ts
formatMoney(Money.of("1.3993", "USD")); // "$1.40" — the Money is still 1.3993
```

So a screen can look correct while the stored value is unrounded. If a number is going to be posted, round it explicitly before it reaches the formatter. If your locale requires `HALF_UP` presentation while the ledger stays `HALF_EVEN`, keep two steps and label them:

```ts
const posted = amount.with(Rounding.currencyDefault());          // ledger truth
const shown = formatMoney(amount.roundTo(2, "HALF_UP"), "en-US"); // display copy
```

Document which mode your product uses at each boundary. Tax authorities and local rules override library defaults — the library will not guess a jurisdiction for you.

## See also

- [Allocate & split](./allocate.md) — parts that always sum to the rounded total
- [Currency conversion](./conversion.md) — rounding after FX
- [Gotchas](./gotchas.md) — the traps this page implies
