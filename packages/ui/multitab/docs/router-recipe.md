---
title: TanStack Router recipe
description: Full-file wiring for MultitabRouterProvider in an ERP shell
sidebar_position: 3
---

# TanStack Router recipe

Copy this pattern when the URL is the source of truth and tabs mirror open documents.

```tsx
// routes/__root.tsx
import { createRootRoute, Outlet } from "@tanstack/react-router";
import {
  MultitabRouterProvider,
  useMultitabRouter,
  navigateToTab,
} from "@eristack/multitab/react/tanstack";

const resolveRouteTab = (pathname: string) => {
  const job = pathname.match(/^\/jobs\/([^/]+)$/);
  if (job) return { title: `Job ${job[1]}`, description: pathname };
  if (pathname === "/jobs") return { title: "Jobs", description: "List" };
  return null;
};

function TabBar() {
  const multitab = useMultitabRouter();
  return (
    <nav role="tablist">
      {multitab.tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={tab.id === multitab.activeTabId}
          onClick={() => navigateToTab(multitab, tab)}
        >
          {tab.title}
        </button>
      ))}
      <button type="button" onClick={() => multitab.openNewTab()}>
        New tab
      </button>
    </nav>
  );
}

function RootLayout() {
  return (
    <MultitabRouterProvider
      storageKey="erp.multitab.v1"
      resolveRouteTab={resolveRouteTab}
      beforeClose={async (tab) => {
        if (!tab.closeGuard) return true;
        return window.confirm(`Close ${tab.title}?`);
      }}
    >
      <TabBar />
      <Outlet />
    </MultitabRouterProvider>
  );
}

export const Route = createRootRoute({ component: RootLayout });
```

## Route visit sync

`MultitabRouterProvider` calls `syncStateForRouteVisit` on navigation — route tabs open adjacent to the active tab; `/new/{uuid}` placeholders stay until `replaceTab`.

## TanStack Router search (validateSearch)

Tab **identity** stays the normalized pathname (`tab.id`). In-document UI state (filters, section tabs, layout mode) usually lives in TanStack Router **`search`**.

The TanStack adapter:

1. Caches `location.search` on `MultitabState.searchByTabId` while a route tab is active.
2. Restores cached search when you activate a tab (`navigateToTab`, `navigateToRoute`, MRU close navigation).
3. Persists `searchByTabId` with `storageKey` (older saved blobs without it still load).

Apps with `validateSearch` on document routes should rely on multitab for tab switches — do not duplicate a parallel pathname cache unless you need pre-upgrade compatibility.

Optional explicit search when opening:

```ts
multitab.navigateToRoute("/jobs/abc", {
  search: { viewMode: "tabs", tab: "financials" },
});
```

## Close navigation

Use `planCloseTabNavigation` when closing the active tab so the router lands on the next tab or empty workspace:

```ts
import { planCloseTabNavigation } from "@eristack/multitab";

const plan = planCloseTabNavigation(state, tabId);
if (plan.navigateTo) router.navigate({ to: plan.navigateTo });
```

## Session persistence

For shared terminals, swap `storageKey` persistence for `loadMultitabFromSessionStorage` / `saveMultitabToSessionStorage` — see [Getting started](./getting-started.md#session-only-persistence).
