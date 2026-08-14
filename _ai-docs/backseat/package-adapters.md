# Backseat package adapters (2026-08-14)

Added `./backseat` + `./backseat/store` to 11 spine packages.

## Pattern

- `@eristack/<pkg>/backseat` — memory `createBackseat*Stores()` + `register*Backseat(api)`
- `@eristack/<pkg>/backseat/store` — `createIndexedDb*Stores({ dbName })` wrapping `@eristack/backseat/store`
- `@eristack/backseat/adapters` — `registerRestLikeRoutes`, `toRestLikeRequest`, date JSON helpers

## Packages

doc-number, financial-ledger, qups, stock-movement, valuations, data-grid, hash-chained-ledger, jwt-auth, pbac, rbac, abac

## Catalog / recipe

Updated `backseat-mock-backend` recipe rationale. `backseat-core` skill mentions `/adapters`.

## Changeset

`.changeset/backseat-package-adapters.md` (minor bumps)
