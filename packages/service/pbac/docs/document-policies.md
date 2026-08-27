---
title: Document policies
description: Status transitions, 409 semantics, and documents helpers
sidebar_position: 4
---

# Document policies

Most ERP gates are a handful of predicates over document fields. The `documents` helpers cover the majority; custom functions cover the rest.

## `documents` helpers

### Positive amount

Allow when `document[field] > 0` (number or numeric string).

```ts
documents.positiveAmount("outstandingMinor");
documents.positiveAmount("outstandingMinor", "Nothing left to receive");
```

Missing/non-numeric → deny with reason.

### Status in set

```ts
documents.statusIn("status", ["open", "partial"]);
documents.statusIn("status", ["draft"], "Only drafts can be edited");
```

### Flag not set

Deny when a boolean (or truthy) flag is set — locked, cancelled, voided.

```ts
documents.flagNotSet("locked");
documents.flagNotSet("cancelled", "Document is cancelled");
```

### Status transition table

When mutations carry an `action` (submit, approve, post), gate with a transition table keyed by current status:

```ts
documents.transitions("status", {
  draft: ["submit"],
  submitted: ["approve", "reject"],
  approved: ["post"],
});
```

Wire `action` on `PbacInput` alongside `document`. Missing action or illegal transition → deny with reason.

## Status transition pattern

Model transitions as **named policies** checked before mutating status:

```text
draft ──post──► open ──close──► closed
                  │
                  └──cancel──► cancelled
```

```ts
pbac.registerPolicy({
  id: "purchase-order.can-post",
  evaluate: documents.statusIn("status", ["draft"]),
});

pbac.registerPolicy({
  id: "purchase-order.can-close",
  evaluate: (input) => {
    const statusOk = ["open", "partial"].includes(String(input.document.status));
    const outstanding = Number(input.document.outstandingMinor);
    return {
      allowed: statusOk && outstanding === 0,
      policyId: "",
      reason: !statusOk
        ? "PO must be open or partial"
        : outstanding === 0
          ? undefined
          : "Close requires zero outstanding",
    };
  },
});

pbac.registerPolicy({
  id: "purchase-order.can-cancel",
  evaluate: documents.statusIn("status", ["draft", "open"]),
});
```

Handler flow:

```ts
await pbac.authorize("purchase-order.can-post", { document: po });
await db.update(purchaseOrders).set({ status: "open" }).where(eq(/* … */));
```

PBAC does not write status — it only gates your write.

## Related documents

When posting a GR against a PO:

```ts
await pbac.authorize("purchase-order.can-receive", {
  document: {
    status: po.status,
    outstandingMinor: po.outstandingMinor,
  },
  related: {
    goodsReceipt: { bookValueMinor: gr.bookValueMinor },
  },
  action: "receive",
});
```

Use `related` for parent/child context; keep the **primary** predicate fields on `document` so helpers stay simple.

## 409 response shape

Express `createRequireBusinessPolicy`:

```json
{
  "error": {
    "code": "BUSINESS_POLICY_DENIED",
    "message": "…",
    "policyId": "purchase-order.can-receive",
    "reason": "outstandingMinor must be greater than 0"
  }
}
```

Client handling:

```ts
if (res.status === 403) showToast("You are not allowed to do this");
if (res.status === 409) showToast(body.error.reason ?? "Document conflict");
```

## Idempotency and races

Two concurrent receives can both pass `outstanding > 0` before either writes. PBAC is not a lock. Combine with:

- Transactional decrement of outstanding
- `WHERE outstanding_minor >= :qty` update counts
- Optional re-check inside the transaction

## Naming

| Pattern | Example |
| --- | --- |
| `{entity}.can-{action}` | `purchase-order.can-receive` |
| `{entity}.{state-gate}` | `invoice.not-locked` |

Keep ids stable — they appear in logs and client error maps.

## Next steps

- [Adapters](./adapters.md)
- [Recipes](./recipes.md)
