import type { MultitabState, TabSearch } from "./types.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function getTabSearch(
  state: MultitabState,
  tabId: string,
): TabSearch | undefined {
  const raw = state.searchByTabId?.[tabId];
  if (!isRecord(raw)) return undefined;
  return { ...raw };
}

export function withTabSearch(
  state: MultitabState,
  tabId: string,
  search: TabSearch,
): MultitabState {
  return {
    ...state,
    searchByTabId: { ...(state.searchByTabId ?? {}), [tabId]: { ...search } },
  };
}

export function withoutTabSearch(
  state: MultitabState,
  tabId: string,
): MultitabState {
  const map = state.searchByTabId;
  if (!map?.[tabId]) return state;
  const { [tabId]: _removed, ...rest } = map;
  return {
    ...state,
    searchByTabId: Object.keys(rest).length > 0 ? rest : undefined,
  };
}

export function pruneSearchByTabId(state: MultitabState): MultitabState {
  if (!state.searchByTabId) return state;
  const open = new Set(state.tabs.map((tab) => tab.id));
  const next: Record<string, TabSearch> = {};
  for (const [id, search] of Object.entries(state.searchByTabId)) {
    if (open.has(id) && isRecord(search)) next[id] = search;
  }
  return {
    ...state,
    searchByTabId: Object.keys(next).length > 0 ? next : undefined,
  };
}

export function parseSearchByTabId(
  value: unknown,
): Readonly<Record<string, TabSearch>> | undefined {
  if (!isRecord(value)) return undefined;
  const next: Record<string, TabSearch> = {};
  for (const [tabId, search] of Object.entries(value)) {
    if (typeof tabId === "string" && isRecord(search)) {
      next[tabId] = search;
    }
  }
  return Object.keys(next).length > 0 ? next : undefined;
}

export function searchSnapshotEqual(
  a: TabSearch | undefined,
  b: TabSearch | undefined,
): boolean {
  return JSON.stringify(a ?? {}) === JSON.stringify(b ?? {});
}
