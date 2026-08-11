<!-- intent-skills:start -->
# TanStack Intent - before editing files, run the matching guidance command.
tanstackIntent:
  - id: "@eristack/jwt-auth#jwt-auth-adapters"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/jwt-auth#jwt-auth-adapters"
    for: "@eristack/jwt-auth adapters: drizzle RefreshTokenStore + CredentialStore (jwt_auth_credentials child of users), rest login/sessions, express createJwtAuthRouter, nest JwtAuthModule, client login, react useJwtAuth. Use when wiring persistence or HTTP/frontend shells."
  - id: "@eristack/jwt-auth#jwt-auth-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/jwt-auth#jwt-auth-core"
    for: "Pure @eristack/jwt-auth: createJwtAuth, registerCredentials, login, changePassword, issueTokens, verifyAccessToken, refresh rotation, revoke, CredentialStore + RefreshTokenStore. Credentials are a child of app users (not a users table). Use for JWT + optional username/password without HTTP frameworks."
  - id: "@eristack/money#money-amounts"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/money#money-amounts"
    for: "Construct Money with strings or minor units, run same-currency arithmetic, and compare amounts in @eristack/money. Use when creating prices, taxes, discounts, totals, Money.of, Money.ofMinor, CurrencyMismatchError, or when an agent reaches for JS number literals for money."
  - id: "@eristack/money#money-ledger"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/money#money-ledger"
    for: "Round at ledger boundaries, allocate without losing cents, convert with app-supplied FX rates, and serialize Money as JSON decimal strings in @eristack/money. Use for invoices, payment splits, multi-currency reporting, Rounding.currencyDefault, allocate, Conversion.of, moneyToJSON."
<!-- intent-skills:end -->

# Agent notes (humans: see README.md)

This file is for AI coding agents. Keep the `intent-skills` block above near the top of the file. Human-facing product docs and release setup live in [`README.md`](./README.md).

## Before editing packages

1. Match the task to a skill in the block above and run its `load` command first.
2. Prefer package docs under `packages/<name>/docs/` and skills under `packages/<name>/skills/`.
3. Domain design artifacts (maps, skill specs) live in [`_artifacts/`](./_artifacts/).

Useful commands:

```bash
pnpm skills:list
pnpm skills:validate
pnpm dlx @tanstack/intent@latest load @eristack/money#money-amounts
pnpm dlx @tanstack/intent@latest load @eristack/jwt-auth#jwt-auth-core
```

## Repo conventions agents must follow

- **Branching:** GitHub Flow — feature branches from `main`, PRs into `main` only. Do not revive a long-lived `dev` branch for integration.
- **Money:** never use JS number literals for currency amounts; use `@eristack/money` (`Money.of` / `Money.ofMinor`).
- **Releases:** user-facing package changes need a Changeset (`pnpm changeset`). Docs-only / CI-only changes do not. Publishing happens only after the Version Packages PR merges to `main`.
- **Scope:** change only what the task requires; do not rewrite README for agent guidance (put that here).
- **Git / commits / PRs:** taboo — never run git or `gh` VCS commands, never create commits or PRs. The human owns all version control.
- **AI working docs:** while implementing, write notes under [`_ai-docs/<topic>/`](./_ai-docs/) good enough to infer public docs. When the user says work is **finished**, promote into `packages/*/docs` and/or `apps/web`, then **delete** that `_ai-docs/<topic>/` folder. See `.cursor/rules/ai-working-docs.mdc`.

## Examples

Prefer `examples/*` when validating or demonstrating framework wiring:

- `examples/express` — Express router + require-auth
- `examples/nestjs` — Nest module + guard + controller
- `examples/react` — headless client/provider against the Express example

Do not invent alternate Express/Nest/React integration patterns when an example already shows the supported one. Examples are private and ignored by Changesets.

## Docs: package ↔ web

- **Source of truth for library guides:** `packages/<name>/docs/*.md` (+ `_meta.json` for sidebar order).
- **Web renders those files** via `apps/web/src/lib/docs.ts` (no duplicate markdown in the app).
- **Site-only pages** (story, support, philosophy, blog posts) live under `apps/web/`.
- When promoting AI notes for a library change, update `packages/*/docs` first; the site picks them up automatically. Update `apps/web` only for marketing/company copy or search/nav wiring.
- Web docs UI links back to the GitHub source path for each page.

## Monorepo layout

- `packages/money` — `@eristack/money`
- `packages/jwt-auth` — `@eristack/jwt-auth` (core + drizzle/rest/express/nest/client/react entrypoints)
- `apps/web` — public Next.js site (landing, marketing, docs from `packages/*/docs`, Cmd/Ctrl+K search)
- `_ai-docs/` — temporary AI working notes (promote then delete; see README there)
- `examples/*` — private runnable demos (not published)
- `.changeset/` — pending release notes for Changesets
- `.github/workflows/ci.yml` — PR/main checks
- `.github/workflows/release.yml` — Version Packages PR + npm publish on `main`
