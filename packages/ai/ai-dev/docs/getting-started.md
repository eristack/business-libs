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

# CI gate (GitHub runs: pnpm build && pnpm eristack check --profile pr --skip-build)
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
| `catalog` | changesets, skills, knowledge, docs, ticket, exports (auto-builds if needed) |
| `pr` | build, typecheck, test, integration + catalog |
| `full` | pr + lint |
| `fast` | build, typecheck, test on **changed packages** (from git diff) |
| `integration` | `pnpm test:integration` only (Drizzle sqlite harness) |

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
| `pnpm docs:check` | `pnpm eristack sync docs --check` |
| `pnpm knowledge:check` | `pnpm eristack sync knowledge --check` |
| `pnpm skills:validate` | `node scripts/skills-validate.mjs` (used internally by check) |
