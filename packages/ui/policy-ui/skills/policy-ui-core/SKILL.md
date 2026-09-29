---
name: policy-ui-core
description: >
  @eristack/policy-ui Can { permission, allowed, fallback } and BusinessPolicyGate { policyId,
  allowed, fallback } — React gates that render children or fallback from a boolean. Use for
  action buttons on document pages/list toolbars; allowed comes from rbac useCan, pbac
  useBusinessPolicy, or server allowedActions. v0: allowed defaults true, ids are labels only,
  hidden is not enforcement.
metadata:
  author: eristack
  version: "0.1"
  type: core
  library: "@eristack/policy-ui"
sources:
  - packages/ui/policy-ui/docs/getting-started.md
---

# @eristack/policy-ui

Render the decision; never make it here.

```tsx
import { Can, BusinessPolicyGate } from "@eristack/policy-ui";
import { useCan } from "@eristack/rbac/react";                 // ({ rbac, subject, permission }) → { allowed, loading }
import { useBusinessPolicy } from "@eristack/pbac/react";      // ({ pbac, policyId, input }) → { allowed, loading, reason }

<Can permission="invoices:edit" allowed={edit.allowed}><EditButton /></Can>
<BusinessPolicyGate policyId="invoice:post" allowed={invoice.allowedActions.includes("post")} fallback={<Why reason={post.reason} />}>
  <PostButton />
</BusinessPolicyGate>
```

## Checklist

1. Prefer server `allowedActions` on document payloads; hooks for user-level RBAC chrome.
2. Always pass `allowed` — default is `true`.
3. Show a skeleton while hooks are `loading`; don't flash the fallback.
4. Server still enforces (`createRequirePermission`, `createRequireBusinessPolicy`) → handle 409 `POLICY_DENIED` / `BUSINESS_POLICY_DENIED` in `onError`.
5. Fill `permission` / `policyId` — they are the audit trail even though v0 ignores them.

## Do not

- Evaluate policies inside JSX or duplicate pbac rules client-side.
- Treat a hidden button as authorization.
- Use gates for route protection or data masking.
