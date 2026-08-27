---
name: pbac-core
description: >
  Pure @eristack/pbac: createPbac, registerPolicy, check/authorize, documents
  helpers — software/business policies over document state (usually not
  per-user). Use for rules like PO outstanding must be > 0 before goods receipt.
metadata:
  type: core
  library: '@eristack/pbac'
  library_version: '0.0.0'
sources:
  - 'eristack/business-libs:packages/service/pbac/docs/concepts.md'
  - 'eristack/business-libs:packages/service/pbac/docs/getting-started.md'
---

# PBAC core

```ts
pbac.registerPolicy({
  id: "purchase-order.can-receive",
  evaluate: documents.positiveAmount("outstandingMinor"),
});

// Status commands: documents.transitions("status", { draft: ["submit"], submitted: ["approve"] })
```
