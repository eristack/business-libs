# @eristack/multitab

## 0.2.2

### Patch Changes

- 2773117: Multitab alpha: `useDirtyTab`, `createConfirmBeforeClose`, and dirty-tab helpers for Router and state-only providers.
- c2ee619: Add React `MultitabProvider` smoke tests (SSR render + missing-provider guard).

## 0.2.1

### Patch Changes

- 7847ca5: Add MIT license: root `LICENSE`, per-package `LICENSE` in publish tarball, and `"license": "MIT"` in `package.json`.

## 0.2.0

### Minor Changes

- 12eb114: Close active tab activates the most-recently-used remaining tab (MRU), not the first tab in order. Persists optional `recentTabIds` in localStorage state.

## 0.1.0

### Minor Changes

- 696954f: Add seven-layer taxonomy (infrastructure, ui, features), scaffold `@eristack/backseat` and `@eristack/multitab`, site roadmap pages, and sync ai-knowledge catalog to 16 sibling packages.
