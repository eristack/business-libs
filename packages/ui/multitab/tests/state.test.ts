import { describe, expect, it } from "vitest";
import {
  activateTab,
  canCloseTab,
  closeTab,
  createNewTabInput,
  ensureTab,
  initialMultitabState,
  isNewTab,
  isNewTabId,
  isWorkspaceEmpty,
  openNewTab,
  openRouteTabAdjacent,
  openTab,
  planRouteTabOpen,
  reorderTab,
  replaceTab,
  setTabCloseGuard,
} from "../src/index.js";

describe("multitab state", () => {
  it("starts in an empty workspace", () => {
    expect(isWorkspaceEmpty(initialMultitabState)).toBe(true);
    expect(initialMultitabState.activeTabId).toBeNull();
  });

  it("opens tabs in sequence and activates the latest", () => {
    let state = openTab(initialMultitabState, {
      id: "home",
      title: "Home",
      description: "Dashboard",
    });
    state = openTab(state, {
      id: "uom",
      title: "UOM",
      description: "Units of measure",
    });

    expect(state.tabs.map((tab) => tab.id)).toEqual(["home", "uom"]);
    expect(state.tabs.map((tab) => tab.sequence)).toEqual([0, 1]);
    expect(state.activeTabId).toBe("uom");
  });

  it("reactivates an existing tab instead of duplicating", () => {
    const opened = openTab(initialMultitabState, {
      id: "home",
      title: "Home",
    });
    const second = openTab(opened, { id: "uom", title: "UOM" });
    const reopened = openTab(second, { id: "home", title: "Home" });

    expect(reopened.tabs).toHaveLength(2);
    expect(reopened.activeTabId).toBe("home");
  });

  it("does not overwrite tab metadata when reactivating an existing tab", () => {
    let state = openTab(initialMultitabState, {
      id: "/catalog/publishers",
      title: "Publishers",
      kind: "route",
    });
    state = openTab(state, {
      id: "/catalog/publishers/uuid",
      title: "Acme",
      kind: "route",
    });
    state = openTab(state, {
      id: "/catalog/publishers",
      title: "Wrong title",
      kind: "route",
    });

    expect(
      state.tabs.find((tab) => tab.id === "/catalog/publishers")?.title,
    ).toBe("Publishers");
    expect(state.activeTabId).toBe("/catalog/publishers");
  });

  it("inserts a route tab right after the active tab", () => {
    let state = openTab(initialMultitabState, {
      id: "/home",
      title: "Home",
      kind: "route",
    });
    state = openTab(state, {
      id: "/catalog/publishers",
      title: "Publishers",
      kind: "route",
    });
    state = openRouteTabAdjacent(state, {
      id: "/catalog/publishers/uuid-1",
      title: "Acme",
      kind: "route",
    });

    expect(state.tabs.map((tab) => tab.id)).toEqual([
      "/home",
      "/catalog/publishers",
      "/catalog/publishers/uuid-1",
    ]);
    expect(state.activeTabId).toBe("/catalog/publishers/uuid-1");
  });

  it("activates an existing route tab instead of inserting adjacent", () => {
    let state = openTab(initialMultitabState, {
      id: "/catalog/publishers",
      title: "Publishers",
      kind: "route",
    });
    state = openRouteTabAdjacent(state, {
      id: "/catalog/publishers/uuid-1",
      title: "Acme",
      kind: "route",
    });
    state = openRouteTabAdjacent(state, {
      id: "/catalog/publishers/uuid-2",
      title: "Beta",
      kind: "route",
    });
    state = openRouteTabAdjacent(state, {
      id: "/catalog/publishers/uuid-1",
      title: "Acme again",
      kind: "route",
    });

    expect(state.tabs).toHaveLength(3);
    expect(state.activeTabId).toBe("/catalog/publishers/uuid-1");
    expect(
      state.tabs.find((tab) => tab.id === "/catalog/publishers/uuid-1")?.title,
    ).toBe("Acme");
  });

  it("plans activate vs insert for route tab opens", () => {
    let state = openTab(initialMultitabState, {
      id: "/catalog/publishers",
      title: "Publishers",
      kind: "route",
    });

    expect(
      planRouteTabOpen(state, { id: "/catalog/publishers", title: "X" }),
    ).toEqual({
      action: "activate",
      tabId: "/catalog/publishers",
    });

    expect(
      planRouteTabOpen(state, {
        id: "/catalog/publishers/uuid-1",
        title: "Acme",
        kind: "route",
      }),
    ).toEqual({
      action: "insert",
      input: {
        id: "/catalog/publishers/uuid-1",
        title: "Acme",
        kind: "route",
      },
      insertIndex: 1,
    });
  });

  it("reorders tabs and compacts sequence", () => {
    let state = openTab(initialMultitabState, { id: "a", title: "A" });
    state = openTab(state, { id: "b", title: "B" });
    state = openTab(state, { id: "c", title: "C" });
    state = reorderTab(state, "c", 0);

    expect(state.tabs.map((tab) => tab.id)).toEqual(["c", "a", "b"]);
    expect(state.tabs.map((tab) => tab.sequence)).toEqual([0, 1, 2]);
  });

  it("closes tabs and selects the next active tab", () => {
    let state = openTab(initialMultitabState, { id: "a", title: "A" });
    state = openTab(state, { id: "b", title: "B" });
    state = closeTab(state, "b");

    expect(state.tabs.map((tab) => tab.id)).toEqual(["a"]);
    expect(state.activeTabId).toBe("a");
  });

  it("activates a tab by id", () => {
    let state = openTab(initialMultitabState, { id: "a", title: "A" });
    state = openTab(state, { id: "b", title: "B" });
    state = activateTab(state, "a");

    expect(state.activeTabId).toBe("a");
  });

  it("opens a new tab placeholder with kind new", () => {
    const state = openNewTab(initialMultitabState);
    const tab = state.tabs[0];

    expect(state.tabs).toHaveLength(1);
    expect(tab?.kind).toBe("new");
    expect(isNewTab(tab!)).toBe(true);
    expect(state.activeTabId).toBe(tab?.id);
  });

  it("inserts a new tab right after the active tab", () => {
    let state = openTab(initialMultitabState, {
      id: "/home",
      title: "Home",
      kind: "route",
    });
    state = openTab(state, {
      id: "/catalog",
      title: "Catalog",
      kind: "route",
    });
    state = openNewTab(state);
    const newTabId = state.activeTabId!;

    expect(state.tabs.map((tab) => tab.id)).toEqual([
      "/home",
      "/catalog",
      newTabId,
    ]);
    expect(state.activeTabId).toBe(newTabId);
    expect(state.tabs[2]?.kind).toBe("new");
  });

  it("creates unique uuid new tab ids", () => {
    const first = createNewTabInput();
    const second = createNewTabInput();

    expect(isNewTabId(first.id)).toBe(true);
    expect(first.id).not.toBe(second.id);
    expect(first.kind).toBe("new");
  });

  it("returns empty workspace after closing the last route tab", () => {
    let state = openTab(initialMultitabState, {
      id: "/a",
      title: "A",
      kind: "route",
    });
    state = closeTab(state, "/a");

    expect(isWorkspaceEmpty(state)).toBe(true);
    expect(state.activeTabId).toBeNull();
  });

  it("returns empty workspace after closing the last new tab", () => {
    let state = openNewTab(initialMultitabState);
    const newTabId = state.activeTabId!;
    state = closeTab(state, newTabId);

    expect(isWorkspaceEmpty(state)).toBe(true);
    expect(state.activeTabId).toBeNull();
  });

  it("treats distinct route params as distinct tabs", () => {
    let state = openTab(initialMultitabState, {
      id: "/detail/1",
      title: "Detail 1",
      kind: "route",
    });
    state = openTab(state, {
      id: "/detail/2",
      title: "Detail 2",
      kind: "route",
    });

    expect(state.tabs).toHaveLength(2);
    state = openTab(state, {
      id: "/detail/1",
      title: "Detail 1",
      kind: "route",
    });
    expect(state.tabs).toHaveLength(2);
    expect(state.activeTabId).toBe("/detail/1");
  });

  it("ensureTab adds a route tab without changing active tab", () => {
    let state = openNewTab(initialMultitabState);
    const newTabId = state.activeTabId;

    state = ensureTab(state, { id: "/", title: "Home", kind: "route" });

    expect(state.tabs).toHaveLength(2);
    expect(state.activeTabId).toBe(newTabId);
  });

  it("replaceTab converts a new tab into a route tab", () => {
    const state = openNewTab(initialMultitabState);
    const newTabId = state.activeTabId!;

    const replaced = replaceTab(state, newTabId, {
      id: "/inventory/uom",
      title: "Units of measure",
      kind: "route",
    });

    expect(replaced.tabs).toHaveLength(1);
    expect(replaced.activeTabId).toBe("/inventory/uom");
    expect(replaced.tabs[0]?.kind).toBe("route");
  });

  it("closes active tab using MRU — A then B then C, close C activates B", () => {
    let state = openTab(initialMultitabState, {
      id: "/inventory/products",
      title: "Products",
      kind: "route",
    });
    state = openTab(state, {
      id: "/procurement/purchase-orders",
      title: "Purchase orders",
      kind: "route",
    });
    state = openTab(state, {
      id: "/dashboard",
      title: "Dashboard",
      kind: "route",
    });

    state = closeTab(state, "/dashboard");

    expect(state.tabs.map((tab) => tab.id)).toEqual([
      "/inventory/products",
      "/procurement/purchase-orders",
    ]);
    expect(state.activeTabId).toBe("/procurement/purchase-orders");
  });

  it("closes active tab using MRU after re-activating an older tab", () => {
    let state = openTab(initialMultitabState, {
      id: "/a",
      title: "A",
      kind: "route",
    });
    state = openTab(state, { id: "/b", title: "B", kind: "route" });
    state = openTab(state, { id: "/a", title: "A", kind: "route" });

    state = closeTab(state, "/a");

    expect(state.activeTabId).toBe("/b");
  });

  it("falls back to adjacent tab when MRU is empty", () => {
    let state = openTab(initialMultitabState, {
      id: "/a",
      title: "A",
      kind: "route",
    });
    state = openTab(state, { id: "/b", title: "B", kind: "route" });
    state = closeTab(state, "/b");

    expect(state.activeTabId).toBe("/a");
  });

  it("setTabCloseGuard marks tabs as protected from close", () => {
    let state = openTab(initialMultitabState, { id: "/a", title: "A" });
    state = setTabCloseGuard(state, "/a", true);

    const tab = state.tabs[0];
    expect(tab?.closeGuard).toBe(true);
    expect(canCloseTab(tab)).toBe(false);
    expect(canCloseTab(tab, { force: true })).toBe(true);

    state = setTabCloseGuard(state, "/a", false);
    expect(state.tabs[0]?.closeGuard).toBeUndefined();
    expect(canCloseTab(state.tabs[0] ?? null)).toBe(true);
  });
});
