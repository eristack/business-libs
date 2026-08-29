"use client";

import { useEffect } from "react";
import { updateTab } from "../core/state.js";
import type { MultitabState } from "../core/types.js";

/** Resolve title async (e.g. fetch doc number) and patch the open tab. */
export function useTabTitle(options: {
  tabId: string | null;
  title: string | null | undefined;
  setState: (updater: (prev: MultitabState) => MultitabState) => void;
  resolveTitle?: () => Promise<string | null | undefined>;
}): void {
  useEffect(() => {
    if (!options.tabId) return;
    let cancelled = false;

    async function run() {
      const resolved = options.resolveTitle
        ? await options.resolveTitle()
        : options.title;
      if (cancelled || resolved == null || resolved === "") return;
      options.setState((prev) => updateTab(prev, options.tabId!, { title: resolved }));
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [options.tabId, options.title, options.resolveTitle, options.setState]);
}
