---
title: Getting started
description: Unified agent-first dev tooling for Eristack monorepos.
---

# Getting started

Unified agent-first dev tooling for Eristack monorepos.

## Install

Monorepo root (workspace):

```bash
pnpm install
pnpm build   # builds @eristack/ai-dev bin
```

Consumer repo (after publish):

```bash
pnpm add -D @eristack/ai-dev
```

## CLI

```bash
# Token-minimal: what to run next (agents run this first)
pnpm eristack plan --json

# Main-branch CI gate (same checks as --profile pr; one parallel turbo graph)
pnpm eristack ci --full

# PR CI (affected turbo; full when root/lockfile/.github/ai-dev change)
pnpm eristack ci --base origin/main

# Same pr checks, sequential, after your own pnpm build
pnpm eristack check --profile pr --skip-build

# Local full bar (includes lint)
pnpm eristack check --profile full --skip-build

# Drift checks only (fast, no compile)
pnpm eristack check --profile catalog

# Sync catalogs after doc/recipe/skill edits
pnpm eristack sync knowledge
pnpm eristack sync docs
pnpm eristack sync all --check   # verify only

# List packages
pnpm eristack packages list --json
```

## Check profiles

| Profile | Includes |
| --- | --- |
| `catalog` | changesets, skills, **agents-intent-sync**, skill-sources, memory-exports, knowledge, docs, ticket, exports, debottleneck (auto-builds if needed) |
| `pr` | build, typecheck, test, integration coverage, examples + catalog |
| `full` | pr + lint |
| `fast` | build, typecheck, test on **changed packages** (from git diff) |
| `integration` | `pnpm test:integration` only (Drizzle sqlite harness). Inside `pr`/`ci` this check is `--verify-covered`: suites already run once in turbo `test`, so it only asserts the package vitest `include` matches `tests/drizzle.integration.test.ts` |
| `examples` | Example apps build only (`turbo run build --filter='./examples/*'`, cached) |

`--skip-build` means "already built": checks that need `dist/` run without triggering another build. CI sets `ERISTACK_LOCKFILE_VERIFIED=1` after its frozen install, so the `lockfile` check does not reinstall.
| `publish` | `pnpm publish:check` only (dependency hygiene) |

## MCP

Stdio server for editors:

```bash
eristack-mcp
```

Set `ERISTACK_DEV_CWD` to your repo root. Tools: `dev_plan`, `dev_check`, `dev_packages`.

## Library

```ts
import {
  findRepoRoot,
  listEristackPackages,
  planFromGit,
  runChecks,
  createDevMcpServer,
} from "@eristack/ai-dev";
```

Subpath `@eristack/ai-dev/repo` re-exports the canonical package walker (backed by `scripts/lib/list-eristack-packages.mjs` in business-libs).

## Root script aliases

These delegate to `eristack` — prefer `pnpm eristack` for new work:

| Legacy | Unified |
| --- | --- |
| `pnpm ci` | `pnpm build && pnpm eristack check --profile full --skip-build` |
| `pnpm ci:pr` | Smart PR CI (full when lockfile/root changes; else affected turbo) |
| `pnpm ci:affected` | Force affected turbo only — **local** pre-push when full CI is slow |
| `pnpm ci:drift` | Catalog only (~seconds): docs, knowledge, skills, **ticket.yaml** |
| `pnpm ticket:check` | Builds `@eristack/ai-ticket-generator` then scans every `ticket.yaml` (affected CI runs this pre-turbo) |
| `pnpm lockfile:sync` | After any `package.json` dep change — refresh `pnpm-lock.yaml` |
| `pnpm lockfile:check` | Same as CI install gate (`--frozen-lockfile`) |
| `pnpm prepush` | **Before push:** `ci:affected` — drift gates + build/typecheck/test on packages changed vs `origin/main` (~1–2 min) |

After editing workspace **`package.json`** (including `examples/*`):

```bash
pnpm lockfile:sync    # commit pnpm-lock.yaml with the package.json change
pnpm prepush          # catch ticket/docs/knowledge/lockfile before push
```
| `pnpm docs:check` | `pnpm eristack sync docs --check` |
| `pnpm knowledge:check` | `pnpm eristack sync knowledge --check` |
| `pnpm skills:validate` | `node scripts/skills-validate.mjs` (used internally by check) |
| `node scripts/check-agents-intent-sync.mjs --ci` | AGENTS.md intent block ↔ `intent.skills` ↔ skill files (`agents-intent-sync` check) |
