---
name: multitab-core
description: >
  @eristack/multitab: headless multi-tab workspace for React ERP screens — tab
  model, closeGuard, TanStack Router sync. UI chrome stays in the app.
metadata:
  type: core
  library: "@eristack/multitab"
  library_version: "0.1.0"
sources:
  - "eristack/business-libs:packages/ui/multitab/docs/index.md"
  - "eristack/business-libs:packages/ui/multitab/docs/getting-started.md"
  - "eristack/business-libs:packages/ui/multitab/docs/architecture.md"
---

# Multitab core

Headless tab engine for document-heavy ERP UIs. **Behavior + navigation plans**; your design system owns rendering.

## When to use

- Multi-document ERP shell (PO, SO, invoice tabs on one page)
- TanStack Router apps that need `/new/{uuid}` placeholders and pathname-keyed tabs
- Prototypes that must persist open tabs across refresh (`storageKey`)

## Entry points

| Import | Role |
| --- | --- |
| `@eristack/multitab` | Reducer, routes, persistence, `createTabWorkspace` |
| `@eristack/multitab/react` | `MultitabProvider` — state-only |
| `@eristack/multitab/react/tanstack` | `MultitabRouterProvider` — URL source of truth |

## Defaults

1. **Route tabs** — tab `id` is normalized pathname (`routeTabId`); distinct params = distinct tabs.
2. **New tabs** — `/new/{uuid}` with `kind: 'new'` until `replaceTab` assigns a route.
3. **Adjacent open** — visiting a detail route inserts after the active tab (not at end).
4. **Persistence** — optional `storageKey`; sanitizes legacy ids on load.
5. **Dirty close** — `setTabCloseGuard(id, true)`; `closeTab(id, { force: true })` to bypass; router `beforeClose` for prompts.

## Do not

- Duplicate tab state in app Zustand — use `useMultitabRouter` or `useMultitab`
- Use non-path ids for route tabs (breaks deep links)
- Skip `resolveRouteTab` — unknown paths clear active tab without opening junk tabs

## Quick wire (TanStack Router)

```tsx
<MultitabRouterProvider
  storageKey="erp.multitab"
  resolveRouteTab={(pathname) =>
    pathname === "/orders" ? { title: "Orders" } : null
  }
>
  {children}
</MultitabRouterProvider>
```

Load `@eristack/multitab#multitab-core` before scaffolding ERP shell tab chrome.
