# Express & Nest adapters

## Express

```bash
pnpm add @eristack/opinion @eristack/opinion/express @eristack/rest express
```

```ts
import express from "express";
import { createDocumentRoutes, createOpinionRouter } from "@eristack/opinion";
import { mountOpinionRouter } from "@eristack/opinion/express";

const opinion = createOpinionRouter({
  routes: createDocumentRoutes({
    basePath: "/invoices",
    tags: ["invoices"],
    handlers: {
      list: listInvoices,
      read: readInvoice,
      create: createInvoice,
      transition: transitionInvoice,
      delete: deleteInvoice,
    },
  }),
});

const app = express();
app.use(express.json());
app.use("/api", mountOpinionRouter({ router: opinion, basePath: "/api" }));
```

`mountOpinionRouter` dispatches to `@eristack/rest` router — same pattern as other eristack Express mounts.

## Nest

```bash
pnpm add @eristack/opinion @eristack/opinion/nest
```

```ts
import { NestFactory } from "@nestjs/core";
import { OpinionModule } from "@eristack/opinion/nest";

const app = await NestFactory.create(AppModule);
OpinionModule.mount(app.getHttpAdapter().getInstance(), {
  router: opinion,
  basePath: "/api/invoices",
});
```

Nest mount is a thin wrapper over the Express instance — guards and interceptors on other routes are unaffected.

## Partial rollout

Ship read-only first:

```ts
createDocumentRoutes({
  basePath: "/products",
  handlers: { list, read, options },
});
```

Add `create`, `transition`, `delete` when policies and Drizzle writes are ready — no route shape change for clients already using list/read.

## Peer dependencies

- `@eristack/rest` — required (router factory)
- `express` — optional peer for `/express` and `/nest` subpaths

Core `@eristack/opinion` import has no Express/Nest dependency.
