# Suggest: Persist TanStack Router search params per workspace tab (tab cache / navigation)

> Portable Eristack ticket — send this file to the maintainer. An agent can open it and start implementing.

## Meta

- **id:** `20261105-091600-suggestion-multitab-persist-route-search-on-tab-cache-b4e8f2`
- **kind:** suggest
- **feasibility:** possible
- **package:** `@eristack/multitab`
- **observed version:** `0.2.3`
- **created:** 2026-11-05T02:16:00.000Z
- **reporter:** Tiga Sekawan ERP (consumer)

## Summary

Workspace tabs are keyed by **pathname only**. Navigation and persistence ignore **URL search** (`?viewMode=`, `?tab=`, list filters, etc.). Re-activating a tab therefore drops document UI state that lives in TanStack Router `validateSearch`. ERP job/invoice screens need tab switches and session restore to return to the **same route + search**, not pathname defaults.

## User story

As an operator with multiple jobs open in workspace tabs, I change layout and section via query params (e.g. Financials tab). When I switch to another job and click back, I expect the same section and view mode—not a reset to Overview.

## Scenario

TanStack Router file routes with `validateSearch` (job document: `viewMode`, `tab`). `@eristack/multitab/react/tanstack` syncs tabs from pathname; tab bar activates via `navigateToTab` → `navigateToRoute(pathname)`.

## Steps to reproduce

1. Open job A at `/jobs/{idA}?viewMode=tabs&tab=financials`.
2. Open job B in another workspace tab.
3. Click job A’s tab in the workspace tab bar.

## Expected

Router location is `/jobs/{idA}?viewMode=tabs&tab=financials` (or equivalent serialized search).

## Actual (package behavior)

Router navigates to `/jobs/{idA}` only. Search resets to route defaults (`viewMode=tabs`, `tab=overview`).

## Impact

High UX friction for multi-document ERP: tab chrome implies “return to where I was,” but in-document navigation state is lost on every tab switch unless the app builds a parallel cache.

## Environment

- runtime: Vite + React 19 + TanStack Router ~1.170
- package: `@eristack/multitab@0.2.3`
- consumer: Tiga Sekawan ERP `apps/web` (`MultitabRouterProvider`, `workspace-shell.tsx`)

## Root cause (observed in published dist)

1. **`Tab` model** (`dist/core/types.d.ts`): `id`, `title`, `description`, `sequence`, `kind`, `closeGuard` — no `search` / `href`.
2. **`MultitabRouterProvider`** (`dist/react/tanstack.js`): sync uses `useRouterState({ select: (s) => s.location.pathname })` only; `useLayoutEffect` calls `syncStateForRouteVisit(state, pathname, ...)`.
3. **`navigateToRoute(routePathname)`**: `router.navigate({ to: routePathname })` — no `search`.
4. **`navigateToTab`**: `api.navigateToRoute(pathForTab(tab))` — pathname from `tab.id`.
5. **Persistence** (`loadMultitabState` / `saveMultitabState` via `storageKey`): serializes tab list metadata, not per-tab search.

Tab identity remains one pathname per document; multiple “views” of the same path cannot be distinct tabs (by design). The gap is **remembering search for that tab id** across activate/deactivate and optional reload.

## Proposed behavior

1. **Per-tab search snapshot** (optional on `Tab` or parallel map `tabId → search`):
   - On route visit while tab is active: capture `location.search` (parsed object or opaque JSON) keyed by `tab.id` (pathname).
   - When activating a tab (tab bar, MRU close navigation, `navigateToRoute` to existing tab): `router.navigate({ to: tab.id, search: restoredSearch ?? {} })`.
2. **Persistence**: include search in serialized state (backward compatible: missing → `{}`).
3. **API surface** (sketch):
   - Extend `Tab` with optional `search?: Record<string, unknown>` **or** keep `Tab` lean and store `searchByTabId` on `MultitabState`.
   - `navigateToRoute(pathname, options?: { search?: Record<string, unknown> })`.
   - `OpenTabInput` optional initial `search`.
4. **TanStack adapter**: read/write search from `useRouterState` (`location.search`), not only pathname.
5. **Docs / Intent skill**: document that pathname = tab identity; search = restorable UI state; apps with `validateSearch` should rely on multitab for tab switches.

## Fix plan

1. Extend `MultitabState` with `searchByTabId?: Readonly<Record<string, Record<string, unknown>>>` (or equivalent).
2. In TanStack provider:
   - Subscribe to `location.search`; on change, update cache for `activeTabId`.
   - On `pathname` change (tab switch), merge cached search into `router.navigate`.
3. Update `planCloseTabNavigation`, `navigateToTab`, `navigateToRoute`, `syncStateForRouteVisit` call sites to pass search when known.
4. Persistence: extend serialize/parse + `sanitizePersistedState` (strip unknown keys if needed).
5. **Tests** (headless + adapter smoke):
   - Activate tab A with search `{ tab: "financials" }`; switch to B; activate A → search restored.
   - Reload from localStorage: search survives for open tabs.
   - New tab / first visit: no cache → router defaults unchanged.
6. Changeset (minor: additive state + navigation behavior).

## Consumer workaround (shipped in Tiga Sekawan until package ships)

SessionStorage cache keyed by pathname + `MultitabSearchCacheSync` + `navigateToWorkspaceTab` in:

- `apps/web/src/lib/multitab-search-cache.ts`
- `apps/web/src/lib/multitab-search-cache-sync.tsx`
- `apps/web/src/lib/multitab-navigate.ts`
- `apps/web/src/components/workspace-shell.tsx` (tab clicks)
- `apps/web/src/components/multitab-app-shell.tsx` (sync mount)

Limitations vs library fix:

- Search not in multitab **localStorage** tab blob (sessionStorage only unless duplicated).
- `multitab.navigateToRoute(pathname)` from lists still pathname-only until sync effect runs (one-frame default search possible).
- Each app reimplements serialization; no typed coupling to route `validateSearch`.

Remove workaround after upgrading to a multitab release that owns search restore.

## Feasibility rationale

**possible** — Additive state and TanStack adapter changes; no breaking change if `search` is optional and persistence is backward compatible. Core reducer may stay pathname-centric; search is an adapter concern tied to router location.

## Agent handoff

1. Load `@eristack/multitab#multitab-core` Intent skill.
2. Reproduce with a minimal TanStack example (two routes, one with `validateSearch`).
3. Implement **Fix plan**; align `navigateToTab` and `navigateToRoute`.
4. Document in package README and multitab TanStack adapter docs.
5. Changeset + tests.

## Notes

- Related: MRU tab close ticket `20260814-071900-suggest-multitab-close-tab-activate-previous-tab-not-first-a3f21c` (may already be fixed in 0.2.x — `recentTabIds` appears in types).
- Consumer job routes: `/jobs/$jobId`, `/jobs/new` with `viewMode` (`tabs` | `stack`) and `tab` (section id).
