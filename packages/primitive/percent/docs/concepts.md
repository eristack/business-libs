# Concepts

## Stored form: ratio

Internally `Percent` is `{ ratio: string }` where ratio is a decimal:

| Meaning | ratio string |
| --- | --- |
| 11% | `"0.11"` |
| 7.5% | `"0.075"` |
| 100% | `"1"` |

Never store `11` meaning 11% without parsing — use `parsePercent("11%")` or `fromBasisPoints`.

## Input kinds

```ts
parsePercent("11%");                                    // percent symbol
parsePercent("0.11");                                   // raw ratio
parsePercent({ kind: "basisPoints", value: "1100" });   // bps
parsePercent({ kind: "percent", value: "11" });
parsePercent({ kind: "ratio", value: "0.11" });
```

## vs @eristack/money percent helpers

| Use | Package |
| --- | --- |
| Rate is master data / tax code | `@eristack/percent` |
| Apply known % to `Money` with currency | `@eristack/money` `percentOf` |

Typical flow: `percentOf(lineAmount, taxRate)` on strings → wrap in `Money.of` → round at ledger.

## Immutability

`Percent` objects are plain data — create new via `parsePercent` / `fromBasisPoints`; `addPercents` returns new ratio.

## Negative rates

Parsing rejects negative ratios. Credits/reversals use positive rate + app sign on amount.
