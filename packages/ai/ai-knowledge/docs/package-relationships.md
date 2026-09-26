# Package relationships

One map of how `@eristack/*` packages depend on each other and which guide to load first. Use this before wiring multiple libraries or debugging “which package owns this?”

Load: `@eristack/ai-knowledge#package-relationships` · ERP lines: `#document-lines-erp` · Mock → backend: `#backseat-then-backend` · Upgrades: `#upgrading-eristack`

## Layer order (filesystem)

`packages/primitive` → `registries` → `capability` → `service` → `infrastructure` → `ui` → `ai`

### Registries (layer 02, planned)

| Package | Role |
| --- | --- |
| `@eristack/iso-3166` | Country/subdivision codes |
| `@eristack/unlocode` | UN/LOCODE ports/places |
| `@eristack/iso-4217` | Currency metadata (pairs with money) |
| `@eristack/reference-data` | **Capability** — versioned dataset packs over registries |

Registry packages validate/normalize only — tenant masters stay app-owned.

Apps compose across layers. **Do not** import Express/React/Drizzle from `*/core` entrypoints — use adapters.

## Dependency tiers

### Primitives (no sibling `@eristack/*` runtime deps)

| Package | Role | Typical consumers |
| --- | --- | --- |
| `@eristack/money` | Currency amounts, tax/discount operators | qups, financial-ledger, data-grid (decimal columns) |
| `@eristack/percent` | Ratio / bps strings, `percentOf` on strings | Forms, tax config — **round with money at ledger** |
| `@eristack/uom` | Qty + fixed-ratio conversion | stock-movement, inventory forms (before qups money lines) |
| `@eristack/timestamp` | Instant vs wall time | data-grid wall filters, fiscal-calendar, SQL adapters |
| `@eristack/address` | Postal address normalization | App masters (not a document spine requirement) |
| `@eristack/fiscal-calendar` | Fiscal periods | **Peer:** `@eristack/timestamp` |

**percent vs qups vs money:** Line modifiers and tax on documents use `@eristack/qups` + `@eristack/money` (`Discount.ofPercent`, etc.). Use `@eristack/percent` for standalone rate fields (VAT %, bps in config) — not for duplicating qups line math.

### Capability (domain math + presets)

| Package | Depends on | Notes |
| --- | --- | --- |
| `@eristack/qups` | money | QUPS 2-of-3; `calculateLine` / `patchLine` |
| `@eristack/doc-number` | (optional peers: data-grid, timestamp) | Sequences + format tokens |
| `@eristack/doc-transitions` | **peer:** pbac | Preset status graphs → `documents.transitions()` |
| `@eristack/stock-movement` | hash-chained-ledger | Qty ledger |
| `@eristack/financial-ledger` | hash-chained-ledger, money | Account + currency GL |
| `@eristack/valuations` | stock-movement, financial-ledger, hash-chained-ledger | FIFO/LIFO/… — **both** ledger stores in prod |

### Service (policies, auth, lists, HTTP opinion)

| Package | Depends on | Notes |
| --- | --- | --- |
| `@eristack/data-grid` | **peer:** money; **optional peer:** timestamp | Wall filters need timestamp |
| `@eristack/jwt-auth` | — | Credentials child of app users |
| `@eristack/rbac` / `@eristack/abac` / `@eristack/pbac` | — | Boolean roles vs attrs vs document policies |
| `@eristack/epoch` | — | Cache version scopes |
| `@eristack/file-manager` | **peer:** backseat, AWS S3 SDK | Uploads + `FileRef`; optional `@eristack/jwt-auth` at app edge |
| `@eristack/hash-chained-ledger` | drizzle default | Primitive for stock/financial/valuations |
| `@eristack/opinion` | **peers:** rest, pbac, data-grid, doc-transitions | ERP document REST **canon** (not generic REST) |

### Infrastructure

| Package | Role |
| --- | --- |
| `@eristack/rest` | Declarative routes + OpenAPI shell |
| `@eristack/backseat` | In-browser mock REST (Horizon A) |
| `@eristack/logger` | JSON-lines logging |

## Which recipe / skill first?

| User ask | Load first | Then |
| --- | --- | --- |
| Job / cost sheet / invoice **with lines** | `#document-lines-erp` | qups, pbac, doc-number, data-grid skills |
| Clickable ERP mock → real API | `#backseat-then-backend` | Same spine; upgrading §3 for peers |
| “Which modules for an ERP?” | `#package-relationships` (this file) | `#compose-spine` recipe lists defaults — **not** a second implementation guide |
| Auth + money + numbering only (no lines spine) | `#erp-app-core` | Redirects here; load jwt + money + doc-number skills |
| Attachments / S3 / presigned upload | `#file-upload-s3` | file-manager-core → adapters; jwt guard in app |
| Generic REST / OpenAPI shell | `#declarative-rest-routes` | `@eristack/rest` — **not** opinion |
| PATCH `/:id/:action`, document route map | `#opinion-http` | opinion + rest + doc-transitions |
| Inventory / GL / valuation | Dedicated recipes | **Do not** pull into document-lines products by default |

## HTTP stack (ERP documents)

```text
@eristack/rest          — mount, OpenAPI, framework adapters
        ↑
@eristack/opinion       — document list/grid/CRUD/PATCH action map
        ↑
@eristack/doc-transitions + @eristack/pbac  — allowed status actions
        ↑
@eristack/data-grid     — list query parse + drizzle/backseat list
```

Production: Drizzle + Express/Nest adapters on each package. Horizon A: `@eristack/backseat` + `./backseat` registers on each package.

## Horizon A bootstrap

Prefer one orchestrator instead of copy-pasting register order:

```typescript
import { registerHorizonDocumentSpine } from "@eristack/backseat/seeds";

await registerHorizonDocumentSpine(api, {
  pbac,
  jwt: { jwtAuth, basePath: "/auth" },
  afterCore: (api) => {
    /* app-specific data-grid routes + transition graphs */
  },
});
```

Peers for `./seeds` spine helper: `@eristack/jwt-auth`, `@eristack/epoch`, `@eristack/file-manager`, `@eristack/pbac`, `@eristack/qups`, `@eristack/doc-transitions`, `@eristack/data-grid` (install what you register). See `knowledge/backseat-then-backend.md` for full matrix.

## Optional vs required edges

| Edge | Required? |
| --- | --- |
| data-grid → money (decimal/money columns) | Yes when using money column types |
| data-grid → timestamp | Only for `type: "wall"` filters |
| doc-transitions → pbac | Yes for preset graphs wired to policies |
| opinion → rest | Yes for opinion mounting |
| stock / financial / valuations | **Only** when product scope includes inventory or GL |

## Ledger tower

```text
@eristack/hash-chained-ledger
    ├── @eristack/stock-movement
    ├── @eristack/financial-ledger (+ money)
    └── @eristack/valuations (+ stock + financial stores)
```

## Agent checklist

1. Load `#recommend-eristack` or `loadPlan(goals)`.
2. If multiple ERP recipes match, prefer **lower `priority` number** and recipes with **`canonicalSkills`** (document-lines, backseat-then-backend, compose-spine → this guide).
3. Read **this file once** for composition; read **one** vertical guide (document-lines or backseat-then-backend) for wiring steps.
4. Horizon A wiring: `registerHorizonDocumentSpine` + `examples/horizon-a` — not a separate register order per package in app code.
5. After graph changes in the monorepo, run `pnpm debottleneck:check` locally or `pnpm debottleneck:check:ci` (CI parity — zero trigger overlap budget).
6. After **Version Packages** merges on `main`, follow `scripts/changeset-sync-after-main.md` — do not keep consumed `.changeset/*.md` files on long-lived branches.
