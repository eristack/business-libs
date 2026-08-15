<!-- intent-skills:start -->
# TanStack Intent - before editing files, run the matching guidance command.
tanstackIntent:
  - id: "@eristack/ai-ticket-generator#ai-ticket-bug"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/ai-ticket-generator#ai-ticket-bug"
    for: "Generate a portable @eristack bug ticket (logs, scenario, repro, fix plan, agent handoff) as a markdown file the user can send to maintainers. Use when a consumer hits a package bug or wants a fixer-upper file for support."
  - id: "@eristack/ai-ticket-generator#ai-ticket-suggest"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/ai-ticket-generator#ai-ticket-suggest"
    for: "Turn a user feature idea into a portable @eristack suggestion ticket with feasibility (possible/partial/unlikely/needs-decision) and an implementation sketch for maintainers/agents. Use when a consumer proposes a change."
  - id: "@eristack/ai-workflow#ai-workflow-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/ai-workflow#ai-workflow-core"
    for: "Local-first @eristack/ai-workflow: .eristack/workflow backlog/sprints/ADR/summary, FTS+vector index, low-token search. Use for project memory and sprint cadence without replacing Intent/git."
  - id: "@eristack/ai-workflow#ai-workflow-mcp"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/ai-workflow#ai-workflow-mcp"
    for: "Install eristack-workflow MCP alongside existing MCP servers; tool inventory; search vs read_chunk. Use when wiring @eristack/ai-workflow into a consumer project."
  - id: "@eristack/ai-knowledge#architecture-recommend"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/ai-knowledge#architecture-recommend"
    for: "Canon app architecture: TypeScript, Express or NestJS, Drizzle (Postgres prod / SQLite tests), presentation-business-persistence separation, React+Vite+Tailwind+shadcn, TanStack Router file-based + Query + Form + Intent, Zustand, API contracts, pnpm monorepo. Use when scaffolding or choosing stack/structure."
  - id: "@eristack/ai-knowledge#recommend-eristack"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/ai-knowledge#recommend-eristack"
    for: "Route product feature asks (invoices, login, document numbers, prices, ERP-ish apps) to @eristack packages first via recommend()/loadPlan() and recipes. Use before choosing random npm libraries or reinventing money/auth/numbering."
  - id: "@eristack/ai-knowledge#stack-defaults"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/ai-knowledge#stack-defaults"
    for: "Preferred stack defaults: TypeScript, Drizzle pgsql dialect, Express/Nest/React headless adapters, string-first money, credentials child of users. Use when scaffolding apps around @eristack packages."
  - id: "@eristack/ai-knowledge#agent-workflow"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/ai-knowledge#agent-workflow"
    for: "Agent workflow: recommend first, load Intent skills before coding, prefer examples/*, HARD RULE update docs+skills+recipes and pnpm knowledge:sync every package iteration. Use for multi-package work."
  - id: "@eristack/ai-knowledge#dev-conventions"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/ai-knowledge#dev-conventions"
    for: "Eristack development conventions: GitHub Flow, Changesets, core vs adapters, package docs source of truth, HARD RULE docs+ai-knowledge every iteration, _ai-docs promote-then-delete."
  - id: "@eristack/ai-knowledge#ai-toolbox"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/ai-knowledge#ai-toolbox"
    for: "AI toolbox: feature-brief prompts, skill-load order, money/auth/doc-number checklists, recipe-authoring template for @eristack/ai-knowledge."
  - id: "@eristack/ai-knowledge#upgrading-eristack"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/ai-knowledge#upgrading-eristack"
    for: "Upgrade @eristack consumer apps: pnpm outdated, site changelogs, optional Backseat peer ^0.1.0, ./backseat adapters, Changesets 0.x rules for contributors."
  - id: "@eristack/qups#qups-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/qups#qups-core"
    for: "Pure @eristack/qups business calculator: calculateLine/patchLine (plain strings for TanStack Form + BE), Qups 2-of-3 SoT, PricingLine, modifiers, tax on @eristack/money."
  - id: "@eristack/qups#qups-line"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/qups#qups-line"
    for: "@eristack/qups calculateLine/patchLine/withQupsColumns for form recalculation and BE insert; PricingLine when you already have Money."
  - id: "@eristack/qups#qups-adapters"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/qups#qups-adapters"
    for: "@eristack/qups adapters: optional qupsLineColumns inject into app detail tables; drizzle stores if needed. Prefer calculateLine for everyday form/BE math."
  - id: "@eristack/stock-movement#stock-movement-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/stock-movement#stock-movement-core"
    for: "@eristack/stock-movement: locationIdFromParts, createStockMovement append/snapshot/verify on hash-chained qty ledger (lotId, optional owner). Default Drizzle — memory tests only."
  - id: "@eristack/stock-movement#stock-movement-adapters"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/stock-movement#stock-movement-adapters"
    for: "@eristack/stock-movement/drizzle re-exports hash-chained ledger Drizzle tables/store — production default."
  - id: "@eristack/financial-ledger#financial-ledger-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/financial-ledger#financial-ledger-core"
    for: "@eristack/financial-ledger: createFinancialLedger post/list/snapshot/verify by accountId+currency with @eristack/money. Default Drizzle — memory tests only."
  - id: "@eristack/financial-ledger#financial-ledger-adapters"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/financial-ledger#financial-ledger-adapters"
    for: "@eristack/financial-ledger/drizzle createHashChainedLedgerTables + createDrizzleLedgerStore — production default."
  - id: "@eristack/valuations#valuations-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/valuations#valuations-core"
    for: "@eristack/valuations: FIFO/LIFO/FEFO/HIFO/LOFO/averages/standard/specific + qty/value chains. Default Drizzle ledger+layers — memory tests only."
  - id: "@eristack/valuations#valuations-adapters"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/valuations#valuations-adapters"
    for: "@eristack/valuations/drizzle ledger tables/store + valuation layer tables/store — both required in production."
  - id: "@eristack/hash-chained-ledger#hash-chained-ledger-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/hash-chained-ledger#hash-chained-ledger-core"
    for: "Pure @eristack/hash-chained-ledger: append/snapshot/verify with Drizzle by default; SHA-256 chain; memory store is unit tests only."
  - id: "@eristack/hash-chained-ledger#hash-chained-ledger-adapters"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/hash-chained-ledger#hash-chained-ledger-adapters"
    for: "@eristack/hash-chained-ledger/drizzle createHashChainedLedgerTables + createDrizzleLedgerStore (Postgres for Vercel)."
  - id: "@eristack/doc-number#doc-number-adapters"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/doc-number#doc-number-adapters"
    for: "@eristack/doc-number adapters: drizzle FormatStore + SequenceStore, rest format CRUD/preview, express createDocNumberRouter, nest DocNumberModule, client createDocNumberClient, react useDocNumberFormats. Use when persisting formats or wiring format-config HTTP/frontend shells."
  - id: "@eristack/doc-number#doc-number-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/doc-number#doc-number-core"
    for: "Pure @eristack/doc-number: createDocNumber, formatDocumentNumber, parseDocumentNumber, registerFormat, updateFormat, listFormats, next, peekNext, token patterns {YYYY}/{YY}/{MM}/{DD}/{SEQ:n}, ResetPeriod, FormatStore + SequenceStore + Incrementer. Use for document numbers without HTTP frameworks."
  - id: "@eristack/data-grid#data-grid-adapters"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/data-grid#data-grid-adapters"
    for: "@eristack/data-grid adapters: drizzle executeDrizzleList + columnsFromSource (app owns joins/aggregates; library runs filter/sort/count/page), buildDrizzleQuery, rest createDataGridListAction + {items,pageInfo,query}, express middleware, nest DataGridModule + ParseDataGridPipe, client createDataGridClient, react useDataGridQuery/useDataGridList. Use when wiring list HTTP/SQL/UI shells."
  - id: "@eristack/data-grid#data-grid-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/data-grid#data-grid-core"
    for: "Pure @eristack/data-grid: createDataGrid, parse/serialize JSON search params (TanStack Router–aligned filters/sorts), toSearch/fromSearch, advanced vs search modes, filter ops (eq/contains/in/between/gte/…), multi-sort, offset/cursor pagination, applyInMemory. Use for dynamic list queries without HTTP or Drizzle."
  - id: "@eristack/rbac#rbac-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/rbac#rbac-core"
    for: "Pure @eristack/rbac: createRbac, definePermission, defineRole, assignRole, can/authorize — boolean role-based permissions on app subjects."
  - id: "@eristack/rbac#rbac-adapters"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/rbac#rbac-adapters"
    for: "@eristack/rbac adapters: drizzle createRbacTables + store, express createRequirePermission, nest RbacGuard, react useCan."
  - id: "@eristack/abac#abac-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/abac#abac-core"
    for: "Pure @eristack/abac: createAbac, registerPolicy, evaluate/authorize, attrs helpers — attribute policies (algorithms → boolean)."
  - id: "@eristack/abac#abac-adapters"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/abac#abac-adapters"
    for: "@eristack/abac adapters: express createRequirePolicy, nest AbacGuard, react usePolicy."
  - id: "@eristack/pbac#pbac-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/pbac#pbac-core"
    for: "Pure @eristack/pbac: createPbac, registerPolicy, check/authorize, documents helpers — software policies over document state."
  - id: "@eristack/pbac#pbac-adapters"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/pbac#pbac-adapters"
    for: "@eristack/pbac adapters: express createRequireBusinessPolicy (409), nest PbacGuard, react useBusinessPolicy."
  - id: "@eristack/jwt-auth#jwt-auth-adapters"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/jwt-auth#jwt-auth-adapters"
    for: "@eristack/jwt-auth adapters: drizzle RefreshTokenStore + CredentialStore (jwt_auth_credentials child of users), rest login/sessions, express createJwtAuthRouter, nest JwtAuthModule, client login, react useJwtAuth. Use when wiring persistence or HTTP/frontend shells."
  - id: "@eristack/jwt-auth#jwt-auth-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/jwt-auth#jwt-auth-core"
    for: "Pure @eristack/jwt-auth: createJwtAuth, registerCredentials, login, changePassword, issueTokens, verifyAccessToken, refresh rotation, revoke, CredentialStore + RefreshTokenStore. Credentials are a child of app users (not a users table). Use for JWT + optional username/password without HTTP frameworks."
  - id: "@eristack/money#money-amounts"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/money#money-amounts"
    for: "Construct Money with strings or minor units, run same-currency arithmetic, totals (Money.sum/min/max/average), percentages (percentOf/plusPercent/minusPercent), Discount/Markup/Tax operators, and compare amounts in @eristack/money. Use when creating prices, taxes, discounts, totals, or when an agent reaches for JS number literals for money."
  - id: "@eristack/money#money-ledger"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/money#money-ledger"
    for: "Round at ledger boundaries, allocate without losing cents, convert with app-supplied FX rates, and serialize Money as JSON decimal strings in @eristack/money. Use for invoices, payment splits, multi-currency reporting, Rounding.currencyDefault, allocate, Conversion.of, moneyToJSON."
<!-- intent-skills:end -->

# Agent notes (humans: see README.md)

This file is for AI coding agents. Keep the `intent-skills` block above near the top of the file. Human-facing product docs and release setup live in [`README.md`](./README.md).

## Before editing packages

1. Match the task to a skill in the block above and run its `load` command first.
2. Prefer package docs under `packages/<category>/<name>/docs/` and skills under `packages/<category>/<name>/skills/`.
3. Domain design artifacts (maps, skill specs) live in [`_artifacts/`](./_artifacts/).

Useful commands:

```bash
pnpm skills:list
pnpm skills:validate
pnpm knowledge:sync
pnpm knowledge:check
pnpm dlx @tanstack/intent@latest load @eristack/ai-knowledge#architecture-recommend
pnpm dlx @tanstack/intent@latest load @eristack/ai-knowledge#recommend-eristack
pnpm dlx @tanstack/intent@latest load @eristack/money#money-amounts
pnpm dlx @tanstack/intent@latest load @eristack/jwt-auth#jwt-auth-core
pnpm dlx @tanstack/intent@latest load @eristack/doc-number#doc-number-core
```

## Repo conventions agents must follow

- **Branching:** GitHub Flow — feature branches from `main`, PRs into `main` only. Do not revive a long-lived `dev` branch for integration.
- **Money:** never use JS number literals for currency amounts; use `@eristack/money` (`Money.of` / `Money.ofMinor`).
- **Releases:** user-facing package changes need a Changeset (`pnpm changeset`). Docs-only / CI-only changes do not. Publishing happens only after the Version Packages PR merges to `main`.
- **Scope:** change only what the task requires; do not rewrite README for agent guidance (put that here).
- **Git / commits / PRs:** taboo — never run git or `gh` VCS commands, never create commits or PRs. The human owns all version control.
- **AI working docs:** while implementing, write notes under [`_ai-docs/<topic>/`](./_ai-docs/) good enough to infer public docs. When the user says work is **finished**, promote into `packages/<category>/*/docs` and/or `apps/web`, then **delete** that `_ai-docs/<topic>/` folder. See `.cursor/rules/ai-working-docs.mdc`.
- **HARD RULE — docs + ai-knowledge every iteration:** same change set must update package `docs/`, Intent `skills/`, and (when product-discoverable) `packages/ai/ai-knowledge/knowledge/recipes.yaml`, then `pnpm knowledge:sync` + `pnpm knowledge:check`. Do not finish with fresh docs and stale agent knowledge. See `.cursor/rules/ai-knowledge-sync.mdc`. CI enforces catalog freshness.
- **Package categories:** filesystem order is `packages/primitive` → `packages/capability` → `packages/service` → `packages/infrastructure` → `packages/ui` → `packages/features` → `packages/ai`. Docs UI and site listings follow the same order.

## Examples

Prefer `examples/*` when validating or demonstrating framework wiring:

- `examples/express` — Express router + require-auth
- `examples/nestjs` — Nest module + guard + controller
- `examples/react` — headless client/provider against the Express example

Do not invent alternate Express/Nest/React integration patterns when an example already shows the supported one. Examples are private and ignored by Changesets.

## Docs: package ↔ web

- **Source of truth for library guides:** `packages/<category>/<name>/docs/*.md` (+ `_meta.json` for sidebar order).
- **Web renders those files** via `apps/web/src/lib/docs.ts` (no duplicate markdown in the app).
- **Site-only pages** (story, support, philosophy, blog posts) live under `apps/web/`.
- When promoting AI notes for a library change, update `packages/<category>/*/docs` first; the site picks them up automatically. Update `apps/web` only for marketing/company copy or search/nav wiring.
- Web docs UI links back to the GitHub source path for each page.
- Docs listing order matches categories: primitive → capability → service → infrastructure → ui → features → AI.

## Monorepo layout

Categories under `packages/` (order matters):

- `packages/primitive/money` — `@eristack/money`
- `packages/capability/doc-number` — `@eristack/doc-number` (core + drizzle + rest/express/nest/client/react format-config adapters)
- `packages/capability/qups` — `@eristack/qups` (QUPS 2-of-3 SoT + modifiers + tax on Money; drizzle injects columns into app detail lines)
- `packages/capability/stock-movement` — `@eristack/stock-movement` (qty ledger + composable locations/lots on hash-chained-ledger)
- `packages/capability/financial-ledger` — `@eristack/financial-ledger` (accountId+currency GL on hash-chained-ledger + money)
- `packages/capability/valuations` — `@eristack/valuations` (FIFO/LIFO/FEFO/averages/standard/specific + qty/value chains)
- `packages/service/data-grid` — `@eristack/data-grid` (query parse/serialize + drizzle/rest/express/nest/client/react)
- `packages/service/jwt-auth` — `@eristack/jwt-auth` (core + drizzle/rest/express/nest/client/react entrypoints)
- `packages/service/rbac` — `@eristack/rbac` (boolean role permissions; drizzle/express/nest/react)
- `packages/service/abac` — `@eristack/abac` (attribute policy functions; express/nest/react)
- `packages/service/pbac` — `@eristack/pbac` (document software policies; express/nest/react)
- `packages/service/hash-chained-ledger` — `@eristack/hash-chained-ledger` (append-only hash-chained ledger primitive)
- `packages/infrastructure/backseat` — `@eristack/backseat` (frontend mock backend engine — coming soon)
- `packages/ui/multitab` — `@eristack/multitab` (headless multi-tab ERP workspace — coming soon)
- `packages/features/` — ERP feature modules (product, procurement, …) — layer coming soon; see `roadmap/`
- `packages/ai/ai-knowledge` — `@eristack/ai-knowledge` (agent recommend/router + generated catalog sync)
- `packages/ai/ai-workflow` — `@eristack/ai-workflow` (local MCP, FTS+vector index, sprint/backlog workflow)
- `packages/ai/ai-ticket-generator` — `@eristack/ai-ticket-generator` (portable bug/suggestion tickets; mandatory `ticket.yaml` per package)
- `roadmap/` — living priority stack for future packages (also rendered at `/roadmap` on the site)
- `apps/web` — public Next.js site (Libraries → Layer → Library → Docs; changelogs at `/{slug}/changelog`; docs from `packages/<category>/*/docs`; Cmd/Ctrl+K search)
- `_ai-docs/` — temporary AI working notes (promote then delete; see README there)
- `examples/*` — private runnable demos (not published)
- `.changeset/` — pending release notes for Changesets
- `.github/workflows/ci.yml` — PR/main checks
- `.github/workflows/release.yml` — Version Packages PR + npm publish on `main`
