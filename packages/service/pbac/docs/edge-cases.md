---
title: Edge cases
description: Locked docs, zero outstanding, missing fields, stacked policies
sidebar_position: 5
---

# Edge cases

## Missing numeric fields

`documents.positiveAmount("outstandingMinor")` denies when the field is missing
or non-numeric — fail closed. Load the document in the adapter/input factory;
do not pass a partial DTO from the client alone.

## Zero outstanding

Receiving a PO with `outstandingMinor: 0` is a **business** conflict (409), not
a permission problem (403). Copy should say “nothing left to receive.”

## Locked / cancelled flags

`flagNotSet("locked")` denies when truthy. Combine with `statusIn` in one
policy evaluate:

```ts
pbac.registerPolicy({
  id: "po.edit",
  evaluate: (input) => {
    const status = documents.statusIn("status", ["draft", "submitted"])(input);
    if (!status.allowed) return status;
    return documents.flagNotSet("locked", "PO is locked")(input);
  },
});
```

## Stale client status

Never authorize from a status the SPA cached five screens ago. Middleware
should re-read the row (or pass a loader) before `check` / `authorize`.

## check vs authorize

| API | Deny behavior |
| --- | --- |
| `check` | `{ allowed: false, reason }` |
| `authorize` | throws `BusinessPolicyDeniedError` |
| Express/Nest | 409 + reason body |

UI branches on 409 separately from 403.

## checkAll

Fails closed on the first deny. Order policies from cheap/deterministic to
expensive if you compose many.

## Related documents

`PbacInput.related` holds sibling rows (e.g. invoice lines). Helpers in
`documents` today read `input.document`; custom evaluate functions may use
`related` for cross-document rules (still code-registered).

## Not for identity

Do not encode “only managers” in PBAC — that is RBAC/ABAC. PBAC answers
“does this document allow the operation in its current state?”

## Next

- [Document policies](./document-policies.md)
- [Recipes](./recipes.md)
- Sibling: [ABAC](/docs/abac) · [RBAC](/docs/rbac)
