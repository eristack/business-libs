# @eristack/jwt-auth

## 0.4.2

### Patch Changes

- Updated dependencies [78d8154]
  - @eristack/data-grid@0.2.2

## 0.4.1

### Patch Changes

- 7847ca5: Add MIT license: root `LICENSE`, per-package `LICENSE` in publish tarball, and `"license": "MIT"` in `package.json`.
- Updated dependencies [7847ca5]
  - @eristack/data-grid@0.2.1

## 0.4.0

### Minor Changes

- 8015590: Add `./backseat` and `./backseat/store` adapters across spine packages for browser prototypes (IndexedDB persistence + registerRoute/registerAction wiring). Adds `@eristack/backseat/adapters` REST bridge utilities.

### Patch Changes

- Updated dependencies [8015590]
  - @eristack/data-grid@0.2.0

## 0.3.1

### Patch Changes

- 5d508e1: Fix import-time crash in Vite browser bundles: replace Node-only `crypto.scrypt` / `util.promisify` with isomorphic Web Crypto + `@noble/hashes` scrypt so `createJwtAuth` and `createRestActions` load in Backseat prototypes.

## 0.3.0

### Minor Changes

- 03ef4d7: Add `@eristack/data-grid` for schema-aware list queries (advanced filters vs search mode, multi-sort, offset/cursor pagination) with drizzle/rest/express/nest/client/react adapters.

  Filter URLs use TanStack Router–style JSON search params (`filters` / `sorts` as JSON); `toSearch` / `fromSearch` for Router `validateSearch`. Drizzle adapter includes `executeDrizzleList` / `columnsFromSource` so apps only supply the projection (see `examples/express` orders grid). React `/react` adds `useDataGridController` draft/commit + headless filter rows (commit on modal Apply / search blur — no fetch-on-type).

  **Breaking:** `jwt-auth` `listSessions` and `doc-number` `listFormats` (plus REST/client) now return `DataGridResult` (`{ items, pageInfo, query }`) and accept optional data-grid query input.

### Patch Changes

- 03ef4d7: React adapters now wrap `/client` with TanStack Query (lists/mutations) and optional TanStack Form option helpers. `/client` stays framework-agnostic (base for future Vue/Svelte). Apps own `QueryClientProvider`.
- Updated dependencies [03ef4d7]
- Updated dependencies [03ef4d7]
  - @eristack/data-grid@0.1.0

## 0.2.0

### Minor Changes

- 2b3c90e: Add username/password credentials (scrypt) as a child of app users via `jwt_auth_credentials`, session listing/revoke-by-id, and tighter adapter DI (injected storage/baseUrl, Nest `registerAsync`).

## 0.1.0

### Minor Changes

- 713ceb8: Initial public release of `@eristack/money` and `@eristack/jwt-auth`.
