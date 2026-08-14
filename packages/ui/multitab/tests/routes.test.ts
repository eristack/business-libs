import { describe, expect, it } from "vitest";
import {
  activeTabIdFromRoute,
  emptyTabPath,
  newTabPath,
  parseMultitabRoute,
  pathForTab,
  planCloseTabNavigation,
  planOpenNewTabNavigation,
  routeTabId,
  syncStateForRouteVisit,
} from "../src/core/routes.js";
import { initialMultitabState, openTab } from "../src/core/state.js";

describe("routeTabId", () => {
  it("preserves root path", () => {
    expect(routeTabId("/")).toBe("/");
  });

  it("strips trailing slash", () => {
    expect(routeTabId("/detail/1/")).toBe("/detail/1");
  });

  it("keeps distinct param segments", () => {
    expect(routeTabId("/detail/1")).not.toBe(routeTabId("/detail/2"));
  });
});

describe("parseMultitabRoute", () => {
  it("parses empty workspace", () => {
    expect(parseMultitabRoute("/")).toEqual({ kind: "empty" });
  });

  it("parses new tab routes", () => {
    const tabId = "0192e8f4-7b3a-7000-8000-000000000001";
    expect(parseMultitabRoute(newTabPath(tabId))).toEqual({
      kind: "new",
      tabId,
    });
  });

  it("parses module routes", () => {
    expect(parseMultitabRoute("/sales/orders")).toEqual({
      kind: "route",
      pathname: "/sales/orders",
    });
  });
});

describe("activeTabIdFromRoute", () => {
  it("returns null for empty workspace", () => {
    expect(activeTabIdFromRoute("/")).toBeNull();
  });

  it("returns pathname for route tabs", () => {
    expect(activeTabIdFromRoute("/inventory/products")).toBe(
      "/inventory/products",
    );
  });
});

describe("syncStateForRouteVisit", () => {
  const resolveRouteTab = (pathname: string) => {
    if (pathname === "/dashboard") return { title: "Dashboard" };
    if (pathname === "/sales/orders") return { title: "Sales — Orders" };
    return null;
  };

  it("opens a route tab from the visited URL", () => {
    const state = syncStateForRouteVisit(
      initialMultitabState,
      "/dashboard",
      resolveRouteTab,
    );

    expect(state.tabs).toHaveLength(1);
    expect(state.tabs[0]?.id).toBe("/dashboard");
    expect(state.activeTabId).toBe("/dashboard");
  });

  it("reactivates an existing route tab without duplicating", () => {
    let state = syncStateForRouteVisit(
      initialMultitabState,
      "/dashboard",
      resolveRouteTab,
    );
    state = syncStateForRouteVisit(state, "/sales/orders", resolveRouteTab);
    state = syncStateForRouteVisit(state, "/dashboard", resolveRouteTab);

    expect(state.tabs.map((tab) => tab.id)).toEqual([
      "/dashboard",
      "/sales/orders",
    ]);
    expect(state.activeTabId).toBe("/dashboard");
  });

  it("creates a new tab from /new/{uuid} using the URL id", () => {
    const tabId = "0192e8f4-7b3a-7000-8000-000000000099";
    const state = syncStateForRouteVisit(
      initialMultitabState,
      newTabPath(tabId),
      resolveRouteTab,
    );

    expect(state.tabs[0]?.id).toBe(tabId);
    expect(state.tabs[0]?.kind).toBe("new");
    expect(state.activeTabId).toBe(tabId);
  });

  it("clears active tab for empty workspace route", () => {
    let state = syncStateForRouteVisit(
      initialMultitabState,
      "/dashboard",
      resolveRouteTab,
    );
    state = syncStateForRouteVisit(state, "/", resolveRouteTab);

    expect(state.tabs).toHaveLength(1);
    expect(state.activeTabId).toBeNull();
  });
});

describe("planCloseTabNavigation", () => {
  it("navigates to empty workspace when closing the last tab", () => {
    let state = openTab(initialMultitabState, {
      id: "/dashboard",
      title: "Dashboard",
      kind: "route",
    });

    const plan = planCloseTabNavigation(state, "/dashboard");

    expect(plan.nextState.tabs).toHaveLength(0);
    expect(plan.nextPath).toBe(emptyTabPath());
  });

  it("navigates to the next tab path when closing the active tab", () => {
    let state = openTab(initialMultitabState, {
      id: "/dashboard",
      title: "Dashboard",
      kind: "route",
    });
    state = openTab(state, {
      id: "/sales/orders",
      title: "Sales — Orders",
      kind: "route",
    });

    const plan = planCloseTabNavigation(state, "/sales/orders");

    expect(plan.nextState.activeTabId).toBe("/dashboard");
    expect(plan.nextPath).toBe("/dashboard");
  });
});

describe("planOpenNewTabNavigation", () => {
  it("returns a /new/{uuid} path matching the tab id", () => {
    const plan = planOpenNewTabNavigation(initialMultitabState);

    expect(plan.nextPath).toBe(newTabPath(plan.tabId));
    expect(plan.nextState.activeTabId).toBe(plan.tabId);
    expect(pathForTab(plan.nextState.tabs[0]!)).toBe(plan.nextPath);
  });
});
