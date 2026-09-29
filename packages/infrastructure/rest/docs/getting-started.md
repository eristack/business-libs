---
title: Getting started
description: Define a typed route table with Zod bodies, mount it on Express 5 (middleware), Express 4 (Router) or Nest (RestModule), order auth and logging before it, unit-test handlers with dispatch(), and emit merged OpenAPI 3.1.
---

# Getting started

## Install

```bash
pnpm add @eristack/rest express        # or @nestjs/common
```

## 1. Route table (framework-free)

```ts
// src/http/routes.ts
import { defineRoutes, type RestHandler } from "@eristack/rest";
import { z } from "zod";

const createOrderBody = z.object({ partnerId: z.string(), lines: z.array(lineInputSchema) });

const json = (status: number, body: unknown) => ({ status, body });
const notFound = json(404, { error: { code: "NOT_FOUND", message: "No such order" } });

const getOrder: RestHandler = async ({ params }) => {
  const order = await orderService.get(params.id!);
  return order ? json(200, order) : notFound;
};

const createOrder: RestHandler = async ({ body, headers }) => {
  const parsed = createOrderBody.safeParse(body);
  if (!parsed.success) return json(400, { error: { code: "VALIDATION", issues: parsed.error.issues } });
  const created = await orderService.create(parsed.data, { actor: String(headers["x-user-id"] ?? "") });
  return { status: 201, body: created, headers: { Location: `/api/orders/${created.id}` } };
};

export const api = defineRoutes([
  { method: "GET",  path: "/orders/:id", summary: "Get order",    tags: ["orders"], handler: getOrder },
  { method: "POST", path: "/orders",     summary: "Create order", tags: ["orders"], handler: createOrder },
  { method: "GET",  path: "/orders",     summary: "List orders",  tags: ["orders"], handler: listOrders },
]);
```

Handlers get `params` (decoded `:name` segments), `query` (framework's parsed object), `body` (whatever the body parser produced — `undefined` if you forgot `express.json()`), and `headers` (lower-cased keys on Express/Nest).

## 2. Mount

### Express 5 (recommended)

```ts
import express from "express";
import { mountExpressRest } from "@eristack/rest/express";
import { createLoggerMiddleware } from "@eristack/logger/express";
import { createExpressRequireAuth } from "@eristack/jwt-auth/express";

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(createLoggerMiddleware());
app.use("/api", createExpressRequireAuth({ jwtAuth }));                 // before the REST mount
mountExpressRest(app, { router: api, mountPath: "/api", basePath: "/api" });
app.use((req, res) => res.status(404).json({ error: { code: "NOT_FOUND" } }));   // unmatched fall through
```

`mountPath` is where Express mounts the middleware; `basePath` is what gets stripped from `req.path` before matching. Set them equal unless you know why not.

### Express 4 (Router sub-app)

```ts
import { createExpressRestRouter } from "@eristack/rest/express";
app.use("/api", createExpressRestRouter({ router: api, basePath: "/api" }));
```

### NestJS

```ts
import { Module } from "@nestjs/common";
import { RestModule } from "@eristack/rest/nest";

@Module({ imports: [RestModule.forRoutes({ router: api, basePath: "/api" })] })
export class ApiModule {}
```

Nest guards/interceptors on `RestDispatchController` apply to every route in the table. Unmatched paths under the controller return 404 JSON (no fall-through).

## 3. Test without HTTP

```ts
import { api } from "../src/http/routes.js";
import { expect, it } from "vitest";

it("creates then gets", async () => {
  const created = await api.dispatch({ method: "POST", path: "/orders", body: { partnerId: "p1", lines: [] } });
  expect(created).toMatchObject({ matched: true, response: { status: 201 } });
  const id = (created as any).response.body.id;
  const got = await api.dispatch({ method: "get", path: `/orders/${id}/` });     // method case + trailing slash normalised
  expect(got).toMatchObject({ matched: true, response: { status: 200 } });
  expect(await api.dispatch({ method: "GET", path: "/nope" })).toEqual({ matched: false });
});
```

## 4. OpenAPI

```ts
import { toOpenApiDocument, mergeOpenApiDocuments } from "@eristack/rest";

const appDoc = toOpenApiDocument(api.routes, { title: "ERP API", version: pkg.version });
const doc = mergeOpenApiDocuments(appDoc, opinionDoc, jwtAuthDoc);   // later docs win on path+method collisions
app.get("/api/openapi.json", (_req, res) => res.json(doc));
```

Output is `openapi: "3.1.0"` with `paths[path][method] = { summary, tags, operationId }` — enough for route listings and client stubs. Add `components`/request schemas in the app (e.g. `zod-to-openapi`) by spreading into `doc`.

## Matching rules

| Rule | Behaviour |
| --- | --- |
| Params | `:id` → `([^/]+)`, URL-decoded into `params.id`. No optional/wildcard segments. |
| Order | First route whose method and pattern match wins — put `/orders/new` before `/orders/:id`. |
| Trailing slash | Stripped (`/orders/` = `/orders`), except root `/`. |
| Method | Case-insensitive on dispatch; route defs use upper-case. `HEAD`/`OPTIONS` are not routed — let the framework handle them. |
| Query | Passed through from the framework (`req.query`); the router never parses query strings itself. |
| Errors | Express: thrown/rejected handler → `next(error)` (your error middleware). Nest: exception filters. |
| Response | `body === undefined` → `res.sendStatus(status)`; otherwise `res.status().json(body)`. Non-JSON bodies aren't supported. |

## Production path

1. Keep handlers thin: validate → call a service → return `{ status, body }`. No Drizzle in handlers.
2. Auth, logging, rate-limit, idempotency as framework middleware **before** the mount.
3. Domain errors → the 409 envelope from `@eristack/ai-knowledge#http-errors` (`createMapDomainError` in your error middleware).
4. Prefer `@eristack/opinion` for ERP documents — it generates this route table for you.

## Gotchas

- Forgetting `express.json()` yields `body: undefined` with no error.
- `basePath` must match the mount prefix or nothing matches (path becomes `/api/orders/1` vs pattern `/orders/:id`).
- Nest's catch-all controller swallows 404s for everything under its prefix — mount it last or on its own module path.
- Handlers have no access to `req`/`res`; if you need the request logger, resolve `x-request-id` from `headers` and create a child logger.
- `mergeOpenApiDocuments` keeps `info` from the **first** document.

## Exports

`@eristack/rest`: `defineRoutes`, `createRestRouter`, `toOpenApiDocument`, `mergeOpenApiDocuments`, types.
`@eristack/rest/express`: `createExpressRestMiddleware`, `mountExpressRest`, `createExpressRestRouter`.
`@eristack/rest/nest`: `RestModule`, `RestDispatchController`, `REST_ROUTER`, `REST_BASE_PATH`.
