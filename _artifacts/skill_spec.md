# @eristack/money — Skill Spec

`@eristack/money` is a TypeScript money library modeled after JSR 354. It provides immutable `Money` amounts with strict currency checks, adaptive bigint/decimal storage, rounding, allocation, formatting, and application-supplied FX conversion for ERP and business software.

## Domains

| Domain | Description | Skills |
| ------ | ----------- | ------ |
| Monetary amounts | Construct, compare, and arithmetically transform Money | money-amounts |
| Ledger operations | Round, allocate, convert, and serialize at ERP boundaries | money-ledger |

## Skill Inventory

| Skill | Type | Domain | What it covers | Failure modes |
| ----- | ---- | ------ | -------------- | ------------- |
| money-amounts | core | monetary-amounts | Money.of, ofMinor, arithmetic, compare | 3 |
| money-ledger | core | ledger-operations | Rounding, allocate, Conversion, JSON | 3 |

## Failure Mode Inventory

### money-amounts (3 failure modes)

| # | Mistake | Priority | Source | Cross-skill? |
| - | ------- | -------- | ------ | ------------ |
| 1 | Construct Money from fractional number | CRITICAL | docs/concepts.md | — |
| 2 | Add mixed currencies directly | HIGH | docs/arithmetic.md | money-ledger |
| 3 | Persist intermediate unrounded tax | HIGH | docs/rounding.md | money-ledger |

### money-ledger (3 failure modes)

| # | Mistake | Priority | Source | Cross-skill? |
| - | ------- | -------- | ------ | ------------ |
| 1 | Split with plain divide | CRITICAL | docs/allocate.md | — |
| 2 | Expect library FX feeds | HIGH | docs/conversion.md | — |
| 3 | Serialize amount as JSON number | CRITICAL | docs/serialization.md | — |

## Tensions

| Tension | Skills | Agent implication |
| ------- | ------ | ----------------- |
| Precision vs ledger scale | money-amounts ↔ money-ledger | Round every step or never round |

## Cross-References

| From | To | Reason |
| ---- | -- | ------ |
| money-amounts | money-ledger | Intermediates need boundary rounding |
| money-ledger | money-amounts | Ops assume valid Money construction |

## Recommended Skill File Structure

- **Core skills:** money-amounts, money-ledger (flat, minimal-library fast path)
- **Framework skills:** none (framework-agnostic package)
- **Lifecycle skills:** none for this small build
- **Composition skills:** none yet
- **Reference files:** none yet

## Composition Opportunities

| Library | Integration points | Composition skill needed? |
| ------- | ------------------ | ------------------------- |
| — | — | no — single package for now |

## Remaining Gaps

| Skill | Question | Status |
| ----- | -------- | ------ |
| money-ledger | Product defaults for HALF_UP display vs HALF_EVEN ledger | open |
