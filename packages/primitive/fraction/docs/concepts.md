# Concepts

## Rational vs irrational

A **fraction** in this library is always a **rational number** — ratio of two integers. Operations stay exact until you choose to approximate or convert to decimal.

**Irrational** numbers (π, √2, e) have no exact `{ num, den }`. Use:

- `approximateFraction(decimal, { maxDenominator })` — brute-force best error under cap
- `convergentFraction(decimal, maxDenominator)` — continued-fraction convergents (often fewer terms)

Both return an **exact** rational that **approximates** the input. Pick `maxDenominator` from domain rules (e.g. 64 for inch fractions, 10000 for recipes).

## vs `@eristack/percent`

| | `@eristack/percent` | `@eristack/fraction` |
| --- | --- | --- |
| Shape | `{ ratio: "0.11" }` | `{ num: "11", den: "100" }` |
| Typical use | VAT %, bps tables | Recipe parts, yield splits |
| Range | Usually 0–1 ratio | Any rational |
| Arithmetic | On **amount** strings via `percentOf` | On **fractions** via `addFraction`, etc. |

Convert at boundaries: `parseFraction("11/100")` and `toRatioString` interoperate with ratio strings; prefer **percent** for tax master data.

## vs `@eristack/uom`

UOM converts **quantities with units** using fixed decimal ratios (kg/g). Fraction handles **pure rationals** without dimensions — e.g. “2 parts flour : 1 part water” before you attach kg.

## vs brainstorm `@eristack/ratio`

A future **ratio** package may focus on decimal ratio strings for allocation weights. **Fraction** is the exact rational layer; ratio decimals can map via `approximateFraction` or `toRatioString` when you accept decimal expansion.

## Normal form

- Denominator is always **positive**
- Sign is carried in the numerator
- `num` and `den` are coprime (GCD removed)

## Errors

- `FractionParseError` — bad input string
- `FractionDomainError` — divide by zero, invalid max denominator
