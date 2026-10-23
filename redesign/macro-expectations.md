# Macro expectations (program constitution)

These six principles govern **how** the stabilization and redesign runs — not **what** ships first. They override speed, breadth, and “looks done” unless a human explicitly waives a specific item in [tasks.yaml](./tasks.yaml) (`waived_by`, `reason`).

## 1. Small margin for error

- Prefer **reversible, narrow diffs** over sweeping refactors.
- **Verify before assert:** findings are `fact` only with path, command, or test output; everything else is `inference` in [03-findings-register.md](./03-findings-register.md).
- **Fail closed on ambiguity:** if CI, SoT, or approval is unclear, stop and record a blocker — do not guess and merge.
- One wrong default (memory store, skill source, export map) costs more than one extra review cycle.

## 2. Rigorous processing

- Every task follows the lifecycle in [program-guide.md](./program-guide.md): proposed → approved → … → verified with **named commands**.
- Checklists are not decorative: [08-canonical-agent-workflow.md](./08-canonical-agent-workflow.md) + package iteration rules (docs, skills, recipes, sync) apply to **every** authorized repo change.
- Reviews ask: *What evidence? What could still be false? What did we not run?*
- Phase gates in [12-acceptance-model.md](./12-acceptance-model.md) are sequential unless waived in writing.

## 3. Slow but sure

- **Dependency order** in [roadmap.md](./roadmap.md) beats parallel heroics — no phase skipping.
- **One reviewable unit per PR** where possible (one gate, one integration test, one canon doc merge).
- “Done” means **verified** in `tasks.yaml`, not “implemented in chat.”
- Schedule pressure does not shrink acceptance criteria; it defers or splits tasks.

## 4. Audit and accounting mentality in development

- Treat the repo like a ledger: **every material change has a counterpart entry** (finding, task, changeset, or migration note).
- **Reconcile** old snapshots (`_ai-docs/audit/`, prior grades) against current main — do not carry forward ranks without re-verification.
- **Double-entry mindset:** if docs say Drizzle-default, tests or integration proof must exist or the claim is written down as debt (finding + task).
- Periodic **stocktake:** inventory tasks (`STAB-INV-*`) refresh what we think we have vs what exists on disk and in CI.

## 5. Prudent trail

- **Handoff packet** on every stop: `last_command`, `last_result`, `next_action`, `files_touched` on the active task ([program-guide.md](./program-guide.md)).
- **Human owns git;** agents log what would be committed and which checks were run — no silent tree changes for program work without task ID.
- Link tickets (`tickets/`), findings (`F-*`), and tasks (`STAB-*`) so an outsider can reconstruct *why* in under ten minutes.
- No secrets in notes; redact paths/env in public-facing migration notes if needed.

## 6. Proper notes on migration (old order → new order)

- Any change to **where truth lives** or **how agents work** must be recorded in [migration-from-old-order.md](./migration-from-old-order.md) — not only in PR description.
- Migration notes cover: **old behavior**, **new behavior**, **who must act** (maintainers, consumers, agents), **compat window**, **rollback**, and **verification commands**.
- Retire old paths deliberately: redirect stubs, deprecate skills, update recipes — then mark the migration row **complete** with evidence.
- Personal reminders (e.g. `notes/main.md`) may point here; **canonical migration history stays under `redesign/`.**

---

## Agent stop rule (apply every turn)

Before closing work on this program:

1. Did we leave a **finding or task** for anything uncertain?
2. Did we run the **acceptance commands** listed on the task (or record why not)?
3. If workflow/SoT moved, did we append **migration-from-old-order.md**?
4. Would an auditor agree this is **slow but sure**, not **fast and hopeful**?
