---
title: Getting started
description: RBAC and PBAC gate components for ERP actions
---

# Getting started

Authorization decisions stay in `@eristack/rbac` and `@eristack/pbac` — this package renders **allowed / denied** UI.

## Install

```bash
pnpm add @eristack/policy-ui @eristack/rbac @eristack/pbac react
```

Optional peers: `rbac@^0.2.0`, `pbac@^0.2.0`.

## Gates

```tsx
import { Can, BusinessPolicyGate } from "@eristack/policy-ui";
import { useCan } from "@eristack/rbac/react";
import { useBusinessPolicy } from "@eristack/pbac/react";

function PostButton() {
  const canEdit = useCan("invoices:post");
  const policy = useBusinessPolicy("invoice:post");

  return (
    <>
      <Can permission="invoices:edit" allowed={canEdit}>
        <button type="button">Edit</button>
      </Can>
      <BusinessPolicyGate
        policyId="invoice:post"
        allowed={policy.allowed}
        fallback={<p className="text-sm text-muted">Posting not allowed in this status.</p>}
      >
        <button type="button">Post</button>
      </BusinessPolicyGate>
    </>
  );
}
```

## v0 boolean override

You may pass `allowed={false}` while wiring adapters — gates hide or show fallback without importing react hooks.

## Production path

1. Mount rbac/pbac stores (Drizzle default) on the server.
2. Expose `can` / policy checks on the session or per-route loader.
3. Pass booleans into gates on the client — do not duplicate policy logic in JSX.

## Exports

`Can`, `BusinessPolicyGate`.
