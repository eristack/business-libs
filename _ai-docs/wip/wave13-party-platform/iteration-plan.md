# Wave 13 — promotion iteration (approved)

**Human approval:** 2026-09-27 — all 23 packages + compose rules + one-package-per-PR ship rule.

## Iteration map (commits)

| Step | Deliverable | Web / sync touchpoints |
| --- | --- | --- |
| 1 | WIP status `approved` + this plan | — |
| 2 | `roadmap/horizon.md` — Wave 13 catalog rows + sequencing | Site reads horizon via `/roadmap` when page lands; repo canonical now |
| 3 | `roadmap/priorities.md` — Wave 13 pointer under Next | Same |
| 4 | `knowledge/party-and-platform-compose.md` | — |
| 5 | `docs/party-and-platform-compose.md` + `_meta.json` | **`pnpm docs:sync`** → `apps/web` docs nav for ai-knowledge |
| 6 | Skill + `ticket.yaml` + `recipes.yaml` (ai-knowledge only) | **`pnpm knowledge:sync`** → generated catalog/recipes/local-skills |
| 7 | `package-relationships.md` Wave 13 section | Mirror **`docs/package-relationships.md`** body |
| 8 | `AGENTS.md` intent entry | — |
| 9 | WIP `overview.md` promotion checklist ticks + link to canonical guide | — |

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

`E1 entity-id` → `A person/phone/email/contact` → `B dimension/geo` → `E2/E3` → `F` → `C` → `G` — one package per iteration with full checklist in `overview.md`.
