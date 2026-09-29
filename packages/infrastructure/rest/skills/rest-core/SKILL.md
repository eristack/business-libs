---
name: rest-core
description: >
  @eristack/rest declarative route table: defineRoutes([{ method, path "/orders/:id", handler(ctx
  { params, query, body, headers }) → { status, body?, headers? }, summary, tags }]) →
  router.dispatch() for tests; mountExpressRest / createExpressRestMiddleware (Express 5, unmatched
  → next) / createExpressRestRouter (Express 4); RestModule.forRoutes (Nest catch-all, 404 JSON);
  toOpenApiDocument + mergeOpenApiDocuments (3.1 paths only). First-match, :param only, no
  middleware — auth/logging/idempotency mount before it. Prefer @eristack/opinion for ERP docs.
metadata:
  author: eristack
  version: "0.1"
  type: core
  library: "@eristack/rest"
sources:
  - packages/infrastructure/rest/docs/getting-started.md
---

# @eristack/rest

Routes are data; handlers return responses.

```ts
import { defineRoutes, toOpenApiDocument, mergeOpenApiDocuments } from "@eristack/rest";
import { mountExpressRest } from "@eristack/rest/express";      // Nest: RestModule.forRoutes({ router, basePath })

export const api = defineRoutes([
  { method: "GET",  path: "/orders/:id", summary: "Get order", tags: ["orders"],
    handler: async ({ params }) => (await svc.get(params.id)) ? { status: 200, body: o } : { status: 404, body: { error: { code: "NOT_FOUND" } } } },
  { method: "POST", path: "/orders",
    handler: async ({ body }) => { const p = schema.safeParse(body); if (!p.success) return { status: 400, body: { error: { code: "VALIDATION", issues: p.error.issues } } };
      return { status: 201, body: await svc.create(p.data) }; } },
]);

app.use(express.json()); app.use(createLoggerMiddleware()); app.use("/api", requireAuth);
mountExpressRest(app, { router: api, mountPath: "/api", basePath: "/api" });
const doc = mergeOpenApiDocuments(toOpenApiDocument(api.routes, { title, version }), opinionDoc);
```

## Checklist

1. Handlers: validate (Zod) → service → `{ status, body }`; no Drizzle/req/res inside.
2. `mountPath === basePath`; `express.json()` before mount or `body` is undefined.
3. Specific paths before `:param` paths (first match wins); trailing slash + method case normalised.
4. Unit-test with `await api.dispatch({ method, path, body })` → `{ matched, response }`.
5. Errors: throw → `next(error)` → `createMapDomainError` 409 envelope (`#http-errors`).

## Do not

- Expect wildcards, optional segments, HEAD/OPTIONS routing, streaming, or non-JSON bodies.
- Put auth/rate-limit inside handlers — framework middleware before the mount.
- Hand-write ERP document routes — `@eristack/opinion` generates them on this router.
