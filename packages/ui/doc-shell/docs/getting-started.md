---
title: Getting started
description: Document detail page shell — header, actions, body
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

function InvoicePage({ docNumber, status, children }: Props) {
  return (
    <DocShell
      header={
        <DocHeader
          title={docNumber}
          badges={<span className="rounded bg-muted px-2 py-0.5 text-sm">{status}</span>}
        />
      }
      actions={
        <DocActionBar
          leading={<button type="button">Save draft</button>}
          trailing={<button type="button">Post</button>}
        />
      }
    >
      {children}
    </DocShell>
  );
}
```

## With multitab

Wrap the app layout with `MultitabRouterProvider` so each document route opens as a tab; `DocShell` stays the **page** chrome inside the active tab panel.

## Production path

1. Doc number from `@eristack/doc-number` peek/next on create.
2. Status/actions gated with `@eristack/policy-ui` + pbac.
3. Lines in the body via `@eristack/line-grid`.

## Exports

`DocShell`, `DocHeader`, `DocActionBar`.
