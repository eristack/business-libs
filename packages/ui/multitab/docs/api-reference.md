---
title: API reference
description: Core and React exports
---

# API reference

## Core (`@eristack/multitab`)

### State

- `initialMultitabState` — empty workspace
- `multitabReducer(state, action)` — pure reducer
- `createTabWorkspace({ initialState? })` — headless store with `dispatch` / `subscribe`
- `openTab`, `openRouteTabAdjacent`, `openNewTab`, `closeTab`, `activateTab`, `reorderTab`, `replaceTab`, `ensureTab`, `updateTab`, `setTabCloseGuard`
- `findTabById`, `planRouteTabOpen`
- `canCloseTab(tab, { force? })` — respects `closeGuard`

### Routes

- `routeTabId(pathname)` — strip trailing slash (except `/`)
- `parseMultitabRoute(pathname)` — `{ kind: 'empty' | 'new' | 'route' }`
- `activeTabIdFromRoute(pathname, resolveTabId?)`
- `syncStateForRouteVisit(state, pathname, resolveRouteTab, resolveTabId?)`
- `planCloseTabNavigation(state, tabId)` → `{ nextState, nextPath }`
- `planOpenNewTabNavigation(state, input?)` → `{ nextState, nextPath, tabId }`
- `pathForTab(tab)`, `emptyTabPath()`, `newTabPath(tabId)`

### Persistence

- `serializeMultitabState` / `parseMultitabState`
- `sanitizePersistedState`
- `loadMultitabState(read)` / `saveMultitabState(state, write)`

### Types

- `Tab`, `TabKind`, `MultitabState`, `MultitabAction`, `OpenTabInput`
- `RouteTabResolver`, `BeforeCloseHandler`

## React (`@eristack/multitab/react`)

- `MultitabProvider({ children, initialState?, storageKey? })`
- `useMultitab()` → `MultitabApi`
- `closeTab(id, { force? })` — skips when `closeGuard` is set

## TanStack Router (`@eristack/multitab/react/tanstack`)

- `MultitabRouterProvider({ resolveRouteTab, resolveTabId?, storageKey?, beforeClose? })`
- `useMultitabRouter()` → `MultitabRouterApi`
- `navigateToTab(api, tab)` — activate by navigating to tab path

### MultitabRouterApi highlights

| Method | Behavior |
| --- | --- |
| `navigateToRoute(pathname)` | Optimistic path + router.navigate |
| `openNewTab()` | Creates uuid tab at `/new/{id}` |
| `closeTab(id, options?)` | Plans next path; honors guard + `beforeClose` |
| `replaceTab(tabId, input)` | Converts new → route; navigates when route |
