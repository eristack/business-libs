---
name: upgrading-eristack
description: >
  Upgrade @eristack consumer apps: check npm/site changelogs, bump semver ranges,
  optional Backseat peer ^0.1.0, wire @eristack/*/backseat adapters. Monorepo
  Changesets 0.x rules and onlyUpdatePeerDependentsWhenOutOfRange policy.
metadata:
  type: core
  library: '@eristack/ai-knowledge'
  library_version: '0.1.3'
sources:
  - 'eristack/business-libs:packages/ai/ai-knowledge/knowledge/upgrading.md'
  - 'eristack/business-libs:packages/ai/ai-knowledge/knowledge/dev-conventions.md'
  - 'eristack/business-libs:packages/infrastructure/backseat/docs/package-adapters.md'
---

# Upgrading Eristack

Load when the user asks to **upgrade**, **bump**, **what changed**, or **new versions** of `@eristack/*`.

Full guide: `knowledge/upgrading.md` · Site: `/docs/ai-knowledge/upgrading`.

## Check versions (consumer)

```bash
pnpm outdated '@eristack/*'
pnpm npm view @eristack/backseat version
```

Changelogs: site `/{slug}/changelog` (e.g. `/backseat/changelog`, `/jwt-auth/changelog`).

## Backseat 0.1.0 train (what’s new)

- `@eristack/backseat@^0.1.0` — engine, IndexedDB store, React, `./adapters` REST bridge
- Spine packages: **`./backseat`** + **`./backseat/store`** (see `docs/backseat.md` per package)
- Optional peer: `"@eristack/backseat": "^0.1.0"` (never `workspace:*` on published peers)

Prototype wiring pattern:

```ts
import { createBackseat } from "@eristack/backseat";
import { createIndexedDbBackseatStore } from "@eristack/backseat/store";
import { registerJwtAuthBackseat, createIndexedDbJwtAuthStores } from "@eristack/jwt-auth/backseat/store";
```

Production: keep `./drizzle`, `./express`, `./react` — not Backseat.

## After bumping

1. Read each touched package changelog + `docs/backseat.md` if using Backseat
2. Load package skills (`#…-core`, `#…-adapters`, `#backseat-core`)
3. Typecheck / test

## Contributors (Changesets)

- `0.x` + changeset **`patch`** → next `0.(n+1).0` (stay pre-1.0)
- `0.x` + changeset **`minor`** → **`1.0.0`** (intentional exit from 0.x)
- Internal optional peers: **`^0.1.0`** + `onlyUpdatePeerDependentsWhenOutOfRange: true`
- Monorepo devDeps: **`workspace:*`** only
