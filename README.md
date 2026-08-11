# EriStack Business Libraries

TypeScript monorepo of shared business libraries for [Erista](https://github.com/erista) products — the kinds of building blocks enterprise stacks take for granted in Java or C#.

## Why this exists

The Node ecosystem still lacks consistent, reusable libraries for everyday business domains. Teams re-implement money, auth sessions, document numbers, and similar concepts over and over — often with subtle incompatibilities.

EriStack fills those gaps with small, well-scoped libraries inspired by established enterprise models (for example Money after JSR 354).

## Packages

| Package                                     | Description                                                                               |
| ------------------------------------------- | ----------------------------------------------------------------------------------------- |
| [`@eristack/money`](./packages/money)       | JSR 354–inspired money amounts, rounding, allocation, and FX helpers                      |
| [`@eristack/jwt-auth`](./packages/jwt-auth) | JWT access + opaque refresh tokens, with Drizzle / REST / Express / Nest / React adapters |

Each package has its own README and docs under `packages/<name>/`.

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
