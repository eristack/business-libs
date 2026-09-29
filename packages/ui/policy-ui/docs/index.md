---
title: Overview
description: Two React gate components — `Can` for RBAC permissions and `BusinessPolicyGate` for pbac document rules — that render children or a fallback from a boolean. Decisions stay in @eristack/rbac and @eristack/pbac.
---

# @eristack/policy-ui

Authorization has two questions in an ERP: **who** may do this (`@eristack/rbac`) and **whether the document allows it right now** (`@eristack/pbac`). Both already return booleans. `@eristack/policy-ui` is the JSX for those booleans: `<Can>` and `<BusinessPolicyGate>` show children when allowed, a fallback otherwise, so every screen expresses gating the same way and reviewers can grep for it.

v0 is deliberately dumb: the components read `allowed` and nothing else. `permission` / `policyId` props are **labels** today (they document intent, power tests, and will bind to context providers later) — they do not evaluate anything.

## Use it when

- Hiding or disabling actions (Post, Approve, Delete) on document pages and list toolbars.
- You want the RBAC/pbac decision made once (hook or server payload) and rendered consistently.
- Writing UI tests that assert "Post is not offered in status paid".

## Not for

- Route protection — do that in the router loader / server; a hidden button is not security.
- Evaluating policies — `@eristack/rbac` `useCan`, `@eristack/pbac` `useBusinessPolicy`, or the API's `allowedActions`.
- Field-level read masking — that is a data concern (omit fields server-side).

## Install

```bash
pnpm add @eristack/policy-ui react
# optional, for the hooks that produce `allowed`:
pnpm add @eristack/rbac @eristack/pbac
```

Peers: `react`; optional `@eristack/rbac ^0.2.0`, `@eristack/pbac ^0.2.0`.

## 30-second example

```tsx
import { Can, BusinessPolicyGate } from "@eristack/policy-ui";

<Can permission="invoices:edit" allowed={session.can("invoices:edit")}>
  <EditButton />
</Can>

<BusinessPolicyGate
  policyId="invoice:post"
  allowed={invoice.allowedActions.includes("post")}
  fallback={<span className="text-muted">Cannot post in status {invoice.status}</span>}
>
  <PostButton />
</BusinessPolicyGate>
```

## API

| Export | Props | Behaviour |
| --- | --- | --- |
| `Can` | `{ permission?: string; allowed?: boolean; children; fallback?: ReactNode }` | `allowed` defaults to **`true`**; renders `children` when true, else `fallback` (default `null`). `permission` is informational in v0. |
| `BusinessPolicyGate` | `{ policyId?: string; allowed?: boolean; children; fallback?: ReactNode }` | Same semantics; `policyId` informational in v0. |

Both render fragments — no wrapper element, no class names.

## Works with

- `@eristack/rbac/react` — `useCan({ rbac, subject, permission })` → `{ allowed, loading }`.
- `@eristack/pbac/react` — `useBusinessPolicy({ pbac, policyId, input })` → `{ allowed, loading, reason }`; pass `reason` into `fallback`.
- `@eristack/opinion` — `PATCH /:id/:action` returns 409 `POLICY_DENIED` / `BUSINESS_POLICY_DENIED` if the UI was stale; still handle it.
- `@eristack/doc-shell` — gates live in `DocActionBar`.

## For agents

- Skill: `pnpm dlx @tanstack/intent@latest load @eristack/policy-ui#policy-ui-core`
- Recipes: `erp-ui-shell`; policy logic via `access-control-stack` and `document-status-transitions`.

## Next

- [Getting started](./getting-started.md) — hooks → gates, loading state, server-driven `allowedActions`, and why hidden ≠ forbidden.
