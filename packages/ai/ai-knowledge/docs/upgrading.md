---
title: Upgrading packages
description: Check new @eristack versions, peer ranges, and Backseat adapter migrations
sidebar_position: 3
---

# Upgrading @eristack packages

Consumer-focused guide: **what shipped**, **what to bump**, **what to change**.

## See new versions

| Source | Use |
| --- | --- |
| `pnpm outdated '@eristack/*'` | Quick check in your app |
| `pnpm npm view @eristack/backseat version` | Latest on npm |
| Site `/{slug}/changelog` | Human-readable release notes |
| Package `docs/backseat.md` | Backseat adapter wiring per library |

Contributors: `.changeset/*.md`, `pnpm changeset status`, then the Version Packages PR.

## Backseat 0.1.0 + spine `./backseat` adapters

**New export paths** on eleven spine packages: `@eristack/<pkg>/backseat` and `@eristack/<pkg>/backseat/store` (IndexedDB via `@eristack/backseat/store`).

Packages: `jwt-auth`, `doc-number`, `qups`, `stock-movement`, `financial-ledger`, `valuations`, `data-grid`, `hash-chained-ledger`, `rbac`, `abac`, `pbac`, plus `@eristack/backseat` itself.

**Production** remains Drizzle + HTTP adapters. Backseat is browser prototype only.

### Consumer peer dependency

When using optional Backseat adapters:

```json
"peerDependencies": {
  "@eristack/backseat": "^0.1.0"
},
"peerDependenciesMeta": {
  "@eristack/backseat": { "optional": true }
}
```

Use real semver on peers — not `workspace:*` in published manifests. Monorepo devDeps stay `workspace:*`.

A Backseat **0.1.x** release does **not** require you to major-bump other `@eristack/*` packages if `^0.1.0` still satisfies the new Backseat version.

## Upgrade workflow

1. Read changelogs for packages you depend on.
2. Bump `package.json` ranges (or run `pnpm update '@eristack/*'` within your policy).
3. Load Intent skills for packages whose wiring changed.
4. Run your app tests / typecheck.

Agents:

```bash
pnpm dlx @tanstack/intent@latest load @eristack/ai-knowledge#upgrading-eristack
```

Full detail: [`knowledge/upgrading.md`](../knowledge/upgrading.md) in the npm package (also synced into this doc set).
