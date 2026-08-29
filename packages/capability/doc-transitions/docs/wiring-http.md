# Wiring HTTP

Status mutations use **`PATCH /:id/:action`** — not ambiguous `PUT` body flags. Load `@eristack/opinion` for the route map.

## End-to-end flow

1. Client: `PATCH /api/invoices/inv_01/submit`
2. Handler loads row from Drizzle
3. `pbac.authorize(transitionPolicyId("invoice", "publication"), { action: "submit", document: row })`
4. Handler updates `status` (and optional audit fields) in a transaction
5. Optional: `@eristack/epoch` bump for list cache invalidation
6. Return `204` or `200` with updated row

## Express skeleton

```ts
import {
  publicationGraph,
  registerTransitionGraph,
  transitionPolicyId,
} from "@eristack/doc-transitions";
import { createPbac } from "@eristack/pbac";
import { createDocumentRoutes, createOpinionRouter } from "@eristack/opinion";
import { mountOpinionRouter } from "@eristack/opinion/express";

const pbac = createPbac();
registerTransitionGraph(pbac, { entityKey: "invoice", graph: publicationGraph });
const transitionPolicy = transitionPolicyId("invoice", "publication");

const router = createOpinionRouter({
  routes: createDocumentRoutes({
    basePath: "/invoices",
    tags: ["invoices"],
    handlers: {
      transition: async (ctx) => {
        const { id, action } = ctx.params;
        const row = await db.query.invoices.findFirst({ where: eq(invoices.id, id) });
        if (!row) return { status: 404, body: { code: "NOT_FOUND" } };

        await pbac.authorize(transitionPolicy, {
          action,
          document: { status: row.status },
        });

        const nextStatus = mapActionToStatus(action, row.status); // app logic
        await db.update(invoices).set({ status: nextStatus }).where(eq(invoices.id, id));
        return { status: 204 };
      },
    },
  }),
});

app.use("/api", mountOpinionRouter({ router, basePath: "/api" }));
```

## Action name stability

`:action` must match graph table strings exactly (`post`, not `POST` or `post-document`). Use the same names in:

- OpenAPI path params
- Frontend buttons / TanStack Query mutations
- PBAC authorize calls

## Options endpoint

Expose allowed actions for the current status via `GET /options` or embed in read response — use `actionsForStatus(graph, row.status)` from doc-transitions.

## Backseat prototype

Register the same routes on `@eristack/backseat` for Horizon A demos; graduate handlers to Express + Drizzle without changing action names.

See `@eristack/opinion` [Route map](../opinion/route-map.md) for the full HTTP table.
