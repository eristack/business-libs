---
title: Adapters
description: Express, Nest, React shells
sidebar_position: 4
---

# Adapters

## Express

```ts
import { createRequirePolicy } from "@eristack/abac/express";

app.post(
  "/goods-receipts",
  requireAuth,
  createRequirePermission({ rbac, permission: "goods-receipt.post" }),
  createRequirePolicy({
    abac,
    policyId: "goods-receipt.book-value-limit",
    getContext: async (req) => ({
      subject: {
        id: req.auth!.subject!,
        attrs: await loadUserLimits(req.auth!.subject!),
      },
      resource: { attrs: { bookValueMinor: req.body.bookValueMinor } },
      action: "create",
    }),
  }),
  handler,
);
```

## Nest

`@RequirePolicy("…")` + `@AbacContextFactory(fn)` + `AbacGuard`.

## React

`usePolicy({ abac, policyId, context })` for UI enable/disable (server still enforces).
