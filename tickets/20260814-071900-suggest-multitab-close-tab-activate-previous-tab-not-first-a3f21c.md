# Suggest: Closing active tab should activate the previously active tab (MRU), not the first tab

> Portable Eristack ticket — send this file to the maintainer. An agent can open it and start implementing.

## Meta

- **id:** `20260814-071900-suggest-multitab-close-tab-activate-previous-tab-not-first-a3f21c`
- **kind:** suggest
- **feasibility:** possible
- **package:** `@eristack/multitab`
- **observed version:** `0.1.0`
- **created:** 2026-08-14T07:19:00.000Z
- **reporter:** Tiga Sekawan ERP (consumer)

## Summary

When the user closes the **currently active** tab, `@eristack/multitab` activates the **first tab in tab order** (`tabs[0]`) instead of the **previously active tab** (most-recently-used / activation history). ERP-style workspaces expect browser-like behavior: close tab → return to where you were, not jump to the leftmost tab.

## Scenario

Multi-tab ERP workspace (Products, Purchase Orders, Dashboard, etc.) with TanStack Router sync. User opens several tabs, switches between them, then closes the active tab. Expectation matches Chrome/VS Code: land on the tab they were on immediately before the closed one.

## Steps to reproduce

1. Open three route tabs in order, e.g. `/inventory/products`, `/procurement/purchase-orders`, `/dashboard`.
2. Click the **middle** tab (Purchase Orders) so it is active.
3. Click the **last** tab (Dashboard) so it is active.
4. Close Dashboard (the active tab) via tab chrome `closeTab`.

## Expected

After step 4, **Purchase Orders** (the tab active immediately before Dashboard) becomes active and the router navigates to `/procurement/purchase-orders`.

General rule: closing active tab `T` should activate the most recently active remaining tab from an activation stack (MRU), not `tabs[0]`.

## Actual

After step 4, **Products** (`tabs[0]`) becomes active and the router navigates to `/inventory/products`.

## Impact

Medium UX friction in real ERP use: users lose context when closing a tab and are sent to an unrelated first-opened document. Feels broken compared to every major tabbed UI (browsers, IDEs, SAP-style workspaces).

## Environment

- runtime: Vite 6 + React 19 + TanStack Router
- package: `@eristack/multitab@0.1.0`
- consumer: Tiga Sekawan ERP `apps/web` (`workspace-shell.tsx` calls `multitab.closeTab(tab.id)`)

## Root cause (observed in published dist)

`MultitabState` only stores `{ tabs, activeTabId }` — no activation history.

In `@eristack/multitab@0.1.0` `dist/chunk-5R7LDN5T.js`:

```js
function pickActiveTabId(tabs, preferredId) {
  if (tabs.length === 0) return null;
  if (preferredId && tabs.some((tab) => tab.id === preferredId)) {
    return preferredId;
  }
  return tabs[0]?.id ?? null; // fallback = first tab
}

function closeTab(state, id) {
  const remaining = state.tabs.filter((tab) => tab.id !== id);
  if (remaining.length === 0) return initialMultitabState;
  const tabs = normalizeSequences(remaining);
  const activeTabId =
    state.activeTabId === id
      ? pickActiveTabId(tabs, null) // preferredId null → tabs[0]
      : pickActiveTabId(tabs, state.activeTabId);
  return { tabs, activeTabId };
}

function planCloseTabNavigation(state, tabId) {
  const nextState = closeTab(state, tabId);
  // navigates to nextState.activeTabId via pathForTab
}
```

`activateTab`, `openTab`, and route sync update `activeTabId` but never record prior activations.

## Suspects

- `packages/.../multitab/src/core/reducer.ts` (or equivalent) — `closeTab`, `pickActiveTabId`
- `packages/.../multitab/src/core/routes.ts` — `planCloseTabNavigation`
- `packages/.../multitab/src/core/persistence.ts` — `serializeMultitabState` / `parseMultitabState` (must persist history)
- `packages/.../multitab/src/react/tanstack/*` — `useMultitabRouter().closeTab` (should use updated planner)
- Package docs / Intent skill — document MRU close behavior

## Fix plan

1. **Add activation history to state**, e.g. `recentTabIds: readonly string[]` (MRU stack, current active excluded or deduped on push).
2. **On every activation** (`activateTab`, successful `openTab` / `openRouteTabAdjacent` / `openNewTab`, and route-driven sync when `activeTabId` changes): push previous `activeTabId` onto the stack (skip null and duplicates at head).
3. **On `closeTab` when closing the active tab**: walk `recentTabIds` and pick the first id still present in `remaining` tabs; if none, fall back to adjacent tab (index − 1, then + 1) or `tabs[tabs.length - 1]`, not always `tabs[0]`.
4. **On `closeTab` for any tab**: remove closed id from `recentTabIds`.
5. **Persistence**: extend `serializeMultitabState` / `parseMultitabState` with backward-compatible optional `recentTabIds`; sanitize on load.
6. **Tests** (core, no React):
   - A → B → C active; close C → B active.
   - A → B → A re-activate → close A → B active (not C unless C was last).
   - Close last remaining tab → empty path `/` (existing behavior).
7. **Docs + Intent skill**: state MRU close is canonical ERP tab behavior.

## Consumer workaround (until package ships)

Track `previousActiveTabId` or an MRU stack in app state and, after `closeTab`, call `navigateToTab` for the intended tab. Fragile because `closeTab` already navigates via `planCloseTabNavigation`; app would need to fork navigation or patch state after the fact. Prefer fixing the package.

## Agent handoff

1. Load `@eristack/multitab#multitab-core` Intent skill.
2. Reproduce from **Steps to reproduce** in a minimal example or unit test.
3. Implement along **Fix plan**; keep headless core + TanStack adapter in sync.
4. Add/adjust tests; run package `test` + `typecheck`.
5. Add a Changeset (user-facing behavior change).

## Notes

Tiga Sekawan ERP uses blank workspace at `/` (`MULTITAB_EMPTY_PATH`) with `activeTabId: null`. MRU close should still apply when closing a route tab while other tabs remain; only when the last tab closes should navigation go to `/`.

Related consumer files: `apps/web/src/components/workspace-shell.tsx` (tab bar close button), `apps/web/src/routes/__root.tsx` (MultitabProvider).
