# API reference

## Core

| Export | Description |
| --- | --- |
| `DOCUMENT_ROUTE_SPECS` | Canonical method/path/role table |
| `createDocumentRoutes(options)` | Build `RestRouteDef[]` from handlers |
| `createOpinionRouter({ routes })` | `RestRouter` instance |
| `DocumentRouteRole` | Role union type |
| `DocumentRouteHandlers` | Partial handler map |
| `CreateDocumentRoutesOptions` | `{ basePath, handlers, tags? }` |

## Express (`@eristack/opinion/express`)

| Export | Description |
| --- | --- |
| `mountOpinionRouter({ router, basePath })` | Express middleware |

## Nest (`@eristack/opinion/nest`)

| Export | Description |
| --- | --- |
| `OpinionModule.mount(httpServer, { router, basePath })` | Mount on Nest HTTP adapter |

## OpenAPI (`@eristack/opinion/openapi`)

| Export | Description |
| --- | --- |
| `documentRoutesOpenApiDocument({ basePath, tags? })` | OpenAPI 3.1 paths fragment |

## Imports

```ts
import { createDocumentRoutes, createOpinionRouter, DOCUMENT_ROUTE_SPECS } from "@eristack/opinion";
import { mountOpinionRouter } from "@eristack/opinion/express";
import { documentRoutesOpenApiDocument } from "@eristack/opinion/openapi";
```
