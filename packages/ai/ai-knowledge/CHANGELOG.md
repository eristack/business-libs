# @eristack/ai-knowledge

## 0.1.10

### Patch Changes

- 294445c: Add canonical guides and site docs: `backseat-then-backend`, `document-lines-erp`, `optimistic-document-version`. Add matching recipes. Update `erp-modules` rationale to deprioritize stock/GL for document ERPs; remove procurement-spine artifacts.

## 0.1.9

### Patch Changes

- 54e2430: Add package design targets to agent-workflow and dev-conventions. Update line-pricing-qups and data-grid-lists recipes (and catalog skill descriptions) for QUPS_TRUTH_MODES, amount-only form validators, and decimal/money list field types so consumers discover the new exports. Add timestamp-persist recipe.

## 0.1.8

### Patch Changes

- 641854e: Add timestamp-instant and timestamp-wall recipes; catalog sync for @eristack/timestamp.

## 0.1.7

### Patch Changes

- c6cf43f: Document Zod 4-only stack default; update `money-persist` and `line-pricing-qups` recipes for money adapter and qups column conventions.

## 0.1.6

### Patch Changes

- 237f114: Add `@eristack/epoch` to catalog, `epoch-cache-invalidation` recipe, upgrading Backseat matrix row, and AGENTS intent entries.
- 7847ca5: Add MIT license: root `LICENSE`, per-package `LICENSE` in publish tarball, and `"license": "MIT"` in `package.json`.

## 0.1.5

### Patch Changes

- 525f3b3: Add canonical upgrade guide (`knowledge/upgrading.md`): full Backseat spine matrix, ERP bootstrap, peers, Changesets — one file for agents (not eleven stubs). `upgrading-eristack` skill, publish gate (`pnpm exports:check`), docs-depth-tokens hard rule. Per-package `docs/backseat.md` redirect + deltas.

## 0.1.4

### Patch Changes

- 525f3b3: Add consumer upgrade guide (`knowledge/upgrading.md`, site docs), `upgrading-eristack` Intent skill, `eristack-upgrade` recipe, and Backseat peer/changelog guidance in dev-conventions, stack-defaults, and checklists. Regenerated catalog and recipes.

## 0.1.3

### Patch Changes

- 696954f: Add seven-layer taxonomy (infrastructure, ui, features), scaffold `@eristack/backseat` and `@eristack/multitab`, site roadmap pages, and sync ai-knowledge catalog to 16 sibling packages.

## 0.1.2

### Patch Changes

- 9c3ef3d: Refresh agent knowledge for release: catalog includes ledger family packages, docs+skills hard-rule for every iteration, and Intent skill metadata aligned to the package version. Skills ship inside this npm package — they are not versioned or published separately.

## 0.1.1

### Patch Changes

- eca41d2: Add hash-chained ledger service and stock / financial / valuation capability packages.

## 0.1.0

### Minor Changes

- 7db29a1: Initial release of `@eristack/ai-knowledge`: recommend/loadPlan API, Intent skills for routing and agent workflow, hand-authored recipes, and generated catalog sync from sibling packages.
