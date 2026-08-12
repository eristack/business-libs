---
title: Attributes
description: Paths, attrs helpers, and stacking with RBAC
sidebar_position: 4
---

# Attributes

Attribute values are opaque (`string | number | boolean | null | arrays | nested records`). Money-like limits should be **minor units** (integers) or decimal **strings** — do not invent JS currency floats.

## Context shape

```ts
type AbacContext = {
  subject: { id: string; attrs?: AttributeMap };
  resource?: { type?: string; id?: string; attrs?: AttributeMap };
  action?: string;
  environment?: { attrs?: AttributeMap };
};
```

## Path reads

Paths are dotted from the **context root**:

| Path | Reads |
| --- | --- |
| `subject.attrs.maxBookValueMinor` | subject limit |
| `resource.attrs.warehouseId` | resource field |
| `environment.attrs.channel` | env |

```ts
import { attrs } from "@eristack/abac";

attrs.get(ctx, "subject.attrs.department");
attrs.number(ctx, "resource.attrs.bookValueMinor"); // number | null
```

Missing segments yield `undefined` / `null` (for `number`). Helpers treat missing numerics as **deny** with a reason — fail closed.

## Built-in helpers

### Subject limit ≥ resource value

Inclusive: resource value must be ≤ subject max.

```ts
attrs.subjectLimitAtLeastResource({
  subjectPath: "subject.attrs.maxBookValueMinor",
  resourcePath: "resource.attrs.bookValueMinor",
  reason: "Exceeds book-value limit", // optional
});
```

### Subject attr equals

```ts
attrs.subjectAttrEquals("subject.attrs.department", "finance");
```

### Resource in subject list

```ts
attrs.resourceInSubjectList({
  resourcePath: "resource.attrs.warehouseId",
  subjectListPath: "subject.attrs.warehouseIds",
});
```

`warehouseIds` must be an array on the subject; otherwise deny.

## Where attributes live

| Data | Stored in | Loaded when |
| --- | --- | --- |
| Max book value, warehouse list | Your user/profile tables | `getContext` / handler |
| Resource book value, warehouse | Request body or loaded entity | Same |
| Policy algorithms | Application code | Boot (`registerPolicy`) |

ABAC does not create attribute columns. Mirror jwt-auth / rbac: **child of users** for subject attrs is an app schema choice.

Example app columns (illustrative):

```text
users
  id
user_limits                    ← yours
  subject
  max_book_value_minor
  warehouse_ids_json
```

## Stacking with RBAC

Always ask RBAC first (cheap boolean), then ABAC (attribute load):

```ts
await rbac.authorize(subject, "goods-receipt.post");

const limits = await loadUserLimits(subject);
await abac.authorize("goods-receipt.book-value-limit", {
  subject: { id: subject, attrs: limits },
  resource: { attrs: { bookValueMinor: body.bookValueMinor } },
  action: "create",
});
```

Express:

```ts
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

Do **not** encode limits into permission names (`goods-receipt.post.under-5m`). That explodes the RBAC catalog and still needs a number comparison — keep the number in ABAC.

## evaluateAll for multiple attribute gates

```ts
await abac.evaluateAll(
  ["goods-receipt.book-value-limit", "warehouse.in-scope"],
  ctx,
);
// first deny wins
```

## Money attrs checklist

1. Store and compare **minor units** (`5_000_000`) or decimal strings
2. Document the unit on the attr name (`…Minor`)
3. Build the amount with `@eristack/money` in domain code; pass a number/string into ABAC only for comparison

## Next steps

- [Adapters](./adapters.md)
- [Recipes](./recipes.md)
