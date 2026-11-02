---
title: Getting started
description: version.lock.json bump math for private monorepos without Changesets or npm publish.
---

# Getting started

Use **`@eristack/local-monorepo-versioning`** when your product is a **private pnpm monorepo** that deploys as one release train — not when you publish `@eristack/*` libraries (that path stays **Changesets**; see `@eristack/ai-knowledge#dev-conventions`).

## Install

```bash
pnpm add -D @eristack/local-monorepo-versioning
```

## Workspace map

Commit a JSON list at the repo root (default `version.workspace.json`):

```json
[
  { "key": "web", "path": "apps/web" },
  { "key": "api", "path": "apps/api" }
]
```

## Lock file (`version.lock.json`)

Schema v1 keeps a **root product version**, **per-package semver**, and an append-only **`releases[]`** audit trail. Bootstrap once from existing `package.json` files:

```ts
import { bootstrapLockFromWorkspace, saveLock } from "@eristack/local-monorepo-versioning/node";

const workspace = JSON.parse(readFileSync("version.workspace.json", "utf8"));
const lock = bootstrapLockFromWorkspace(process.cwd(), workspace);
saveLock("version.lock.json", lock);
```

## Bump / apply / manifest (CLI)

```bash
pnpm exec eristack-version bump web:patch api:minor --dry-run
pnpm exec eristack-version bump web:patch
pnpm exec eristack-version apply
pnpm exec eristack-version manifest --out version.manifest.json
pnpm exec eristack-version validate --workspace version.workspace.json
```

**Root rule:** each batch advances the root by **one step at the largest bump level** among packages in that batch (patch &lt; minor &lt; major). Package versions bump independently by their requested level.

## Core API (tests, custom tooling)

```ts
import { planRelease, validateLock } from "@eristack/local-monorepo-versioning";

const { nextLock, batchLevel } = planRelease(lock, [
  { key: "web", level: "patch" },
]);
validateLock(nextLock, workspace);
```

## Production path

1. Edit changelogs / release notes (Keep a Changelog — human or AI; this package does not generate them).
2. `eristack-version bump …` → updates lock + `package.json` versions.
3. `eristack-version manifest` → static JSON for `/platform/version` or workshop (consumer-owned route).
4. Tag and deploy (`git tag v$(node -p "require('./version.lock.json').root")` — consumer script).

## Do not

- Replace Changesets for published npm packages in **business-libs**.
- Expect git tags or GitHub Releases — wire those in your repo scripts.
