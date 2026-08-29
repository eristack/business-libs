---
title: Getting started
description: Wire multitab into a TanStack Router ERP shell
---

# Getting started

## Install

```bash
pnpm add @eristack/multitab @tanstack/react-router react
```

## Router-integrated shell (recommended)

Wrap your app layout with `MultitabRouterProvider`. The provider syncs open tabs from the current pathname and persists tab lists to `localStorage`.

```tsx
import {
  MultitabRouterProvider,
  useMultitabRouter,
  navigateToTab,
} from "@eristack/multitab/react/tanstack";

const resolveRouteTab = (pathname: string) => {
  if (pathname === "/inventory/products") {
    return { title: "Products", description: "Catalog" };
  }
  if (pathname.startsWith("/inventory/products/")) {
    return { title: "Product detail", description: pathname };
  }
  return null;
};

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <MultitabRouterProvider
      storageKey="erp.multitab"
      resolveRouteTab={resolveRouteTab}
      beforeClose={async (tab) => {
        if (!tab.closeGuard) return true;
        return window.confirm(`Close ${tab.title}? Unsaved changes may be lost.`);
      }}
    >
      <TabChrome />
      {children}
    </MultitabRouterProvider>
  );
}

function TabChrome() {
  const multitab = useMultitabRouter();

  return (
    <div role="tablist">
      {multitab.tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={tab.id === multitab.activeTabId}
          onClick={() => navigateToTab(multitab, tab)}
        >
          {tab.title}
          {tab.closeGuard ? " *" : null}
        </button>
      ))}
      <button type="button" onClick={() => multitab.openNewTab()}>
        +
      </button>
    </div>
  );
}
```

## State-only mode

When you manage routing yourself, use `MultitabProvider`:

```tsx
import { MultitabProvider, useMultitab } from "@eristack/multitab/react";

function Workspace() {
  return (
    <MultitabProvider storageKey="demo.multitab">
      <Inner />
    </MultitabProvider>
  );
}

function Inner() {
  const multitab = useMultitab();

  return (
    <button
      type="button"
      onClick={() =>
        multitab.openTab({
          id: "/sales/orders",
          title: "Orders",
          kind: "route",
        })
      }
    >
      Open orders
    </button>
  );
}
```

## Headless core

For tests or non-React hosts:

```ts
import { createTabWorkspace, planCloseTabNavigation } from "@eristack/multitab";

const workspace = createTabWorkspace();
workspace.dispatch({
  type: "open",
  input: { id: "/home", title: "Home", kind: "route" },
});
```

## Dirty tabs

Call `setTabCloseGuard(id, true)` when a form becomes dirty. `closeTab` respects guards unless `{ force: true }`. With `beforeClose` on the router provider, prompt before navigating away.

## Replace new tab with a route

When the user picks a module from the new-tab picker:

```tsx
multitab.replaceTab(newTabId, {
  id: "/operations/jobs/:id",
  title: "Job 1001",
  kind: "route",
});
```

This converts `/new/{uuid}` into a real document tab and navigates to the route.
