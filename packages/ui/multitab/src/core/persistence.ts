import type { MultitabState, Tab } from "./types.js";
import { isNewTab, isNewTabId } from "./workspace.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isTab(value: unknown): value is Tab {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.sequence === "number" &&
    (value.description === undefined ||
      typeof value.description === "string") &&
    (value.kind === undefined ||
      value.kind === "route" ||
      value.kind === "new") &&
    (value.closeGuard === undefined || typeof value.closeGuard === "boolean")
  );
}

function normalizeSequences(tabs: readonly Tab[]): Tab[] {
  return tabs.map((tab, index) => ({ ...tab, sequence: index }));
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

export function sanitizePersistedState(state: MultitabState): MultitabState {
  const tabs = normalizeSequences(
    state.tabs.filter((tab) => {
      if (isNewTab(tab)) return isNewTabId(tab.id);
      return tab.id.startsWith("/");
    }),
  );
  const activeTabId =
    tabs.length === 0 ? null : pickActiveTabId(tabs, state.activeTabId);

  return { tabs, activeTabId };
}

export function parseMultitabState(raw: string): MultitabState | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || !Array.isArray(parsed.tabs)) {
      return null;
    }

    const tabs = parsed.tabs.filter(isTab);
    const activeTabId =
      typeof parsed.activeTabId === "string" || parsed.activeTabId === null
        ? parsed.activeTabId
        : null;

    return sanitizePersistedState({ tabs, activeTabId });
  } catch {
    return null;
  }
}

export function serializeMultitabState(state: MultitabState): string {
  return JSON.stringify(sanitizePersistedState(state));
}

export function loadMultitabState(
  read: () => string | null,
): MultitabState | null {
  const raw = read();
  if (!raw) return null;
  return parseMultitabState(raw);
}

export function saveMultitabState(
  state: MultitabState,
  write: (value: string) => void,
): void {
  write(serializeMultitabState(state));
}
