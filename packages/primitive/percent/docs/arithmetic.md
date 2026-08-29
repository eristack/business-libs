# Arithmetic

## percentOf

Line extension before tax:

```ts
percentOf("250", parsePercent("10%")); // "25"
```

Both operands are decimal strings; result is decimal string (not rounded currency).

## plusPercent / minusPercent

Gross-up and discount base:

```ts
plusPercent("100", parsePercent("10%"));  // "110" — add 10%
minusPercent("100", parsePercent("10%")); // "90"  — subtract 10%
```

## addPercents

Combine component rates only when policy allows simple addition (e.g. stacked surcharges):

```ts
addPercents(parsePercent("5%"), parsePercent("2%")); // { ratio: "0.07" }
```

Tax-on-tax and compound discounts need app rules — do not assume `addPercents` matches statutory calculation.

## Order with money rounding

1. Compute line subtotal as string (QUPS / money)
2. `percentOf(subtotal, taxRate)` → tax string
3. `Money.of(tax, currency)` + `round` at boundary

Applying percent after float conversion defeats the purpose of this package.

## toPercentSymbol

Display only:

```ts
toPercentSymbol(parsePercent("0.11")); // "11%"
```

Do not parse display strings back from formatted UI without user intent.
