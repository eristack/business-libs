---
name: rest-core
description: >
  @eristack/rest: declarative REST route definitions, Express/Nest mounting,
  minimal OpenAPI 3.1 emit. Pair with jwt-auth and data-grid in apps.
metadata:
  type: core
  library: "@eristack/rest"
  library_version: "0.1.0"
sources:
  - "eristack/business-libs:packages/infrastructure/rest/docs/getting-started.md"
---

# REST core

One HTTP shell pattern for Eristack examples and apps.

## When to use

- Multiple packages expose HTTP handlers you want to compose as data
- Examples need the same route table on Express and Nest
- You want OpenAPI paths without hand-maintaining YAML

## Default wiring

```ts
const router = defineRoutes([/* handlers */]);
app.use("/api", createExpressRestRouter({ router, basePath: "/api" }));
```

## Do not

- Put Drizzle or React in route handlers — keep handlers thin; delegate to stores
- Replace package-specific routers (jwt-auth, epoch) — mount those alongside
