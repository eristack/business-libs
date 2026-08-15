# @eristack/pbac

## 0.2.1

### Patch Changes

- 7847ca5: Add MIT license: root `LICENSE`, per-package `LICENSE` in publish tarball, and `"license": "MIT"` in `package.json`.

## 0.2.0

### Minor Changes

- 8015590: Add `./backseat` and `./backseat/store` adapters across spine packages for browser prototypes (IndexedDB persistence + registerRoute/registerAction wiring). Adds `@eristack/backseat/adapters` REST bridge utilities.

## 0.1.0

### Minor Changes

- 5cdaca4: Add access-control services: `@eristack/rbac` (boolean roles/permissions), `@eristack/abac` (attribute policy functions), and `@eristack/pbac` (document software policies), each with core + Express/Nest/React adapters (RBAC also Drizzle).
