---
title: Overview
description: Presentational shell for ERP document detail pages — header, action bar, and body slots with stable `erista-doc-*` CSS hooks. Document state, pbac, and routing stay in the app.
---

# @eristack/doc-shell

A document page (invoice, purchase order, job) always has the same three regions: a **header** (number, subtitle, status badges), an **action bar** (save / post / cancel), and a **body** (fields + lines). `@eristack/doc-shell` gives those regions names — as React slots and as stable CSS class hooks — so every document route in an app, and every app in a company, lays out the same way.

It renders `div`s and a `header`. No state, no fetching, no policy logic. Style through `@eristack/design-system` tokens or your own CSS targeting the `erista-doc-*` classes.

## Use it when

- Building a document-with-lines route (`@eristack/ai-knowledge#document-lines-erp`).
- You want `DocHeader` + `DocActionBar` placement to be identical across 20 document types.
- The page lives inside `@eristack/multitab` and needs a consistent inner chrome.

## Not for

- Lists — `@eristack/list-shell`.
- Modal / drawer editors — the shell assumes a full page (or a tab panel).
- Layout logic like sticky action bars or responsive collapse — add CSS on the hooks; v0 ships no styles.

## Install

```bash
pnpm add @eristack/doc-shell @eristack/design-system react
```

Peers: `@eristack/design-system ^0.1.0`, `react ^18 || ^19`. Optional: `@eristack/multitab ^0.2.0`.

## 30-second example

```tsx
import { DocShell, DocHeader, DocActionBar } from "@eristack/doc-shell";

<DocShell
  header={<DocHeader title="INV-2026-000123" subtitle="Acme Pte Ltd" badges={<StatusBadge status="draft" />} />}
  actions={<DocActionBar leading={<SaveDraftButton />} trailing={<PostButton />} />}
>
  <InvoiceHeaderFields />
  <InvoiceLines />
</DocShell>
```

## API

| Export | Props | Renders |
| --- | --- | --- |
| `DocShell` | `{ header?, actions?, children }` | `.erista-doc-shell` → `__header`, `__actions`, `__body` (slots omitted when not passed) |
| `DocHeader` | `{ title, subtitle?, badges? }` (all `ReactNode`) | `<header class="erista-doc-header">` → `__title`, `__subtitle`, `__badges` |
| `DocActionBar` | `{ leading?, trailing? }` | `.erista-doc-action-bar` → `__leading`, `__trailing` |

Every root element also carries `data-component="doc-shell" | "doc-header" | "doc-action-bar"` for tests and e2e selectors.

## Works with

- `@eristack/line-grid` — QUPS lines in the body.
- `@eristack/policy-ui` — wrap action buttons in `BusinessPolicyGate` / `Can`.
- `@eristack/doc-number` — `peekNext` for the header title on create.
- `@eristack/doc-transitions` + `@eristack/opinion` — the actions call `PATCH /:id/:action`.
- `@eristack/multitab` — `DocShell` is the content of one tab panel.

## For agents

- Skill: `pnpm dlx @tanstack/intent@latest load @eristack/doc-shell#doc-shell-core`
- Recipe: `erp-ui-shell`. Cross-package composition: `@eristack/ai-knowledge#ui-package-stack`.

## Next

- [Getting started](./getting-started.md) — full invoice route with header fields, gates, lines, multitab, and the minimal CSS.
