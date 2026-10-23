# Publish peer dependency gate (F-013)

**Script:** `node scripts/check-publish-deps.mjs` (`pnpm publish:check`, `eristack check --profile publish`).

## Rules enforced

1. No `workspace:*` in publishable `dependencies`.
2. Every `@eristack/*` entry in `peerDependencies` uses a caret **0.x** floor (e.g. `^0.1.0`, `^0.3.0`) — not `workspace:*`.
3. Non-optional `@eristack/*` peers must have `devDependencies` `workspace:*` for monorepo tests.
4. **Required adapter map** (audit D-003–D-005):
   - `@eristack/jwt-auth` → peer `@eristack/data-grid`
   - `@eristack/data-grid` → peer `@eristack/timestamp`
   - `@eristack/doc-number` → peers `@eristack/data-grid`, `@eristack/timestamp`

Optional peers (`peerDependenciesMeta.optional: true`) may omit workspace devDeps when tests do not import them (e.g. `@eristack/backseat` spine peers).

## When adding a published adapter

Declare runtime `@eristack/*` imports as peers + workspace devDeps; run `pnpm publish:check` before merge.
