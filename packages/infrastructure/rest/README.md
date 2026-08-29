# @eristack/rest

**Declarative REST routes as data** — dispatch core, Express router, Nest module, OpenAPI 3.1 emit.

```ts
import { defineRoutes, toOpenApiDocument } from "@eristack/rest";

const router = defineRoutes([
  {
    method: "GET",
    path: "/orders/:id",
    handler: (ctx) => ({ status: 200, body: { id: ctx.params.id } }),
  },
]);
```

Docs: [Getting started](./docs/getting-started.md)
