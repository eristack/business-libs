# Acceptance model — when is the program “complete”?

Not a single date — **exit criteria** by phase ([program-guide.md](./program-guide.md)).

**Macro bar:** [macro-expectations.md](./macro-expectations.md) applies to every phase — verified means evidenced, not merely merged.

## Phase 0 complete

- [x] [02-inventory.md](./02-inventory.md) reviewed; STAB-INV-* done or waived (2026-10-23)
- [x] [03-findings-register.md](./03-findings-register.md) has no open **crit** facts (F-001 closed 2026-10-24)
- [ ] Human sign-off on [01-executive-assessment.md](./01-executive-assessment.md)

## Phase 1 complete

- [x] [08-canonical-agent-workflow.md](./08-canonical-agent-workflow.md) approved (STAB-MIG-AIWF)
- [x] F-004 closed (loadPlan)
- [x] F-009/F-015 closed (skill sources + recommend embed)

## Phase 2 complete

- [x] Tier 2 gates shipped: skill-sources, memory-exports, agents-intent-sync ([10-enforcement-design.md](./10-enforcement-design.md))
- [x] Cursor rules + `@eristack/ai-dev` profiles align with canonical workflow

## Phase 3 complete (“Prove Drizzle”)

- [x] F-001, F-002, F-003 **closed** with integration tests in CI profile
- [x] Document-with-lines path: `examples/horizon-a` + `examples/express` in examples CI

## Phase 4 optional (maturity)

- [ ] Package maturity sheet maintained (grade refresh vs Aug audit)
- [ ] Debottleneck budget stable; no new recipe overlap regressions

## Per-task acceptance (template)

Every `tasks.yaml` entry must include:

```yaml
acceptance:
  commands:
    - "pnpm eristack ci --base origin/main"
  artifacts:
    - "path/to/test or doc"
  findings:
    - "F-00x"
```

**Verified** = all commands passed on stated branch/commit (note hash in task).

## Migration acceptance

Any phase that changes agent or integrator **order of operations**:

- [ ] Row in [migration-from-old-order.md](./migration-from-old-order.md) is `complete` or explicitly `waived`
- [ ] Rollback and verify commands documented
- [ ] Superseded sources listed if old paths still exist

## Explicit non-completion

Program is **not** complete while:

- Valuations or data-grid production claims lack drizzle proof
- Agents must read &gt;3 files for standard upgrade/integration tasks
- Stabilization tasks remain `proposed` with no waiver
- Material SoT moves lack a migration register row
