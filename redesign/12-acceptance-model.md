# Acceptance model — when is the program “complete”?

Not a single date — **exit criteria** by phase ([program-guide.md](./program-guide.md)).

**Macro bar:** [macro-expectations.md](./macro-expectations.md) applies to every phase — verified means evidenced, not merely merged.

## Phase 0 complete

- [ ] [02-inventory.md](./02-inventory.md) reviewed; STAB-INV-* done or waived
- [ ] [03-findings-register.md](./03-findings-register.md) has no unverified **crit** facts
- [ ] Human sign-off on [01-executive-assessment.md](./01-executive-assessment.md)

## Phase 1 complete

- [ ] [08-canonical-agent-workflow.md](./08-canonical-agent-workflow.md) approved
- [ ] F-004 closed or waived (loadPlan)
- [ ] F-009/F-015 reduced (skill sources + recommend embed)

## Phase 2 complete

- [ ] At least one Tier 2 gate shipped ( [10-enforcement-design.md](./10-enforcement-design.md) )
- [ ] Cursor rules reference canonical workflow without contradicting it

## Phase 3 complete (“Prove Drizzle”)

- [ ] F-001, F-002, F-003 **closed** with integration tests green in CI
- [ ] Document-with-lines example path proven (express or horizon-a + backend mirror)

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
