# Documentation strategy (draft)

## Sources of truth

| Content | Authoritative path | Generated / mirrored |
| --- | --- | --- |
| Library behavior | `packages/*/docs/*.md` | Web via `apps/web/src/lib/docs.ts` |
| Cross-cutting integration | `packages/ai/ai-knowledge/knowledge/*.md` | `packages/ai/ai-knowledge/docs/*.md` |
| Agent routing | `recipes.yaml`, skills `SKILL.md` | `src/generated/catalog.ts`, `local-skills.ts` |
| Repo agent index | root `package.json` `intent.skills` | `AGENTS.md` block |
| Program / stabilization | **`redesign/`** | Not synced to site |
| Ephemeral implementation notes | `_ai-docs/wip/<topic>/` | Delete after promote |

## Author vs generate

| Generate (never hand-edit) | Author (human/agent edit + sync) |
| --- | --- |
| `AGENTS.md` intent block | Skill bodies, frontmatter |
| `catalog.ts`, recommend skill catalog section | `recipes.yaml` |
| `apps/web` docs `_meta.json` | Package doc frontmatter |

## Token budget rules (mechanical targets)

From `docs-depth-tokens.mdc`:

1. One canonical markdown per cross-cutting topic.
2. Per-package docs = unique deltas + link to canon (≤15 lines redirect OK).
3. Skills: **one** primary `sources` entry for cross-cutting tasks.
4. Recipes: name **one** load command in rationale.

**Program tasks:** STAB-DOC-* to collapse multi-source skills (jwt-auth, doc-number called out in audit).

## Promotion flow

```text
_ai-docs/wip/ → packages/*/docs + skills + recipes → knowledge:sync → delete wip
```

Redesign docs **do not** promote to package docs unless the content is library truth (usually they stay in `redesign/`).

## Metrics (optional phase 4)

- Count skills with `sources.length > 1` for cross-cutting ids
- Count package docs pages &lt; 20 lines (stub detector)
- Recipe count vs packages with recipes
