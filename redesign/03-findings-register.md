# Findings register (living)

**Legend:** Severity `crit` | `high` | `med` | `low` · Status `open` | `verified` | `waived` | `closed` · Type `fact` | `inference`

Add rows when discovery or CI proves something new. Link tasks in [tasks.yaml](./tasks.yaml).

| ID | Type | Severity | Status | Finding | Evidence |
| --- | --- | --- | --- | --- | --- |
| F-001 | fact | crit | open | Hash-chained / financial ledger Drizzle store lacks integration proof in CI | `_ai-docs/audit/executive-summary.md` rank 1; grades HCL/financial **C** |
| F-002 | fact | crit | open | `executeDrizzleList` has no integration test | Audit rank 2; data-grid **B−** |
| F-003 | fact | crit | open | Valuations: most methods + drizzle layer store untested | Audit rank 3; **D+** |
| F-004 | inference | crit | open | `loadPlan()` may omit canonical skills that recipes describe in prose | Audit rank 4; verify via STAB-INV-2 |
| F-005 | inference | crit | open | Published packages may still declare bad runtime deps | Audit rank 5; run `pnpm eristack check --profile publish` |
| F-006 | fact | crit | open | No composite Horizon A example in CI matrix | Audit rank 6; `examples/horizon-a` exists — confirm in examples check |
| F-007 | fact | high | open | Memory stores exported from main package entrypoints | Audit rank 7; conflicts with skills/recipes |
| F-008 | fact | high | open | Backseat register/bootstrap duplicated across packages | Audit rank 8 |
| F-009 | fact | high | open | Some skills list 5+ `sources` (token budget violation) | `docs-depth-tokens.mdc`; audit rank 9 |
| F-010 | inference | high | open | Recipe triggers missing for newer APIs (wall grid, atomic backseat, etc.) | Audit rank 10 |
| F-011 | inference | high | open | AGENTS.md intent block may lag new package skills | Audit rank 11; compare `intent.skills` vs packages with skills/ |
| F-012 | fact | high | open | Examples build is part of pr CI | `CHECK_DEFS` examples profile; audit rank 12 |
| F-013 | inference | high | open | Peer dependency floors may be incomplete on adapters | Audit rank 13; `check-publish-deps.mjs` |
| F-014 | fact | med | open | 409 error canon documented; thin end-to-end demo | `#http-errors` skill; audit rank 14 |
| F-015 | fact | med | open | `recommend-eristack` skill embeds large generated catalog | Audit rank 15; prefer generated block only in sync artifact |
| F-016 | fact | med | open | Stabilization program docs live in `redesign/` only | This folder |
| F-017 | fact | low | open | `redesign/SPEC.md` stub — full charter was prior README | Git history if verbatim needed |
| F-018 | fact | med | open | 3ss library program largely shipped; B4 SQL codegen still deferred | `#tiga-sekawan-3ss-adoption`, `#collection-declaration-horizon-b` |
| F-019 | fact | med | open | `@eristack/id-wilayah` shipped with bundled registry; CI needed 30s test timeout | `packages/registries/id-wilayah/vitest.config.ts` |
| F-020 | fact | low | open | WAHA driver removed from comms; WhatsApp via Twilio/Meta only | `packages/service/comms` — no waha path |

## Disposition workflow

1. **Verify** — run command, paste result in task notes.
2. **Fix** — approved STAB task → PR (human).
3. **Waive** — document reason in row + `tasks.yaml` (`waived_by`).
4. **Duplicate** — merge into parent finding ID.

## Conflicts between instruction sources (track here)

| Conflict | Sources | Resolution target |
| --- | --- | --- |
| Drizzle default vs memory in tests | Skills vs audit vs some package READMEs | [05-engineering-standards.md](./05-engineering-standards.md) + `@eristack/*/testing` export policy |
| Docs in WIP vs package docs | `ai-working-docs.mdc` vs ad-hoc `_ai-docs/` | Promote-then-delete; program meta only in `redesign/` |
| Agent no-git vs user commit rules | `.cursor/rules/no-git.mdc` vs user rule | Human commits; agents refuse unless explicit |
