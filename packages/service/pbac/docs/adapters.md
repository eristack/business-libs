---
title: Adapters
description: Express, Nest, React shells
sidebar_position: 5
---

# Adapters

Headless shells that load a document bag, call `authorize`, and map denial to **409**.

## Express

```ts
import { createRequireBusinessPolicy } from "@eristack/pbac/express";

app.post(
  "/goods-receipts",
  requireAuth,
  createRequirePermission({ rbac, permission: "goods-receipt.post" }),
  createRequirePolicy({
    abac,
    policyId: "goods-receipt.book-value-limit",
    getContext: async (req) => {
      /* … */
    },
  }),
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

Denied → **409** + `BUSINESS_POLICY_DENIED` (see [Document policies](./document-policies.md#409-response-shape)).

Load the PO **inside** `getInput` so the check sees committed state, not only the request body.

## NestJS

```ts
import {
  PbacModule,
  PbacGuard,
  RequireBusinessPolicy,
  PbacInputFactory,
} from "@eristack/pbac/nest";

@Module({
  imports: [PbacModule.forRoot({ pbac })],
})
export class GoodsReceiptModule {}

@Post()
@RequireBusinessPolicy("purchase-order.can-receive")
@PbacInputFactory(async (req) => ({
  document: await loadPo(req.body.purchaseOrderId),
}))
@UseGuards(PbacGuard)
create() {
  /* … */
}
```

Pair with auth + RBAC (+ ABAC) guards in a defined order.

## React

```ts
import { useBusinessPolicy } from "@eristack/pbac/react";

const { allowed, loading, reason } = useBusinessPolicy({
  pbac,
  policyId: "purchase-order.can-receive",
  input: { document: po },
});

// Disable "Receive" when !allowed; show `reason` in tooltip or inline alert
```

UI hints only — server enforces with 409.

## Injection checklist

| Layer | You inject |
| --- | --- |
| Core | `createPbac()` + `registerPolicy` |
| Express / Nest | `pbac`, `policyId`, input factory |
| React | `pbac`, `policyId`, `input` |

## Next steps

- [Recipes](./recipes.md)
- [Document policies](./document-policies.md)
