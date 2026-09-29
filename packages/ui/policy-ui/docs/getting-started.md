---
title: Getting started
description: Feed RBAC and pbac booleans into Can and BusinessPolicyGate — from React hooks or a server-computed allowedActions list — with loading handling and the 409 fallback path.
---

# Getting started

Authorization decisions stay in `@eristack/rbac` and `@eristack/pbac` — this package renders **allowed / denied** UI.

## Install

```bash
pnpm add @eristack/policy-ui react
pnpm add @eristack/rbac @eristack/pbac       # if you use the hooks below
```

Optional peers: `rbac@^0.2.0`, `pbac@^0.2.0`.

## Option A — hooks on the client

```tsx
import { Can, BusinessPolicyGate } from "@eristack/policy-ui";
import { useCan } from "@eristack/rbac/react";
import { useBusinessPolicy } from "@eristack/pbac/react";

function InvoiceActions({ invoice, session }: Props) {
  const edit = useCan({ rbac, subject: session.userId, permission: "invoices:edit" });
  const post = useBusinessPolicy({ pbac, policyId: "invoice:post", input: { document: invoice } });

  if (edit.loading || post.loading) return <ActionsSkeleton />;

  return (
    <>
      <Can permission="invoices:edit" allowed={edit.allowed}>
        <button type="button">Edit</button>
      </Can>
      <BusinessPolicyGate
        policyId="invoice:post"
        allowed={post.allowed}
        fallback={<p className="text-sm text-muted">{post.reason ?? "Posting not allowed in this status."}</p>}
      >
        <button type="button">Post</button>
      </BusinessPolicyGate>
    </>
  );
}
```

`rbac` / `pbac` are the app's `createRbac(...)` / `createPbac(...)` instances (usually from a context provider). Both hooks start with `allowed: false, loading: true` — render a skeleton rather than flashing a denied fallback.

## Option B — server-computed `allowedActions` (recommended for documents)

Let the API answer once per document instead of re-running policies in the browser:

```ts
// GET /invoices/:id → { …invoice, allowedActions: ["edit", "post"] }
```

```tsx
<BusinessPolicyGate policyId="invoice:post" allowed={invoice.allowedActions.includes("post")}>
  <PostButton />
</BusinessPolicyGate>
```

Fewer round-trips, identical result to what `PATCH /:id/post` will enforce, and no pbac bundle on the client.

## v0 boolean override

While wiring adapters you may pass `allowed={false}` (or omit it → `true`) — gates hide or show the fallback without importing any hooks. **Default is `true`**: a gate with no `allowed` prop shows its children. Never ship a gate without a real `allowed` source.

## Hidden is not forbidden

Gates are UX. The server must still enforce:

- `@eristack/rbac/express` `createRequirePermission` → 403/409 on deny.
- `@eristack/pbac/express` `createRequireBusinessPolicy` → 409 `BUSINESS_POLICY_DENIED`.

Handle those responses in the mutation's `onError` (stale tab, concurrent status change) — see `@eristack/ai-knowledge#http-errors`.

## Production path

1. Mount rbac/pbac stores (Drizzle default) on the server.
2. Expose `can` / policy checks on the session or the document payload (`allowedActions`).
3. Pass booleans into gates on the client — do not duplicate policy logic in JSX.
4. Keep `permission` / `policyId` props filled in: they are the grep-able audit trail of what each button requires.

## Gotchas

- `allowed` defaults to `true`; forgetting the prop silently allows.
- The components render fragments — wrap in your own element if you need layout.
- Disabling instead of hiding: pass `allowed` to your button's `disabled` and leave the gate always-on, or render a disabled button in `fallback`.
- `permission` / `policyId` do **not** evaluate anything in v0.

## Testing

```tsx
render(<Can permission="x" allowed={false} fallback="nope">yes</Can>);
expect(screen.getByText("nope")).toBeInTheDocument();
```

## Exports

`Can`, `BusinessPolicyGate` + `CanProps`, `BusinessPolicyGateProps`.
