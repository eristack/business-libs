import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import {
  canCloseTab,
  createNewTabInput,
  findTabById,
  initialMultitabState,
  isNewTab,
  isWorkspaceEmpty,
  loadMultitabState,
  multitabReducer,
  saveMultitabState,
  type MultitabState,
  type OpenTabInput,
  type Tab,
} from "../index.js";
import { useDirtyTabFromApi } from "./use-dirty-tab.js";

export type { MultitabState, OpenTabInput, Tab, TabKind } from "../index.js";
export { isNewTab, isNewTabId, isWorkspaceEmpty } from "../index.js";

export type CloseTabOptions = {
  /** Skip closeGuard and beforeClose checks. */
  readonly force?: boolean;
};

export type MultitabApi = {
  readonly tabs: readonly Tab[];
  readonly activeTabId: string | null;
  readonly activeTab: Tab | null;
  readonly isWorkspaceEmpty: boolean;
  readonly isActiveTabNew: boolean;
  openTab(input: OpenTabInput): void;
  openRouteTabAdjacent(input: OpenTabInput): void;
  openNewTab(): string;
  ensureTab(input: OpenTabInput): void;
  replaceTab(tabId: string, input: OpenTabInput): void;
  closeTab(id: string, options?: CloseTabOptions): void;
  clearActiveTab(): void;
  activateTab(id: string): void;
  reorderTab(id: string, newIndex: number): void;
  updateTab(
    id: string,
    patch: Partial<Pick<Tab, "title" | "description" | "closeGuard">>,
  ): void;
  setTabCloseGuard(id: string, closeGuard: boolean): void;
};

const MultitabContext = createContext<MultitabApi | null>(null);

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

export function MultitabProvider({
  children,
  initialState,
  storageKey,
}: {
  children: ReactNode;
  initialState?: MultitabState;
  storageKey?: string;
}) {
  const [state, dispatch] = useReducer(
    multitabReducer,
    undefined as unknown as MultitabState,
    () => resolveInitialState(storageKey, initialState),
  );

  useEffect(() => {
    if (!storageKey) return;
    writeStorage(storageKey, state);
  }, [state, storageKey]);

  const value = useMemo<MultitabApi>(() => {
    const tabs = [...state.tabs].sort(
      (left, right) => left.sequence - right.sequence,
    );
    const activeTab =
      tabs.find((tab) => tab.id === state.activeTabId) ?? null;

    return {
      tabs,
      activeTabId: state.activeTabId,
      activeTab,
      isWorkspaceEmpty: isWorkspaceEmpty(state),
      isActiveTabNew: activeTab ? isNewTab(activeTab) : false,
      openTab(input) {
        dispatch({ type: "open", input });
      },
      openRouteTabAdjacent(input) {
        dispatch({ type: "openAdjacent", input });
      },
      openNewTab() {
        const input = createNewTabInput();
        dispatch({ type: "openNew", input });
        return input.id;
      },
      ensureTab(input) {
        dispatch({ type: "ensure", input });
      },
      replaceTab(tabId, input) {
        dispatch({ type: "replace", tabId, input });
      },
      closeTab(id, options) {
        const tab = findTabById(state, id);
        if (!canCloseTab(tab, options)) return;
        dispatch({ type: "close", id });
      },
      clearActiveTab() {
        dispatch({ type: "clearActive" });
      },
      activateTab(id) {
        dispatch({ type: "activate", id });
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
  }, [state]);

  return (
    <MultitabContext.Provider value={value}>{children}</MultitabContext.Provider>
  );
}

export function useMultitab(): MultitabApi {
  const context = useContext(MultitabContext);
  if (!context) {
    throw new Error("useMultitab must be used within MultitabProvider");
  }
  return context;
}

/** Mark the active tab (or tabId) dirty while a form has unsaved edits. */
export function useDirtyTab(isDirty: boolean, tabId?: string): void {
  const api = useMultitab();
  useDirtyTabFromApi(api, isDirty, tabId);
}
