export type {
  BeforeCloseHandler,
  MultitabAction,
  MultitabState,
  OpenTabInput,
  RouteTabOpenPlan,
  Tab,
  TabKind,
} from "./core/types.js";
export {
  activateTab,
  closeTab,
  clearActiveTab,
  ensureRouteTab,
  ensureTab,
  findTabById,
  initialMultitabState,
  multitabReducer,
  openNewTab,
  openRouteTabAdjacent,
  openTab,
  planRouteTabOpen,
  reorderTab,
  replaceTab,
  setTabCloseGuard,
  updateTab,
} from "./core/state.js";
export {
  MULTITAB_EMPTY_PATH,
  MULTITAB_NEW_TAB_PREFIX,
  activeTabIdFromRoute,
  emptyTabPath,
  newTabPath,
  parseMultitabRoute,
  pathForTab,
  planCloseTabNavigation,
  planOpenNewTabNavigation,
  routeTabId,
  syncStateForRouteVisit,
  type ParsedMultitabRoute,
  type RouteTabResolver,
} from "./core/routes.js";
export {
  loadMultitabState,
  parseMultitabState,
  sanitizePersistedState,
  saveMultitabState,
  serializeMultitabState,
} from "./core/persistence.js";
export {
  NEW_TAB_DEFAULT_DESCRIPTION,
  NEW_TAB_DEFAULT_TITLE,
  NEW_TAB_KIND,
  canCloseTab,
  createNewTabId,
  createNewTabInput,
  isNewTab,
  isNewTabId,
  isWorkspaceEmpty,
} from "./core/workspace.js";
export {
  loadMultitabFromSessionStorage,
  saveMultitabToSessionStorage,
} from "./core/session-storage.js";
export {
  createConfirmBeforeClose,
  type ConfirmBeforeCloseOptions,
} from "./core/before-close.js";
export {
  DEFAULT_MULTITAB_SHORTCUTS,
  type MultitabShortcutAction,
  type MultitabShortcutBinding,
} from "./core/shortcuts.js";
export {
  createTabWorkspace,
  type TabWorkspace,
} from "./core/create-workspace.js";
