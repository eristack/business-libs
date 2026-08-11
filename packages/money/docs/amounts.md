---
title: Amounts
description: Creating Money values, NumberValue, comparison, and equality
sidebar_position: 5
---

# Amounts

## Factories

```ts
import { Money } from "@eristack/money";

Money.of("19.99", "USD");
Money.ofMinor(1999n, "USD"); // 19.99 USD
Money.zero("EUR");
Money.fromJSON({ currency: "USD", amount: "19.99" });
```

Integer `number` values are accepted (`Money.of(20, "USD")`). Fractional numbers are not.

## NumberValue

```ts
const n = Money.of("19.99", "USD").getNumber();
n.toString(); // "19.99"
n.scale();
n.precision();
n.signum(); // -1 | 0 | 1
n.bigintValue(); // minor units when exact
```

`numberValueExact()` returns a JS `number` only when the value is exactly representable; otherwise it throws.

## Compare and equality

```ts
const a = Money.of("10.00", "USD");
const b = Money.of("9.50", "USD");

a.isGreaterThan(b);
a.isEqualTo(Money.of("10", "USD"));
a.compareTo(b); // 1
```

Equality is by currency + numeric value, not by internal representation.
