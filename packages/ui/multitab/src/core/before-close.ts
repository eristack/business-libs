import type { BeforeCloseHandler, Tab } from "./types.js";

export type ConfirmBeforeCloseOptions = {
  message?: (tab: Tab) => string;
  confirm?: (message: string) => boolean | Promise<boolean>;
};

/** Standard beforeClose: prompt only when tab.closeGuard is set. */
export function createConfirmBeforeClose(
  options: ConfirmBeforeCloseOptions = {},
): BeforeCloseHandler {
  const message =
    options.message ??
    ((tab) => `Close "${tab.title}"? Unsaved changes may be lost.`);
  const confirm =
    options.confirm ??
    ((text: string) => {
      if (typeof globalThis !== "undefined" && "confirm" in globalThis) {
        return (globalThis as { confirm: (m: string) => boolean }).confirm(text);
      }
      return true;
    });

  return async (tab) => {
    if (!tab.closeGuard) return true;
    return confirm(message(tab));
  };
}
