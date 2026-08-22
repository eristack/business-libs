# @eristack/qups

## 0.3.0

### Minor Changes

- c6cf43f: Breaking: `qupsLineColumns()` uses one shared `currency` column and numeric `*Amount` fields via `@eristack/money/drizzle`. Updates `QupsColumnValues`, stores, and `withQupsColumns`. Migration notes in docs.

### Patch Changes

- Updated dependencies [c6cf43f]
  - @eristack/money@0.3.0

## 0.2.1

### Patch Changes

- 7847ca5: Add MIT license: root `LICENSE`, per-package `LICENSE` in publish tarball, and `"license": "MIT"` in `package.json`.
- Updated dependencies [7847ca5]
  - @eristack/money@0.2.1

## 0.2.0

### Minor Changes

- 8015590: Add `./backseat` and `./backseat/store` adapters across spine packages for browser prototypes (IndexedDB persistence + registerRoute/registerAction wiring). Adds `@eristack/backseat/adapters` REST bridge utilities.

## 0.1.0

### Minor Changes

- ef2f284: Add `@eristack/qups`: business-layer line pricing with `calculateLine`/`patchLine` (TanStack Form + BE), 2-of-3 SoT, modifiers, tax on `@eristack/money`, and optional injectable Drizzle columns for app detail tables.
