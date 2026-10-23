# Target architecture (draft)

## Layer model (unchanged policy)

Keep eight filesystem layers (`roadmap/layers.md`):

```text
01 primitive → 02 registries → 03 capability → 04 service
→ 05 infrastructure → 06 ui → 07 features (empty) → 08 ai
```

**Rule:** dependencies flow **down** the stack only; no primitive importing service.

## Package boundaries (design targets — enforce in review)

From `.cursor/rules/eristack-package-targets.mdc`:

| Target | Architecture implication |
| --- | --- |
| Cheap (≤3 files) | One skill + one getting-started (+ optional adapter doc) per integration task |
| Predictable | Core framework-free; adapters thin mirrors |
| Reliable | **Drizzle/DB default** in production docs; memory only under `/testing` or test-only subpaths |
| Clear boundaries | Export registries/helpers consumers would copy; no app-owned tables inside libraries |

## Spine compositions (reference stacks)

| Product shape | Packages (load `#package-relationships`) |
| --- | --- |
| Document-with-lines ERP | qups, doc-number, pbac, data-grid, backseat, opinion, ui stack |
| Ledger / inventory | hash-chained-ledger, stock-movement, valuations, money |
| Platform HTTP | jwt-auth, rbac, idempotency, rate-limit, logger, health, rest |
| 3ss consumer backend | drizzle open + spine schema, feedback, epoch, collection manifests (B4 deferred codegen) |

## Target: adapter proof layer

```text
┌─────────────────────────────────────┐
│  Package core (unit tests)          │
├─────────────────────────────────────┤
│  @eristack/*/drizzle (integration)  │  ← shared harness: internal/test-harness
├─────────────────────────────────────┤
│  examples/* (smoke build)           │
└─────────────────────────────────────┘
```

**Decision (proposed):** one sqlite integration suite invoked by `pnpm eristack check --profile integration`, extended incrementally per package — not 71 bespoke CI jobs.

## Target: agent knowledge graph

```text
recipes.yaml (discover)
    → loadPlan() (ordered skills)
        → SKILL.md (actionable body, ≤1 canonical source)
            → knowledge/<topic>.md OR package docs/getting-started.md
```

No parallel truth in `_ai-docs/` after promotion.

## Non-goals

- Merging all packages into “erp-core”
- Mandatory Nest vs Express (both adapters stay)
- Feature packages in layer 07 before policy changes
