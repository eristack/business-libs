---
"@eristack/money": minor
"@eristack/timestamp": minor
"@eristack/qups": minor
"@eristack/doc-number": minor
"@eristack/backseat": minor
"@eristack/data-grid": minor
"@eristack/epoch": minor
"@eristack/pbac": minor
"@eristack/abac": minor
"@eristack/ai-knowledge": minor
---

Generic document/cost-sheet ERP gaps (Tiga Sekawan Horizon A/B): additive APIs and agent routing without feature packages or inventory spine recipes.

### @eristack/money
- Add `convertAtQuotePerBase` for quote-per-base FX snapshots (golden USD × IDR rate path).

### @eristack/timestamp
- Add `compareWall`, `isWallInRange`, and `addWallDays` for wall-mode list filters and due-date arithmetic.

### @eristack/qups
- Add headless `applyCellPatch` and `withQupsFields` for spreadsheet cost-sheet / Backseat line storage.

### @eristack/doc-number
- Optional IANA `timezone` on formats for period keys and date tokens.
- Optional `scope` on `next()` / `peekNext()` with `{SCOPE}` pattern token and Drizzle sequence column.

### @eristack/backseat
- Add `store.atomic()` for multi-collection document writes.
- Add `listRoutes()`, `routesSnapshot()`, and Devtools Routes export for Horizon B derivation.
- Add `jsonError()`, `versionConflict()`, and `BackseatVersionConflictError` for standard error envelopes.

### @eristack/data-grid
- Add `type: wall` field filters (uses `@eristack/timestamp`).
- Add `executeBackseatList` for mock register parity with Drizzle list envelope.

### @eristack/epoch
- Add `bumpMany(scopes)` for multi-scope cache invalidation after writes.

### @eristack/pbac
- Add `documents.transitions()` declarative status transition helper.

### @eristack/abac
- Add `matchesAssignmentPair` and `attrs.assignmentPairMatch` for Role × Branch × Trade scope.

### @eristack/ai-knowledge
- Add canonical guides and site docs: `backseat-then-backend`, `document-lines-erp`, `optimistic-document-version`.
- Add recipes `backseat-then-backend`, `document-lines-erp`, `optimistic-document-version`.
- Update `erp-modules` rationale to deprioritize stock/GL for document ERPs; remove procurement-spine artifacts.
