# Gotchas

## Double scaling

```ts
percentOf("100", parsePercent("0.11")); // wrong if user meant 11%
percentOf("100", parsePercent("11%"));  // correct
```

## Mixing money Percent and this package

`@eristack/money` `percentOf(money, "7")` means **7 percent points**. `@eristack/percent` stores ratio `0.07`. Convert explicitly.

## Compound tax

`addPercents` is not compound tax (11% + 5% on top of taxed amount). Implement compound rules in app.

## Empty and malformed input

`parsePercent("")`, `parsePercent("%")`, and `parsePercent("abc%")` throw **`PercentParseError`** with a clear message — not raw Decimal errors.

```ts
parsePercent(0.11); // wrong type — use string
```

## Rounding direction

percent package does not apply banker's rounding — delegate to `@eristack/money` `Rounding` at invoice total.

## Rates over 100%

Ratio `"1.5"` (150%) parses if non-negative — allow in surcharge scenarios; reject in UI if business forbids.
