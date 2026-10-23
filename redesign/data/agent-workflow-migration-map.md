# Agent workflow migration map (MIG-2026-10-23-04)

**Task:** STAB-MIG-AIWF · **Audience:** agents + maintainers · **Compat:** additive (old paths still work; prefer new order)

## Entry (start every business-libs iteration)

| Step | Old order | New order |
| --- | --- | --- |
| 0 | Jump into package docs | Stabilization work: read `redesign/README.md` + active row in `tasks.yaml` |
| 1 | Ad-hoc `pnpm` chains | `pnpm eristack plan --json` |
| 2 | Guess packages | `recommend()` / `loadPlan()` or `#recommend-eristack` |
| 3 | Read many skills | **One** Intent load per area; cross-cutting = **one** `knowledge/*.md` source |
| 4 | Edit + hope CI catches | Same pass: docs + skills + recipes + `pnpm knowledge:sync` |
| 5 | Human commits everything | Agent **granular** `git commit`; human **push/PR** |
| 6 | Assume each PR releases npm | **Batch** Version Packages on `main`; extend `stab-program-*` changesets |

## Routing (product language → packages)

| Old | New |
| --- | --- |
| Scroll 70-row table in `recommend-eristack` skill | `getCatalog()` / `listPackages()` or compact skill stub after sync |
| Miss ERP canonical guides | Recipes `canonicalSkills` → merged in `loadPlan()` (tested) |
| Open `upgrading.md` + `dev-conventions` + `AGENTS.md` as skill sources | `#dev-conventions` → one doc; upgrades → `#upgrading-eristack` |
| Open `architecture.md` + `stack-defaults.md` together | `#architecture-recommend` then `#stack-defaults` if wiring |
| Toolbox: three skill sources | `#ai-toolbox` → decision tree; prompts/checklists paths in skill body |

## Verification commands (agent)

```bash
pnpm eristack plan --json
pnpm --filter @eristack/ai-knowledge test
pnpm knowledge:check
node scripts/check-skill-sources.mjs --ci
pnpm eristack check --profile catalog --only skill-sources   # after ai-dev build
```

## Consumer repos (unchanged optional)

| Tool | When |
| --- | --- |
| `@eristack/ai-workflow` MCP | Sprint memory / FTS — optional |
| `@eristack/ai-ticket-generator` | Portable maintainer tickets |

business-libs stabilization uses **`redesign/tasks.yaml`** instead of ai-workflow for program state.

## Rollback

Revert skills/knowledge to prior commit; run `pnpm knowledge:sync`. Cursor rules: restore `no-git.mdc` taboo if disabling iteration commits.

## Verify migration complete

- [x] MIG-04 map filed (this doc)
- [x] `skill-sources` CI green without allowlist
- [ ] STAB-MEM-1 gate prevents **new** root `createMemory*` exports
- [ ] Phase 2 enforcement row in [10-enforcement-design.md](../10-enforcement-design.md)
