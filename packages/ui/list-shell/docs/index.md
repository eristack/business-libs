---
title: Overview
description: Presentational list page layout — toolbar, query state banner, body — for @eristack/data-grid + TanStack Query lists, with stable `erista-list-*` CSS hooks and no fetching or filter logic.
---

# @eristack/list-shell

Every ERP list page has a title row with actions, a strip for loading / error / empty state, and the table. `@eristack/list-shell` names those three regions (`ListPageLayout` slots), gives the toolbar a leading/trailing split (`ListToolbar`), and turns TanStack Query flags into one accessible banner (`QueryStateBanner`). Nothing else: no fetching, no filter parsing, no table.

Pair it with `@eristack/data-grid/react` `useDataGridList` for data and `@eristack/filter-builder` for filter chrome.

## Use it when

- Building a list route (partners, invoices, stock) that should look like every other list route.
- You want `isLoading` / `isError` / empty handled once with `role="status"` / `role="alert"` semantics.
- Reusing the same page frame inside `@eristack/master-detail`'s master pane.

## Not for

- Document pages — `@eristack/doc-shell`.
- The table itself — bring shadcn `DataTable`, TanStack Table, or plain `<table>`.
- Data fetching, filters, sorting, pagination — `@eristack/data-grid`.
- Export buttons' implementation — `@eristack/spreadsheet-render` in the app.

## Install

```bash
pnpm add @eristack/list-shell @eristack/design-system @eristack/data-grid @tanstack/react-query react
```

Peers: `@eristack/design-system ^0.1.0`, `@eristack/data-grid ^0.2.0`, `@tanstack/react-query ^5`, `react`.

## 30-second example

```tsx
import { useDataGridList } from "@eristack/data-grid/react";
import { ListPageLayout, ListToolbar, QueryStateBanner } from "@eristack/list-shell";

const list = useDataGridList<Partner>({ schema: partnerSchema, client: partnerClient });

<ListPageLayout
  toolbar={<ListToolbar leading={<h1>Partners</h1>} trailing={<button>New partner</button>} />}
  banner={<QueryStateBanner isLoading={list.isLoading} isError={list.isError} isEmpty={list.items.length === 0} errorMessage={list.error?.message} />}
>
  <PartnersTable rows={list.items} />
</ListPageLayout>
```

## API

| Export | Props | Renders |
| --- | --- | --- |
| `ListPageLayout` | `{ toolbar?, banner?, children }` | `.erista-list-page` → `__toolbar`, `__banner`, `__body` (omitted slots not rendered) |
| `ListToolbar` | `{ leading?, trailing?, children? }` | `.erista-list-toolbar` → `__leading`, children (unwrapped, centre), `__trailing` |
| `QueryStateBanner` | `{ isLoading?, isError?, isEmpty?, loadingMessage? = "Loading…", errorMessage? = "Something went wrong.", emptyMessage? = "No results." }` | Precedence loading → error → empty → `null`. `.erista-query-banner[data-state=loading\|error\|empty]`; loading has `role="status"`, error `role="alert"`. |

All roots carry `data-component` for tests.

## Works with

- `@eristack/data-grid/react` — `useDataGridList` returns `items`, `pageInfo`, `isLoading`, `isError`, `error`, plus the controller (`setPage`, `sortBy`, filter draft).
- `@eristack/filter-builder` — `FilterChipBar` as the first child of the body.
- `@eristack/master-detail` — a `ListPageLayout` as `master`.
- `@eristack/policy-ui` — gate the trailing "New" action.
- `@eristack/design-system` — density gap tokens for toolbar spacing.

## For agents

- Skill: `pnpm dlx @tanstack/intent@latest load @eristack/list-shell#list-shell-core`
- Recipes: `erp-ui-shell`, `data-grid-lists`. Composition: `@eristack/ai-knowledge#ui-package-stack`.

## Next

- [Getting started](./getting-started.md) — list route with data-grid client, Router search sync, pagination and sort controls in the toolbar, empty-state CTA, and the CSS you own.
