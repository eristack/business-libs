# Getting started

Install doc-transitions with PBAC, pick a preset, register one policy, and authorize before mutating status.

## Install

```bash
pnpm add @eristack/doc-transitions @eristack/pbac
```

## Minimal example

```ts
import { createPbac } from "@eristack/pbac";
import {
  journalGraph,
  registerTransitionGraph,
  transitionPolicyId,
  actionsForStatus,
} from "@eristack/doc-transitions";

const pbac = createPbac();

registerTransitionGraph(pbac, {
  entityKey: "journal-entry",
  graph: journalGraph,
});

const policyId = transitionPolicyId("journal-entry", "journal");

// Before PATCH /journal-entries/:id/post
await pbac.authorize(policyId, {
  action: "post",
  document: { status: "unposted" },
});

actionsForStatus(journalGraph, "posted"); // ["void"]
```

## Presets (summary)

| Preset | Typical use |
| --- | --- |
| `publicationGraph` | draft → submitted → published |
| `decisionGraph` | pending → approved \| rejected |
| `outstandingGraph` | unopened → open → closed |
| `journalGraph` | unposted → posted → voided |
| `lockGraph` | unlocked ↔ locked |

Full tables: [Presets reference](./presets-reference.md).

## HTTP pairing

Expose transitions as **`PATCH /:id/:action`** via `@eristack/opinion`. Action names must match the graph (`post`, `submit`, `lock`, …). See [Wiring HTTP](./wiring-http.md).

## Production path

1. Drizzle table with `status` text column (or custom field — set `statusField` on graph).
2. `registerTransitionGraph` at app bootstrap.
3. Authorize in transition handler; update row in transaction.
4. Optional `@eristack/epoch` bump after successful transition.

## Next

- [Concepts](./concepts.md) — graphs, terminal rows, policy ids
- [Wiring PBAC](./wiring-pbac.md) — custom graphs, tests
- [Recipes](./recipes.md) — invoice, journal, period lock
