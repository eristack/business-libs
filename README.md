# EriStack Business Libraries

TypeScript monorepo of shared business libraries for [Erista](https://github.com/erista) products — the kinds of building blocks enterprise stacks take for granted in Java or C#.

## Why this exists

The Node ecosystem still lacks consistent, reusable libraries for everyday business domains. Teams re-implement money, auth sessions, document numbers, and similar concepts over and over — often with subtle incompatibilities.

EriStack fills those gaps with small, well-scoped libraries inspired by established enterprise models (for example Money after JSR 354).

## Packages

Packages live under `packages/<category>/<name>/` in this order: **primitive → capability → service → AI**.

| Category | Package | Description |
| --- | --- | --- |
| Primitive | [`@eristack/money`](./packages/primitive/money) | JSR 354–inspired amounts, totals/%/tax helpers, rounding, allocation, FX |
| Capability | [`@eristack/doc-number`](./packages/capability/doc-number) | Document numbers + format-config adapters (Drizzle / REST / Express / Nest / React) |
| Service | [`@eristack/jwt-auth`](./packages/service/jwt-auth) | JWT access + opaque refresh tokens, with Drizzle / REST / Express / Nest / React adapters |
| AI | [`@eristack/ai-knowledge`](./packages/ai/ai-knowledge) | Agent knowledge pack: recommend `@eristack/*`, Intent skills, synced catalog |
| AI | [`@eristack/ai-workflow`](./packages/ai/ai-workflow) | Local-first MCP, FTS+vector index, sprint/backlog workflow |

Each package has its own README and docs under `packages/<category>/<name>/`.

## Website

The public site lives in [`apps/web`](./apps/web) (Next.js 16 + Tailwind + shadcn).

**Information architecture:** Libraries (`/packages`) → Layer (`/primitive`, `/capability`, `/service`, `/ai`) → Library overview (`/money`, …) → Docs (`/docs/money`, …). Changelogs live at `/{slug}/changelog`.

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
