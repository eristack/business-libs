export {
  MultitabProvider,
  useMultitab,
  useDirtyTab,
  type CloseTabOptions,
  type MultitabApi,
} from "./provider.js";
export { applyDirtyTab, useDirtyTabFromApi, type DirtyTabApi } from "./use-dirty-tab.js";
export { useTabTitle } from "./use-tab-title.js";
export { createConfirmBeforeClose, type ConfirmBeforeCloseOptions } from "../core/before-close.js";
export { isNewTab, isNewTabId, isWorkspaceEmpty } from "../index.js";
export type { MultitabState, OpenTabInput, Tab, TabKind } from "../index.js";
