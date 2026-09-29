---
title: Overview
description: Declarative REST routes as data — one route table dispatched on Express 4/5 or NestJS, handlers that return { status, body, headers } instead of touching req/res, and minimal OpenAPI 3.1 emit + merge for codegen.
---

# @eristack/rest

Eristack packages (`jwt-auth`, `data-grid`, `opinion`, `doc-number`, …) all need HTTP routes, and every app needs them on *its* framework. `@eristack/rest` makes a route table a plain array of `{ method, path, handler }` where the handler receives a framework-free context (`params`, `query`, `body`, `headers`) and **returns** a response object. The same table mounts on Express 4, Express 5, or Nest, is unit-testable without a server (`router.dispatch(...)`), and emits an OpenAPI 3.1 skeleton for client codegen.

It is a small router: `:param` segments, first-match ordering, trailing-slash normalisation. No middleware chain, no body parsing, no validation — compose those from the framework and Zod.

## Use it when

- Building an app API from Eristack handlers and you want one route table for Express and Nest.
- Testing handlers without spinning up HTTP (`await router.dispatch({ method, path, body })`).
- Producing an OpenAPI paths list (merge with package-provided docs) for TanStack Query codegen.

## Not for

- Streaming, file uploads, WebSockets — use the framework directly; presigned uploads via `@eristack/file-manager`.
- Middleware ordering (auth, rate limit) — mount those with the framework **before** the REST mount.
- Full OpenAPI schemas — `toOpenApiDocument` emits paths/operations only; add components in the app or a future `/zod` adapter.

## Install

```bash
pnpm add @eristack/rest express            # Express
pnpm add @eristack/rest @nestjs/common     # Nest
```

Peers: `express ^4 || ^5` **or** `@nestjs/common ^10 || ^11` (only the one you mount on).

## 30-second example

```ts
import { defineRoutes, toOpenApiDocument } from "@eristack/rest";
import { mountExpressRest } from "@eristack/rest/express";

export const api = defineRoutes([
  { method: "GET", path: "/orders/:id", summary: "Get order", tags: ["orders"],
    handler: async ({ params }) => {
      const order = await orders.get(params.id);
      return order ? { status: 200, body: order } : { status: 404, body: { error: { code: "NOT_FOUND" } } };
    } },
  { method: "POST", path: "/orders", summary: "Create order",
    handler: async ({ body }) => ({ status: 201, body: await orders.create(orderSchema.parse(body)) }) },
]);

mountExpressRest(app, { router: api, mountPath: "/api", basePath: "/api" });
export const openapi = toOpenApiDocument(api.routes, { title: "Orders API", version: "1.0.0" });
```

## API

| Import | Export | Signature / notes |
| --- | --- | --- |
| `@eristack/rest` | `defineRoutes` / `createRestRouter` | `(routes: RestRouteDef[]) => RestRouter` — same function, two names. |
| | `RestRouter` | `{ routes; dispatch({ method, path, query?, body?, headers? }) => Promise<{ matched: true; response } \| { matched: false }> }`. Method upper-cased, trailing `/` stripped, first matching route wins. |
| | `RestRouteDef` | `{ method: "GET"\|"POST"\|"PUT"\|"PATCH"\|"DELETE"; path: "/orders/:id"; handler; summary?; tags? }`. `:name` matches `[^/]+`, URL-decoded. |
| | `RestHandler` | `(ctx: RestHandlerContext) => RestResponse \| Promise<RestResponse>` where ctx = `{ method, path, params, query, body, headers }`. |
| | `RestResponse` | `{ status: number; body?: unknown; headers?: Record<string,string> }` — `body` undefined → `sendStatus`. |
| | `toOpenApiDocument` | `(routes, { title? = "API", version? = "0.0.0" }) => OpenApiDocument` — `paths[path][method] = { summary, tags, operationId }`. |
| | `mergeOpenApiDocuments` | `(...docs) => OpenApiDocument` — shallow merge of paths; later docs win per method; `info` from the first. |
| `@eristack/rest/express` | `createExpressRestMiddleware({ router, basePath? })` | `RequestHandler`; strips `basePath` from `req.path`, unmatched → `next()`, thrown → `next(error)`. Express 5-friendly (no `*`). |
| | `mountExpressRest(app, { router, basePath?, mountPath? })` | `app.use(mountPath ?? basePath ?? "/", middleware)`. |
| | `createExpressRestRouter({ router, basePath? })` | Express `Router` wrapping the middleware (Express 4 sub-app style). |
| `@eristack/rest/nest` | `RestModule.forRoutes({ router, basePath? })` | Dynamic module with a catch-all `@All("*")` controller; unmatched → 404 `{ error: { code: "NOT_FOUND" } }`. Tokens `REST_ROUTER`, `REST_BASE_PATH`. |

## Works with

- `@eristack/opinion` — the ERP route table (`options`, list, CRUD, `PATCH /:id/:action`) is built on this router.
- `@eristack/jwt-auth` — `createExpressRequireAuth({ jwtAuth })` middleware before `mountExpressRest`; or mount its own router alongside.
- `@eristack/data-grid` — call `createDataGridListAction` inside a handler and return its result as `body`.
- `@eristack/idempotency` — wrap `POST` handlers at the framework layer (`wrapIdempotentHandler`) or check inside the handler.
- `@eristack/logger` — `createLoggerMiddleware` before the mount; `getRequestLogger(req)` is not available inside handlers (framework-free) — pass what you need via `resolveContext` → headers, or log at the boundary.

## For agents

- Skill: `pnpm dlx @tanstack/intent@latest load @eristack/rest#rest-core`
- Recipes: `declarative-rest-routes`, `opinion-http`.

## Next

- [Getting started](./getting-started.md) — route table with Zod, Express 5 vs 4 mounts, Nest module, auth ordering, testing via `dispatch`, OpenAPI merge with package docs, and matching rules.
