# Full package audit — index

**Date:** 2026-08-27 · **Scope:** all 20 publishable `@eristack/*` packages + examples + agent tooling  
**Status:** point-in-time snapshot — does **not** change `roadmap/`, `packages/`, or [`../brainstorm/`](../brainstorm/) naming queue.

| Doc | Read for |
| --- | --- |
| [executive-summary.md](./executive-summary.md) | Top 15 fixes ranked by leverage × severity |
| [per-package.md](./per-package.md) | Every package: tests, exports, skills, docs, design-target gaps |
| [cross-cutting.md](./cross-cutting.md) | Examples, Backseat spine, publish deps, CI, recommend/loadPlan |
| [docs-and-agents.md](./docs-and-agents.md) | Token burn, skills, recipes, mirrors, AGENTS.md |
| [improvement-backlog.md](./improvement-backlog.md) | Master backlog: id, theme, effort, owner layer, acceptance criteria |
| [architecture-matrix.md](./architecture-matrix.md) | Adapter/export/test matrix across the monorepo |

## Method

1. Read `package.json`, main exports, test trees, skills, docs for each package.
2. Cross-check against design targets (`.cursor/rules/eristack-package-targets.mdc`).
3. Compare documented integration stories (Horizon A/B guides) vs `examples/*`.
4. Run mental CI: what passes vs what production consumers would hit.

## Scoring rubric (used in per-package doc)

| Grade | Meaning |
| --- | --- |
| **A** | Ship-ready for production integrators; tests prove Drizzle path |
| **B** | Usable; gaps are adapter polish or docs token budget |
| **C** | Core solid; Drizzle/adapters undertested or memory on main export |
| **D** | Risky for agents/consumers without reading source |
| **F** | Critical hole (untested ledger path, broken routing, publish leak) |

## How to use

- **Maintainers:** start at executive-summary → pick a theme → find backlog ids.
- **Agents:** do **not** treat this as npm/API truth; use package docs + skills after a row is promoted to a real task.
- **Promotion:** when an backlog item ships, mark it done here; optional one-line in `CHANGELOG` / package docs.
