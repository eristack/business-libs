# @eristack/backseat

## 0.1.8

### Patch Changes

- 4ef9e8c: Add `@eristack/backseat/drizzle` (`createDrizzleBackseatStore` with staged sqlite `atomic()`) and `@eristack/backseat/workshop` (`bootWorkshopServer`).
- 35b630f: Add `@eristack/backseat/testing` mirror helpers, `pnpm backseat:routes:check`, `@eristack/backseat/express` + `/nest` `createMapDomainError`, `/ports` document store types, and `/client` `createWorkshopClient`.

## 0.1.7

### Patch Changes

- Add registerHorizonDocumentSpine on ./seeds (dynamic imports, no workspace devDeps — avoids turbo build cycle), optional spine peerDependencies, and Horizon A bootstrap docs.

## 0.1.6

### Patch Changes

- b793eed: Add testing subpath for memory store and diffRoutesSnapshots for Horizon route migration.

## 0.1.5

### Patch Changes

- 61b28d1: Add checked-in Horizon A seed pack (`loadHorizonASeedV1` from horizon-a-v1.json).
- c2ee619: Backseat M3 demo flows: `createErpDemoBackseat()` wires ERP seed + PO submit/approve controllers; draft PO in seed for list → edit → status-action tests.

## 0.1.4

### Patch Changes

- Export `register-helpers` from `./adapters` (`normalizeBasePath`, `validationError`, `registerMountedRoutes`, `jsonError` re-exports).

## 0.1.3

### Patch Changes

- 294445c: Add `store.atomic()` for multi-collection document writes. Add `listRoutes()`, `routesSnapshot()`, and Devtools Routes export for Horizon B derivation. Add `jsonError()`, `versionConflict()`, and `BackseatVersionConflictError` for standard error envelopes.

## 0.1.2

### Patch Changes

- 7847ca5: Add MIT license: root `LICENSE`, per-package `LICENSE` in publish tarball, and `"license": "MIT"` in `package.json`.

## 0.1.1

### Patch Changes

- a9f6903: Publish `./adapters` export (`registerRestLikeRoutes`, `asDate`, `asNullableDate`, `toRestLikeRequest`) required by spine `./backseat` packages. Fixes Vite `Missing "./adapters" specifier` on `@eristack/backseat@0.1.0`.

## 0.1.0

### Minor Changes

- 8015590: Add `./backseat` and `./backseat/store` adapters across spine packages for browser prototypes (IndexedDB persistence + registerRoute/registerAction wiring). Adds `@eristack/backseat/adapters` REST bridge utilities.

## 0.1.0

### Minor Changes

- 696954f: Add seven-layer taxonomy (infrastructure, ui, features), scaffold `@eristack/backseat` and `@eristack/multitab`, site roadmap pages, and sync ai-knowledge catalog to 16 sibling packages.
