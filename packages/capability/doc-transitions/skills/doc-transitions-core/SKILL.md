---
name: doc-transitions-core
description: >
  @eristack/doc-transitions preset status graphs (publication, decision, journal,
  lock, outstanding) for pbac documents.transitions(). Use instead of copy-paste
  status tables when wiring ERP document PATCH actions.
metadata:
  author: eristack
  version: "0.1"
sources:
  - packages/capability/doc-transitions/docs/index.md
---

# @eristack/doc-transitions

Import a preset graph and register it on PBAC — do not reinvent status vocabularies.

```ts
import { createPbac } from "@eristack/pbac";
import { publicationGraph, registerTransitionGraph } from "@eristack/doc-transitions";

const pbac = createPbac();
registerTransitionGraph(pbac, { entityKey: "price-list", graph: publicationGraph });
```

## Presets

- **publicationGraph** — draft → submitted → published; cancel from draft/submitted
- **decisionGraph** — pending → approve \| reject
- **outstandingGraph** — unopened → open → close
- **journalGraph** — unposted → post → void
- **lockGraph** — unlocked ↔ locked

## HTTP

Mutations that change status use **`PATCH /:id/:action`** where `:action` matches graph action names (`post`, `submit`, `lock`, …). Load `@eristack/opinion#opinion-core` when scaffolding routes.

## Checklist

1. Pick preset closest to the document (or fork the table in-app for exotic flows).
2. `registerTransitionGraph(pbac, { entityKey, graph })`.
3. Guard PATCH handlers with `pbac.authorize(transitionPolicyId(entityKey, graph.id), { action, document })`.
4. Keep money/qty/date fields string-first — transitions only gate status commands.
