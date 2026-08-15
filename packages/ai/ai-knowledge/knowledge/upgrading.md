# Upgrading @eristack packages

Guide for **app consumers** (and agents wiring consumer apps): see what shipped, what to bump, and what to change — without reading the whole monorepo.

## 1. See what is available

### npm (consumer apps)

```bash
# One package
pnpm npm view @eristack/backseat version
pnpm npm view @eristack/jwt-auth versions --json | tail -5

# Everything you depend on (from app root)
pnpm outdated '@eristack/*'
```

### Site changelogs (human-readable)

Each library has a changelog on the public site:

```text
https://eristack.dev/{slug}/changelog
```

Examples: `/backseat/changelog`, `/jwt-auth/changelog`, `/doc-number/changelog`.

Package docs (including `docs/backseat.md` where applicable) live under `/docs/{slug}/…` on the site — rendered from `packages/<category>/<name>/docs/`.

### Monorepo (contributors)

- Pending release notes: `.changeset/*.md`
- Dry run: `pnpm changeset status`
- After merge: **Version Packages** PR updates `package.json` versions + changelogs

## 2. Current release train (Backseat + spine adapters)

When **`@eristack/backseat@0.1.0`** ships, these packages gain **`./backseat`** and **`./backseat/store`** export paths (browser prototype wiring):

| Package | New subpaths | IndexedDB helper |
| --- | --- | --- |
| `@eristack/backseat` | `.`, `./store`, `./react`, `./adapters`, `./seeds` | `createIndexedDbBackseatStore` |
| `@eristack/jwt-auth` | `./backseat`, `./backseat/store` | `createIndexedDbJwtAuthStores` |
| `@eristack/doc-number` | `./backseat`, `./backseat/store` | `createIndexedDbDocNumberStores` |
| `@eristack/qups` | `./backseat`, `./backseat/store` | `createIndexedDbQupsStores` |
| `@eristack/stock-movement` | `./backseat`, `./backseat/store` | `createIndexedDbStockMovementStores` |
| `@eristack/financial-ledger` | `./backseat`, `./backseat/store` | `createIndexedDbFinancialLedgerStores` |
| `@eristack/valuations` | `./backseat`, `./backseat/store` | `createIndexedDbValuationsStores` |
| `@eristack/data-grid` | `./backseat`, `./backseat/store` | `createIndexedDbDataGridContext` |
| `@eristack/hash-chained-ledger` | `./backseat`, `./backseat/store` | `createIndexedDbHashChainedLedgerStores` |
| `@eristack/rbac` | `./backseat`, `./backseat/store` | `createIndexedDbRbacStores` |
| `@eristack/abac` | `./backseat`, `./backseat/store` | `createIndexedDbAbacContext` |
| `@eristack/pbac` | `./backseat`, `./backseat/store` | `createIndexedDbPbacContext` |

**Production** apps still use **`./drizzle`**, **`./express`**, **`./react`**, etc. Backseat is **prototype / Storybook / local UX only**.

## 3. Consumer upgrade checklist (Backseat 0.1.0)

### Install

```bash
pnpm add @eristack/backseat@^0.1.0
# plus any spine packages you use, e.g.:
pnpm add @eristack/jwt-auth@^0.4.0 @eristack/doc-number@^0.3.0
```

Use the versions from npm / changelogs after the Version Packages PR merges — the `^` ranges above are illustrative.

### Optional Backseat peer (spine packages)

If you import `@eristack/*/backseat`, declare a **semver peer** on Backseat (not `workspace:*`):

```json
"peerDependencies": {
  "@eristack/backseat": "^0.1.0"
},
"peerDependenciesMeta": {
  "@eristack/backseat": { "optional": true }
},
"devDependencies": {
  "@eristack/backseat": "^0.1.0"
}
```

- **`^0.1.0`** accepts `0.1.x` and rejects `1.0.0` until you widen the range.
- In the **business-libs monorepo**, keep **`devDependencies`: `workspace:*`** for local linking; **peers** still use **`^0.1.0`** so Changesets can evaluate compatibility.

### Wire a prototype (minimal)

```ts
import { createBackseat } from "@eristack/backseat";
import { createIndexedDbBackseatStore } from "@eristack/backseat/store";
import {
  createIndexedDbJwtAuthStores,
  registerJwtAuthBackseat,
} from "@eristack/jwt-auth/backseat/store";
import { createJwtAuth } from "@eristack/jwt-auth";

const { backseatStore, credentials, refreshTokens } =
  createIndexedDbJwtAuthStores({ dbName: "my-erp" });

const jwtAuth = createJwtAuth({ /* secrets */, credentials, store: refreshTokens });

const api = createBackseat({ store: backseatStore, baseUrl: "/api" });
registerJwtAuthBackseat(api, { jwtAuth });
```

Per-package examples: each library’s **`docs/backseat.md`**.

### Do not

- Ship IndexedDB Backseat as production persistence
- Use `workspace:*` in **published** `peerDependencies` (npm consumers)
- Assume a Backseat bump forces you to major-bump unrelated `@eristack/*` packages if your peer range still satisfies the new Backseat version

## 4. What to read when upgrading any package

1. **`/{slug}/changelog`** on the site (or package `CHANGELOG.md` after publish)
2. Package **`docs/`** — breaking changes and migration notes
3. Load the package **Intent skill** before editing wiring:

   ```bash
   pnpm dlx @tanstack/intent@latest load @eristack/jwt-auth#jwt-auth-adapters
   ```

4. `@eristack/ai-knowledge#upgrading-eristack` (this guide as a skill)

## 5. Contributor: Changesets + internal peers

### Changesets on `0.x` packages

| Intent | Write in changeset | Result on `0.1.0` | Result on `0.0.0` |
| --- | --- | --- | --- |
| Fix / additive feature (stay pre-1.0) | **`patch`** | `0.1.0 → 0.2.0` | `0.0.0 → 0.1.0` |
| First release from zero | **`minor`** | `0.1.0 → 1.0.0` ⚠️ | `0.0.0 → 0.1.0` |
| Intentional stable **1.0** | **`minor`** on `0.x` | `→ 1.0.0` | `→ 1.0.0` |

Use **`patch`** for routine adapter/docs/features on packages already past `0.0.0`. Use **`minor`** on `0.0.0` only for first publish, or when you **mean 1.0.0**.

### Internal optional peers (Backseat)

`.changeset/config.json`:

```json
"updateInternalDependencies": "patch",
"___experimentalUnsafeOptions_WILL_CHANGE_IN_PATCH": {
  "onlyUpdatePeerDependentsWhenOutOfRange": true
}
```

**Peer dependents bump only when the new peer version falls outside the declared range.**

- Peers must use **semver** (`^0.1.0`), not `workspace:*`.
- **`devDependencies`** stay **`workspace:*`** in the monorepo.
- No **`fixed`** / **`linked`** groups — independent package versions.

## 6. Agent load order (upgrade task)

1. `@eristack/ai-knowledge#upgrading-eristack`
2. `pnpm outdated '@eristack/*'` or npm view / changelogs
3. Per bumped package: that package’s `#…-adapters` or `#…-core` skill
4. For Backseat prototypes: `@eristack/backseat#backseat-core` + target `docs/backseat.md`
