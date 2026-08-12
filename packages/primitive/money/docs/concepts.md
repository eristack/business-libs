---
title: Concepts
description: Immutability, currency safety, the adaptive engine, and operators
sidebar_position: 3
---

# Concepts

Five ideas explain almost every API decision in `@eristack/money`: amounts are immutable, currency is part of the type, decimals are exact, storage is adaptive, and transformations are operators.

## Immutability

Every operation returns a new `Money`. Instances never change after creation.

```ts
import { Money } from "@eristack/money";

const a = Money.of("10.00", "USD");
const b = a.add(Money.of("1.00", "USD"));
// a is still 10.00 USD; b is 11.00 USD
```

This is what makes a calculation auditable: the subtotal you computed in step 2 is still the subtotal in step 6, and passing an amount to another function cannot mutate your copy. It also means results must be captured — `amount.add(fee)` on its own does nothing.

## Currency safety

`add`, `subtract`, and all comparisons require the same currency. Mismatches throw `CurrencyMismatchError` with both codes attached.

```ts
Money.of("10.00", "USD").add(Money.of("10.00", "EUR"));
// CurrencyMismatchError: Currency mismatch: USD vs EUR
```

There is no implicit conversion, ever — an implicit rate is an invented rate. Convert explicitly with [Conversion](./conversion.md), using a factor your application supplies. The same rule covers `Money.sum`, `min`, `max`, `average`, and `ratio`.

## Why not JavaScript `number`?

Binary floating point cannot represent many decimal fractions exactly (`0.1 + 0.2 !== 0.3`). For money, that is unacceptable — the error is small per operation and cumulative across a ledger.

So fractional `number` amounts are rejected outright:

```ts
Money.of(19.99, "USD");      // ParseError
Money.of("19.99", "USD");    // preferred
Money.ofMinor(1999n, "USD"); // when you store minor units
```

Integers are accepted because they are exact (`Money.of(20, "USD")`). Percent and factor inputs follow the same string-first rule — with one asymmetry worth knowing about, covered in [gotchas](./gotchas.md#fractional-number-factors-are-rejected-in-percent-helpers).

## Adaptive representation

Internally, `@eristack/money` stores amounts as:

| Path | When |
| --- | --- |
| `bigint` minor units | Fixed currency scale, exact integer ops, within digit budget |
| `decimal` | Higher scale, non-integer factors, virtual currencies (`defaultFractionDigits === -1`) |

Callers use one type: `Money`. There is no `FastMoney` vs `Money` decision to get wrong, and the two paths are numerically equivalent — equality compares currency and value, not storage.

Inspect storage only for debugging:

```ts
const raw = Money.of("19.99", "USD").multiply("0.07");
raw.getContext();
// { representation: "decimal", precision: 5, maxScale: 4 }

raw.with(Rounding.currencyDefault()).getContext();
// { representation: "bigint", precision: 3, maxScale: 2 }
```

Non-integer multiply/divide promotes to `decimal`; rounding back to currency scale **demotes** to exact `bigint` minor units. A `decimal` representation reaching a persistence boundary is a useful smell — it usually means a value was never rounded.

## Operators and queries

Inspired by JSR 354:

- `MonetaryOperator` — `amount.with(operator)` transforms an amount
- `MonetaryQuery` — `amount.query(query)` extracts a value

Rounding, percent/discount/markup, tax, and FX conversion are all operators, which is why they compose in a single readable chain:

```ts
const posted = subtotal
  .with(Discount.ofPercent("5"))
  .with(Tax.onExclusive("11"))
  .with(Rounding.currencyDefault());
```

Operators are plain objects with an `apply` method, so your own domain rules (a rounding policy per company, a levy, a surcharge) can join the same pipeline instead of living in loose helper functions.

## Currency units

A `CurrencyUnit` is `{ currencyCode, numericCode, defaultFractionDigits }`. ISO 4217 units ship with the package; you can register your own for points, store credit, or internal units. `defaultFractionDigits` is load-bearing — it sets ledger scale, minor-unit conversion, and whether allocation is possible at all. See [currency](./currency.md).

## Where to go next

- [Amounts](./amounts.md) and [arithmetic](./arithmetic.md) — the everyday surface
- [Rounding](./rounding.md) — boundaries and modes
- [Gotchas](./gotchas.md) — the sharp edges these concepts imply, with the exact errors
