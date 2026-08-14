---
title: Controllers
description: Custom routes, named actions, and ERP-style patterns
---

# Controllers

Backseat does not lock you into CRUD. **Controllers are plain async functions** — register as HTTP routes or named actions.

## Choose the right surface

| Need | Use |
| --- | --- |
| Standard list/detail/create/update/delete | `registerCollection` → `handlers` |
| Document workflow (submit, approve, post) | `registerRoute` — POST/PATCH on custom path |
| Dashboard / report / aggregation | `registerAction` + `invoke` |
| Existing code expects `fetch` | `api.fetch()` or `handle()` |
| TanStack Query in React | Handlers, actions, or `@eristack/backseat/react` hooks |

## HTTP controller anatomy

```ts
api.registerRoute({
  method: "POST",
  path: "/procurement/po/:id/approve",
  name: "approve-purchase-order",
  handler: async (ctx) => {
    // 1. Parse input
    const { note } = ctx.json<{ note?: string }>();
    const force = ctx.query("force") === "true";

    // 2. Load related documents
    const po = await ctx.store.get("purchaseOrders", ctx.params.id);
    if (!po) {
      return {
        status: 404,
        body: { error: { code: "NOT_FOUND", message: "PO not found" } },
      };
    }

    // 3. Business rules (simplified for prototype)
    if (po.status !== "submitted" && !force) {
      return {
        status: 409,
        body: { error: { code: "INVALID_STATE", message: "PO must be submitted" } },
      };
    }

    const partner = po.partnerId
      ? await ctx.store.get("partners", String(po.partnerId))
      : null;

    // 4. Persist + return DTO
    const updated = await ctx.store.update("purchaseOrders", ctx.params.id, {
      status: "approved",
      approvedAt: new Date().toISOString(),
      approvedNote: note,
      partnerName: partner?.name,
    });

    return { status: 200, body: updated };
  },
});
```

Call from Query:

```ts
useMutation({
  mutationFn: ({ id, note }: { id: string; note?: string }) =>
    api
      .handle({
        method: "POST",
        path: `/api/procurement/po/${id}/approve`,
        body: { note },
      })
      .then((res) => {
        if (res.status >= 400) throw new Error(JSON.stringify(res.body));
        return res.body;
      }),
});
```

Or keep using handlers after approval if you patch via store in the action instead.

## Splat routes

Trailing `/*` captures the rest of the path as `ctx.params._splat`:

```ts
api.registerRoute({
  method: "GET",
  path: "/analytics/*",
  handler: async (ctx) => {
    const report = ctx.params._splat; // e.g. "inventory/warehouse-a"
    const minQty = Number(ctx.query("minQty") ?? "0");

    const products = await ctx.store.list("products");
    const filtered = products.filter((p) => Number(p.qty ?? 0) >= minQty);

    return {
      status: 200,
      body: { report, minQty, items: filtered },
    };
  },
});

// GET /api/analytics/inventory/warehouse-a?minQty=5
```

## Named actions

When REST shape is awkward or you want a stable internal API:

```ts
api.registerAction("procurement.outstandingBySupplier", async ({ input, store }) => {
  const { supplierId, asOf } = input as { supplierId: string; asOf?: string };

  const orders = await store.list("purchaseOrders", {
    where: { partnerId: supplierId, status: "approved" },
  });

  // Complex in-memory processing — joins, totals, date filters
  return orders
    .filter((po) => !asOf || String(po.orderDate ?? "") <= asOf)
    .map((po) => ({
      id: po.id,
      docNumber: po.docNumber,
      lineCount: Array.isArray(po.lines) ? po.lines.length : 0,
    }));
});
```

Query:

```ts
useQuery({
  queryKey: ["outstanding-pos", supplierId, asOf],
  queryFn: () =>
    api.invoke("procurement.outstandingBySupplier", { supplierId, asOf }),
});
```

Actions can call other actions or read via `backseat`:

```ts
api.registerAction("dashboard.summary", async ({ backseat, store }) => {
  const [products, orders] = await Promise.all([
    store.list("products"),
    backseat.invoke("procurement.openPoCount", null),
  ]);
  return { productCount: products.length, openPoCount: orders };
});
```

## Multi-collection posting (prototype)

Simulate GR posting without real `@eristack/stock-movement` yet:

```ts
api.registerRoute({
  method: "POST",
  path: "/procurement/gr/:poId/post",
  name: "post-goods-receipt",
  handler: async (ctx) => {
    const { lines } = ctx.json<{ lines: Array<{ itemId: string; qty: string }> }>();
    const po = await ctx.store.get("purchaseOrders", ctx.params.poId);
    if (!po || po.status !== "approved") {
      return { status: 409, body: { error: { code: "INVALID_STATE", message: "PO not approved" } } };
    }

    const grId = `gr-${Date.now()}`;
    const receipt = {
      id: grId,
      poId: ctx.params.poId,
      status: "posted",
      lines,
      postedAt: new Date().toISOString(),
    };

    await ctx.store.create("goodsReceipts", receipt);

    // Prototype stock ledger as documents
    for (const line of lines) {
      await ctx.store.create("stockMovements", {
        id: `${grId}-${line.itemId}`,
        itemId: line.itemId,
        qty: line.qty,
        direction: "in",
        sourceDoc: grId,
      });
    }

    return { status: 201, body: receipt };
  },
});
```

This is **sketch logic** — when the real backend lands, move rules to capability packages and keep DTO shapes similar.

## Organizing controllers

```text
backseat/
  api.ts              engine + collections
  controllers/
    procurement.ts    PO submit/approve/GR
    reports.ts        actions + analytics routes
    index.ts          registerAll(api)
```

```ts
// controllers/index.ts
export function registerAll(api: Backseat) {
  registerProcurement(api);
  registerReports(api);
}
```

Register once at startup. Feature folders stay unaware of HTTP vs action — they only import hooks.

## Error responses

Custom routes should return structured errors consistent with CRUD:

```ts
return {
  status: 400,
  body: { error: { code: "VALIDATION_ERROR", message: "lines required" } },
};
```

Thrown `BackseatError` subclasses work inside handlers wrapped by `registerRoute` error handling.

## Anti-patterns

| Avoid | Prefer |
| --- | --- |
| Putting all logic inline in React components | `registerRoute` / `registerAction` |
| Using CRUD PATCH for state machines | Named transition routes (`/submit`, `/approve`) |
| IndexedDB store in Vitest | `createMemoryBackseatStore()` |
| Hard-coding fetch URLs without `baseUrl` | `api.handle({ path: \`/api/...\` })` or handlers |
| Shipping devtools to production users | `import.meta.env.DEV` gate |

## Related

- [API reference](./api-reference.md) — types and hook list
- [Devtools](./devtools.md) — fixture data for testing controllers
- [Graduation](./graduation.md) — moving logic to real backend
