# Getting started

Opinionated ERP HTTP — install, mount Express routes, wire list + transition handlers.

## Install

```bash
pnpm add @eristack/opinion @eristack/rest express
pnpm add @eristack/doc-transitions @eristack/pbac @eristack/data-grid @eristack/epoch
```

## Document route map

| Method | Path | Role |
| --- | --- | --- |
| `GET` | `/options` | Field metadata for forms + grid |
| `GET` | `/data-grid` | List `{ items, pageInfo, query }` |
| `GET` | `/:id` | Read one row |
| `POST` | `/` | Create |
| `PUT` | `/:id` | Full replace (rare) |
| `PATCH` | `/:id/:action` | Status transition (`post`, `submit`, …) |
| `DELETE` | `/:id` | Soft-delete / cancel |

Status actions match `@eristack/doc-transitions` preset graphs + `@eristack/pbac` policies.

## Express

```ts
import express from "express";
import { createDocumentRoutes, createOpinionRouter } from "@eristack/opinion";
import { mountOpinionRouter } from "@eristack/opinion/express";

const opinion = createOpinionRouter({
  routes: createDocumentRoutes({
    basePath: "/invoices",
    tags: ["invoices"],
    handlers: {
      list: async () => ({ status: 200, body: { items: [], pageInfo: {}, query: {} } }),
      transition: async (ctx) => {
        // pbac.authorize(..., { action: ctx.params.action, document })
        return { status: 204 };
      },
    },
  }),
});

const app = express();
app.use(express.json());
app.use("/api", mountOpinionRouter({ router: opinion, basePath: "/api" }));
```

## Rules

- Money, qty, dates: string-first types from `@eristack/money`, `@eristack/uom`, `@eristack/timestamp`.
- Status changes: **`PATCH /:id/:action` only** — not ambiguous `PUT`.
- Lists: wire `@eristack/data-grid` on the `list` handler; expose epoch via `@eristack/epoch`.
- Errors: unified JSON envelopes (`jsonError`, `CONFLICT_VERSION`) from `@eristack/rest` adapters.
- Typed clients: compose OpenAPI with `@eristack/opinion/openapi` + `mergeOpenApiDocuments`.

## Nest

```ts
import { OpinionModule } from "@eristack/opinion/nest";

OpinionModule.mount(app, { router: opinion, basePath: "/api/invoices" });
```

## OpenAPI

```ts
import { documentRoutesOpenApiDocument } from "@eristack/opinion/openapi";
import { docNumberFormatOpenApiDocument } from "@eristack/doc-number/rest";
import { mergeOpenApiDocuments } from "@eristack/rest";

const spec = mergeOpenApiDocuments(
  documentRoutesOpenApiDocument({ basePath: "/invoices" }),
  docNumberFormatOpenApiDocument("/doc-number"),
);
```

## Next

- [Route map](./route-map.md) — full path/param rules
- [OpenAPI compose](./openapi-compose.md) — multi-resource specs
- [Errors & epoch](./errors-and-epoch.md) — versioning and cache policy
