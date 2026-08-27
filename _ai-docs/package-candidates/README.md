# Package candidates — brainstorm index

**Isolated working doc.** Not shipped, not in `roadmap/`, not in `packages/`, not in `apps/web` canon.

| File | Purpose |
| --- | --- |
| [overview.md](./overview.md) | Rules, layers, promotion path |
| [catalog.md](./catalog.md) | **120+** `@eristack/*` name drafts (table) |
| [by-domain.md](./by-domain.md) | Same candidates grouped by ERP domain (finance, stock, …) |

## vs other docs

| Doc | Role |
| --- | --- |
| **`_ai-docs/package-candidates/`** (here) | Brainstorm superset — quantity, wild ideas, duplicates OK |
| `roadmap/horizon.md` | Curated shortlist — human-approved candidates only |
| `roadmap/priorities.md` | What we actually build next |
| `packages/*` | Shipped or scaffolded npm packages only |

## Status key (catalog)

| Status | Meaning |
| --- | --- |
| `idea` | Name + one-liner only |
| `sketch` | API shape discussed in horizon or notes |
| `shipped` | Already on npm (listed for completeness) |
| `reject` | Parked — do not promote without new evidence |

## Promotion (human)

1. Pick row from catalog → debate → add to `roadmap/horizon.md` (curated).
2. Horizon row → `roadmap/priorities.md` or `backlog.md` when sequenced.
3. Priority row → scaffold under `packages/<layer>/<name>/` + changeset + recipe.

Agents: **do not** treat this folder as npm truth or site nav. Load only when brainstorming or naming new packages.
