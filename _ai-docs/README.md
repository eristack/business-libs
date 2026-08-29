# AI working docs

Scratch space for agents **while** work is in flight. Nothing here is public documentation.

## Three buckets only

| Bucket | Path | Lifetime | When to use |
| --- | --- | --- | --- |
| **WIP** | [`wip/<topic>/`](./wip/) | **Ephemeral** — delete after promote | Active implementation: APIs, decisions, migration notes for one change |
| **Brainstorm** | [`brainstorm/`](./brainstorm/) | Long-lived sandbox | Package **names** and improvement ideas **before** `roadmap/horizon.md` |
| **Audit** | [`audit/`](./audit/) | Snapshot until refreshed | Point-in-time monorepo health review (2026-08-27 baseline) |

**Not here:** execution priority → [`roadmap/`](../roadmap/) · shipped truth → `packages/<category>/*/docs/` · agent canon → `@eristack/ai-knowledge/knowledge/`

## Decision tree (agents)

```
Implementing a feature or package change?
  → wip/<topic>/  (copy _template/overview.md)
  → Same iteration: update package docs + skills + recipes + pnpm knowledge:sync
  → User says finished? Promote → delete wip/<topic>/

Naming a future @eristack/* package?
  → brainstorm/catalog.md or catalog-wave2.md
  → Human promotes row → roadmap/horizon.md → priorities → packages/

Reviewing monorepo quality / backlog?
  → audit/executive-summary.md → improvement-backlog.md
  → Do not treat audit as npm/API truth

Planning what we build next?
  → roadmap/priorities.md and roadmap/backlog.md (not _ai-docs)
```

## WIP folder contract

One topic = one folder under `wip/`. Max **four** files:

| File | Purpose |
| --- | --- |
| `overview.md` | Problem, scope, status frontmatter, **promotes-to** paths |
| `decisions.md` | ADRs / trade-offs (optional) |
| `api.md` | Public surface draft (optional) |
| `migration.md` | Breaking changes (optional) |

Every `overview.md` must list:

- **Promotes to** — exact `packages/.../docs/` paths (and `apps/web/` if site-only)
- **Skills/recipes** — which Intent skills and `recipes.yaml` rows change
- **Status** — `draft` \| `in-progress` \| `ready-to-promote`

When the user marks work **finished**: promote content → run `pnpm knowledge:sync` → **delete** `wip/<topic>/`.

## Canonical locations (do not duplicate)

| Topic | Read instead of writing new _ai-docs |
| --- | --- |
| Layer 06 Features gates | `roadmap/features.md` |
| Build order / spine | `roadmap/priorities.md`, `roadmap/backlog.md` |
| Curated future packages | `roadmap/horizon.md` |
| Stack defaults (Vercel, Drizzle) | `knowledge/stack-defaults.md`, `knowledge/architecture.md` |
| Package APIs | `packages/<category>/<name>/docs/` |

## Brainstorm entry

~300 horizontal `@eristack/*` name drafts + per-package improvement matrix — start at [brainstorm/README.md](./brainstorm/README.md).

Agents must never run git/commit/PR — humans own version control.
