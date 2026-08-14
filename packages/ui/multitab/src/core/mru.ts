import type { MultitabState, Tab } from "./types.js";

export function emptyRecentTabIds(): readonly string[] {
  return [];
}

export function normalizeRecentTabIds(
  recentTabIds: readonly string[] | undefined,
  tabs: readonly Tab[],
): readonly string[] {
  const openIds = new Set(tabs.map((tab) => tab.id));
  const seen = new Set<string>();
  const next: string[] = [];
  for (const id of recentTabIds ?? []) {
    if (!openIds.has(id) || seen.has(id)) continue;
    seen.add(id);
    next.push(id);
  }
  return next;
}

/** Push previous active tab onto MRU when focus changes. */
export function recordActivation(
  state: MultitabState,
  nextActiveId: string | null,
): readonly string[] {
  const previous = state.activeTabId;
  if (previous === nextActiveId) {
    return normalizeRecentTabIds(state.recentTabIds, state.tabs);
  }

  let recent = [...(state.recentTabIds ?? [])];
  if (nextActiveId !== null) {
    recent = recent.filter((id) => id !== nextActiveId);
  }
  if (previous !== null && previous !== nextActiveId) {
    recent = [previous, ...recent.filter((id) => id !== previous)];
  }

  return normalizeRecentTabIds(recent, state.tabs);
}

export function removeFromRecent(
  recentTabIds: readonly string[],
  tabId: string,
): readonly string[] {
  return recentTabIds.filter((id) => id !== tabId);
}

export function pickActiveAfterClose(
  tabs: readonly Tab[],
  recentTabIds: readonly string[],
  closedIndex: number,
  wasActive: boolean,
  currentActiveId: string | null,
): string | null {
  if (tabs.length === 0) return null;

  if (!wasActive) {
    if (currentActiveId && tabs.some((tab) => tab.id === currentActiveId)) {
      return currentActiveId;
    }
    return pickAdjacentTabId(tabs, closedIndex);
  }

  for (const id of recentTabIds) {
    if (tabs.some((tab) => tab.id === id)) {
      return id;
    }
  }

  return pickAdjacentTabId(tabs, closedIndex);
}

/** Prefer tab to the left of the closed tab, then rightmost remaining. */
export function pickAdjacentTabId(
  tabs: readonly Tab[],
  closedIndex: number,
): string | null {
  if (tabs.length === 0) return null;
  const adjIndex = Math.max(0, Math.min(closedIndex - 1, tabs.length - 1));
  return tabs[adjIndex]?.id ?? tabs[tabs.length - 1]?.id ?? null;
}

export function withActivation(
  state: MultitabState,
  patch: Partial<MultitabState> & Pick<MultitabState, "activeTabId">,
): MultitabState {
  const merged = { ...state, ...patch };
  return {
    ...merged,
    recentTabIds: recordActivation(state, patch.activeTabId),
  };
}
