---
name: collection-declaration-horizon-b
description: >
  defineErpCollection manifests in @eristack/drizzle/schema, CollectionDocumentStore port,
  createDrizzleBackseatStore JSON path vs normalized row mappers, routesSnapshot mirror CI via
  @eristack/backseat/testing. Codegen later; manifests + mirror smoke now.
metadata:
  author: eristack
  version: "0.1"
  type: core
  library: "@eristack/ai-knowledge"
sources:
  - packages/ai/ai-knowledge/knowledge/collection-declaration-horizon-b.md
---

# Collection declaration (B4)

```ts
import { defineErpCollection, erpCollectionManifests } from "@eristack/drizzle/schema";
```

Pair with `#drizzle-app-database` (B3) and `#backseat-then-backend`. Acceptance: `examples/express/scripts/api-mirror-smoke.template.mjs` + `assertRoutesSnapshotsEqual`.
