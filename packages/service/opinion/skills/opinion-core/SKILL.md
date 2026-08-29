---
name: opinion-core
description: >
  @eristack/opinion ERP HTTP route table on @eristack/rest: options, data-grid,
  CRUD, PATCH /:id/:action for pbac/doc-transitions. Use when scaffolding
  document APIs instead of inventing paths per app.
metadata:
  author: eristack
  version: "0.1"
sources:
  - packages/service/opinion/docs/index.md
---

# @eristack/opinion

Build the **canonical document REST map** — handlers stay in the app.

```ts
import { createDocumentRoutes, createOpinionRouter } from "@eristack/opinion";
import { mountOpinionRouter } from "@eristack/opinion/express";

const router = createOpinionRouter({
  routes: createDocumentRoutes({
    basePath: "/purchase-orders",
    handlers: { list, read, create, transition },
  }),
});
```

## PATCH transitions

`:action` names must match `@eristack/doc-transitions` graphs (`post`, `submit`, `approve`, …). Guard with `@eristack/pbac` `authorize` before mutating.

## Checklist

1. `createDocumentRoutes({ basePath, handlers })` — omit roles you do not implement yet.
2. Mount with `mountOpinionRouter` on Express (Nest/OpenAPI horizon).
3. List handler returns data-grid envelope; include epoch headers or query param.
4. Never use raw number literals for money — `@eristack/money` strings in JSON.
5. Compose OpenAPI with `@eristack/opinion/openapi` + `@eristack/rest` `mergeOpenApiDocuments`.
