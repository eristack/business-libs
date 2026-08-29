---
title: Upgrading packages
description: Single canonical guide — versions, Backseat matrix, peers, Changesets (read this file only)
sidebar_position: 3
---

# Upgrading @eristack packages

**Canonical guide — read this file only.** Do not open per-package `docs/backseat.md` files for upgrades or Backseat wiring; everything needed is below.

For agents: load `@eristack/ai-knowledge#upgrading-eristack` (same content). Token budget: **this one document** + optional package skill only when editing that package’s **production** adapters (`./drizzle`, `./express`).

---

## 1. Discover versions (30 seconds)

```bash
# All @eristack deps in your app
pnpm outdated '@eristack/*'

# One package
pnpm npm view @eristack/backseat version
pnpm npm view @eristack/jwt-auth versions --json
```

| Source | URL / path |
| --- | --- |
| Site changelog | `https://eristack.dev/{slug}/changelog` — e.g. `backseat`, `jwt-auth`, `doc-number` |
| npm | `@eristack/{name}` |
| Monorepo pending release | `.changeset/*.md`, `pnpm changeset status` |

**After bump:** read changelogs for packages you actually depend on, run typecheck/tests, load **one** package skill only if that package’s **production** wiring changed.

---

## 2. Install / semver (consumer)

```bash
pnpm add @eristack/backseat@^0.1.0
pnpm add @eristack/jwt-auth@^0.4.0 @eristack/doc-number@^0.3.0  # examples — use npm/changelog for real floors
```

### Optional Backseat peer (when importing `@eristack/*/backseat`)

Published apps:

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

| Rule | Why |
| --- | --- |
| Peers use **`^0.1.0`**, never `workspace:*` on npm | Changesets + consumers resolve semver |
| Monorepo **devDependencies** stay `workspace:*` | Local linking |
| Backseat **`0.1.x`** does not force major bumps on spine packages if peer range still satisfies | `onlyUpdatePeerDependentsWhenOutOfRange` |

**Do not** ship IndexedDB Backseat as production persistence. Production = **`./drizzle`**, **`./express`**, **`./react`**, **`./client`**.

### 2.1 `@eristack/*/testing` subpaths (Vitest only)

Several packages export memory stores and sqlite helpers on **`./testing`** — not for production imports:

| Package | `./testing` exports (examples) |
| --- | --- |
| `@eristack/hash-chained-ledger/testing` | `setupHclSqlite`, tamper helpers |
| `@eristack/jwt-auth/testing` | memory credential + refresh stores |
| `@eristack/qups/testing` | memory profile + line stores |
| `@eristack/doc-number/testing` | memory format + sequence stores |
| `@eristack/rbac/testing` | memory RBAC store |
| `@eristack/epoch/testing` | memory epoch store |
| `@eristack/valuations/testing` | memory layer helpers |

Prefer **`./drizzle`** in apps; use **`./testing`** only in Vitest. Main package exports stay production-facing — migration from deep test imports is incremental (D-006).

---

## 3. Backseat release train (what changed)

`@eristack/backseat@0.1.0` adds a browser mock REST engine. Eleven spine packages add:

| Subpath | Purpose |
| --- | --- |
| `@eristack/<pkg>/backseat` | Memory store factories (tests) + `register*Backseat(api)` |
| `@eristack/<pkg>/backseat/store` | `createIndexedDb*…()` for browser prototypes |

Shared REST bridge: `@eristack/backseat/adapters` (`registerRestLikeRoutes`, date JSON helpers).

### 3.1 Engine exports (`@eristack/backseat`)

| Import | Key symbols |
| --- | --- |
| `@eristack/backseat` | `createBackseat`, `createMemoryBackseatStore`, types, CRUD helpers |
| `@eristack/backseat/store` | `createIndexedDbBackseatStore({ dbName })` — **browser default** |
| `@eristack/backseat/react` | `BackseatProvider`, `BackseatDevtools`, Query hooks |
| `@eristack/backseat/adapters` | `registerRestLikeRoutes`, `toRestLikeRequest` |
| `@eristack/backseat/seeds` | `createErpDemoSnapshot()` |

Minimal engine:

```ts
import { createBackseat } from "@eristack/backseat";
import { createIndexedDbBackseatStore } from "@eristack/backseat/store";

export const api = createBackseat({
  store: createIndexedDbBackseatStore({ dbName: "my-erp" }),
  baseUrl: "/api",
  collections: { partners: {}, products: {} },
});
```

React shell:

```tsx
import { BackseatProvider, BackseatDevtools } from "@eristack/backseat/react";

<BackseatProvider backseat={api}>
  {children}
  {import.meta.env.DEV ? <BackseatDevtools /> : null}
</BackseatProvider>
```

### 3.2 Spine adapter matrix (complete)

Use **one shared** `dbName` across `createIndexedDb*…()` calls so all packages share one IndexedDB database. Pass one factory’s `backseatStore` into `createBackseat({ store })`.

| Package | Memory factory `@…/backseat` | IndexedDB `@…/backseat/store` | Register | Default route prefix | Register needs |
| --- | --- | --- | --- | --- | --- |
| `@eristack/jwt-auth` | `createBackseatJwtAuthStores()` → `{ backseatStore, credentials, refreshTokens }` | `createIndexedDbJwtAuthStores({ dbName })` | `registerJwtAuthBackseat` | `/auth` | `RestAuthConfig`: `credentials`, `store` (refresh), secrets, + optional `basePath`, `paths` |
| `@eristack/doc-number` | `createBackseatDocNumberStores()` → `{ backseatStore, formats, sequences }` | `createIndexedDbDocNumberStores({ dbName })` | `registerDocNumberBackseat` | `/doc-number` | `RestDocNumberConfig`: `formats`, `sequences`, + optional `basePath`, `paths` |
| `@eristack/qups` | `createBackseatQupsStores()` → `{ backseatStore, profiles, lines }` | `createIndexedDbQupsStores({ dbName })` | `registerQupsBackseat` | `/qups` | `CreateQupsOptions` or prebuilt `qups`, + optional `basePath` |
| `@eristack/stock-movement` | `createBackseatStockMovementStores()` → `{ backseatStore, ledger, movement }` | `createIndexedDbStockMovementStores({ dbName })` | `registerStockMovementBackseat` | `/stock-movement` | `movement` instance or built from stores, + optional `basePath` |
| `@eristack/financial-ledger` | `createBackseatFinancialLedgerStores()` → `{ backseatStore, ledger, financialLedger }` | `createIndexedDbFinancialLedgerStores({ dbName })` | `registerFinancialLedgerBackseat` | `/financial-ledger` | `financialLedger` or built from ledger store, + optional `basePath` |
| `@eristack/valuations` | `createBackseatValuationsStores()` → `{ backseatStore, ledger, layers }` | `createIndexedDbValuationsStores({ dbName })` | `registerValuationsBackseat` | `/valuations` | **`method`** (FIFO/LIFO/…), optional `engine`, + optional `basePath` |
| `@eristack/hash-chained-ledger` | `createBackseatHashChainedLedgerStores()` → `{ backseatStore, ledger }` | `createIndexedDbHashChainedLedgerStores({ dbName })` | `registerHashChainedLedgerBackseat` | `/ledger` | optional `ledger` config, + optional `basePath` |
| `@eristack/data-grid` | `createBackseatDataGridContext()` → `{ backseatStore }` | `createIndexedDbDataGridContext({ dbName })` | `registerDataGridBackseat` / `registerDataGridBackseatRoute` | per route | `{ routes: [{ path, name, loader }] }` — grid has no dedicated store |
| `@eristack/rbac` | `createBackseatRbacStores()` → `{ backseatStore, rbac }` | `createIndexedDbRbacStores({ dbName })` | `registerRbacBackseat` | `/rbac` | `RbacConfig` fields or prebuilt `rbac`, + optional `basePath` |
| `@eristack/abac` | `createBackseatAbacContext()` → `{ backseatStore }` | `createIndexedDbAbacContext({ dbName })` | `registerAbacBackseat` | `/abac` | `abac` instance (policies are code-registered), + optional `basePath` |
| `@eristack/pbac` | `createBackseatPbacContext()` → `{ backseatStore }` | `createIndexedDbPbacContext({ dbName })` | `registerPbacBackseat` | `/pbac` | `pbac` instance, + optional `basePath` |
| `@eristack/epoch` | `createBackseatEpochStores()` → `{ backseatStore, epochStore }` | `createIndexedDbEpochStores({ dbName })` | `registerEpochBackseat` | `/epoch` | optional prebuilt `epoch`, + optional `basePath` |

**IndexedDB collection prefixes (debugging in Devtools):**

| Package | Typical Backseat collections |
| --- | --- |
| jwt-auth | `jwtAuth.credentials`, `jwtAuth.refreshTokens` |
| doc-number | `docNumber.formats`, `docNumber.sequences` |
| qups | `qups.profiles`, `qups.lines` |
| hash-chained-ledger / ledgers | `hashChainedLedger.entries` (via ledger store) |
| valuations | layer docs + ledger (see `VALUATIONS_COLLECTIONS`) |
| rbac | `rbac.roles`, `rbac.grants` (see `RBAC_COLLECTIONS`) |
| abac / pbac / data-grid | no extra collections — HTTP/actions only |
| epoch | `epoch.counters` |

### 3.3 Full ERP prototype bootstrap (copy-paste)

Single IndexedDB database (`dbName` must match across factories), jwt-auth + doc-number + shared engine:

```ts
import { createBackseat } from "@eristack/backseat";
import { createJwtAuth } from "@eristack/jwt-auth";
import { createDocNumber } from "@eristack/doc-number";
import { createIndexedDbJwtAuthStores } from "@eristack/jwt-auth/backseat/store";
import { createIndexedDbDocNumberStores } from "@eristack/doc-number/backseat/store";
import { registerJwtAuthBackseat } from "@eristack/jwt-auth/backseat";
import { registerDocNumberBackseat } from "@eristack/doc-number/backseat";

const dbName = "my-erp";

const jwt = createIndexedDbJwtAuthStores({ dbName });
const doc = createIndexedDbDocNumberStores({ dbName });

const jwtAuth = createJwtAuth({
  credentials: jwt.credentials,
  store: jwt.refreshTokens,
  accessSecret: import.meta.env.VITE_ACCESS_SECRET!,
  refreshSecret: import.meta.env.VITE_REFRESH_SECRET!,
});

const docNumber = createDocNumber({
  formats: doc.formats,
  sequences: doc.sequences,
});

export const api = createBackseat({
  store: jwt.backseatStore,
  baseUrl: "/api",
});

registerJwtAuthBackseat(api, {
  credentials: jwt.credentials,
  store: jwt.refreshTokens,
  accessSecret: import.meta.env.VITE_ACCESS_SECRET!,
  refreshSecret: import.meta.env.VITE_REFRESH_SECRET!,
});

registerDocNumberBackseat(api, {
  formats: doc.formats,
  sequences: doc.sequences,
});

export { jwtAuth, docNumber };
```

**Tests / Storybook:** swap `createIndexedDb*…` for `createBackseat*…()` from `@eristack/<pkg>/backseat` (memory).

**Graduation to production:** keep DTOs and Query keys; replace `queryFn` with `@eristack/*/client` fetchers; swap stores to `@eristack/*/drizzle`; mount Express/Nest routers from `@eristack/*/express` or `/nest`. Backseat handler source is a **hint** for backend implementers — not a shared contract.

### 3.4 jwt-auth Backseat detail

```ts
import { registerJwtAuthBackseat } from "@eristack/jwt-auth/backseat";

registerJwtAuthBackseat(api, {
  credentials,
  store: refreshTokens,
  accessSecret: "...",
  refreshSecret: "...",
  basePath: "/auth", // default
  paths: {
    login: "/login",
    refresh: "/refresh",
    sessions: "/sessions",
    // issue, changePassword, logout, logoutAll, revokeSession
  },
});
```

Routes registered via `@eristack/backseat/adapters` REST bridge (same shapes as `@eristack/jwt-auth/rest`).

### 3.5 doc-number Backseat detail

```ts
import { registerDocNumberBackseat } from "@eristack/doc-number/backseat";

registerDocNumberBackseat(api, {
  formats,
  sequences,
  basePath: "/doc-number",
  paths: {
    formats: "/formats",
    activeFormat: "/formats/active",
    formatById: "/formats/:id",
    preview: "/preview",
  },
});
```

### 3.6 data-grid Backseat detail

No persistence store — registers list routes that run your loader + `createDataGrid` parse:

```ts
import {
  registerDataGridBackseatRoute,
  registerDataGridBackseat,
} from "@eristack/data-grid/backseat";

registerDataGridBackseatRoute(api, {
  path: "/api/orders",
  name: "orders.list",
  loader: async (query) => {
    /* return { items, pageInfo } from Backseat collections or in-memory rows */
  },
});

// or batch:
registerDataGridBackseat(api, { routes: [/* … */] });
```

### 3.7 valuations Backseat detail

`registerValuationsBackseat` requires **`method`** (`"fifo" | "lifo" | …`):

```ts
import { createValuations } from "@eristack/valuations";
import { registerValuationsBackseat } from "@eristack/valuations/backseat";

const engine = createValuations({ store: layers, ledger, method: "fifo" });
registerValuationsBackseat(api, { method: "fifo", engine, basePath: "/valuations" });
```

---

## 4. Production upgrade (non-Backseat)

When a release only touches Drizzle/REST/React adapters:

1. Changelog for that `{slug}`.
2. Load **one** skill: `@eristack/<pkg>#<pkg>-adapters` (or `-core` if pure API).
3. Compare breaking changes in changelog — migrate imports/export paths, Drizzle table helpers, router mount paths.

Common stable patterns (unchanged across releases):

| Concern | Default |
| --- | --- |
| Drizzle dialect | `"pgsql"` for Postgres helpers |
| Auth | Credentials child of app `users`; refresh hashes in DB |
| Money | `Money.of(string)` / `Money.ofMinor`; never JS float literals |
| Doc numbers | `next` mutates; `peekNext` / `preview` do not |

---

## 5. Contributors — Changesets + peers

### 5.1 Version bumps on `0.x`

| You want | Changeset type | From `0.0.0` | From `0.1.0+` (pre-1.0) |
| --- | --- | --- | --- |
| Routine fix/feature | **`patch`** | `0.0.1` | `0.2.0`, `0.3.0`, … |
| First publish | **`minor`** | **`0.1.0`** | — |
| Intentional **1.0.0** | **`minor`** | `1.0.0` | **`1.0.0`** |

Never use **`minor`** on `0.1.x` unless you **want 1.0.0**.

### 5.1.1 One file per package (changelog hygiene)

Changesets copies **each file's body** into **every package** listed in that file's frontmatter. A ten-package changeset with one shared essay produces ten identical changelogs — avoid it.

| Do | Don't |
| --- | --- |
| One `.changeset/*.md` per bumped package | One file listing `@eristack/money`, `@eristack/qups`, … |
| Body = bullets for **that package only** | `### @eristack/foo` sections for other packages |
| `pnpm changesets:check` before merge | Rely on review to catch mega-changelogs |

### 5.2 Backseat peer policy (monorepo)

`.changeset/config.json`:

```json
"updateInternalDependencies": "patch",
"___experimentalUnsafeOptions_WILL_CHANGE_IN_PATCH": {
  "onlyUpdatePeerDependentsWhenOutOfRange": true
}
```

- Spine packages: `"@eristack/backseat": "^0.1.0"` in **peerDependencies**
- `"@eristack/backseat": "workspace:*"` in **devDependencies** only
- No `fixed` / `linked` groups

Pre-release `pnpm changeset status` may warn `0.0.0 vs ^0.1.0` until `@eristack/backseat@0.1.0` publishes — expected.

**Export integrity:** after `pnpm build`, run `pnpm exports:check`. CI enforces this — catches missing `./adapters` (and any undeclared subpath spine packages import). Published `@eristack/backseat@0.1.0` omitted `./adapters`; patch with `./adapters` in exports + dist required before spine `./backseat` works in Vite.

### 5.3 Documenting releases (contributors)

When shipping cross-package features:

1. Update **this file** (`knowledge/upgrading.md`) + site `docs/upgrading.md` with the full matrix — not eleven stubs.
2. Per-package `docs/backseat.md`: redirect + unique deltas only.
3. `@eristack/ai-knowledge#upgrading-eristack` skill — one source file.
4. `pnpm knowledge:sync` + `pnpm knowledge:check`.

---

## 6. Agent checklist (strict)

- [ ] Read **only this guide** for upgrade / Backseat integration scope
- [ ] `pnpm outdated '@eristack/*'` + relevant changelogs
- [ ] Bump `package.json` ranges; fix peers if using `/backseat`
- [ ] Load per-package skill **only** for production adapter edits
- [ ] Do **not** glob-read `**/docs/backseat.md` across the monorepo
