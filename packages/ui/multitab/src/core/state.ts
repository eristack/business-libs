import type {
  MultitabAction,
  MultitabState,
  OpenTabInput,
  RouteTabOpenPlan,
  Tab,
} from "./types.js";
import { createNewTabInput, NEW_TAB_KIND } from "./workspace.js";

export const initialMultitabState: MultitabState = {
  tabs: [],
  activeTabId: null,
};

function normalizeSequences(tabs: readonly Tab[]): Tab[] {
  return tabs.map((tab, index) => ({ ...tab, sequence: index }));
}

function orderedTabs(state: MultitabState): Tab[] {
  return normalizeSequences(
    [...state.tabs].sort((left, right) => left.sequence - right.sequence),
  );
}

function pickActiveTabId(
  tabs: readonly Tab[],
  preferredId: string | null,
): string | null {
  if (tabs.length === 0) return null;
  if (preferredId && tabs.some((tab) => tab.id === preferredId)) {
    return preferredId;
  }
  return tabs[0]?.id ?? null;
}

export function findTabById(state: MultitabState, id: string): Tab | null {
  return state.tabs.find((tab) => tab.id === id) ?? null;
}

export function planRouteTabOpen(
  state: MultitabState,
  input: OpenTabInput,
): RouteTabOpenPlan {
  const existing = findTabById(state, input.id);
  if (existing) {
    return { action: "activate", tabId: existing.id };
  }

  const tabs = orderedTabs(state);
  const activeIndex = state.activeTabId
    ? tabs.findIndex((tab) => tab.id === state.activeTabId)
    : -1;
  const insertIndex = activeIndex >= 0 ? activeIndex + 1 : tabs.length;

  return { action: "insert", input, insertIndex };
}

export function openTab(state: MultitabState, input: OpenTabInput): MultitabState {
  const existing = findTabById(state, input.id);
  if (existing) {
    return { tabs: state.tabs, activeTabId: input.id };
  }

  const tabs = normalizeSequences([
    ...state.tabs,
    {
      id: input.id,
      title: input.title,
      description: input.description,
      kind: input.kind ?? "route",
      sequence: state.tabs.length,
    },
  ]);

  return { tabs, activeTabId: input.id };
}

/** Activate an existing route tab, or insert a new one right after the active tab. */
export function openRouteTabAdjacent(
  state: MultitabState,
  input: OpenTabInput,
): MultitabState {
  const plan = planRouteTabOpen(state, input);

  if (plan.action === "activate") {
    return { tabs: state.tabs, activeTabId: plan.tabId };
  }

  const tabs = orderedTabs(state);
  const next = tabs.slice();
  next.splice(plan.insertIndex, 0, {
    id: plan.input.id,
    title: plan.input.title,
    description: plan.input.description,
    kind: plan.input.kind ?? "route",
    sequence: plan.insertIndex,
  });

  return {
    tabs: normalizeSequences(next),
    activeTabId: plan.input.id,
  };
}

export function closeTab(state: MultitabState, id: string): MultitabState {
  const remaining = state.tabs.filter((tab) => tab.id !== id);

  if (remaining.length === 0) {
    return initialMultitabState;
  }

  const tabs = normalizeSequences(remaining);
  const activeTabId =
    state.activeTabId === id
      ? pickActiveTabId(tabs, null)
      : pickActiveTabId(tabs, state.activeTabId);

  return { tabs, activeTabId };
}

export function clearActiveTab(state: MultitabState): MultitabState {
  if (state.activeTabId === null) return state;
  return { ...state, activeTabId: null };
}

export function activateTab(state: MultitabState, id: string): MultitabState {
  if (!state.tabs.some((tab) => tab.id === id)) return state;
  return { ...state, activeTabId: id };
}

export function reorderTab(
  state: MultitabState,
  id: string,
  newIndex: number,
): MultitabState {
  const tabs = orderedTabs(state);
  const currentIndex = tabs.findIndex((tab) => tab.id === id);
  if (currentIndex === -1) return state;

  const clampedIndex = Math.max(0, Math.min(newIndex, tabs.length - 1));
  if (currentIndex === clampedIndex) return state;

  const next = tabs.slice();
  const [moved] = next.splice(currentIndex, 1);
  if (!moved) return state;
  next.splice(clampedIndex, 0, moved);

  return {
    tabs: next.map((tab, index) => ({ ...tab, sequence: index })),
    activeTabId: state.activeTabId,
  };
}

export function updateTab(
  state: MultitabState,
  id: string,
  patch: Partial<Pick<Tab, "title" | "description" | "closeGuard">>,
): MultitabState {
  if (!state.tabs.some((tab) => tab.id === id)) return state;

  const tabs = state.tabs.map((tab) =>
    tab.id === id ? { ...tab, ...patch } : tab,
  );

  return { ...state, tabs };
}

export function ensureTab(state: MultitabState, input: OpenTabInput): MultitabState {
  if (state.tabs.some((tab) => tab.id === input.id)) {
    return state;
  }

  const tabs = normalizeSequences([
    ...state.tabs,
    {
      id: input.id,
      title: input.title,
      description: input.description,
      kind: input.kind ?? "route",
      sequence: state.tabs.length,
    },
  ]);

  return { tabs, activeTabId: state.activeTabId };
}

export function replaceTab(
  state: MultitabState,
  tabId: string,
  input: OpenTabInput,
): MultitabState {
  const sourceIndex = state.tabs.findIndex((tab) => tab.id === tabId);
  if (sourceIndex === -1) {
    return openTab(state, { ...input, kind: input.kind ?? "route" });
  }

  const duplicateTarget = state.tabs.find(
    (tab) => tab.id === input.id && tab.id !== tabId,
  );
  if (duplicateTarget) {
    const tabs = normalizeSequences(state.tabs.filter((tab) => tab.id !== tabId));
    return { tabs, activeTabId: input.id };
  }

  const tabs = normalizeSequences(
    state.tabs.map((tab) =>
      tab.id === tabId
        ? {
            id: input.id,
            title: input.title,
            description: input.description,
            kind: input.kind ?? "route",
            sequence: tab.sequence,
          }
        : tab,
    ),
  );

  return { tabs, activeTabId: input.id };
}

export function ensureRouteTab(
  state: MultitabState,
  input: OpenTabInput,
): MultitabState {
  return openTab(state, { ...input, kind: input.kind ?? "route" });
}

export function openNewTab(
  state: MultitabState,
  input = createNewTabInput(),
): MultitabState {
  const tabs = orderedTabs(state);
  const activeIndex = state.activeTabId
    ? tabs.findIndex((tab) => tab.id === state.activeTabId)
    : -1;
  const insertIndex = activeIndex >= 0 ? activeIndex + 1 : tabs.length;

  const next = tabs.slice();
  next.splice(insertIndex, 0, {
    id: input.id,
    title: input.title,
    description: input.description,
    kind: input.kind ?? NEW_TAB_KIND,
    sequence: insertIndex,
  });

  return {
    tabs: normalizeSequences(next),
    activeTabId: input.id,
  };
}

export function setTabCloseGuard(
  state: MultitabState,
  id: string,
  closeGuard: boolean,
): MultitabState {
  return updateTab(state, id, { closeGuard: closeGuard || undefined });
}

export function multitabReducer(
  state: MultitabState,
  action: MultitabAction,
): MultitabState {
  switch (action.type) {
    case "open":
      return openTab(state, action.input);
    case "openAdjacent":
      return openRouteTabAdjacent(state, action.input);
    case "openNew":
      return openNewTab(state, action.input);
    case "ensure":
      return ensureTab(state, action.input);
    case "replace":
      return replaceTab(state, action.tabId, action.input);
    case "close":
      return closeTab(state, action.id);
    case "clearActive":
      return clearActiveTab(state);
    case "activate":
      return activateTab(state, action.id);
    case "reorder":
      return reorderTab(state, action.id, action.newIndex);
    case "update":
      return updateTab(state, action.id, action.patch);
    case "setCloseGuard":
      return setTabCloseGuard(state, action.id, action.closeGuard);
    case "replaceState":
      return action.state;
    default:
      return state;
  }
}
