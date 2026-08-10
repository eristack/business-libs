---
title: Arithmetic
description: Add, subtract, multiply, divide, and related money operations
sidebar_position: 6
---

# Arithmetic

## Same-currency ops

```ts
const a = Money.of("10.00", "USD");
const b = Money.of("2.50", "USD");

a.add(b);
a.subtract(b);
a.negate();
a.abs();
```

## Factors

```ts
a.multiply("1.07");
a.multiply(2);
a.divide("3");
a.remainder(3);
```

Multiplication/division by non-integers typically promotes to the decimal path until you round.

## Errors

| Error | When |
| --- | --- |
| `CurrencyMismatchError` | Mixed currencies on add/sub/compare |
| `ArithmeticError` | Division by zero, invalid allocate, unnecessary rounding failure |
| `ParseError` | Invalid amount strings / JSON |

## Guidance

- Keep intermediate tax/discount calculations precise
- Apply [rounding](./rounding.md) before persisting journal lines
- Never exchange currencies with `add` — use [conversion](./conversion.md)
