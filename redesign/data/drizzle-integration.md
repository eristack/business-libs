# Drizzle integration tests (verified 2026-10-23)

**Command:** `pnpm eristack check --profile integration` → **OK** (build + `pnpm test:integration`)

**Harness:** `scripts/run-integration-tests.mjs` runs `tests/drizzle.integration.test.ts` per package.

| Package | Integration file | Notes |
| --- | --- | --- |
| `@eristack/hash-chained-ledger` | yes | HCL store |
| `@eristack/financial-ledger` | yes | Uses HCL harness |
| `@eristack/stock-movement` | yes | |
| `@eristack/valuations` | yes | Drizzle layers + HCL: fifo, lifo, movingAverage, fefo |
| `@eristack/doc-number` | yes | format/sequence |
| `@eristack/qups` | yes | profile/line stores |
| `@eristack/data-grid` | yes | `executeDrizzleList` wall + decimal |
| `@eristack/idempotency` | yes | |
| `@eristack/rbac` | yes | |
| `@eristack/epoch` | yes | |
| `@eristack/file-manager` | yes | |
| `@eristack/payment-manager` | yes | |
| `@eristack/jwt-auth` | yes | refresh token store save/find |
| `@eristack/comms` | yes | message + delivery event store |
| `@eristack/outbox` | yes | enqueue idempotency dedupe |
| `@eristack/oauth` | yes | pending login save/consume |
| `@eristack/backseat` | yes | sqlite document store + atomic |

## Packages with `/drizzle` but **no** `drizzle.integration.test.ts` (debt)

| Package | Drizzle path |
| --- | --- |
| `@eristack/drizzle` | infrastructure (unit tests in package) |

**Finding:** F-001 **partially closed** (matrix complete); F-003 **partially closed** (four methods on Drizzle integration; hifo/lofo/weightedAverage/standardCost/specificIdentification unit-only).
