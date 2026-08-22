# EriStack Business Libraries

TypeScript monorepo of shared business libraries for [Erista](https://github.com/erista) products — the kinds of building blocks enterprise stacks take for granted in Java or C#.

## Why this exists

The Node ecosystem still lacks consistent, reusable libraries for everyday business domains. Teams re-implement money, auth sessions, document numbers, and similar concepts over and over — often with subtle incompatibilities.

EriStack fills those gaps with small, well-scoped libraries inspired by established enterprise models (for example Money after JSR 354).

## Packages

Packages live under `packages/<category>/<name>/` in this order: **primitive → capability → service → infrastructure → ui → features → AI**.

| Category | Package | Description |
| --- | --- | --- |
| Primitive | [`@eristack/money`](./packages/primitive/money) | JSR 354–inspired amounts, totals/%/tax helpers, rounding, allocation, FX + adapters (Drizzle / REST / Zod / Express / Nest / client / React) |
| Primitive | [`@eristack/timestamp`](./packages/primitive/timestamp) | Business time: UTC **instant** facts + **wall** schedules (DST-safe), Temporal core + same adapter spine as money |
| Capability | [`@eristack/doc-number`](./packages/capability/doc-number) | Document numbers + format-config adapters (Drizzle / REST / Express / Nest / React) |
| Capability | [`@eristack/qups`](./packages/capability/qups) | Quantity / unit price / subtotal (2-of-3 SoT), modifiers, tax on Money |
| Capability | [`@eristack/stock-movement`](./packages/capability/stock-movement) | Inventory qty ledger on hash-chained-ledger |
| Capability | [`@eristack/financial-ledger`](./packages/capability/financial-ledger) | GL balances per account + currency |
| Capability | [`@eristack/valuations`](./packages/capability/valuations) | FIFO/LIFO/average costing + cost layers |
| Service | [`@eristack/data-grid`](./packages/service/data-grid) | Dynamic list queries: filters, search mode, multi-sort, offset/cursor pagination |
| Service | [`@eristack/epoch`](./packages/service/epoch) | Per-scope data-version counters for TanStack Query cache policy (use-cache vs refetch) |
| Service | [`@eristack/jwt-auth`](./packages/service/jwt-auth) | JWT access + opaque refresh tokens, with Drizzle / REST / Express / Nest / React adapters |
| Service | [`@eristack/rbac`](./packages/service/rbac) | Role-based boolean permissions on subjects |
| Service | [`@eristack/abac`](./packages/service/abac) | Attribute policies (algorithms → true/false) |
| Service | [`@eristack/pbac`](./packages/service/pbac) | Software policies over business documents |
| Service | [`@eristack/hash-chained-ledger`](./packages/service/hash-chained-ledger) | Append-only hash-chained ledger primitive |
| Infrastructure | [`@eristack/backseat`](./packages/infrastructure/backseat) | In-browser mock REST engine + IndexedDB store for frontend-first prototypes (alpha) |
| UI | [`@eristack/multitab`](./packages/ui/multitab) | Headless multi-tab ERP workspace (coming soon) |
| Features | *(coming soon)* | ERP modules — product, procurement, … — see [`roadmap/`](./roadmap/README.md) |
| AI | [`@eristack/ai-knowledge`](./packages/ai/ai-knowledge) | Agent knowledge pack: recommend `@eristack/*`, Intent skills, synced catalog |
| AI | [`@eristack/ai-workflow`](./packages/ai/ai-workflow) | Local-first MCP, FTS+vector index, sprint/backlog workflow |
| AI | [`@eristack/ai-ticket-generator`](./packages/ai/ai-ticket-generator) | Portable bug/suggestion tickets for maintainers; mandatory `ticket.yaml` |

Each package has its own README and docs under `packages/<category>/<name>/`. Planned work lives in [`roadmap/`](./roadmap/README.md).

## Website

The public site lives in [`apps/web`](./apps/web) (Next.js 16 + Tailwind + shadcn).

**Information architecture:** Libraries (`/packages`) → Layer (`/primitive`, …, `/features`, `/ai`) → Library overview (`/money`, …) → Docs (`/docs/money`, …). Changelogs at `/{slug}/changelog`. Roadmap at [`/roadmap`](./roadmap/README.md).

- Landing, libraries index, layer/library landings, blog, story, philosophy, maintainers, support/partners
- Library docs rendered from `packages/<category>/*/docs` (single source of truth), grouped by category
- Current package version (from `package.json`) and changelog pages (from `CHANGELOG.md` when present)
- Cmd/Ctrl+K search across pages, layers, libraries, docs, and changelogs

```bash
pnpm web
# or: pnpm --filter @eristack/web dev
```

Eristack is a subsidiary of [erista.id](https://erista.id). Agent working notes go in [`_ai-docs/`](./_ai-docs/) while a feature is in progress; promote into package/web docs when finished, then delete the topic folder.

## Examples

Framework demos under [`examples/`](./examples) exercise the real adapters (especially `@eristack/jwt-auth`):

| Example | Command |
| --- | --- |
| Express API | `pnpm --filter @eristack/example-express dev` |
| NestJS API | `pnpm --filter @eristack/example-nestjs dev` |
| React client (needs Express) | `pnpm --filter @eristack/example-react dev` |

See [`examples/README.md`](./examples/README.md).

## Local development

```bash
pnpm install
pnpm build
pnpm test
pnpm ci          # build + typecheck + test + skill validation
```

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

1. On the feature PR, run `pnpm changeset` and commit the generated file.
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
