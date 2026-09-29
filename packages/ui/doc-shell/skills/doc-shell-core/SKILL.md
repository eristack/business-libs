---
name: doc-shell-core
description: >
  @eristack/doc-shell presentational document page chrome: DocShell { header, actions, children },
  DocHeader { title, subtitle, badges }, DocActionBar { leading, trailing } with stable erista-doc-*
  CSS hooks and data-component attributes. Use for invoice/PO/job detail routes (with line-grid,
  policy-ui gates, multitab tabs). No state, no styles shipped, no pbac logic — app owns those.
metadata:
  author: eristack
  version: "0.1"
  type: core
  library: "@eristack/doc-shell"
sources:
  - packages/ui/doc-shell/docs/getting-started.md
---

# @eristack/doc-shell

Three slots, three components, zero logic.

```tsx
import { DocShell, DocHeader, DocActionBar } from "@eristack/doc-shell";

<DocShell
  header={<DocHeader title={invoice.number} subtitle={partnerName} badges={<StatusBadge />} />}
  actions={<DocActionBar leading={<SaveDraft />} trailing={<BusinessPolicyGate allowed={canPost}><Post /></BusinessPolicyGate>} />}
>
  <HeaderFields />        {/* form-ui inputs */}
  <LineGrid … />          {/* @eristack/line-grid */}
</DocShell>
```

## Checklist

1. One `DocShell` per document route; inside a multitab panel if the app uses tabs.
2. Title = doc number (`@eristack/doc-number` peekNext on create); badges = status.
3. Action buttons wrapped in `@eristack/policy-ui` gates; `allowed` from pbac hook or server payload.
4. Actions call `@eristack/opinion` `PATCH /:id/:action` with `expectedVersion`; 409 banner in body.
5. Style `.erista-doc-shell*`, `.erista-doc-header*`, `.erista-doc-action-bar*` with design-system tokens — v0 ships no CSS.

## Do not

- Put fetching, pbac evaluation, or form state in the shell.
- Nest `DocShell` inside `DocShell`.
- Select on `data-component` for styling (tests only).
- Use it for list pages (`@eristack/list-shell`) or dialogs.
