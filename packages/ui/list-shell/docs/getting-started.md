---
title: Getting started
description: List page layout, toolbar, and Query state banners
---

# Getting started

Compose with `@eristack/data-grid/react` — this package does not parse filters or fetch rows. Stack: `@eristack/ai-knowledge#ui-package-stack`.

## Install

```bash
pnpm add @eristack/list-shell @eristack/design-system @eristack/data-grid @tanstack/react-query react
```

Peers: `design-system@^0.1.0`, `data-grid@^0.2.0`, `@tanstack/react-query@^5`.

## Layout

```tsx
import { useDataGridList } from "@eristack/data-grid/react";
import { ListPageLayout, ListToolbar, QueryStateBanner } from "@eristack/list-shell";

function PartnersPage() {
  const query = useDataGridList({ basePath: "/api/partners", columns: partnerColumns });

  return (
    <ListPageLayout
      toolbar={
        <ListToolbar
          leading={<h1 className="text-lg font-semibold">Partners</h1>}
          trailing={<button type="button">New partner</button>}
        />
      }
      banner={
        <QueryStateBanner
          isLoading={query.isLoading}
          isError={query.isError}
          errorMessage={query.error?.message}
        />
      }
    >
      <PartnersTable rows={query.data?.items ?? []} />
    </ListPageLayout>
  );
}
```

## URL sync

Drive `useDataGridList` `search` from TanStack Router `useSearch` — use `fromSearch` / `toSearch` from `@eristack/data-grid` so filters match the backend list action.

## Production path

1. Express/Nest list route with `createDataGridListAction` or Drizzle `executeDrizzleList`.
2. Router search params ↔ data-grid JSON.
3. Optional `@eristack/filter-builder` above the table.
4. Export via `@eristack/spreadsheet-render` in the app — not in list-shell.

## Exports

`ListPageLayout`, `ListToolbar`, `QueryStateBanner`.
