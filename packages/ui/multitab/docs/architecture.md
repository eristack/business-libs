---
title: Architecture
description: Core vs React vs TanStack Router responsibilities
---

# Architecture

## Separation of concerns

```text
┌─────────────────────────────────────────────────────────┐
│  Your app: tab bar UI, keyboard shortcuts, form dirty   │
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│  @eristack/multitab/react/tanstack                      │
│  MultitabRouterProvider — pathname sync, navigate plans │
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│  @eristack/multitab/react                               │
│  MultitabProvider — useReducer + optional localStorage  │
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│  @eristack/multitab (core)                              │
│  state · routes · persistence · createTabWorkspace      │
└─────────────────────────────────────────────────────────┘
```

## Core modules

| Module | Responsibility |
| --- | --- |
| `state.ts` | Reducer actions: open, close, reorder, replace, ensure |
| `mru.ts` | Activation history (`recentTabIds`) and MRU pick on close |
| `routes.ts` | Parse `/`, `/new/{uuid}`, module paths; navigation plans |
| `persistence.ts` | Serialize/sanitize localStorage payloads |
| `workspace.ts` | New-tab ids, `closeGuard` helpers |
| `create-workspace.ts` | Headless `createTabWorkspace()` store |

## Route-as-source-of-truth

With TanStack Router, **the URL decides the active tab**. `syncStateForRouteVisit` runs on every pathname change:

1. `/` → clear active tab (tabs remain open)
2. `/new/{uuid}` → ensure placeholder tab exists
3. `/module/...` → `resolveRouteTab(pathname)` supplies title; tab id is normalized pathname

Adjacent insert: visiting a detail route while a list tab is active inserts the detail tab **after** the list tab (browser-like behavior).

## Persistence

Saved state drops invalid entries:

- Legacy `__new__:*` ids
- New tabs without UUID ids
- Route tabs whose id does not start with `/`

Active tab id is revalidated against remaining tabs on load. Optional `recentTabIds` (MRU stack) is persisted for browser-like close behavior.

## MRU close

`MultitabState` tracks `recentTabIds` — previous activations, newest first. When the **active** tab closes:

1. Walk `recentTabIds` and activate the first id still open
2. If none, fall back to the tab **left** of the closed tab (then last tab)

Closing the last tab still navigates to `/` with an empty workspace.

## Edge cases covered in tests

- Reactivate existing tab without duplicating or overwriting title
- Close last tab → empty workspace + navigate to `/`
- Close active tab → **MRU** tab becomes active (not `tabs[0]`)
- `replaceTab` when target id already exists on another tab
- `ensureTab` adds without stealing focus
- Trailing slash normalization on tab ids
- Invalid JSON persistence → null (fresh start)

## Non-goals

- Tab panel rendering or animation
- Scroll/form snapshot serializers (app-owned)
- Server data fetching (TanStack Query stays in the app)
