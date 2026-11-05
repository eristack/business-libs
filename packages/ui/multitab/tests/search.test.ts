import { describe, expect, it } from "vitest";
import { planCloseTabNavigation } from "../src/core/routes.js";
import {
  closeTab,
  initialMultitabState,
  openTab,
  setTabSearch,
} from "../src/core/state.js";
import {
  getTabSearch,
  parseSearchByTabId,
  pruneSearchByTabId,
  withTabSearch,
  withoutTabSearch,
} from "../src/core/search.js";
import {
  parseMultitabState,
  sanitizePersistedState,
  serializeMultitabState,
} from "../src/core/persistence.js";

describe("tab search cache", () => {
  it("stores and reads search by tab id", () => {
    let state = openTab(initialMultitabState, {
      id: "/jobs/a",
      title: "Job A",
      kind: "route",
    });
    state = setTabSearch(state, "/jobs/a", {
      viewMode: "tabs",
      tab: "financials",
    });

    expect(getTabSearch(state, "/jobs/a")).toEqual({
      viewMode: "tabs",
      tab: "financials",
    });
  });

  it("opens a tab with initial search", () => {
    const state = openTab(initialMultitabState, {
      id: "/jobs/a",
      title: "Job A",
      kind: "route",
      search: { tab: "overview" },
    });

    expect(getTabSearch(state, "/jobs/a")).toEqual({ tab: "overview" });
  });

  it("drops search when a tab closes", () => {
    let state = openTab(initialMultitabState, {
      id: "/jobs/a",
      title: "Job A",
      kind: "route",
      search: { tab: "financials" },
    });
    state = openTab(state, {
      id: "/jobs/b",
      title: "Job B",
      kind: "route",
    });

    state = closeTab(state, "/jobs/a");

    expect(state.searchByTabId?.["/jobs/a"]).toBeUndefined();
    expect(state.tabs.map((tab) => tab.id)).toEqual(["/jobs/b"]);
  });

  it("returns cached search when closing the active tab", () => {
    let state = openTab(initialMultitabState, {
      id: "/jobs/a",
      title: "Job A",
      kind: "route",
      search: { tab: "financials" },
    });
    state = openTab(state, {
      id: "/jobs/b",
      title: "Job B",
      kind: "route",
    });

    const plan = planCloseTabNavigation(state, "/jobs/b");

    expect(plan.nextPath).toBe("/jobs/a");
    expect(plan.nextSearch).toEqual({ tab: "financials" });
  });

  it("prunes search for closed tabs on sanitize", () => {
    const state = sanitizePersistedState({
      tabs: [
        {
          id: "/jobs/b",
          title: "Job B",
          sequence: 0,
          kind: "route",
        },
      ],
      activeTabId: "/jobs/b",
      searchByTabId: {
        "/jobs/a": { tab: "old" },
        "/jobs/b": { tab: "current" },
      },
    });

    expect(state.searchByTabId).toEqual({ "/jobs/b": { tab: "current" } });
  });

  it("round-trips searchByTabId through persistence", () => {
    let state = openTab(initialMultitabState, {
      id: "/jobs/a",
      title: "Job A",
      kind: "route",
    });
    state = withTabSearch(state, "/jobs/a", { viewMode: "tabs" });

    const restored = parseMultitabState(serializeMultitabState(state));

    expect(restored?.searchByTabId).toEqual(state.searchByTabId);
  });

  it("parses legacy payloads without searchByTabId", () => {
    const legacy = serializeMultitabState(
      openTab(initialMultitabState, {
        id: "/home",
        title: "Home",
        kind: "route",
      }),
    );
    const restored = parseMultitabState(legacy);

    expect(restored?.searchByTabId).toBeUndefined();
  });

  it("parseSearchByTabId ignores non-objects", () => {
    expect(parseSearchByTabId(null)).toBeUndefined();
    expect(parseSearchByTabId({ "/a": "nope" })).toBeUndefined();
  });

  it("withoutTabSearch is a no-op when missing", () => {
    const state = openTab(initialMultitabState, {
      id: "/a",
      title: "A",
      kind: "route",
    });
    expect(withoutTabSearch(state, "/missing")).toBe(state);
  });

  it("pruneSearchByTabId clears empty map", () => {
    const state = pruneSearchByTabId({
      tabs: [],
      activeTabId: null,
      searchByTabId: { "/gone": { x: 1 } },
    });
    expect(state.searchByTabId).toBeUndefined();
  });
});
