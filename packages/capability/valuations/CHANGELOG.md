# @eristack/valuations

## 0.2.0

### Minor Changes

- c6cf43f: Breaking: cost layer Drizzle table uses `unitCostAmount` (numeric) instead of `unitCost` TEXT. `receive` value chain uses `Money.multiply`.

### Patch Changes

- Updated dependencies [c6cf43f]
  - @eristack/money@0.3.0

## 0.1.1

### Patch Changes

- 7847ca5: Add MIT license: root `LICENSE`, per-package `LICENSE` in publish tarball, and `"license": "MIT"` in `package.json`.
- Updated dependencies [7847ca5]
  - @eristack/money@0.2.1
  - @eristack/hash-chained-ledger@0.1.1

## 0.1.0

### Minor Changes

- 8015590: Add `./backseat` and `./backseat/store` adapters across spine packages for browser prototypes (IndexedDB persistence + registerRoute/registerAction wiring). Adds `@eristack/backseat/adapters` REST bridge utilities.

### Patch Changes

- Updated dependencies [8015590]
  - @eristack/hash-chained-ledger@0.1.0

## 0.0.1

### Patch Changes

- eca41d2: Add hash-chained ledger service and stock / financial / valuation capability packages.
- Updated dependencies [eca41d2]
  - @eristack/hash-chained-ledger@0.0.1
