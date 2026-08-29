# Document transition presets

Canonical **status vocabularies** for ERP documents — not a BPM engine. Each preset exports a transition table compatible with `@eristack/pbac` `documents.transitions()`.

## Install

```bash
pnpm add @eristack/doc-transitions @eristack/pbac
```

## Presets

| Preset | Typical use |
| --- | --- |
| `publicationGraph` | Customer-facing docs: draft → submitted → published |
| `decisionGraph` | Approvals: pending → approved \| rejected |
| `outstandingGraph` | Tasks/tickets: unopened → open → closed |
| `journalGraph` | GL/inventory postings: unposted → posted → voided |
| `lockGraph` | Period lock / document freeze: unlocked ↔ locked |

## Wire with PBAC

```ts
import { createPbac } from "@eristack/pbac";
import {
  journalGraph,
  registerTransitionGraph,
  transitionPolicyId,
} from "@eristack/doc-transitions";

const pbac = createPbac();
registerTransitionGraph(pbac, { entityKey: "journal-entry", graph: journalGraph });

const policyId = transitionPolicyId("journal-entry", "journal");
await pbac.authorize(policyId, {
  action: "post",
  document: { status: "unposted" },
});
```

Pair with **`PATCH /:id/:action`** HTTP (see `@eristack/opinion` when wiring routes). Status field defaults to `status` on each graph — override in app schemas if needed.

## Helpers

- `describeTransitionGraph(graph)` — list statuses and actions
- `actionsForStatus(graph, status)` — allowed commands from a status
- `isTerminalStatus(graph, status)` — no outgoing transitions
- `createTransitionPolicy(graph)` — build evaluator without registering

Production persistence stays in the app; policies are pure functions over document state.
