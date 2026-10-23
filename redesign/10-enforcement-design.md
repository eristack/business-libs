# Enforcement design (draft)

**Principle:** If a rule matters for integrator trust, **mechanical gate** &gt; prose in five places.

## Tier 1 — Already enforced (keep)

| Rule | Gate |
| --- | --- |
| Lockfile frozen | lockfile check |
| Catalog/skills sync | knowledge + skills |
| Export integrity | exports (needs build) |
| Changeset policy | changesets |
| Docs catalog | docs |
| Recipe/package drift | debottleneck |

## Tier 2 — Proposed (phase 2)

| Rule | Proposed gate | Task ID |
| --- | --- | --- |
| Cross-cutting skill ≤1 source | `scripts/check-skill-sources.mjs` + `skill-sources` check | STAB-AI-1 ✓ |
| loadPlan includes recipe canonicalSkills | extend `recommend.test.ts` + CI | STAB-AI-2 |
| New `/drizzle` export requires integration test file | lint script listing adapters | STAB-INT-GATE |
| Memory store not from `.` export | grep + allowlist in exports check | STAB-MEM-1 |

## Tier 3 — Advisory (stay in Cursor rules)

| Rule | Why advisory |
| --- | --- |
| Agent no-git | Cannot enforce in CI |
| Token budget for agent reads | Subjective; partial via skill source check |
| WIP promote-then-delete | Process |

## Failure UX

- Checks run via `pnpm eristack check` with same IDs locally and in CI
- New gates start in **`catalog` profile only** (optional `--only debottleneck` pattern) before mandatory in `pr`

## Rollout

1. Add script + document in `packages/ai/ai-dev/src/checks/registry.ts` (approved task).
2. Run green on main.
3. Enable in `pr` profile.
4. Update [05-engineering-standards.md](./05-engineering-standards.md) from proposed → mandatory.
