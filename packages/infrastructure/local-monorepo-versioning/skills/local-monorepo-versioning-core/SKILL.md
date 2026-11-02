---
name: local-monorepo-versioning-core
description: >
  @eristack/local-monorepo-versioning planRelease + version.lock.json schema for private pnpm monorepos
  without Changesets: root advances one step at the batch's largest bump level, independent package
  semver, releases[] audit trail, validateLock, Node load/save/apply, eristack-version CLI bump/apply/manifest/validate.
  Not for npm-published @eristack library repos.
metadata:
  author: eristack
  version: "0.1"
  type: core
  library: "@eristack/local-monorepo-versioning"
sources:
  - packages/infrastructure/local-monorepo-versioning/docs/getting-started.md
---

# @eristack/local-monorepo-versioning

Private monorepo release train: **`version.lock.json`** at repo root, workspace map JSON, optional **`eristack-version`** CLI.

```ts
import { planRelease, bumpRelative, validateLock } from "@eristack/local-monorepo-versioning";
import {
  bootstrapLockFromWorkspace,
  applyLockToPackageJson,
  saveLock,
  writeManifest,
} from "@eristack/local-monorepo-versioning/node";
```

## Checklist

1. `version.workspace.json` — `{ key, path, packageName? }[]` for CLI shorthand (`web:patch`).
2. Bootstrap lock from `package.json` once; commit `version.lock.json` schema `1`.
3. Bump: `planRelease(lock, [{ key, level }])` or `eristack-version bump web:patch api:minor`.
4. Root moves one step at **max level in the batch**; packages move by their own level.
5. `validateLock(lock, workspace)` before commit; `manifest` for static version API.
6. **Published libraries** in eristack/business-libs use **Changesets** — do not swap this in.

## Do not

- Use for npm publish versioning or Changesets replacement in `@eristack/*` maintainers repo.
- Invent parallel semver scripts — import core `planRelease` and the normative root-rule tests.
