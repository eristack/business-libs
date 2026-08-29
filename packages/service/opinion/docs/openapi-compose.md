# OpenAPI compose

Emit document route fragments and merge with other `@eristack/*` OpenAPI helpers.

## Document routes fragment

```ts
import { documentRoutesOpenApiDocument } from "@eristack/opinion/openapi";

const invoices = documentRoutesOpenApiDocument({
  basePath: "/invoices",
  tags: ["invoices"],
});
```

Includes paths for each role in `DOCUMENT_ROUTE_SPECS` under `basePath`.

## Merge with doc-number and app routes

```ts
import { documentRoutesOpenApiDocument } from "@eristack/opinion/openapi";
import { docNumberFormatOpenApiDocument } from "@eristack/doc-number/rest";
import { mergeOpenApiDocuments } from "@eristack/rest";

export const openApi = mergeOpenApiDocuments(
  {
    openapi: "3.1.0",
    info: { title: "ERP API", version: "0.1.0" },
    paths: {},
  },
  documentRoutesOpenApiDocument({ basePath: "/invoices" }),
  documentRoutesOpenApiDocument({ basePath: "/purchase-orders" }),
  docNumberFormatOpenApiDocument("/doc-number"),
);
```

`mergeOpenApiDocuments` deep-merges paths and components — last writer wins on conflicts; keep `basePath` unique per resource.

## PBAC policy export (optional)

Export transition action enums from `@eristack/pbac` OpenAPI helpers when documenting allowed `:action` values per resource.

## Serve spec

Mount merged document on `/openapi.json` in Express or Nest alongside handlers — clients and Backseat demos share one source of truth.

## Checklist

1. One `documentRoutesOpenApiDocument` call per opinion `basePath`
2. Merge format/config routes from `@eristack/doc-number/rest`
3. Add app-specific masters manually or via `@eristack/rest` route defs
4. Regenerate client types in the app from merged spec (your codegen tool of choice)

OpenAPI is the supported typed-client path — no separate RPC layer in eristack.
