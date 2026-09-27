# Wave 13 — promotion iteration (approved)

**Human approval:** 2026-09-27 — all 23 packages + compose rules + one-package-per-PR ship rule.

## Iteration map (commits)

| Step | Deliverable | Web / sync touchpoints | Done |
| --- | --- | --- | --- |
| 1 | WIP status `approved` + this plan | — | yes |
| 2 | `roadmap/horizon.md` — Wave 13 catalog rows + sequencing | Site reads horizon via `/roadmap` when page lands; repo canonical now | yes |
| 3 | `roadmap/priorities.md` — Wave 13 pointer under Next | Same | yes |
| 4 | `knowledge/party-and-platform-compose.md` | — | yes |
| 5 | `docs/party-and-platform-compose.md` + `_meta.json` | **`pnpm docs:sync`** → ai-knowledge docs on site (19 pages) | yes |
| 6 | Skill + `ticket.yaml` + `recipes.yaml` (ai-knowledge only) | **`pnpm knowledge:sync`** → generated catalog/recipes/local-skills | yes |
| 7 | `package-relationships.md` Wave 13 section | Mirror **`docs/package-relationships.md`** body | yes |
| 8 | `AGENTS.md` intent entry | — | yes |
| 9 | WIP collaboration link → canonical guide | Delete WIP folder after last package ships | partial |

## Web sync checklist (after doc commits)

| Command | When |
| --- | --- |
| `pnpm knowledge:sync` | After recipes, skills, or catalog-facing package.json |
| `pnpm knowledge:check` | Before each knowledge commit ends |
| `pnpm docs:sync` | After `packages/ai/ai-knowledge/docs/_meta.json` nav change |
| `pnpm docs:check` | Verify web `_meta.json` parity |

**Not in this promotion (no npm package yet):** `apps/web/src/lib/site.ts` per-package highlights — add on **first ship** of each `@eristack/*`.

**Parallel UI track:** `_ai-docs/wip/ui-package-stack/` — separate promotion pass.

## Ship order (implementation — unchanged)

~~`E1 entity-id`~~ **done 2026-09-27** (`@eristack/entity-id` 0.0.0) → `A person/phone/email/contact` → `B dimension/geo` → `E2/E3` → `F` → `C` → `G` — one package per iteration with full checklist in `overview.md`.
