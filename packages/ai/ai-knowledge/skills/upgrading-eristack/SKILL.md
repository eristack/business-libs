---
name: upgrading-eristack
description: >
  Single canonical upgrade guide: pnpm outdated, changelogs, full Backseat spine
  matrix with register/store APIs, ERP bootstrap, peer ^0.1.0, Changesets 0.x.
  Read this skill only — do not open per-package docs/backseat.md files.
metadata:
  type: core
  library: '@eristack/ai-knowledge'
  library_version: '0.1.3'
sources:
  - 'eristack/business-libs:packages/ai/ai-knowledge/knowledge/upgrading.md'
---

# Upgrading Eristack

**Stop.** Load this skill once. The full guide is in `knowledge/upgrading.md` (one file). **Do not** read eleven `docs/backseat.md` files or grep the monorepo for upgrade facts.

## When to use

Upgrade, bump, changelog, Backseat `./backseat` adapters, peer ranges, Changesets policy.

## Quick path

```bash
pnpm outdated '@eristack/*'
pnpm dlx @tanstack/intent@latest load @eristack/ai-knowledge#upgrading-eristack
# then read knowledge/upgrading.md sections 1–3 only if not inlined in your context
```

Changelogs: `https://eristack.dev/{slug}/changelog`.

## Backseat (summary — full matrix in source doc)

| Layer | Import |
| --- | --- |
| Engine | `@eristack/backseat`, `@eristack/backseat/store`, `@eristack/backseat/react` |
| Spine | `@eristack/<pkg>/backseat` (memory + `register*Backseat`) |
| Browser | `@eristack/<pkg>/backseat/store` (`createIndexedDb*…({ dbName })`) |

Peer on published apps: `"@eristack/backseat": "^0.1.0"` (optional). Production stays `./drizzle` + HTTP adapters.

**All eleven packages, register options, collections, and copy-paste bootstrap:** see `knowledge/upgrading.md` §3 (complete table + jwt-auth/doc-number/data-grid/valuations examples).

## Contributors

- Changeset **`patch`** on `0.1.x` → next pre-1.0 minor; **`minor`** → **1.0.0**
- Peers `^0.1.0`; devDeps `workspace:*`; `onlyUpdatePeerDependentsWhenOutOfRange: true`

## Agent rule

Max **three files** for an upgrade task: this skill + `knowledge/upgrading.md` + one package adapters skill if production wiring changed.
