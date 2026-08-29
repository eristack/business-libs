---
name: money-amounts
description: >
  Construct Money with strings or minor units, run same-currency arithmetic,
  totals (Money.sum/min/max/average), percentages (percentOf/plusPercent/minusPercent),
  ratios, Discount/Markup/Tax/Percent operators, and compare amounts in
  @eristack/money. Use when creating prices, taxes, discounts, totals, or when
  an agent reaches for JS number literals for money.
metadata:
  type: core
  library: '@eristack/money'
  library_version: '0.0.0'
sources:
  - 'eristack/business-libs:packages/primitive/money/docs/getting-started.md'
---

# @eristack/money — Amounts & Arithmetic

Immutable monetary amounts with strict currency checks. Prefer string or minor-unit constructors; never fractional `number`s.

## Setup

```ts
import { Money, Monetary, Rounding } from "@eristack/money";

const usd = Monetary.getCurrency("USD");
const price = Money.of("19.99", usd);
const tax = price.multiply("0.07");
const total = price.add(tax).with(Rounding.currencyDefault());

console.log(total.toString()); // 21.39 USD
```

## Core Patterns

### Construct from string or minor units

```ts
import { Money } from "@eristack/money";

Money.of("19.99", "USD");
Money.ofMinor(1999n, "USD");
Money.zero("EUR");
Money.fromJSON({ currency: "USD", amount: "19.99" });
Money.of(20, "USD"); // integer number OK
```

### Same-currency arithmetic

```ts
const a = Money.of("10.00", "USD");
const b = Money.of("2.50", "USD");

a.add(b);
a.subtract(b);
a.multiply("1.07");
a.divide("3");
a.negate();
a.abs();
```

### Totals and percentages

```ts
import { Discount, Money, Percent, Rounding, Tax } from "@eristack/money";

Money.sum([a, b]);
Money.min(a, b);
a.percentOf("7");       // 7% of a — pass percent points, not 0.07
a.plusPercent("10");
a.minusPercent("5");
Money.percentRatio(a, b); // "a as % of b" decimal string

const round = Rounding.currencyDefault();
const net = a.with(Discount.ofPercent("5")).with(round);
const tax = net.with(Tax.onExclusive("11")).with(round);
```

Keep tax/discount intermediates precise. Round with the ledger skill before persist/display/post.

### Compare and inspect

```ts
const a = Money.of("10.00", "USD");
const b = Money.of("9.50", "USD");

a.isGreaterThan(b);
a.isEqualTo(Money.of("10", "USD"));
a.compareTo(b); // 1
a.getNumber().toString(); // "10"
```

Equality is currency + numeric value, not internal representation (`bigint` vs `decimal`).

## Common Mistakes

### CRITICAL Construct Money from fractional number

Wrong:

```ts
Money.of(19.99, "USD");
```

Correct:

```ts
Money.of("19.99", "USD");
// or
Money.ofMinor(1999n, "USD");
```

Fractional JS numbers are rejected because binary floats cannot represent many decimals exactly.

### List/filter decimal operands

```ts
import { compareDecimalStrings, parseDecimalFilter } from "@eristack/money";

compareDecimalStrings("4990000.00", "1200.50");
parseDecimalFilter(filterValue); // throws if JSON number
```

Source: packages/primitive/money/docs/concepts.md

### HIGH Add mixed currencies directly

Wrong:

```ts
Money.of("10", "USD").add(Money.of("10", "EUR"));
```

Correct:

```ts
import { Conversion, Money } from "@eristack/money";

const usd = Money.of("10", "USD");
const eur = usd.with(
  Conversion.of({ base: "USD", term: "EUR", factor: "0.92" }),
);
```

`add` / `subtract` / comparisons require the same currency and throw `CurrencyMismatchError` otherwise.

Source: packages/primitive/money/docs/arithmetic.md

### HIGH Persist intermediate unrounded tax

Wrong:

```ts
const tax = Money.of("100.00", "USD").multiply("0.11");
await save(tax.toJSON()); // may retain extra scale
```

Correct:

```ts
import { Money, Rounding } from "@eristack/money";

const tax = Money.of("100.00", "USD")
  .multiply("0.11")
  .with(Rounding.currencyDefault());
await save(tax.toJSON());
```

Non-integer multiply/divide promotes to the decimal path until you round to currency scale.

Source: packages/primitive/money/docs/rounding.md

## See also

- `money-ledger` — rounding, allocate, FX conversion, JSON serialization
