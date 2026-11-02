# Suggestion: `@eristack/local-monorepo-versioning` (2026-11)

> Portable Eristack ticket — send this file to maintainers. Feasibility is a first-pass gate for agents.

## Meta

- **id:** `20261102-112500-suggestion-local-monorepo-versioning`
- **kind:** suggestion
- **package:** `@eristack/local-monorepo-versioning` (new)
- **feasibility:** `possible`
- **created:** 2026-11-02T11:25:00+07:00
- **reporter:** Tiga Sekawan ERP (consumer)
- **source:** `version.lock.json`, `scripts/version-bump.mjs`, `scripts/lib/*`, `VERSIONING.md` in [tiga-sekawan-erp](https://github.com/) on branch `mikevar/dev` (commits `f4796e1` … `e5d1f57`, Nov 2026)

## Summary

Consumer monorepos that **do not** use Changesets/npm publish still need a **repeatable, AI-friendly release workflow**:

1. A **parent (root) product version** that always moves forward on each release batch.
2. **Independent semver per workspace package** (apps + libraries).
3. On each batch, root advances by **one step at the largest bump level** among packages changed in that batch (not “max of all package versions”).
4. **Auditable history**: every batch gets a unique release id and a structured record of which packages moved from → to.

Tiga Sekawan implemented this in app-owned scripts. Extract the headless rules into `@eristack/local-monorepo-versioning` so the next consumer copies a package instead of ~400 lines of shell/Node.

## User story

As a maintainer of an Eristack-style pnpm monorepo, I want a small versioning library and optional CLI that owns the lock file schema and bump math, so I run `pnpm version:bump web:patch api:minor` and get consistent root + package versions, release ids, and a manifest snapshot — without Changesets or automated npm publish.

## Provenance (consumer reference implementation)

| Concern | Tiga path |
|--------|-----------|
| Lock schema + load/save | `version.lock.json`, `scripts/lib/version-lock.mjs` |
| Semver (parse, level, apply step) | `scripts/lib/semver.mjs` |
| Workspace registry | `scripts/lib/version-workspace.mjs` |
| Bump CLI | `scripts/version-bump.mjs` |
| Apply lock → package.json | `scripts/apply-version-lock.mjs` |
| Manifest read model | `scripts/generate-version-manifest.mjs` |
| Rules tests | `scripts/lib/semver.test.mjs` |
| Human workflow | `VERSIONING.md` |

### Root bump rules (must match tests)

These are **normative** for the package; Tiga’s tests encode them today.

| Scenario | Root |
|----------|------|
| All at `0.1.0`, batch bumps **web** patch | `0.1.0` → `0.1.1` |
| Root `0.1.1`, batch bumps **api** patch (api was `0.1.0`) | `0.1.1` → `0.1.2` |
| One batch: **api** minor + **web** patch | Root **minor** step → `0.2.0` (api `0.2.0`, web `0.1.2`) |

Each batch appends one entry to `releases[]` with a unique id (Tiga uses `YYYYMMDD.NNNN-xxxx`).

## Proposed package shape

**Name:** `@eristack/local-monorepo-versioning`

**Layering (Eristack norms):**

| Layer | Contents |
|-------|----------|
| **Core** | Pure functions: semver, `planRelease(lock, bumps)`, lock schema types, manifest DTO types. No `fs`. |
| **Node adapter** | `loadLock(path)`, `saveLock`, `applyLockToPackageJson(root, lock, workspaceMap)`, `generateManifest(lock)`. |
| **CLI** (optional bin `eristack-version` or `@eristack/local-monorepo-versioning/cli`) | `bump`, `apply`, `manifest`, `validate`, `--dry-run`. |

No Drizzle, no HTTP, no React — consumer apps wire manifest into their own `/platform/version` routes (Tiga uses `@tiga-sekawan/contracts` + workshop).

## Lock file schema (v1)

```json
{
  "schema": 1,
  "root": "0.1.0",
  "packages": {
    "@scope/web": { "version": "0.1.0", "path": "apps/web", "key": "web" }
  },
  "releases": [
    {
      "id": "20261102.0001-a1b2",
      "createdAt": "2026-11-02T12:00:00.000Z",
      "root": { "from": "0.1.0", "to": "0.1.1", "level": "patch" },
      "packages": [
        { "name": "@scope/web", "key": "web", "from": "0.1.0", "to": "0.1.1", "level": "patch" }
      ]
    }
  ]
}
```

- **`schema`** — migration hook for future lock versions.
- **`releases[]`** — canonical history (append-only in normal use).
- **`packages`** — current semver per workspace member; **`root`** — product release counter.

## Manifest (generated read model)

Not a second history store. Regenerated from lock on bump/apply:

- `release` (= lock.root)
- `releasedAt` (generation date or env override)
- `latestReleaseId`
- `packages[]`
- `releases[]` (copy of lock.releases for static hosting / API)

Tiga writes `version.manifest.json` and `apps/web/public/version.manifest.json`.

## Configuration

Consumer supplies a **workspace manifest** (not necessarily pnpm-only):

```ts
type WorkspaceMember = { key: string; path: string; packageName?: string };
```

- **key** — CLI shorthand (`web:patch`).
- **path** — directory containing `package.json` (relative to repo root).

Optional:

- `releaseIdFactory(lock, createdAt)` — default Tiga-style id.
- `changelogPath` — copy hook after bump (consumer-owned content).

## API sketch (core)

```ts
export type BumpRequest = { key: string; level: "patch" | "minor" | "major" };

export function planRelease(
  lock: VersionLock,
  requests: BumpRequest[],
): { release: VersionLockRelease; nextLock: VersionLock; batchLevel: SemverLevel };

export function bumpRelative(current: string, level: SemverLevel): string;
export function applyLevel(version: string, level: SemverLevel): string;
export function bumpLevel(from: string, to: string): SemverLevel | null;
```

Future (not v0): exact target `web:0.1.2` instead of relative level only.

## Out of scope (v0)

- **Changesets** integration or npm publish.
- **Git tags** or GitHub Releases (consumer runs `git tag v$(…)` per VERSIONING.md).
- **Changelog parsing/generation** (Keep a Changelog stays human/AI-edited).
- **Turbo/pnpm version** built-in detection — explicit workspace list is fine for v0.
- **Lerna independent mode** compatibility.

## Relationship to existing Eristack docs

- **`@eristack/ai-knowledge#dev-conventions`** — Changesets for **library publish**; this package is for **private monorepos** that release/deploy as one product without npm.
- Document in ai-knowledge as **recipe**: “local monorepo versioning” pointing at this package when `recommend()` sees private root + multiple workspace packages + no Changesets.

## Acceptance criteria

1. Core unit tests reproduce Tiga’s three root-rule scenarios (and semver edge cases).
2. Node adapter round-trip: bootstrap lock from existing `package.json` files → bump → all versions updated.
3. `validateLock(lock)` fails on schema mismatch, downgrades, or packages missing from workspace map.
4. Published README with the same workflow as Tiga `VERSIONING.md` (bump / apply / manifest / test).
5. Zero runtime deps beyond Node 20+ (or align with Eristack baseline).

## Migration path for Tiga Sekawan

1. Add dependency `@eristack/local-monorepo-versioning`.
2. Replace `scripts/lib/{semver,version-lock,version-workspace}.mjs` with package imports.
3. Thin `scripts/version-bump.mjs` → re-export CLI or 10-line wrapper passing Tiga workspace map.
4. Keep `version.lock.json` path and schema v1 identical for git history continuity.

## Open decisions for maintainers

1. **Package name** — `@eristack/local-monorepo-versioning` vs `@eristack/monorepo-version` (consumer suggested local-monorepo-versioning to stress non-publish).
2. **Single vs split** — core + `/node` export only, or also `exports["./cli"]`.
3. **Lock file name** — default `version.lock.json` at repo root vs configurable.
4. **Whether manifest types** live in this package or stay consumer-contract (`@tiga-sekawan/contracts` today).

## Test plan (maintainer)

- Port `scripts/lib/semver.test.mjs` into package vitest suite.
- Fixture repo with two fake packages; sequential bumps match table above.
- CI recipe: `validate` + `git diff --exit-code` after `apply`.

## Agent handoff

Load `@eristack/ai-knowledge#dev-conventions` and implement core-first with examples in `examples/node-bump/`. Do not pull in Changesets. Copy normative tests from Tiga consumer commits listed in Meta before changing bump semantics.
