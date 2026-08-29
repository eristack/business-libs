# Recipes

## Invoice publish (publicationGraph)

```ts
import { publicationGraph, registerTransitionGraph, transitionPolicyId } from "@eristack/doc-transitions";

registerTransitionGraph(pbac, { entityKey: "invoice", graph: publicationGraph });

// PATCH /invoices/:id/submit  → status submitted
// PATCH /invoices/:id/publish   → status published
await pbac.authorize(transitionPolicyId("invoice", "publication"), {
  action: "publish",
  document: { status: "submitted" },
});
```

## Journal post + void (journalGraph)

```ts
import { journalGraph, actionsForStatus } from "@eristack/doc-transitions";

registerTransitionGraph(pbac, { entityKey: "journal-entry", graph: journalGraph });

const allowed = actionsForStatus(journalGraph, "unposted"); // ["post"]
// After post handler runs financial-ledger post:
// status → posted; void allowed via actionsForStatus(journalGraph, "posted")
```

## Fiscal period lock (lockGraph)

```ts
import { lockGraph } from "@eristack/doc-transitions";

registerTransitionGraph(pbac, { entityKey: "fiscal-period", graph: lockGraph });
// PATCH /fiscal-periods/:id/lock
// Block invoice edits in separate pbac policies when period.status === "locked"
```

## PO approval (decisionGraph)

```ts
import { decisionGraph } from "@eristack/doc-transitions";

registerTransitionGraph(pbac, { entityKey: "purchase-order", graph: decisionGraph });
// PATCH /purchase-orders/:id/approve | /reject
```

## Admin UI: list preset metadata

```ts
import { PRESET_GRAPHS, describeTransitionGraph } from "@eristack/doc-transitions";

export const transitionCatalog = PRESET_GRAPHS.map(describeTransitionGraph);
```

Use `transitionCatalog` to seed internal docs or a settings screen — not for runtime BPM editing in v0.1.
