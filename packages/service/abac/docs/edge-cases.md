---
title: Edge cases
description: Missing attrs, empty combinators, floats, and other sharp edges
sidebar_position: 6
---

# Edge cases

ABAC fails closed in most helpers. These are the edges that still surprise people.

## Missing numeric attributes deny

`attrs.subjectLimitAtLeastResource` treats missing or non-numeric values as deny:

```ts
await abac.evaluate("goods-receipt.book-value-limit", {
  subject: { id: "u1", attrs: {} }, // no maxBookValueMinor
  resource: { attrs: { bookValueMinor: 100 } },
});
// { allowed: false, reason: "Missing numeric attributes for limit check" }
```

Load limits in `getContext` before authorize. Do not register a policy that “passes if attr absent” unless you write that explicitly.

## String numbers are accepted

`attrs.number` parses finite numbers and numeric strings (`"5000000"`). That helps when JSON or forms deliver strings. Non-numeric strings → `null` → deny in limit helpers.

```ts
attrs.number(ctx, "resource.attrs.bookValueMinor"); // 1200000 from "1200000"
```

Prefer **minor-unit integers** (or decimal strings you compare yourself). Do not pass JS currency floats (`19.99`) into limit checks — see [`@eristack/money` gotchas](/docs/money/gotchas).

## `resourceInSubjectList` needs an array

```ts
attrs.resourceInSubjectList({
  resourcePath: "resource.attrs.warehouseId",
  subjectListPath: "subject.attrs.warehouseIds",
});
```

If `warehouseIds` is missing, a string, or a Set, the helper returns **`false`** (bare boolean — no reason string). Normalize to `string[]` when loading attrs.

## `subjectAttrEquals` is strict `===`

```ts
attrs.subjectAttrEquals("subject.attrs.department", "finance");
```

`"Finance" !== "finance"`. Normalize case in the loader, not inside every policy.

## Empty `evaluateAll` / `evaluateAny`

| Call | Empty `policyIds` |
| --- | --- |
| `evaluateAll([])` | `{ allowed: true, policyId: "all" }` |
| `evaluateAny([])` | `{ allowed: false, policyId: "any", reason: "No policies matched" }` |

Do not build id lists from user input without a whitelist — empty All is silently allow.

## Unknown policy id throws

```ts
await abac.evaluate("typo-policy", ctx);
// PolicyNotFoundError  code: POLICY_NOT_FOUND
```

`evaluate` / `authorize` / combinators throw for missing registration. Typo ≠ deny. Register at boot and assert `listPolicies()` in a smoke test.

## `authorize` vs `evaluate`

| API | Deny |
| --- | --- |
| `evaluate` | returns `{ allowed: false, … }` |
| `authorize` | throws `PolicyDeniedError` (`POLICY_DENIED`) |

Express `createRequirePolicy` uses `authorize` and maps only `PolicyDeniedError` → 403. Other errors (including `PolicyNotFoundError`) go to `next(err)`.

## Custom `PolicyDecision.policyId`

If your evaluator returns `{ allowed, policyId: "", reason }`, `createAbac` **normalizes** `policyId` to the registered id. You do not need to thread the id through helpers.

## Re-register overwrites

```ts
abac.registerPolicy({ id: "warehouse.in-scope", evaluate: v1 });
abac.registerPolicy({ id: "warehouse.in-scope", evaluate: v2 }); // replaces
```

There is no versioning. Prefer one boot-time `registerAbacPolicies(abac)` module.

## Async evaluate vs getContext

Async policy bodies are allowed, but loading attrs inside every evaluate duplicates work and hides cache bugs. Prefer:

```ts
createRequirePolicy({
  abac,
  policyId: "…",
  getContext: async (req) => ({
    subject: {
      id: req.auth!.subject!,
      attrs: await loadUserLimits(req.auth!.subject!),
    },
    resource: { attrs: { bookValueMinor: req.body.bookValueMinor } },
    action: "create",
  }),
});
```

Keep `evaluate` pure against the bag you already built.

## React hook returns `reason`, not `decision`

```ts
const { allowed, loading, reason } = usePolicy({ abac, policyId, context });
```

There is no `decision` object on the hook. Server still enforces — the hook is UX only. Passing `context: null` → `allowed: false`, `reason: "Missing context"`.

## Effect dependency on `context` object identity

`usePolicy` re-runs when `options.context` reference changes. If you inline a new object every render, you will re-evaluate constantly. Stabilize the bag (state, or build it when draft fields change).

## Environment attrs are optional

Nothing in core requires `environment`. Use it for channel/time rules you own:

```ts
abac.registerPolicy({
  id: "orders.business-hours",
  evaluate: (ctx) => {
    const hour = attrs.number(ctx, "environment.attrs.hourUtc");
    if (hour == null) return { allowed: false, policyId: "", reason: "Missing hour" };
    return hour >= 8 && hour < 18;
  },
});
```

Pass `hourUtc` from the server clock in `getContext` — never trust a client-supplied “now” for security.

## Stacking: ABAC is not PBAC

ABAC deny → **403** (this actor’s attributes). Document-closed PO → **PBAC 409**. Do not return 403 for “outstanding is 0” or clients will show the wrong recovery path. See [Choosing access control](./choosing-access-control.md).

## Next steps

- [Attributes](./attributes.md)
- [Adapters](./adapters.md)
- [Recipes](./recipes.md)
