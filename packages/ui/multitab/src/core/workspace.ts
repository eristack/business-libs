import type { MultitabState, OpenTabInput, Tab } from "./types.js";

export const NEW_TAB_KIND = "new" as const;
export const NEW_TAB_DEFAULT_TITLE = "New tab";
export const NEW_TAB_DEFAULT_DESCRIPTION = "Unassigned";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function createNewTabId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `tab_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function createNewTabInput(): OpenTabInput {
  return {
    id: createNewTabId(),
    title: NEW_TAB_DEFAULT_TITLE,
    description: NEW_TAB_DEFAULT_DESCRIPTION,
    kind: NEW_TAB_KIND,
  };
}

export function isWorkspaceEmpty(state: MultitabState): boolean {
  return state.tabs.length === 0;
}

export function isNewTab(tab: Tab): boolean {
  return tab.kind === NEW_TAB_KIND;
}

export function isNewTabId(tabId: string): boolean {
  return UUID_RE.test(tabId);
}

export function canCloseTab(
  tab: Tab | null,
  options?: { force?: boolean },
): boolean {
  if (!tab) return false;
  if (options?.force) return true;
  return !tab.closeGuard;
}
