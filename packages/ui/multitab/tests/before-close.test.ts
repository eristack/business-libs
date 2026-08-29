import { describe, expect, it, vi } from "vitest";
import { createConfirmBeforeClose } from "../src/core/before-close.js";
import { applyDirtyTab } from "../src/react/use-dirty-tab.js";
import { initialMultitabState, openTab } from "../src/core/state.js";
import type { Tab } from "../src/core/types.js";

describe("createConfirmBeforeClose", () => {
  it("allows close when closeGuard is unset", async () => {
    const handler = createConfirmBeforeClose({
      confirm: vi.fn(() => false),
    });
    const tab: Tab = {
      id: "/a",
      title: "A",
      sequence: 0,
      kind: "route",
    };
    await expect(handler(tab)).resolves.toBe(true);
  });

  it("prompts when closeGuard is set", async () => {
    const confirm = vi.fn(() => true);
    const handler = createConfirmBeforeClose({ confirm });
    const tab: Tab = {
      id: "/a",
      title: "Draft PO",
      sequence: 0,
      kind: "route",
      closeGuard: true,
    };
    await expect(handler(tab)).resolves.toBe(true);
    expect(confirm).toHaveBeenCalledWith(
      'Close "Draft PO"? Unsaved changes may be lost.',
    );
  });
});

describe("applyDirtyTab", () => {
  it("sets and clears closeGuard on the active tab", () => {
    let state = openTab(initialMultitabState, {
      id: "/orders",
      title: "Orders",
      kind: "route",
    });
    const api = {
      get activeTabId() {
        return state.activeTabId;
      },
      setTabCloseGuard(id: string, closeGuard: boolean) {
        state = {
          ...state,
          tabs: state.tabs.map((tab) =>
            tab.id === id
              ? { ...tab, closeGuard: closeGuard || undefined }
              : tab,
          ),
        };
      },
    };

    const clear = applyDirtyTab(api, true);
    expect(state.tabs[0]?.closeGuard).toBe(true);
    clear();
    expect(state.tabs[0]?.closeGuard).toBeUndefined();
  });
});
