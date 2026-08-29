import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter, useRouterState } from "@tanstack/react-router";
import {
  activeTabIdFromRoute,
  canCloseTab,
  createNewTabInput,
  findTabById,
  initialMultitabState,
  isNewTab,
  isWorkspaceEmpty,
  loadMultitabState,
  multitabReducer,
  newTabPath,
  pathForTab,
  planCloseTabNavigation,
  routeTabId,
  saveMultitabState,
  syncStateForRouteVisit,
  type BeforeCloseHandler,
  type MultitabState,
  type OpenTabInput,
  type RouteTabResolver,
  type Tab,
} from "../index.js";
import type { CloseTabOptions } from "./provider.js";
import { useDirtyTabFromApi } from "./use-dirty-tab.js";

export type {
  MultitabState,
  OpenTabInput,
  RouteTabResolver,
  Tab,
  TabKind,
} from "../index.js";
export {
  activeTabIdFromRoute,
  emptyTabPath,
  isNewTab,
  isNewTabId,
  isWorkspaceEmpty,
  newTabPath,
  parseMultitabRoute,
  pathForTab,
} from "../index.js";

export type MultitabRouterApi = {
  readonly pathname: string;
  readonly tabs: readonly Tab[];
  readonly activeTabId: string | null;
  readonly activeTab: Tab | null;
  readonly isWorkspaceEmpty: boolean;
  readonly isActiveTabNew: boolean;
  /** Navigate to a module route (opens or activates the matching tab). */
  navigateToRoute(pathname: string): void;
  /** Insert a unique new tab and navigate to `/new/{id}`. */
  openNewTab(): string;
  closeTab(id: string, options?: CloseTabOptions): void;
  replaceTab(tabId: string, input: OpenTabInput): void;
  reorderTab(id: string, newIndex: number): void;
  updateTab(
    id: string,
    patch: Partial<Pick<Tab, "title" | "description" | "closeGuard">>,
  ): void;
  setTabCloseGuard(id: string, closeGuard: boolean): void;
};

const MultitabRouterContext = createContext<MultitabRouterApi | null>(null);

function readStorage(storageKey: string): MultitabState | null {
  if (typeof localStorage === "undefined") return null;
  return loadMultitabState(() => localStorage.getItem(storageKey));
}

function writeStorage(storageKey: string, state: MultitabState): void {
  if (typeof localStorage === "undefined") return;
  saveMultitabState(state, (value) => localStorage.setItem(storageKey, value));
}

function resolveInitialState(
  storageKey: string | undefined,
  initialState: MultitabState | undefined,
): MultitabState {
  if (initialState) return initialState;
  if (storageKey) {
    const stored = readStorage(storageKey);
    if (stored) return stored;
  }
  return initialMultitabState;
}

function tabsEqual(left: readonly Tab[], right: readonly Tab[]): boolean {
  if (left.length !== right.length) return false;
  return left.every((tab, index) => {
    const other = right[index];
    return (
      other &&
      tab.id === other.id &&
      tab.title === other.title &&
      tab.sequence === other.sequence &&
      tab.kind === other.kind
    );
  });
}

export function MultitabRouterProvider({
  children,
  resolveRouteTab,
  resolveTabId,
  initialState,
  storageKey,
  beforeClose,
}: {
  children: ReactNode;
  resolveRouteTab: RouteTabResolver;
  resolveTabId?: (pathname: string) => string;
  initialState?: MultitabState;
  storageKey?: string;
  /** Optional confirmation before closing (e.g. unsaved form). Return false to cancel. */
  beforeClose?: BeforeCloseHandler;
}) {
  const router = useRouter();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const [state, dispatch] = useReducer(
    multitabReducer,
    undefined as unknown as MultitabState,
    () => resolveInitialState(storageKey, initialState),
  );
  const resolveRouteTabRef = useRef(resolveRouteTab);
  resolveRouteTabRef.current = resolveRouteTab;
  const resolveTabIdRef = useRef(resolveTabId ?? routeTabId);
  resolveTabIdRef.current = resolveTabId ?? routeTabId;
  const stateRef = useRef(state);
  stateRef.current = state;
  const beforeCloseRef = useRef(beforeClose);
  beforeCloseRef.current = beforeClose;
  const [optimisticPath, setOptimisticPath] = useState<string | null>(null);

  const effectivePath = optimisticPath ?? pathname;

  useEffect(() => {
    if (
      optimisticPath &&
      routeTabId(pathname) === routeTabId(optimisticPath)
    ) {
      setOptimisticPath(null);
    }
  }, [optimisticPath, pathname]);

  const activeTabId = useMemo(
    () => activeTabIdFromRoute(effectivePath, resolveTabIdRef.current),
    [effectivePath],
  );

  useLayoutEffect(() => {
    const next = syncStateForRouteVisit(
      stateRef.current,
      pathname,
      resolveRouteTabRef.current,
      resolveTabIdRef.current,
    );
    if (
      tabsEqual(stateRef.current.tabs, next.tabs) &&
      stateRef.current.activeTabId === next.activeTabId
    ) {
      return;
    }
    dispatch({ type: "replaceState", state: next });
  }, [pathname]);

  useEffect(() => {
    if (!storageKey) return;
    writeStorage(storageKey, state);
  }, [state, storageKey]);

  const value = useMemo<MultitabRouterApi>(() => {
    const tabs = [...state.tabs].sort(
      (left, right) => left.sequence - right.sequence,
    );
    const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? null;

    return {
      pathname,
      tabs,
      activeTabId,
      activeTab,
      isWorkspaceEmpty: isWorkspaceEmpty(state),
      isActiveTabNew: activeTab ? isNewTab(activeTab) : false,
      navigateToRoute(routePathname) {
        setOptimisticPath(routePathname);
        void router.navigate({ to: routePathname });
      },
      openNewTab() {
        const input = createNewTabInput();
        const path = newTabPath(input.id);
        setOptimisticPath(path);
        void router.navigate({ to: path });
        return input.id;
      },
      closeTab(id, options) {
        const tab = findTabById(state, id);
        if (!canCloseTab(tab, options)) return;

        const runClose = () => {
          const { nextState, nextPath } = planCloseTabNavigation(state, id);
          setOptimisticPath(nextPath);
          dispatch({ type: "replaceState", state: nextState });
          void router.navigate({ to: nextPath });
        };

        const handler = beforeCloseRef.current;
        if (!options?.force && handler && tab) {
          void Promise.resolve(handler(tab)).then((allowed) => {
            if (allowed) runClose();
          });
          return;
        }

        runClose();
      },
      replaceTab(tabId, input) {
        dispatch({ type: "replace", tabId, input });
        if (input.kind !== "new") {
          void router.navigate({ to: input.id });
        }
      },
      reorderTab(id, newIndex) {
        dispatch({ type: "reorder", id, newIndex });
      },
      updateTab(id, patch) {
        dispatch({ type: "update", id, patch });
      },
      setTabCloseGuard(id, closeGuard) {
        dispatch({ type: "setCloseGuard", id, closeGuard });
      },
    };
  }, [activeTabId, pathname, router, state]);

  return (
    <MultitabRouterContext.Provider value={value}>
      {children}
    </MultitabRouterContext.Provider>
  );
}

export function useMultitabRouter(): MultitabRouterApi {
  const context = useContext(MultitabRouterContext);
  if (!context) {
    throw new Error(
      "useMultitabRouter must be used within MultitabRouterProvider",
    );
  }
  return context;
}

/** Activate a tab by navigating to its URL (route is source of truth). */
export function navigateToTab(api: MultitabRouterApi, tab: Tab): void {
  api.navigateToRoute(pathForTab(tab));
}

/** Mark the active route tab dirty while a form has unsaved edits. */
export function useDirtyTab(isDirty: boolean, tabId?: string): void {
  const api = useMultitabRouter();
  useDirtyTabFromApi(api, isDirty, tabId);
}

export { createConfirmBeforeClose, type ConfirmBeforeCloseOptions } from "../core/before-close.js";
export { applyDirtyTab, useDirtyTabFromApi, type DirtyTabApi } from "./use-dirty-tab.js";
