# eristack/business-libs — Skill Spec

Monorepo of Eristack business primitives. Current publishable packages: `@eristack/money` (JSR 354–inspired money) and `@eristack/jwt-auth` (JWT access + opaque refresh with layered adapters).

## Domains

| Domain | Description | Skills |
| ------ | ----------- | ------ |
| Monetary amounts | Construct, compare, and arithmetically transform Money | money-amounts |
| Ledger operations | Round, allocate, convert, and serialize at ERP boundaries | money-ledger |
| JWT token lifecycle | Issue/verify/refresh/revoke tokens | jwt-auth-core |
| JWT adapters | Drizzle + REST/Express/Nest/client/React | jwt-auth-adapters |

## Skill Inventory

| Skill | Type | Domain | What it covers | Failure modes |
| ----- | ---- | ------ | -------------- | ------------- |
| money-amounts | core | monetary-amounts | Money.of, ofMinor, arithmetic, compare | 3 |
| money-ledger | core | ledger-operations | Rounding, allocate, Conversion, JSON | 3 |
| jwt-auth-core | core | jwt-token-lifecycle | createJwtAuth, issue/verify/refresh/revoke | 3 |
| jwt-auth-adapters | core | jwt-adapters | drizzle, rest, express, nest, client, react | 3 |

## Failure Mode Inventory

### money-amounts (3)

| # | Mistake | Priority | Source | Cross-skill? |
| - | ------- | -------- | ------ | ------------ |
| 1 | Construct Money from fractional number | CRITICAL | docs/concepts.md | — |
| 2 | Add mixed currencies directly | HIGH | docs/arithmetic.md | money-ledger |
| 3 | Persist intermediate unrounded tax | HIGH | docs/rounding.md | money-ledger |

### money-ledger (3)

| # | Mistake | Priority | Source | Cross-skill? |
| - | ------- | -------- | ------ | ------------ |
| 1 | Split with plain divide | CRITICAL | docs/allocate.md | — |
| 2 | Expect library FX feeds | HIGH | docs/conversion.md | — |
| 3 | Serialize amount as JSON number | CRITICAL | docs/serialization.md | — |

### jwt-auth-core (3)

| # | Mistake | Priority | Source | Cross-skill? |
| - | ------- | -------- | ------ | ------------ |
| 1 | Login/password inside core | CRITICAL | docs/index.md | — |
| 2 | Store refresh tokens plaintext | CRITICAL | docs/refresh-flow.md | jwt-auth-adapters |
| 3 | Ignore refresh reuse errors | HIGH | docs/refresh-flow.md | — |

### jwt-auth-adapters (3)

| # | Mistake | Priority | Source | Cross-skill? |
| - | ------- | -------- | ------ | ------------ |
| 1 | Dialect `"pg"` instead of `"pgsql"` | CRITICAL | drizzle/table.ts | — |
| 2 | Duplicate Express refresh handlers | HIGH | docs/adapters.md | — |
| 3 | Expect React UI from `/react` | HIGH | docs/adapters.md | — |

## Tensions

| Tension | Skills | Agent implication |
| ------- | ------ | ----------------- |
| Precision vs ledger scale | money-amounts ↔ money-ledger | Round every step or never round |
| Core purity vs adapter convenience | jwt-auth-core ↔ jwt-auth-adapters | Put login/SQL in core or reimplement refresh in Express |

## Cross-References

| From | To | Reason |
| ---- | -- | ------ |
| money-amounts | money-ledger | Intermediates need boundary rounding |
| money-ledger | money-amounts | Ops assume valid Money construction |
| jwt-auth-core | jwt-auth-adapters | Production store + shells |
| jwt-auth-adapters | jwt-auth-core | Shared createJwtAuth instance |

## Recommended Skill File Structure

- **Core skills (flat):** money-amounts, money-ledger, jwt-auth-core, jwt-auth-adapters
- **Framework skills:** none as separate Intent skills (Nest/Express covered inside jwt-auth-adapters)
- **Reference files:** none yet

## Remaining Gaps

| Skill | Question | Status |
| ----- | -------- | ------ |
| money-ledger | Product defaults for HALF_UP display vs HALF_EVEN ledger | open |
