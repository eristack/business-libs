# EriStack Business Primitives Library

Eristack Business Primitives — a TypeScript monorepo for shared business primitives library.

## Story behind EriStack Business Primitives

Node ecosystem lacks the proper enterprise support like Java or C# environment. This pain is especially known to us, as we, at the [Erista](https://github.com/erista), struggles with reusability of so many important and what is supposed to be consistent business primitives.

EriStack aims to fill these gaps by implementing some of the well-known enterprise support on business primitives such as: Date, Money (JSR 354 on Java), Document Number, etc.

## Packages

- [`@eristack/money`](./packages/money) — JSR 354–inspired money primitives (see [`packages/money/docs`](./packages/money/docs))
- [`@eristack/jwt-auth`](./packages/jwt-auth) — JWT access + refresh-token auth with Drizzle / REST / Express / Nest / React adapters

## AI agent skills

Publishable packages ship versioned [TanStack Intent](https://tanstack.com/intent) skills:

```bash
pnpm skills:list
npx @tanstack/intent@latest load @eristack/money#money-amounts
npx @tanstack/intent@latest load @eristack/jwt-auth#jwt-auth-core
```

Domain artifacts live in [`_artifacts/`](./_artifacts/). Keep the `intent-skills` block in [`AGENTS.md`](./AGENTS.md) near the top.

## Development

Branching is [GitHub Flow](https://docs.github.com/en/get-started/using-github/github-flow): work on a feature branch, open a PR into `main`, merge when green. There is no long-lived `dev` integration branch.

```bash
git checkout main && git pull
git checkout -b feat/my-change
pnpm install
pnpm build
pnpm test
pnpm ci          # build + typecheck + test + skill validation
```

## Releases

Versioning and publishing use [Changesets](https://github.com/changesets/changesets). Landing on `main` does **not** publish by itself — only merging the Version Packages PR does.

```text
feature/* ──PR──► main ──(changesets)──► Version Packages PR ──merge──► npm publish
```

1. On the feature PR, record the intended bump:

   ```bash
   pnpm changeset
   ```

2. Merge the feature PR into `main`. The release workflow opens (or updates) a **Version Packages** PR that bumps versions and changelogs.

3. Merge that Version Packages PR. The same workflow publishes changed packages to npm and creates GitHub releases.

### One-time npm setup

1. Create the `@eristack` org (or packages) on [npmjs.com](https://www.npmjs.com/) if needed.
2. Add a granular npm automation token as the repo secret `NPM_TOKEN` (Settings → Secrets → Actions).
3. Optional but recommended: after the first publish, configure [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers) for this repo’s `release.yml` workflow (OIDC). You can then remove `NPM_TOKEN`.
