# API reference

## Types

- `Fraction` — `{ num: string; den: string }` reduced, `den > 0`
- `CompareFraction` — `-1 | 0 | 1`
- `ApproximateFractionOptions` — `{ maxDenominator?: string }`

## Parse & construct

| Function | Description |
| --- | --- |
| `fraction(num, den)` | From integer strings, reduced |
| `parseFraction(input)` | `n/d`, mixed `w n/d`, integer |
| `zeroFraction()`, `oneFraction()` | Constants |

## Arithmetic

| Function | Description |
| --- | --- |
| `addFraction`, `subtractFraction` | Exact ± |
| `multiplyFraction`, `divideFraction` | Exact × ÷ |
| `negateFraction`, `absFraction` | Sign |
| `compareFraction`, `fractionEquals` | Order / equality |

## Format & decimal

| Function | Description |
| --- | --- |
| `formatFraction` | `n/d` or integer |
| `toDecimal(f, scale?)` | Decimal string (display boundary) |
| `toRatioString` | Same as unscaled `toDecimal` |

## Approximation

| Function | Description |
| --- | --- |
| `approximateFraction(decimal, options?)` | Best rational under max denominator |
| `convergentFraction(decimal, maxDenominator?)` | Continued-fraction convergent |

## Utilities

| Function | Description |
| --- | --- |
| `gcd(a, b)` | BigInt GCD (exported for tests/tools) |

## Errors

- `FractionParseError`
- `FractionDomainError`
