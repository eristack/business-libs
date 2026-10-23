# Drizzle integration tests (verified 2026-10-23)

**Command:** `pnpm eristack check --profile integration` → **OK** (build + `pnpm test:integration`)

**Harness:** `scripts/run-integration-tests.mjs` runs `tests/drizzle.integration.test.ts` per package.

| Package | Integration file | Notes |
| --- | --- | --- |
| `@eristack/hash-chained-ledger` | yes | HCL store |
| `@eristack/financial-ledger` | yes | Uses HCL harness |
| `@eristack/stock-movement` | yes | |
| `@eristack/valuations` | yes | FIFO + layer store (single scenario) |
| `@eristack/doc-number` | yes | format/sequence |
| `@eristack/qups` | yes | profile/line stores |
| `@eristack/data-grid` | yes | `executeDrizzleList` wall + decimal |
| `@eristack/idempotency` | yes | |
| `@eristack/rbac` | yes | |
| `@eristack/epoch` | yes | |
| `@eristack/file-manager` | yes | |
| `@eristack/payment-manager` | yes | |
| `@eristack/jwt-auth` | yes | refresh token store save/find |

## Packages with `/drizzle` but **no** `drizzle.integration.test.ts` (debt)

| Package | Drizzle path |
| --- | --- |
| `@eristack/comms` | `src/drizzle/` |
| `@eristack/oauth` | `src/drizzle/` |
| `@eristack/outbox` | `src/drizzle/` |
| `@eristack/backseat` | `src/drizzle/` |
| `@eristack/drizzle` | infrastructure (unit tests in package) |

**Finding:** F-001–F-003 **partially closed** — spine ledger/list/valuations have CI proof; depth (all valuation methods, concurrency) still audit debt.
