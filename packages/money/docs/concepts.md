---
title: Concepts
description: Immutability, currency safety, and the adaptive bigint/decimal engine
sidebar_position: 3
---

# Concepts

## Immutability

Every operation returns a new `Money`. Instances never change after creation.

```ts
import { Money } from "@eristack/money";

const a = Money.of("10.00", "USD");
const b = a.add(Money.of("1.00", "USD"));
// a is still 10.00 USD
```

## Currency safety

`add`, `subtract`, and comparisons require the same currency. Mismatches throw `CurrencyMismatchError`.

Convert currencies explicitly with [Conversion](./conversion.md).

## Why not JavaScript `number`?

Binary floating point cannot represent many decimal fractions exactly (`0.1 + 0.2 !== 0.3`). For money, that is unacceptable.

`Money.of(19.99, "USD")` is rejected. Use `Money.of("19.99", "USD")` or `Money.ofMinor(1999n, "USD")`.

## Adaptive representation

Internally, `@eristack/money` stores amounts as:

| Path | When |
| --- | --- |
| `bigint` minor units | Fixed currency scale, exact integer ops, within digit budget |
| `decimal` | Higher scale, non-integer factors, virtual currencies (`defaultFractionDigits === -1`) |

Callers use one type: `Money`. Inspect storage only for debugging:

```ts
price.getContext().representation; // "bigint" | "decimal"
```

After currency rounding, amounts that fit the currency scale may **demote** back to `bigint`.

## Operators and queries

Inspired by JSR 354:

- `MonetaryOperator` — `amount.with(operator)` transforms an amount
- `MonetaryQuery` — `amount.query(query)` extracts a value

Rounding and conversion are operators.
