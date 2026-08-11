---
name: money-ledger
description: >
  Round at ledger boundaries, allocate without losing cents, convert with
  app-supplied FX rates, and serialize Money as JSON decimal strings in
  @eristack/money. Use for invoices, payment splits, multi-currency reporting,
  Rounding.currencyDefault, allocate, Conversion.of, moneyToJSON.
metadata:
  type: core
  library: '@eristack/money'
  library_version: '0.0.0'
sources:
  - 'eristack/business-libs:packages/money/docs/rounding.md'
  - 'eristack/business-libs:packages/money/docs/allocate.md'
  - 'eristack/business-libs:packages/money/docs/conversion.md'
  - 'eristack/business-libs:packages/money/docs/serialization.md'
  - 'eristack/business-libs:packages/money/docs/recipes.md'
---

# @eristack/money — Ledger Boundaries

Round before post/persist/display. Allocate so parts always sum to the original. Supply your own FX rates. Serialize amounts as decimal strings.

## Setup

```ts
import { Conversion, Money, Rounding } from "@eristack/money";

const round = Rounding.currencyDefault();
const line = Money.of("149.70", "USD");
const discount = line.multiply("0.05").with(round);
const net = line.subtract(discount);
const tax = net.multiply("0.11").with(round);
const total = net.add(tax).with(round);
```

## Core Patterns

### Currency-default rounding

```ts
import { Money, Rounding } from "@eristack/money";

const raw = Money.of("19.99", "USD").multiply("0.07"); // 1.3993
const tax = raw.with(Rounding.currencyDefault()); // 1.40

amount.roundTo(2, "HALF_UP");
amount.with(Rounding.of(0, "DOWN"));
```

Default mode is `HALF_EVEN` (banker's rounding). Modes: `UP`, `DOWN`, `CEILING`, `FLOOR`, `HALF_UP`, `HALF_DOWN`, `HALF_EVEN`, `UNNECESSARY`.

### Allocate without losing cents

```ts
const total = Money.of("10.00", "USD");
const [a, b, c] = total.allocate(3);
// 3.34 + 3.33 + 3.33 === 10.00

const payment = Money.of("1000.00", "USD");
const shares = payment.allocateByRatios([250, 400, 350]);
```

Uses largest-remainder allocation on currency-rounded amounts.

### App-supplied FX conversion

```ts
import { Conversion, Money, Rounding } from "@eristack/money";

const local = Money.of("1500000", "IDR");
const reporting = local
  .with(Conversion.of({ base: "IDR", term: "USD", factor: "0.000067" }))
  .with(Rounding.currencyDefault("USD"));
```

`factor` means `term = base * factor`. The library does not fetch market rates.

### JSON for APIs and persistence

```ts
import { Money, moneyFromJSON, moneyToJSON } from "@eristack/money";

const money = Money.of("19.99", "USD");
const json = moneyToJSON(money); // { currency: "USD", amount: "19.99" }
const restored = moneyFromJSON(json);
// Money.toJSON() / JSON.stringify(money) emit the same shape
```

## Common Mistakes

### CRITICAL Split with plain divide

Wrong:

```ts
const share = Money.of("10.00", "USD").divide(3);
```

Correct:

```ts
const [a, b, c] = Money.of("10.00", "USD").allocate(3);
```

Plain division drops remainder cents; `allocate` / `allocateByRatios` always sum back to the original.

Source: packages/money/docs/allocate.md

### HIGH Expect library to fetch FX rates

Wrong:

```ts
Money.of("100", "USD").convertTo("IDR");
```

Correct:

```ts
import { Conversion, Money } from "@eristack/money";

Money.of("100", "USD").with(
  Conversion.of({
    base: "USD",
    term: "IDR",
    factor: "15000",
    timestamp: new Date("2026-01-15"),
  }),
);
```

Your app owns treasury tables / bank feeds / manual rates.

Source: packages/money/docs/conversion.md

### CRITICAL Serialize amount as JSON number

Wrong:

```ts
const payload = { currency: "USD", amount: 19.99 };
```

Correct:

```ts
const payload = Money.of("19.99", "USD").toJSON();
// { currency: "USD", amount: "19.99" }
```

Wire format uses a decimal string so transit never corrupts money via binary float.

Source: packages/money/docs/serialization.md

## See also

- `money-amounts` — constructors, same-currency arithmetic, comparisons
