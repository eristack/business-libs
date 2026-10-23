# Roadmap — dependency-ordered initiatives

**Active phase:** 0 (Discover) — expand inventory tasks; human review before Phase 1 approvals.

No calendar dates. Pull the **next** initiative when its `blocks` are cleared in [tasks.yaml](./tasks.yaml).

## Initiative map

```text
Phase 0 ──► STAB-INV-* (inventory automation)
         └──► Review findings F-001..F-020

Phase 1 ──► STAB-AI-* (routing truth)
         └──► STAB-DOC-* (skill source collapse)

Phase 2 ──► STAB-ENF-* (new CI gates)

Phase 3 ──► STAB-INT-* (Drizzle proof — ledger, list, valuations, doc-number)
         └──► STAB-EX-* (horizon composite)

Phase 4 ──► STAB-MAT-* (maturity dashboard — optional)
```

## Initiative details

### INIT-PROVE-DRIZZLE (Phase 3)

**Goal:** Production store paths tested on sqlite harness.

**Blocks:** Phase 1 complete (so skills don’t lie about defaults).

**Tasks:** STAB-INT-HCL, STAB-INT-DATAGRID, STAB-INT-VAL, STAB-INT-DOCNUM (see tasks.yaml).

**Acceptance:** `integration` profile green; findings F-001–F-003 closed.

### INIT-AGENT-TRUTH (Phase 1)

**Goal:** `loadPlan()` + recipes + skills agree; token budget for cross-cutting loads.

**Tasks:** STAB-AI-1..4, STAB-DOC-JWT, STAB-DOC-DOCNUM.

**Acceptance:** F-004, F-009, F-015 closed; `pnpm knowledge:check` green.

### INIT-MEMORY-EXPORTS (Phase 2–3)

**Goal:** `createMemory*` only from `/testing` subpaths.

**Tasks:** STAB-MEM-1 (gate), STAB-MEM-2+ (per-package moves — many small PRs).

**Acceptance:** F-007 closed; export check allowlist empty.

### INIT-BACKSEAT-DEDUP (Phase 2)

**Goal:** Shared `normalizeBasePath` / register bootstrap.

**Tasks:** STAB-BS-1.

**Acceptance:** F-008 closed; backseat-routes-check if applicable.

### INIT-3SS-FOLLOWUP (parallel, lower priority)

**Goal:** B4 codegen deferred; consumer seams documented.

**Tasks:** Link to `#tiga-sekawan-3ss-adoption`; ticket batch `3ss-platform-seams-20261014`.

**Not blocking** stabilization phases unless consumer work is in scope.

## How to reprioritize

1. Edit task `priority` in `tasks.yaml` (1 = highest).
2. Add `blocks: [STAB-xxx]` edges.
3. One paragraph in this file under **Changelog**.

## Changelog

| Date | Change |
| --- | --- |
| 2026-10-23 | Initial roadmap from audit top 15 + program structure |
