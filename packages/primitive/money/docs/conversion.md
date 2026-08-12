---
title: Currency conversion
description: Convert amounts with rates your application supplies — no bundled market feeds
sidebar_position: 11
---

# Currency conversion

`@eristack/money` converts amounts. It does **not** know what a rate is worth today. Rate sourcing, dating, approval, and audit are product decisions with legal weight, so they stay in your application: a treasury table, a bank feed, a daily central-bank import, or a number a controller typed into a form.

## The operator

```ts
import { Conversion, Money } from "@eristack/money";

const usd = Money.of("100.00", "USD");

const idr = usd.with(
  Conversion.of({
    base: "USD",
    term: "IDR",
    factor: "15000",
    timestamp: new Date("2026-01-15"),
  }),
);
// 1500000 IDR
```

`Conversion.of(rate, roundingMode?)` builds a `MonetaryOperator`, so conversion composes with the rest of the pipeline in one chain:

```ts
line
  .with(Discount.ofPercent("5"))
  .with(Conversion.of({ base: "EUR", term: "USD", factor: "1.0850" }))
  .with(Rounding.currencyDefault("USD"));
```

## The rate

```ts
type ExchangeRateInput = {
  base: string | CurrencyUnit;  // the currency you hold
  term: string | CurrencyUnit;  // the currency you want
  factor: string | number;      // term = base × factor
  timestamp?: Date;             // metadata only
};
```

**`factor` semantics: `term = base × factor`.** One direction, no inversion, no guessing:

| Holding | Want | Factor means | Example |
| --- | --- | --- | --- |
| `USD` | `IDR` | IDR per 1 USD | `"15000"` |
| `IDR` | `USD` | USD per 1 IDR | `"0.000064"` |
| `EUR` | `USD` | USD per 1 EUR | `"1.0850"` |

If your rate table stores the opposite direction, invert it **in your code**, where the precision policy is visible. `Conversion` will not silently flip a rate for you, because "which way round is this quote?" is the single most common FX bug.

Rates are validated on construction. A factor must be a positive finite value:

```ts
Conversion.of({ base: "USD", term: "EUR", factor: "0" });
// ArithmeticError: Exchange rate factor must be a positive finite value
```

`factor` accepts a `number`, but prefer strings for the same reason amounts prefer strings — `"0.000064"` says exactly what you mean. Build a reusable rate with `exchangeRate(input)` and pass it to many conversions:

```ts
import { exchangeRate } from "@eristack/money";

const eurUsd = exchangeRate({ base: "EUR", term: "USD", factor: "1.0850" });
const convert = Conversion.of(eurUsd);

invoices.map((amount) => amount.with(convert));
```

### The base must match

```ts
Money.of("100.00", "USD").with(
  Conversion.of({ base: "EUR", term: "USD", factor: "1.0850" }),
);
// ArithmeticError: Conversion expects EUR but got USD
```

This is deliberate. A conversion that accepted any input currency would happily turn EUR into "USD" using a JPY rate. Select the rate from the amount's currency, not the other way round:

```ts
function toReporting(amount: Money, rates: Record<string, string>) {
  const code = amount.currency.currencyCode;
  if (code === "USD") return amount;
  const factor = rates[code];
  if (!factor) throw new Error(`No USD rate for ${code}`);
  return amount.with(Conversion.of({ base: code, term: "USD", factor }));
}
```

Converting a currency to itself is a no-op and returns the amount unchanged — even if you pass a nonsense factor — so identity rows in a rate table are harmless.

## Rounding after conversion

The result is rounded to the **term** currency's `defaultFractionDigits`, using `HALF_EVEN` unless you pass a mode:

```ts
Money.of("100.00", "USD").with(
  Conversion.of({ base: "USD", term: "EUR", factor: "0.92555" }),
);            // 92.56 EUR — HALF_EVEN

Money.of("100.00", "USD").with(
  Conversion.of({ base: "USD", term: "EUR", factor: "0.92555" }, "DOWN"),
); // 92.55 EUR
```

Zero-decimal currencies round to whole units (`100.00 USD × 151.35 → 15135 JPY`). Currencies registered with `defaultFractionDigits: -1` have no ledger scale, so the converted amount keeps full precision and you decide the scale yourself.

Because the term scale is applied automatically, an extra `Rounding.currencyDefault()` after `Conversion` is usually redundant. Keep it only when it documents intent (as in the chained example above) or when you are converting into a scale-less unit.

## Rate dating is metadata, not behavior

`timestamp` is carried on the rate and never consulted during math:

```ts
const rate = exchangeRate({
  base: "USD",
  term: "IDR",
  factor: "15000",
  timestamp: new Date("2026-01-15"),
});

rate.timestamp; // available for your audit trail
```

Nothing expires, nothing warns when a rate is a year old. If your product needs "the rate on the invoice date" or "the month-end closing rate," that selection logic lives in your rate service. Store the rate you used (factor **and** date) alongside the converted amount — a converted `Money` on its own cannot tell an auditor how it got there.

## Round-trip loss is real and expected

Converting and converting back does not always return the original:

```ts
const eur = Money.of("100.00", "EUR");
const usd = eur.with(Conversion.of({ base: "EUR", term: "USD", factor: "1.0850" }));
// 108.50 USD

usd.with(Conversion.of({ base: "USD", term: "EUR", factor: "0.92166" }));
// 100.00 EUR — only because 0.92166 is close to 1 / 1.0850
```

Every conversion rounds to the target scale, so information is discarded at each hop. The loss becomes visible when the scales differ sharply:

```ts
Money.of("1", "JPY").with(
  Conversion.of({ base: "JPY", term: "USD", factor: "0.0066" }),
);
// 0.01 USD — 0.0066 became a whole cent; converting back at 151.5 yields 2 JPY
```

Practical rules:

1. **Never chain conversions** to reach a third currency (`IDR → USD → EUR`). Get a direct rate, or convert from the original amount twice.
2. **Store the original amount** in its transaction currency. Treat converted values as derived, reproducible from the amount plus the stored rate.
3. **Do not expect reversibility.** A reversal should re-read the stored original, not re-convert the converted value.
4. **Sum in one currency.** Convert each row, then total — or total then convert once. Pick one; they can differ by cents, and mixing the two across reports is how reconciliations fail.

## What is not included

- No market data, no HTTP calls, no API keys
- No triangulation through a base currency
- No rate caching, expiry, or interpolation
- No bid/ask/mid spread modeling — pass whichever number your policy says to use

[Recipes](./recipes.md#multi-currency-report-with-app-supplied-fx) shows a reporting-currency roll-up with an app-owned rate map.

## See also

- [Currency](./currency.md) — fraction digits and custom units
- [Rounding](./rounding.md) — modes and boundaries
- [Gotchas](./gotchas.md) — mixed-currency errors and float rates
