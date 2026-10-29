# Package relationships

One map of how `@eristack/*` packages depend on each other and which guide to load first. Use this before wiring multiple libraries or debugging “which package owns this?”

Load: `@eristack/ai-knowledge#package-relationships` · ERP lines: `#document-lines-erp` · Mock → backend: `#backseat-then-backend` · Upgrades: `#upgrading-eristack`

## Layer order (filesystem)

`packages/primitive` → `registries` → `capability` → `service` → `infrastructure` → `ui` → `ai`

### Registries (layer 02)

| Package | Role |
| --- | --- |
| `@eristack/iso-3166` | Assigned ISO 3166-1/2 codes — validate, alpha-3 convert |
| `@eristack/unlocode` | UN/LOCODE normalize/parse — **depends on** iso-3166 |
| `@eristack/id-wilayah` | Indonesia official admin codes (2/4/7/10) + bundled villages; English unit kinds through neighborhood — pair with iso-3166 (`ID`) + address for postal |
Currency codes and minor-unit scales live in `@eristack/money` (its built-in currency registry) — there is no separate ISO 4217 package.

Registry packages validate/normalize only — tenant masters stay app-owned.

Apps compose across layers. **Do not** import Express/React/Drizzle from `*/core` entrypoints — use adapters.

## Dependency tiers

### Primitives (no sibling `@eristack/*` runtime deps)

| Package | Role | Typical consumers |
| --- | --- | --- |
| `@eristack/money` | Currency amounts, tax/discount operators | qups, financial-ledger, data-grid (decimal columns) |
| `@eristack/percent` | Ratio / bps strings, `percentOf` on strings | Forms, tax config — **round with money at ledger** |
| `@eristack/fraction` | Exact rationals `{ num, den }`, approximate irrationals | Recipe/BOM ratios — **not** tax % (use percent) |
| `@eristack/uom` | Qty + fixed-ratio conversion | stock-movement, inventory forms (before qups money lines) |
| `@eristack/timestamp` | Instant vs wall time | data-grid wall filters, fiscal-calendar, SQL adapters |
| `@eristack/address` | Postal address normalization | App masters (not a document spine requirement) |
| `@eristack/payment-instrument` | Token-safe card display + gateway refs; PAN transient | payment-manager, checkout forms |
| `@eristack/fiscal-calendar` | Fiscal periods | **Peer:** `@eristack/timestamp` |
| `@eristack/entity-id` | UUID v7 PK generate/parse | New Drizzle tables; **no** sibling deps |

**percent vs qups vs money:** Line modifiers and tax on documents use `@eristack/qups` + `@eristack/money` (`Discount.ofPercent`, etc.). Use `@eristack/percent` for standalone rate fields (VAT %, bps in config) — not for duplicating qups line math.

**fraction vs percent:** Use `@eristack/fraction` when the domain is exact rational parts (`1/3` cup, 2:1 mix). Use `@eristack/percent` for rate fields stored as decimal ratios or bps. Irrationals are approximated with an explicit `maxDenominator`, not stored exactly.

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
| `@eristack/oauth` | jwt-auth (handoff) | OAuth2 client (17+ IdP drivers) + provider AS; sessions via `issueTokens` |
| `@eristack/comms` | — | Email/SMS/WhatsApp vendor drivers; pairs with jwt-auth for magic-link content |
| `@eristack/rbac` / `@eristack/abac` / `@eristack/pbac` | — | Boolean roles vs attrs vs document policies |
| `@eristack/epoch` | — | Cache version scopes |
| `@eristack/file-manager` | **peer:** backseat, AWS S3 SDK | Uploads + `FileRef`; `resolveDownloadUrl` inline by default — `{ downloadFilename }` for attachment only |
| `@eristack/payment-manager` | money; **peer:** stripe, backseat | Intents + webhooks; **companion:** payment-instrument for saved cards |
| `@eristack/hash-chained-ledger` | drizzle default | Primitive for stock/financial/valuations |
| `@eristack/opinion` | **peers:** rest, pbac, data-grid, doc-transitions | ERP document REST **canon** (not generic REST) |

### Infrastructure

| Package | Role |
| --- | --- |
| `@eristack/rest` | Declarative routes + OpenAPI shell |
| `@eristack/backseat` | In-browser mock REST (Horizon A) |
| `@eristack/drizzle` | App `openDrizzle` boot + `/schema` spine/columns + collection manifests (3ss B3/B4) |
| `@eristack/drizzle-kit-helpers` | drizzle-kit pg/sqlite config fragments (dev) |
| `@eristack/logger` | JSON-lines logging |

## Which recipe / skill first?

Every "Load first" cell is a loadable Intent skill (`pnpm dlx @tanstack/intent@latest load <id>`). Recipe ids (for `recommend()` / `loadPlan()`) are labelled *recipe*.

| User ask | Load first | Then |
| --- | --- | --- |
| Job / cost sheet / invoice **with lines** | `@eristack/ai-knowledge#document-lines-erp` | qups, pbac, doc-number, data-grid skills |
| Clickable ERP mock → real API | `@eristack/ai-knowledge#backseat-then-backend` | Same spine; upgrading §3 for peers |
| “Which modules for an ERP?” | `@eristack/ai-knowledge#package-relationships` (this file) | *recipe* `compose-spine` lists defaults — **not** a second implementation guide |
| Auth + money + numbering only (no lines spine) | `@eristack/jwt-auth#jwt-auth-core` | `@eristack/money#money-amounts`, `@eristack/doc-number#doc-number-core` (*recipe* `erp-app-core`) |
| Party / platform API / tax / posting | `@eristack/ai-knowledge#party-and-platform-compose` | Shipped packages listed in § Wave 13 below |
| Attachments / S3 / presigned upload | `@eristack/file-manager#file-manager-core` | `#file-manager-adapters`; jwt guard in app (*recipe* `file-upload-s3`) |
| Stripe / Xendit / payment intents | `@eristack/payment-manager#payment-manager-core` | `#payment-manager-adapters`; `@eristack/payment-instrument#payment-instrument-core` for tokens (*recipe* `payment-gateway-stripe-xendit`) |
| Generic REST / OpenAPI shell | `@eristack/rest#rest-core` | **Not** opinion (*recipe* `declarative-rest-routes`) |
| PATCH `/:id/:action`, document route map | `@eristack/opinion#opinion-core` | `@eristack/rest#rest-core`, `@eristack/doc-transitions#doc-transitions-core` (*recipe* `opinion-http`) |
| Inventory / GL / valuation | Dedicated recipes | **Do not** pull into document-lines products by default |
| ERP **list / doc React UI** | `@eristack/ai-knowledge#ui-package-stack` | data-grid + qups skills when wiring filters or lines |
| Drizzle boot + collection manifests | `@eristack/ai-knowledge#drizzle-app-database` | `@eristack/ai-knowledge#collection-declaration-horizon-b` |
| Spreadsheet **keyboard** (not xlsx) | `@eristack/spreadsheet-operator#spreadsheet-operator-core` | line-grid / form-ui on commit |

## UI layer (`packages/ui/`)

Styled React for ERP screens — **peers** spine packages; no QUPS or filter JSON parsers in UI cores.

| Package | Peers (typical) | Spine |
| --- | --- | --- |
| `@eristack/design-system` | react, tailwindcss | Tokens + `DensityProvider` |
| `@eristack/form-ui` | design-system, money, percent, timestamp | Domain inputs |
| `@eristack/list-shell` | design-system, data-grid, react-query | List chrome |
| `@eristack/filter-builder` | data-grid, form-ui | Filter sheet UI |
| `@eristack/line-grid` | form-ui, qups, money | `patchLine` recalc |
| `@eristack/spreadsheet-operator` | react (optional on core) | Keyboard / active-grid; **not** spreadsheet-render |
| `@eristack/doc-shell` | design-system; optional multitab | Doc layout |
| `@eristack/policy-ui` | optional rbac, pbac | Gate components |
| `@eristack/master-detail` | list-shell | Split panes |
| `@eristack/command-palette` | react | Cmd+K shell |
| `@eristack/multitab` | react-router (optional) | Tab workspace |
| `@eristack/feedback` | react (optional on core) | Busy lock + action sequence (3ss B1/B5); app owns chrome |

Canonical compose guide: `knowledge/ui-package-stack.md` · Recipes: `erp-ui-design-system`, `erp-ui-shell`, `erp-list-and-doc-screens`.

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

## Wave 13 (shipped — compose at app boundary)

Approved and **shipped** 2026-09-27. Load `#party-and-platform-compose` for handler order; recipes per row in `recipes.yaml`.

| Wave | Packages | Recipes (examples) |
| --- | --- | --- |
| E | entity-id, business-calendar, checksum | entity-id-v7-primary-key, posting-date-guard |
| A | person, phone, email-address, contact | person-normalize, party-contact-normalize |
| B | dimension, geo | — |
| F | currency-pair, rounding-policy, tax | ledger-rounding-policy, invoice-line-tax |
| C | email-template, idempotency, api-key, rate-limit, pdf-render, spreadsheet-render | platform-api-guard, email-template-render |
| G | health, drizzle-kit-helpers, vercel-adapters | health-readiness, vercel-express-handler |

Horizon catalog: `roadmap/horizon.md`.

---

## Agent checklist

1. Load `#recommend-eristack` or `loadPlan(goals)`.
2. If multiple ERP recipes match, prefer **lower `priority` number** and recipes with **`canonicalSkills`** (document-lines, backseat-then-backend, compose-spine → this guide).
3. Read **this file once** for composition; read **one** vertical guide (document-lines or backseat-then-backend) for wiring steps.
4. Horizon A wiring: `registerHorizonDocumentSpine` + `examples/horizon-a` — not a separate register order per package in app code.
5. After graph changes in the monorepo, run `pnpm debottleneck:check` locally or `pnpm debottleneck:check:ci` (CI parity — zero trigger overlap budget).
6. After **Version Packages** merges on `main`, follow `scripts/changeset-sync-after-main.md` — do not keep consumed `.changeset/*.md` files on long-lived branches.
