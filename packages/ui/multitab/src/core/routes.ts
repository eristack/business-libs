import type { MultitabState, OpenTabInput, Tab } from "./types.js";
import { closeTab, findTabById, openNewTab, openRouteTabAdjacent } from "./state.js";
import {
  NEW_TAB_DEFAULT_DESCRIPTION,
  NEW_TAB_DEFAULT_TITLE,
  createNewTabInput,
  isNewTab,
  isNewTabId,
} from "./workspace.js";

/** Normalize pathname for strict tab identity (params included, no trailing slash). */
export function routeTabId(pathname: string): string {
  if (pathname === "/" || !pathname.endsWith("/")) return pathname;
  return pathname.slice(0, -1);
}

export const MULTITAB_EMPTY_PATH = "/" as const;
export const MULTITAB_NEW_TAB_PREFIX = "/new/" as const;

export type ParsedMultitabRoute =
  | { readonly kind: "empty" }
  | { readonly kind: "new"; readonly tabId: string }
  | { readonly kind: "route"; readonly pathname: string };

export type RouteTabResolver = (
  pathname: string,
) => Omit<OpenTabInput, "id" | "kind"> | null;

export function parseMultitabRoute(pathname: string): ParsedMultitabRoute {
  const path = routeTabId(pathname);
  if (path === MULTITAB_EMPTY_PATH) return { kind: "empty" };

  if (path.startsWith(MULTITAB_NEW_TAB_PREFIX)) {
    const tabId = path.slice(MULTITAB_NEW_TAB_PREFIX.length);
    if (isNewTabId(tabId)) return { kind: "new", tabId };
  }

  return { kind: "route", pathname: path };
}

export function emptyTabPath(): string {
  return MULTITAB_EMPTY_PATH;
}

export function newTabPath(tabId: string): string {
  return `${MULTITAB_NEW_TAB_PREFIX}${tabId}`;
}

/** Active tab id derived from the current URL (route is source of truth). */
export function activeTabIdFromRoute(
  pathname: string,
  resolveTabId: (pathname: string) => string = routeTabId,
): string | null {
  const parsed = parseMultitabRoute(pathname);
  if (parsed.kind === "empty") return null;
  if (parsed.kind === "new") return parsed.tabId;
  return resolveTabId(parsed.pathname);
}

export function pathForTab(tab: Tab): string {
  if (isNewTab(tab)) return newTabPath(tab.id);
  return tab.id;
}

/** Ensure open tabs reflect the visited route; does not mutate unrelated tabs. */
export function syncStateForRouteVisit(
  state: MultitabState,
  pathname: string,
  resolveRouteTab: RouteTabResolver,
  resolveTabId: (pathname: string) => string = routeTabId,
): MultitabState {
  const parsed = parseMultitabRoute(pathname);

  if (parsed.kind === "empty") {
    return { tabs: state.tabs, activeTabId: null };
  }

  if (parsed.kind === "new") {
    const existing = findTabById(state, parsed.tabId);
    if (existing) {
      return { tabs: state.tabs, activeTabId: parsed.tabId };
    }

    return openNewTab(state, {
      id: parsed.tabId,
      title: NEW_TAB_DEFAULT_TITLE,
      description: NEW_TAB_DEFAULT_DESCRIPTION,
      kind: "new",
    });
  }

  const meta = resolveRouteTab(parsed.pathname);
  if (!meta) {
    return { tabs: state.tabs, activeTabId: null };
  }

  const tabId = resolveTabId(parsed.pathname);

  return openRouteTabAdjacent(state, {
    id: tabId,
    title: meta.title,
    description: meta.description,
    kind: "route",
  });
}

export function planCloseTabNavigation(
  state: MultitabState,
  tabId: string,
): { readonly nextState: MultitabState; readonly nextPath: string } {
  const nextState = closeTab(state, tabId);

  if (nextState.tabs.length === 0) {
    return { nextState, nextPath: emptyTabPath() };
  }

  const nextActiveId = nextState.activeTabId;
  const nextTab = nextActiveId ? findTabById(nextState, nextActiveId) : null;

  return {
    nextState,
    nextPath: nextTab ? pathForTab(nextTab) : emptyTabPath(),
  };
}

export function planOpenNewTabNavigation(
  state: MultitabState,
  input = createNewTabInput(),
): {
  readonly nextState: MultitabState;
  readonly nextPath: string;
  readonly tabId: string;
} {
  const nextState = openNewTab(state, input);
  return { nextState, nextPath: newTabPath(input.id), tabId: input.id };
}
