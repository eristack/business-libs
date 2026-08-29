# API reference

## Types

| Export | Description |
| --- | --- |
| `Percent` | `{ ratio: string }` |
| `PercentValue` | Ratio string alias |
| `PercentInput` | Discriminated parse input |

## Parse & construct

| Export | Description |
| --- | --- |
| `parsePercent(input)` | String or PercentInput → Percent |
| `fromBasisPoints(bps)` | bps string → Percent |
| `fromPercentSymbol(value)` | `"11"` → 11% |
| `toBasisPoints(p)` | Percent → bps string |
| `toPercentSymbol(p)` | Display `"11%"` |
| `PercentParseError` | Invalid/negative input |

## Arithmetic

| Export | Description |
| --- | --- |
| `percentOf(amount, percent)` | amount × ratio |
| `plusPercent(amount, percent)` | amount × (1 + ratio) |
| `minusPercent(amount, percent)` | amount × (1 − ratio) |
| `addPercents(a, b)` | Sum ratios |

## Zod (`@eristack/percent/zod`)

| Export | Description |
| --- | --- |
| `percentSchema` | `{ ratio }` object |
| `percentRatioSchema` | Ratio string |
| `PercentJson` | Inferred type |
