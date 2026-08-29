# Recipes

## Invoice API (Express + data-grid + transitions)

```ts
import { createDocumentRoutes, createOpinionRouter } from "@eristack/opinion";
import { mountOpinionRouter } from "@eristack/opinion/express";
import { publicationGraph, registerTransitionGraph, transitionPolicyId } from "@eristack/doc-transitions";
import { executeDrizzleList } from "@eristack/data-grid/drizzle";

registerTransitionGraph(pbac, { entityKey: "invoice", graph: publicationGraph });

const router = createOpinionRouter({
  routes: createDocumentRoutes({
    basePath: "/invoices",
    tags: ["invoices"],
    handlers: {
      list: async (ctx) => {
        const result = await executeDrizzleList({ /* app query */ });
        return { status: 200, body: result };
      },
      read: readInvoice,
      create: createInvoice,
      transition: async (ctx) => {
        await pbac.authorize(transitionPolicyId("invoice", "publication"), {
          action: ctx.params.action,
          document: { status: (await loadInvoice(ctx.params.id)).status },
        });
        // update status…
        await epoch.bump({ scope: "invoices" });
        return { status: 204 };
      },
    },
  }),
});
```

## Composed OpenAPI for ERP spine

See [OpenAPI compose](./openapi-compose.md) — merge invoice + PO + doc-number format routes.

## Master data (options + list only)

```ts
createDocumentRoutes({
  basePath: "/warehouses",
  handlers: { options: warehouseOptions, list: warehouseList, read: warehouseRead },
});
```

## Horizon A Backseat

Register same paths on `@eristack/backseat` with in-memory handlers; swap to Drizzle handlers without changing client SDK paths.
