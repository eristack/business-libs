---
title: Getting started
description: Wire DocShell, DocHeader, and DocActionBar into an invoice route — status badges, policy-gated actions, QUPS lines, multitab, and the CSS you own.
---

# Getting started

Use on **document with lines** routes with `@eristack/line-grid` and `@eristack/ai-knowledge#document-lines-erp`.

## Install

```bash
pnpm add @eristack/doc-shell @eristack/design-system react
```

Peers: `design-system@^0.1.0`. Optional: `@eristack/multitab@^0.2.0` for tabbed workspaces.

## Shell

```tsx
import { DocShell, DocHeader, DocActionBar } from "@eristack/doc-shell";
import { BusinessPolicyGate } from "@eristack/policy-ui";

function InvoicePage({ invoice, canPost, onSave, onPost, children }: Props) {
  return (
    <DocShell
      header={
        <DocHeader
          title={invoice.number}
          subtitle={invoice.partnerName}
          badges={<span className="rounded bg-muted px-2 py-0.5 text-sm">{invoice.status}</span>}
        />
      }
      actions={
        <DocActionBar
          leading={<button type="button" onClick={onSave}>Save draft</button>}
          trailing={
            <BusinessPolicyGate policyId="invoice:post" allowed={canPost}>
              <button type="button" onClick={onPost}>Post</button>
            </BusinessPolicyGate>
          }
        />
      }
    >
      {children}
    </DocShell>
  );
}
```

`canPost` comes from `@eristack/pbac/react` `useBusinessPolicy({ pbac, policyId, input }).allowed` (or the server's `allowedActions` on the document payload). The shell never decides.

## Body: fields + lines

```tsx
<InvoicePage invoice={invoice} canPost={canPost} onSave={save} onPost={post}>
  <section className="grid grid-cols-2 gap-4">
    <TimestampWallInput label="Invoice date" … />          {/* @eristack/form-ui */}
    <PartnerPicker … />                                     {/* app */}
  </section>
  <LineGrid line={line} columns={cols} renderCell={renderLineCell} />  {/* @eristack/line-grid */}
</InvoicePage>
```

## With multitab

Wrap the app layout with `MultitabRouterProvider` so each document route opens as a tab; `DocShell` stays the **page** chrome inside the active tab panel. Do not nest a second `DocShell` for sub-documents — open them as tabs.

## Minimal CSS (you own it)

v0 ships **no stylesheet**. A starting point using design-system tokens (HSL triplets, so wrap in `hsl()`; gap follows the active density):

```css
.erista-doc-shell { display: flex; flex-direction: column; gap: var(--erista-density-gap-comfortable); }
.erista-doc-shell__actions { position: sticky; top: 0; z-index: 1; background: hsl(var(--erista-color-background)); border-bottom: 1px solid hsl(var(--erista-color-border)); }
.erista-doc-header { display: flex; align-items: baseline; gap: var(--erista-density-gap-comfortable); }
.erista-doc-header__title { font-size: 1.125rem; font-weight: 600; }
.erista-doc-header__subtitle { color: hsl(var(--erista-color-muted-foreground)); }
.erista-doc-action-bar { display: flex; justify-content: space-between; padding: var(--erista-density-gap-compact) 0; }
```

## Production path

1. Doc number from `@eristack/doc-number` `peekNext` for the title on create; `next` on save.
2. Status/actions gated with `@eristack/policy-ui` + pbac; transitions via `@eristack/opinion` `PATCH /:id/:action`.
3. Lines in the body via `@eristack/line-grid`.
4. Optimistic lock: send `expectedVersion`, render a 409 `CONFLICT_VERSION` banner above the body (`@eristack/ai-knowledge#optimistic-document-version`).

## Gotchas

- Slots render nothing when omitted — `DocShell` with only `children` is a plain body wrapper.
- `DocHeader.title` is a `ReactNode`, so a loading skeleton is fine; but keep it a single line for multitab tab labels.
- Class names are stable public API; `data-component` attributes are for tests, not styling.

## Testing

```tsx
render(<DocShell header={<DocHeader title="INV-1" />}>body</DocShell>);
expect(screen.getByText("INV-1").closest("[data-component='doc-header']")).toBeTruthy();
```

## Exports

`DocShell`, `DocHeader`, `DocActionBar` + `DocShellProps`, `DocHeaderProps`, `DocActionBarProps`.
