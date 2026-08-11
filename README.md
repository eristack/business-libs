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

Packages are not on npm yet, so the first publish needs a classic/granular **automation** token. Trusted Publishing (OIDC) can be added after that.

1. **Own the scope** — sign in at [npmjs.com](https://www.npmjs.com/) and create an `@eristack` [organization](https://www.npmjs.com/org/create) (or ensure your user can publish under that scope).

2. **Create a granular access token** — [npmjs.com/settings/~/tokens](https://www.npmjs.com/settings/~/tokens) → Generate New Token → **Granular Access Token**:
   - Token name: `business-libs-github-actions`
   - Expiration: your choice (or no expiry if you prefer)
   - Packages and scopes: select **`@eristack`** with **Read and write**
   - Permissions: **Automation** (required for CI; bypasses 2FA on publish)

3. **Add the GitHub Actions secret** — in [eristack/business-libs](https://github.com/eristack/business-libs) → Settings → Secrets and variables → Actions → New repository secret:
   - Name: `NPM_TOKEN`
   - Value: the token from step 2

   Or with the GitHub CLI:

   ```bash
   gh secret set NPM_TOKEN -R eristack/business-libs
   # paste the token when prompted
   ```

4. **After the first successful publish** (optional) — on each package’s npm Settings → Trusted Publisher, add GitHub Actions:
   - Organization or user: `eristack`
   - Repository: `business-libs`
   - Workflow filename: `release.yml`
   - Allowed actions: `npm publish`

   The release workflow already has `id-token: write` for OIDC. Once trusted publishing works, you can revoke `NPM_TOKEN`.
