import { useEffect } from "react";

export type DirtyTabApi = {
  activeTabId: string | null;
  setTabCloseGuard(id: string, closeGuard: boolean): void;
};

/** Sync closeGuard for a tab (testable without React). */
export function applyDirtyTab(
  api: DirtyTabApi,
  isDirty: boolean,
  tabId?: string,
): () => void {
  const targetId = tabId ?? api.activeTabId;
  if (!targetId) return () => {};
  api.setTabCloseGuard(targetId, isDirty);
  return () => api.setTabCloseGuard(targetId, false);
}

/** Mark the active tab (or tabId) dirty while a form has unsaved edits. */
export function useDirtyTabFromApi(
  api: DirtyTabApi,
  isDirty: boolean,
  tabId?: string,
): void {
  const targetId = tabId ?? api.activeTabId;
  useEffect(() => {
    if (!targetId) return;
    api.setTabCloseGuard(targetId, isDirty);
    return () => api.setTabCloseGuard(targetId, false);
  }, [api, isDirty, targetId]);
}
