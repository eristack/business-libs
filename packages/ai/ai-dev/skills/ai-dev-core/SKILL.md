---
name: ai-dev-core
description: >
  @eristack/ai-dev unified monorepo tooling: eristack plan (token-minimal),
  eristack check profiles (catalog/pr/full = CI), sync docs/knowledge, MCP
  dev_plan/dev_check. Use before ad-hoc pnpm script chains or reading every check doc.
metadata:
  type: core
  library: '@eristack/ai-dev'
  library_version: '0.0.0'
sources:
  - 'eristack/business-libs:packages/ai/ai-dev/docs/getting-started.md'
---

# ai-dev — unified dev tooling

**One command beats ten.** Load this skill when wiring checks, planning agent work, or consolidating monorepo scripts.

## Agent workflow (token budget)

1. **`pnpm eristack plan --json`** — changed files → profile, checks, sync, skills, commands, **`nextBrainstormItem`** (first open row in `_ai-docs/brainstorm/improvements.md`). Run this **first** instead of glob-reading AGENTS.md check lists.
2. **`pnpm eristack ci --base origin/main`** — **PR CI** (affected turbo + drift; skips web `next build` on library-only diffs).
3. **`pnpm eristack check --profile pr`** — **main branch CI** (full gate).
4. **`pnpm eristack sync knowledge`** / **`docs`** — when recipes, skills, or package docs changed.

## Profiles

| Profile | Use |
| --- | --- |
| `catalog` | Drift only: docs, knowledge, skills, ticket, changesets, exports* |
| `pr` | **Main CI** — build + typecheck + test + integration + catalog |
| `full` | `pr` + lint |
| `fast` | Turbo filter on changed packages (from `plan`) |
| `integration` | Drizzle integration tests only (`pnpm test:integration`) |
| `examples` | Example apps build (`pnpm --filter './examples/*' build`) |
| `publish` | `pnpm publish:check` only (no workspace:* in published deps) |
| `ci` command | PR path: affected + drift + integration; `--full` or `ci:full` label → `pr` |

## MCP (Cursor / Claude Desktop)

```json
"eristack-dev": {
  "command": "eristack-mcp",
  "env": { "ERISTACK_DEV_CWD": "/path/to/repo" }
}
```

Tools: `dev_plan`, `dev_check`, `dev_packages` — all return compact JSON.

## Library API

```ts
import {
  findRepoRoot,
  listEristackPackages,
  planFromPaths,
  runChecks,
} from "@eristack/ai-dev";
import { listEristackPackages as listJs } from "@eristack/ai-dev/repo";
```

Plain JS walker (no build): `scripts/lib/list-eristack-packages.mjs` — shared with docs sync scripts.

## Do not

- Chain ten root `pnpm *:check` scripts when `eristack check` exists
- Skip `plan --json` on multi-package tasks
- Duplicate package walkers in new scripts — import `@eristack/ai-dev/repo` or the `.mjs` lib
