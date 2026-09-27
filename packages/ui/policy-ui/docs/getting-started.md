# Getting started

```bash
pnpm add @eristack/policy-ui @eristack/rbac @eristack/pbac react
```

```tsx
import { Can, BusinessPolicyGate } from "@eristack/policy-ui";

<Can permission="partners:edit" allowed={canEdit}>
  <button>Edit</button>
</Can>

<BusinessPolicyGate policyId="invoice:post" allowed={policyOk} fallback={<p>Blocked</p>}>
  <button>Post</button>
</BusinessPolicyGate>
```

v0 uses the `allowed` boolean until `useCan` / `useBusinessPolicy` are wired from rbac/pbac react adapters.
