# Wiring PBAC

## Install

```bash
pnpm add @eristack/doc-transitions @eristack/pbac
```

## Register a preset

```ts
import { createPbac } from "@eristack/pbac";
import {
  journalGraph,
  registerTransitionGraph,
  transitionPolicyId,
} from "@eristack/doc-transitions";

const pbac = createPbac();

registerTransitionGraph(pbac, {
  entityKey: "journal-entry",
  graph: journalGraph,
});

const policyId = transitionPolicyId("journal-entry", "journal");
// "journal-entry.journal-transition"
```

## Authorize in handlers

PBAC expects `{ action, document }` where `document[statusField]` is the current status:

```ts
await pbac.authorize(policyId, {
  action: "post",
  document: { status: row.status },
});
```

On denial, throw your HTTP adapter’s policy error (`409` business policy or `403` — match app convention via `@eristack/pbac` Express/Nest guards).

## Manual policy (no register helper)

```ts
import { createTransitionPolicy, transitionPolicyId } from "@eristack/doc-transitions";

pbac.registerPolicy({
  id: transitionPolicyId("invoice", "publication"),
  ...createTransitionPolicy(publicationGraph),
});
```

## Multiple graphs per entity

Rare, but supported — use distinct `graph.id` values:

```ts
registerTransitionGraph(pbac, { entityKey: "invoice", graph: publicationGraph });
registerTransitionGraph(pbac, { entityKey: "invoice", graph: lockGraph });
```

Authorize with the policy id for the graph you are enforcing on that request.

## Custom status field

If your column is not `status`:

```ts
const graph = { ...journalGraph, statusField: "postingStatus" };
registerTransitionGraph(pbac, { entityKey: "je", graph });
```

Ensure `document` passed to `authorize` includes that field.

## Testing

Use in-memory PBAC in unit tests — no Drizzle required:

```ts
import { describe, it, expect } from "vitest";
import { createPbac } from "@eristack/pbac";
import { decisionGraph, registerTransitionGraph, transitionPolicyId } from "@eristack/doc-transitions";

it("allows approve from pending", async () => {
  const pbac = createPbac();
  registerTransitionGraph(pbac, { entityKey: "expense", graph: decisionGraph });
  const id = transitionPolicyId("expense", "decision");
  await expect(
    pbac.authorize(id, { action: "approve", document: { status: "pending" } }),
  ).resolves.toBeUndefined();
});
```

Production persistence stays Drizzle-first in the app; policies remain pure functions.
