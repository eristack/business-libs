# EriStack Business Libraries

TypeScript monorepo of shared business libraries for [Erista](https://github.com/erista) products — the kinds of building blocks enterprise stacks take for granted in Java or C#.

## Why this exists

The Node ecosystem still lacks consistent, reusable libraries for everyday business domains. Teams re-implement money, auth sessions, document numbers, and similar concepts over and over — often with subtle incompatibilities.

EriStack fills those gaps with small, well-scoped libraries inspired by established enterprise models (for example Money after JSR 354).

## Packages

Packages live under `packages/<category>/<name>/` in this order: **primitive → registries → capability → service → infrastructure → ui → features → AI**. All 67 published packages are listed below; descriptions come from each `package.json`.

Cross-cutting guides (idempotency + outbox, upgrading, HTTP errors, ERP document spine, …) live once in [`@eristack/ai-knowledge/knowledge`](./packages/ai/ai-knowledge/knowledge) and render on the site.

| Category | Package | Description |
| --- | --- | --- |
| Primitive | [`@eristack/address`](./packages/primitive/address) | Normalized postal addresses with ISO country codes — string fields, no geocoding |
| Primitive | [`@eristack/business-calendar`](./packages/primitive/business-calendar) | Business days and holidays on YYYY-MM-DD wall dates — no timestamp import in core |
| Primitive | [`@eristack/checksum`](./packages/primitive/checksum) | SHA-256 hex normalize and constant-time compare for exports and file refs |
| Primitive | [`@eristack/contact`](./packages/primitive/contact) | Contact roles and channel list normalization on a party — compose with person/phone/email |
| Primitive | [`@eristack/currency-pair`](./packages/primitive/currency-pair) | Base/quote currency pair validation and canonical pair keys — no FX rates |
| Primitive | [`@eristack/dimension`](./packages/primitive/dimension) | L×W×H dimension triple as decimal strings — cubic volume, optional unit label |
| Primitive | [`@eristack/email-address`](./packages/primitive/email-address) | Normalized email local@domain strings for contact channels |
| Primitive | [`@eristack/entity-id`](./packages/primitive/entity-id) | UUID v7 entity identifiers — sortable, parseable, Drizzle column helper |
| Primitive | [`@eristack/fiscal-calendar`](./packages/primitive/fiscal-calendar) | Fiscal years and periods with open/closed flags — wall-date boundaries on @eristack/timestamp |
| Primitive | [`@eristack/fraction`](./packages/primitive/fraction) | Exact rational numbers as reduced fractions — string numerators/denominators, no float literals |
| Primitive | [`@eristack/geo`](./packages/primitive/geo) | Latitude and longitude as decimal strings — normalize and haversine distance |
| Primitive | [`@eristack/money`](./packages/primitive/money) | Money primitives for Eristack |
| Primitive | [`@eristack/payment-instrument`](./packages/primitive/payment-instrument) | Token-safe payment card value types — display + gateway refs, PAN transient only, PCI-minded guards |
| Primitive | [`@eristack/percent`](./packages/primitive/percent) | Percent and basis-point ratios as strings — tax, discount, markup without float literals |
| Primitive | [`@eristack/person`](./packages/primitive/person) | Structured person name and gender identity — normalize and display, not HRIS |
| Primitive | [`@eristack/phone`](./packages/primitive/phone) | E.164 phone normalization — strict plus prefix, no libphonenumber in core |
| Primitive | [`@eristack/timestamp`](./packages/primitive/timestamp) | Business timestamps: UTC instants for facts, wall-clock for schedules (DST-safe) |
| Primitive | [`@eristack/uom`](./packages/primitive/uom) | Unit of measure quantities with fixed-ratio conversion — string decimal amounts, no silent float math |
| Registries | [`@eristack/iso-3166`](./packages/registries/iso-3166) | ISO 3166-1 country codes and ISO 3166-2 subdivision normalization — assigned alpha-2/alpha-3 registry |
| Registries | [`@eristack/unlocode`](./packages/registries/unlocode) | UN/LOCODE port and place codes — normalize five-character locodes with ISO 3166 country validation |
| Capability | [`@eristack/doc-number`](./packages/capability/doc-number) | Document number format, parse, and sequence primitives for Eristack |
| Capability | [`@eristack/doc-transitions`](./packages/capability/doc-transitions) | Preset ERP document status graphs for @eristack/pbac documents.transitions() |
| Capability | [`@eristack/financial-ledger`](./packages/capability/financial-ledger) | Accounting ledger on hash-chained-ledger keyed by accountId, amounts via @eristack/money |
| Capability | [`@eristack/qups`](./packages/capability/qups) | Quantity / unit price / subtotal (QUPS) with 2-of-3 sources of truth, plus modifiers and tax — business line pricing on @eristack/money |
| Capability | [`@eristack/rounding-policy`](./packages/capability/rounding-policy) | Named rounding profiles that resolve to @eristack/money Rounding operators |
| Capability | [`@eristack/stock-movement`](./packages/capability/stock-movement) | Inventory quantity ledger on hash-chained-ledger: locationId, lotId, composable locations, snapshots, tamper checks |
| Capability | [`@eristack/tax`](./packages/capability/tax) | Tax code registry and effective-dated rates — math via @eristack/money Tax ops |
| Capability | [`@eristack/valuations`](./packages/capability/valuations) | Product/lot cost valuation: FIFO, LIFO, FEFO, moving/weighted average, standard cost, specific ID, HIFO/LOFO — with hash-chained cost ledger |
| Service | [`@eristack/abac`](./packages/service/abac) | Attribute-based access control for Eristack: policy functions over subject/resource/environment attributes |
| Service | [`@eristack/api-key`](./packages/service/api-key) | Generate, hash, and timing-safe verify API keys for partner B2B routes |
| Service | [`@eristack/comms`](./packages/service/comms) | Transactional email, SMS, and WhatsApp — SendGrid, Postmark, Mailgun, Resend, Twilio, Vonage, Meta drivers, Drizzle delivery log, Express webhooks |
| Service | [`@eristack/data-grid`](./packages/service/data-grid) | Dynamic list query primitives: multi-field filters, search mode, multi-sort, offset/cursor pagination for Eristack services and capabilities |
| Service | [`@eristack/email-template`](./packages/service/email-template) | {{var}} HTML/text email template render and key extraction — pair with @eristack/comms |
| Service | [`@eristack/epoch`](./packages/service/epoch) | Headless data-version epochs for cache invalidation: compare client epoch vs server, bump on mutation, Drizzle default |
| Service | [`@eristack/file-manager`](./packages/service/file-manager) | Headless file uploads: S3 presigned PUT/GET, server uploads, FileRef for Drizzle columns, REST/Express/React dev tools |
| Service | [`@eristack/hash-chained-ledger`](./packages/service/hash-chained-ledger) | Append-only hash-chained ledger primitive: opening/in/out/adjustment/closing, type refs, chain verify and tamper detection |
| Service | [`@eristack/health`](./packages/service/health) | Liveness and readiness health check registry with Express and Nest mount helpers |
| Service | [`@eristack/idempotency`](./packages/service/idempotency) | Idempotency-Key guard with Drizzle store, scoped keys, lease, Express/Nest/client adapters |
| Service | [`@eristack/jwt-auth`](./packages/service/jwt-auth) | Canonical JWT access + refresh-token auth primitives for Eristack |
| Service | [`@eristack/oauth`](./packages/service/oauth) | OAuth2 client with 17+ IdP drivers (Google, Microsoft, GitHub, Apple, Okta, …) and authorization-server provider — PKCE, Drizzle, Express; hand off to jwt-auth |
| Service | [`@eristack/opinion`](./packages/service/opinion) | Opinionated ERP HTTP route table: document CRUD + PATCH /:id/:action transitions |
| Service | [`@eristack/outbox`](./packages/service/outbox) | Transactional outbox enqueue + Drizzle worker batch for reliable comms and payment side effects |
| Service | [`@eristack/payment-manager`](./packages/service/payment-manager) | Headless payment intents: Stripe/Xendit drivers, Drizzle history, webhooks, REST/Express/client — pairs with payment-instrument |
| Service | [`@eristack/pbac`](./packages/service/pbac) | Policy-based (software) access control for Eristack: business document rules that return true or false |
| Service | [`@eristack/pdf-render`](./packages/service/pdf-render) | HTML to PDF driver interface — Puppeteer/Playwright stays in the app or optional adapter |
| Service | [`@eristack/rate-limit`](./packages/service/rate-limit) | Fixed-window in-memory rate limiter — Redis adapter in app or later package |
| Service | [`@eristack/rbac`](./packages/service/rbac) | Role-based access control for Eristack: subjects, roles, and boolean permissions |
| Service | [`@eristack/spreadsheet-render`](./packages/service/spreadsheet-render) | Declarative workbook model and xlsx/csv render drivers — ExcelJS/SheetJS in app or adapter |
| Infrastructure | [`@eristack/backseat`](./packages/infrastructure/backseat) | Frontend mock backend engine: in-browser REST server with pluggable store, controllers, and TanStack Query hooks |
| Infrastructure | [`@eristack/drizzle-kit-helpers`](./packages/infrastructure/drizzle-kit-helpers) | Shared drizzle-kit config fragments for Eristack consumer monorepos (pg prod, sqlite tests) |
| Infrastructure | [`@eristack/logger`](./packages/infrastructure/logger) | JSON-lines structured logger with request context and Express/Nest adapters |
| Infrastructure | [`@eristack/rest`](./packages/infrastructure/rest) | Declarative REST route definitions with Express and Nest mounting and OpenAPI 3.1 emit |
| Infrastructure | [`@eristack/vercel-adapters`](./packages/infrastructure/vercel-adapters) | Serverless-friendly Express entry helpers for Vercel — no Vercel SDK in core |
| UI | [`@eristack/command-palette`](./packages/ui/command-palette) | Headless command palette state and simple dialog shell |
| UI | [`@eristack/design-system`](./packages/ui/design-system) | Erista design tokens, Tailwind preset, and React density context for ERP UI |
| UI | [`@eristack/doc-shell`](./packages/ui/doc-shell) | Document detail page shell — header, actions, body slots |
| UI | [`@eristack/filter-builder`](./packages/ui/filter-builder) | Stub filter chip bar and sheet UI for data-grid list filters |
| UI | [`@eristack/form-ui`](./packages/ui/form-ui) | Native React form controls wired to @eristack money, percent, and timestamp |
| UI | [`@eristack/line-grid`](./packages/ui/line-grid) | Editable QUPS line table with patchLine recalculation hook |
| UI | [`@eristack/list-shell`](./packages/ui/list-shell) | Presentational list page layout, toolbar, and TanStack Query state banners |
| UI | [`@eristack/master-detail`](./packages/ui/master-detail) | Two-pane master list + detail layout for picker flows |
| UI | [`@eristack/multitab`](./packages/ui/multitab) | Headless multi-tab workspace for React ERP screens — document tabs, state preservation, Router sync |
| UI | [`@eristack/policy-ui`](./packages/ui/policy-ui) | RBAC and PBAC gate components with v0 allowed override |
| Features | *(under construction)* | Future `@eristack/feature-*` — [roadmap/features.md](./roadmap/features.md); compose spine today |
| AI | [`@eristack/ai-dev`](./packages/ai/ai-dev) | Unified agent-first dev tooling for Eristack monorepos: plan (token-minimal), check profiles, sync, compact JSON + MCP |
| AI | [`@eristack/ai-knowledge`](./packages/ai/ai-knowledge) | Eristack knowledge pack for AI agents: recommend packages first, load the right Intent skills, and keep catalog facts in sync |
| AI | [`@eristack/ai-ticket-generator`](./packages/ai/ai-ticket-generator) | Generate portable maintainer tickets (bugs + suggestions) for every @eristack package — logs, scenario, fix plan, and agent-ready handoff files |
| AI | [`@eristack/ai-workflow`](./packages/ai/ai-workflow) | Local-first AI workflow for Eristack projects: MCP server, FTS+vector index, backlog/sprint/ADR artifacts — low-token agent tools that do not replace existing editors or Intent |

Each package has its own README and docs under `packages/<category>/<name>/`. Planned work lives in [`roadmap/`](./roadmap/README.md).

## Website

The public site lives in [`apps/web`](./apps/web) (Next.js 16 + Tailwind). The previous doc-heavy site is archived in [`apps/old-web`](./apps/old-web).

**Information architecture:** Libraries (`/packages`) → Layer (`/primitive`, …, `/features`, `/ai`) → Library overview (`/money`, …) → Docs (`/docs/money`, …). Changelogs at `/{slug}/changelog`. Roadmap at [`/roadmap`](./roadmap/README.md).

- Landing, libraries index, layer/library landings, blog, story, philosophy, maintainers, support/partners
- Library docs rendered from `packages/<category>/*/docs` (single source of truth), grouped by category
- Current package version (from `package.json`) and changelog pages (from `CHANGELOG.md` when present)
- Cmd/Ctrl+K search across pages, layers, libraries, docs, and changelogs

```bash
pnpm web
# or: pnpm --filter @eristack/web dev
```

Eristack is a subsidiary of [erista.id](https://erista.id). Agent WIP notes go in [`_ai-docs/wip/<topic>/`](./_ai-docs/wip/) while implementing; promote into package/web docs when finished, then delete the folder. See [`_ai-docs/README.md`](./_ai-docs/README.md).

## Examples

Framework demos under [`examples/`](./examples) exercise the real adapters (jwt-auth, data-grid, idempotency, Backseat):

| Example | Command |
| --- | --- |
| Express API (Drizzle SQLite, orders grid, idempotent `POST /orders`) | `pnpm --filter @eristack/example-express dev` |
| NestJS API | `pnpm --filter @eristack/example-nestjs dev` |
| React client (needs Express; grid + idempotent create form) | `pnpm --filter @eristack/example-react dev` |
| Horizon A — Backseat-only ERP document spine | `pnpm --filter @eristack/example-horizon-a start` |

See [`examples/README.md`](./examples/README.md).

## Local development

```bash
pnpm install
pnpm build
pnpm test
pnpm prepush     # before git push — affected build/typecheck/test + drift gates vs origin/main (~1–2 min)
pnpm ci:pr       # what a PR runs on GitHub
pnpm ci          # full profile: build + typecheck + test + integration + every drift gate
```

### Generated files that must ship with the change

CI fails on drift between sources and generated artifacts. Commit these together with the edit that invalidates them:

| Edit | Regenerate |
| --- | --- |
| Any `package.json` dependency section | `pnpm lockfile:sync` → `pnpm-lock.yaml` |
| Package `docs/*.md` pages added or removed | `pnpm docs:sync` → `docs/_meta.json` |
| `skills/**/SKILL.md`, `recipes.yaml`, `knowledge/*.md`, package descriptions | `pnpm knowledge:sync` → `packages/ai/ai-knowledge/src/generated/*` |
| Package with skills added | root `package.json` `intent.skills` + devDependencies, then `pnpm exec intent install --map` → `AGENTS.md` block |
| `package.json` `exports` | `pnpm build && pnpm exports:check` |

Runtime `@eristack/*` dependencies of a published package go in `peerDependencies` (+ `devDependencies` for the workspace), never `dependencies: workspace:*` — `pnpm publish:check` enforces this.

### Branching

We use [GitHub Flow](https://docs.github.com/en/get-started/using-github/github-flow):

1. Branch from `main` (`feat/…`, `fix/…`, …)
2. Open a pull request into `main`
3. Merge when CI is green

There is no long-lived `dev` integration branch.

### Releases

Versioning and publishing use [Changesets](https://github.com/changesets/changesets). Merging a feature into `main` does **not** publish — only merging the **Version Packages** PR does.

```text
feature/* ──PR──► main ──(changesets)──► Version Packages PR ──merge──► npm publish
```

1. On the feature PR, run `pnpm changeset` and commit the generated file — **one package per changeset file**, `patch` for packages still on `0.x` (a `minor` on `0.1.x` becomes `0.2.0` and breaks `^0.1.0` peer ranges; `pnpm changesets:check` rejects it).
2. Merge into `main`. CI opens or updates a Version Packages PR (version bumps + changelogs).
3. Merge that PR to publish to npm and create GitHub releases.

#### One-time npm publish setup

1. Own the `@eristack` [npm org](https://www.npmjs.com/org/create) (or publish rights under that scope).
2. Create a [granular Automation token](https://www.npmjs.com/settings/~/tokens) with read/write on `@eristack`.
3. Add it as the repo secret `NPM_TOKEN` (Settings → Secrets and variables → Actions), or:

   ```bash
   gh secret set NPM_TOKEN -R eristack/business-libs
   ```

4. After the first publish, optionally configure [Trusted Publishing](https://docs.npmjs.com/trusted-publishers) on each package for workflow `release.yml` (`eristack` / `business-libs`), then revoke the token.

## For AI coding agents

Agent instructions, Intent skill loaders, and domain-artifact notes live in [`AGENTS.md`](./AGENTS.md) — not in this README.
