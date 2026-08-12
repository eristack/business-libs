---
title: Adapters
description: Express, Nest, React shells
sidebar_position: 4
---

# Adapters

## Express

```ts
import { createRequireBusinessPolicy } from "@eristack/pbac/express";

app.post(
  "/goods-receipts",
  requireAuth,
  createRequirePermission({ rbac, permission: "goods-receipt.post" }),
  createRequireBusinessPolicy({
    pbac,
    policyId: "purchase-order.can-receive",
    getInput: async (req) => ({
      document: await loadPo(req.body.purchaseOrderId),
    }),
  }),
  handler,
);
```

Denied → **409** with `BUSINESS_POLICY_DENIED`.

## Nest / React

`RequireBusinessPolicy` + `PbacInputFactory` + `PbacGuard`; `useBusinessPolicy` for UI.
