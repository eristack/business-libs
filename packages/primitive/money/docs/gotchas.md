---
title: Gotchas
description: Rejected constructors, mixed currencies, JSON numbers, scale -1, and other sharp edges
sidebar_position: 13
---

# Gotchas

The mistakes that cost the most in money code are quiet ones. `@eristack/money` throws early where it can; this page collects both the loud failures (with the exact error you will see) and the silent ones the library cannot detect for you.

## Fractional number amounts are rejected

```ts
Money.of(19.99, "USD");
// ParseError: Fractional number amounts are not accepted; pass a string like "19.99"
```

Binary floating point cannot represent most decimal fractions exactly, so `19.99` is already slightly wrong before the library sees it. Integers are fine (`Money.of(20, "USD")`) because they are exact.

```ts
Money.of("19.99", "USD");   // preferred
Money.ofMinor(1999n, "USD"); // when you already store minor units
```

The dangerous version of this bug is upstream: `Money.of(row.price.toString(), "USD")` where `row.price` is a JS `number` from JSON or a driver. The string is faithfully constructed from an already-lossy value. Keep amounts as strings from the database to the constructor — configure your driver to return numerics as strings, or store minor-unit integers.

## Fractional number factors are rejected in percent helpers

Percent helpers and percent-based operators refuse fractional `number` input:

```ts
Money.of("10.00", "USD").percentOf(7.5);
// ParseError: Fractional number factors are not accepted; pass a string like "7.5"

Money.of("10.00", "USD").percentOf("7.5"); // 0.75 — correct
```

But `multiply` and `divide` accept fractional numbers:

```ts
Money.of("10.00", "USD").multiply(0.07); // 0.70 — accepted, no error
```

That asymmetry is a trap. `multiply(0.07)` happens to be safe for short literals, and unsafe the moment the factor is computed (`multiply(1 - discount / 100)`). Treat every factor as a string:

```ts
amount.multiply("0.07");
amount.percentOf("7");            // percent points — 7%, not 0.07
amount.with(Tax.onExclusive("11"));
```

## Percent points, not fractions

```ts
price.percentOf("7");    // 7% of price
price.percentOf("0.07"); // 0.07% of price — legal, and almost never what you meant
```

Every percent input in the library — `percentOf`, `plusPercent`, `minusPercent`, `Percent.of`, `Discount.ofPercent`, `Markup.ofPercent`, and all three `Tax` helpers — is in percent points. If your rate is stored as `0.11`, multiply by 100 before it reaches these APIs, or store rates as percent points to begin with.

## Mixed currencies throw — including in aggregates

```ts
Money.of("10.00", "USD").add(Money.of("10.00", "EUR"));
// CurrencyMismatchError: Currency mismatch: USD vs EUR
```

The same applies to `subtract`, every comparison (`isGreaterThan`, `compareTo`, `isEqualTo`), and the aggregates `Money.sum`, `Money.min`, `Money.max`, `Money.average`, and `Money.ratio`. The error carries `left` and `right` codes so you can report which row broke a batch:

```ts
try {
  Money.sum(rows);
} catch (error) {
  if (error instanceof CurrencyMismatchError) {
    console.error(`Mixed currencies: ${error.left} vs ${error.right}`);
  }
}
```

Convert explicitly with [`Conversion`](./conversion.md) — there is no implicit FX. And group by currency before summing; a "total receivables" number across currencies is meaningless without a stated reporting currency and rate set.

## Money.sum([]) needs a currency

```ts
Money.sum([]);
// ArithmeticError: Money.sum([]) requires a currency argument for the zero result

Money.sum([], "USD"); // 0.00 USD
```

An empty list has no currency to infer, and returning a currency-less zero would poison the next operation. Always pass the currency when the list can be empty — an invoice with no lines, a filtered selection, a fresh cart:

```ts
const subtotal = Money.sum(lineNets, "USD"); // safe for zero lines
```

`Money.min` and `Money.max` throw on an empty list rather than inventing a zero, because "the smallest of nothing" has no sensible value.

## Amount strings are normalized — trailing zeros disappear

```ts
Money.of("10.00", "USD").toString();       // "10 USD"
Money.of("142.20", "USD").amountString();  // "142.2"
JSON.stringify(Money.of("10.00", "USD"));  // {"currency":"USD","amount":"10"}
```

These are **decimal** strings, not display strings. `"10"`, `"10.0"`, and `"10.00"` are the same amount and all round-trip through `Money.of` correctly. Problems appear only if you treat the string as presentation or compare strings for equality:

```ts
// Wrong — string compare on normalized values
money.toJSON().amount === "10.00"; // false for Money.of("10.00", "USD")

// Right
money.isEqualTo(Money.of("10.00", "USD"));            // value comparison
formatMoney(money, "en-US");                          // "$10.00" for display
db.column === money.toJSON().amount;                   // fine — DB numerics normalize too
```

Use [`formatMoney`](./formatting.md) for anything a user reads, and compare `Money` values with `isEqualTo` / `compareTo`.

## Storing amounts as JSON numbers

```ts
// Wrong — the float damage happens in transit, before your code runs
res.json({ currency: "USD", amount: 19.99 });

// Right
res.json(total.toJSON()); // { currency: "USD", amount: "19.99" }
```

`moneyFromJSON` refuses anything that is not two strings:

```ts
moneyFromJSON({ currency: "USD", amount: 19.99 });
// ParseError: Money JSON must be { currency: string, amount: string }
```

Put that call at your API boundary so a number-typed amount fails at the edge instead of drifting into a ledger. The same applies to database columns: a `double precision` money column is a bug regardless of how carefully the application computes. Use `numeric`/`decimal` returned as a string, or a minor-unit integer with the scale documented in the schema.

Minor-unit storage carries its own hazard: `1999` is `19.99 USD`, `1999.00 JPY`, or `1.999 KWD` depending on scale. Rebuild with `Money.ofMinor(1999n, "USD")` and never let the raw integer travel without its currency.

## `defaultFractionDigits: -1` currencies cannot use currency-default helpers

A unit registered with `-1` has no ledger scale, so every scale-derived operation fails:

```ts
Monetary.registerCurrency({
  currencyCode: "XPT",
  numericCode: 0,
  defaultFractionDigits: -1,
});

Money.ofMinor(100n, "XPT");
// ArithmeticError: Currency XPT has no fixed minor units

Money.of("1.23456789", "XPT").with(Rounding.currencyDefault());
// ArithmeticError: Currency XPT has no default fraction digits

Money.of("1.23456789", "XPT").allocate(2);
// ArithmeticError: Cannot allocate for currency XPT without fixed fraction digits
```

Those amounts always live on the decimal path and you must supply scales explicitly (`roundTo(4, "HALF_EVEN")`). Prefer a fixed scale — even a large one like `8` — unless the unit is genuinely unbounded. See [recipes](./recipes.md#register-a-custom-currency-or-unit).

Registration is also process-global and replaces the unit under the same code. Overwriting `"USD"` in a test will affect every other test in the same worker; register custom units in shared setup, not inside individual cases.

## Unknown currency codes throw at construction

```ts
Money.of("10.00", "XXY");
// UnknownCurrencyError: Unknown currency: XXY
```

Codes are normalized (trimmed and upper-cased), so `" usd "` resolves. For user or import-supplied codes, probe first instead of catching:

```ts
if (!Monetary.isCurrencyAvailable(code)) {
  return badRequest(`Unsupported currency: ${code}`);
}
```

## Ledger HALF_EVEN vs display HALF_UP

The library defaults to `HALF_EVEN` because it does not accumulate bias across many rows. Many locales and price displays expect `HALF_UP`. Both are correct in their own place; the bug is applying one where the other belongs, or applying neither:

```ts
const posted = amount.with(Rounding.currencyDefault());           // HALF_EVEN
const shown = formatMoney(amount.roundTo(2, "HALF_UP"), "en-US"); // display
```

Note that `formatMoney` rounds for display through `Intl.NumberFormat` and does **not** change the amount:

```ts
const unrounded = Money.of("19.99", "USD").multiply("0.07"); // 1.3993
formatMoney(unrounded); // "$1.40" — looks posted, is not
```

A screen showing `$1.40` while the database holds `1.3993` is the classic version of this bug. Round before persisting, not before rendering.

## Rounding early instead of at boundaries

```ts
// Wrong — three roundings inside one formula
const tax = net.with(round).with(Tax.onExclusive("11")).with(round).with(round);

// Right — one rounding per posted value
const taxAmount = net.with(Tax.onExclusive("11")).with(round);
```

Intermediates keep up to 40 significant digits on purpose. Round once per value that gets stored, displayed, or posted. If you need to assert an amount was already rounded, `roundTo(2, "UNNECESSARY")` throws instead of silently fixing it. See [rounding](./rounding.md#when-to-round).

## Dividing money to split it

```ts
// Wrong — remainder cents vanish and the total no longer ties out
const share = total.divide(3); // 3.333333… (full precision, not currency scale)

// Right
const [a, b, c] = total.allocate(3); // [3.34, 3.33, 3.33]
```

`divide` is for rates and unit prices, not for splitting an amount among parties. `allocate` / `allocateByRatios` always sum back to the rounded original. See [allocate](./allocate.md).

## `numberValueExact()` throws on unrounded values

```ts
Money.of("10.00", "USD").divide(3).getNumber().numberValueExact();
// ArithmeticError: Amount 3.333333333333333333333333333333333333333
// cannot be represented exactly as a JavaScript number
```

That is the point: it converts only when the value survives the trip. For display use `formatMoney`; for transport use `toJSON()`; for arithmetic stay in `Money`. If you need a JS number for a chart axis or a sort key, round first and accept that it is a derived approximation, not the amount.

## Error reference

| Error | Typical cause |
| --- | --- |
| `ParseError` | Fractional `number` amount or factor, malformed amount string, bad JSON shape |
| `CurrencyMismatchError` | Mixed currencies in arithmetic, comparison, or aggregates |
| `UnknownCurrencyError` | Currency code not in ISO 4217 and not registered |
| `ArithmeticError` | Division by zero, invalid allocation input, `UNNECESSARY` rounding violated, scale-less currency in a scale-dependent operation, invalid FX factor, wrong conversion base |

All four extend `MoneyError`, so a boundary handler can catch the family:

```ts
import { MoneyError } from "@eristack/money";

try {
  postJournal(lines);
} catch (error) {
  if (error instanceof MoneyError) return badRequest(error.message);
  throw error;
}
```

## See also

- [Concepts](./concepts.md) — why these rules exist
- [Rounding](./rounding.md) · [Allocate & split](./allocate.md) · [Currency conversion](./conversion.md)
- [Serialization](./serialization.md) — the wire format in detail
