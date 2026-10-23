# Findings register (living)

**Legend:** Severity `crit` | `high` | `med` | `low` · Status `open` | `verified` | `waived` | `closed` · Type `fact` | `inference`

Add rows when discovery or CI proves something new. Link tasks in [tasks.yaml](./tasks.yaml).

| ID | Type | Severity | Status | Finding | Evidence |
| --- | --- | --- | --- | --- | --- |
| F-001 | fact | crit | open | Drizzle integration matrix complete for spine packages; ledger depth/concurrency not fully audited | STAB-INT-DRIZZLE-GAPS verified 2026-10-23; [data/drizzle-integration.md](./data/drizzle-integration.md) |
| F-002 | fact | high | closed | `executeDrizzleList` integration test present | `packages/service/data-grid/tests/drizzle.integration.test.ts`; integration profile OK |
| F-003 | fact | high | closed | All nine valuation methods exercised on Drizzle + HCL integration test | STAB-INT-VAL; `drizzle.integration.test.ts` 2026-10-23 |
| F-004 | fact | med | closed | `loadPlan()` merges `canonicalSkills` | `recommend.ts` L196–205; 28 tests incl. all-recipe matrix |
| F-005 | fact | med | closed | Publish dep hygiene passes on current main | `pnpm eristack check --profile publish` OK 2026-10-23 |
| F-006 | fact | med | closed | Example apps build in CI | `pnpm eristack check --profile examples` OK 2026-10-23 |
| F-007 | fact | high | closed | Root `createMemory*` exports moved to `*/testing`; allowlist empty | STAB-MEM-2; `check-memory-root-exports.mjs --ci` 2026-10-23 |
| F-008 | fact | high | closed | Backseat `normalizeBasePath` unified in `@eristack/backseat/adapters` | STAB-BS-1 verified 2026-10-23; register bootstrap patterns may still differ |
| F-009 | fact | high | closed | ai-knowledge cross-cutting skills >1 source | STAB-AI-4; `skill-sources` check, no allowlist |
| F-010 | inference | high | closed | Recipe triggers for wall grid, atomic backseat, applyCellPatch, compareDecimalStrings | STAB-AI-RECIPES; `recommend.test.ts`; `debottleneck:check --ci` 2026-10-23 |
| F-011 | inference | high | closed | AGENTS.md intent block stays aligned with disk skills + `intent.skills` | STAB-AI-AGENTS; `check-agents-intent-sync.mjs --ci`; `intent install --map` current |
| F-012 | fact | high | closed | Examples build is part of pr CI | Same as F-006; `STAB-EX-HORIZON` closed |
| F-013 | inference | high | open | Peer dependency floors may be incomplete on adapters | Audit rank 13; `check-publish-deps.mjs` |
| F-014 | fact | med | open | 409 error canon documented; thin end-to-end demo | `#http-errors` skill; audit rank 14 |
| F-015 | fact | med | closed | `recommend-eristack` skill embeds large generated catalog | STAB-AI-3: compact catalog stub + one `sources` entry; sync regenerates stub |
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
