import { describe, expect, it } from "vitest";
import {
  createNewTabInput,
  createTabWorkspace,
  initialMultitabState,
  isNewTabId,
  openNewTab,
  openTab,
  parseMultitabState,
  sanitizePersistedState,
  serializeMultitabState,
} from "../src/index.js";

describe("multitab persistence", () => {
  it("persists new tabs across save/load", () => {
    const state = openNewTab(
      openTab(initialMultitabState, {
        id: "/",
        title: "Home",
        kind: "route",
      }),
    );

    const persisted = sanitizePersistedState(state);
    const restored = parseMultitabState(serializeMultitabState(state));

    expect(persisted.tabs).toHaveLength(2);
    expect(persisted.tabs.some((tab) => tab.kind === "new")).toBe(true);
    expect(restored?.activeTabId).toBe(state.activeTabId);
    expect(restored?.tabs.map((tab) => tab.id)).toEqual(
      state.tabs.map((tab) => tab.id),
    );
  });

  it("persists recentTabIds across save/load", () => {
    let state = openTab(initialMultitabState, {
      id: "/a",
      title: "A",
      kind: "route",
    });
    state = openTab(state, { id: "/b", title: "B", kind: "route" });
    state = openTab(state, { id: "/c", title: "C", kind: "route" });

    const restored = parseMultitabState(serializeMultitabState(state));

    expect(restored?.activeTabId).toBe("/c");
    expect(restored?.recentTabIds).toEqual(["/b", "/a"]);
  });

  it("round-trips persisted state through json", () => {
    const state = openTab(initialMultitabState, {
      id: "/inventory/uom",
      title: "Units of measure",
      description: "Registry",
      kind: "route",
    });

    const restored = parseMultitabState(serializeMultitabState(state));

    expect(restored).toEqual(state);
  });

  it("drops legacy new-tab ids on sanitize", () => {
    const raw = serializeMultitabState({
      tabs: [
        {
          id: "__new__:7",
          title: "New tab",
          sequence: 0,
          kind: "new",
        },
        {
          id: "/",
          title: "Home",
          sequence: 1,
          kind: "route",
        },
      ],
      activeTabId: "/",
    });

    const restored = parseMultitabState(raw);

    expect(restored?.tabs).toHaveLength(1);
    expect(restored?.tabs[0]?.id).toBe("/");
  });

  it("rejects invalid persisted payloads", () => {
    expect(parseMultitabState("not-json")).toBeNull();
    expect(parseMultitabState('{"tabs":"nope"}')).toBeNull();
  });
});

describe("createNewTabInput", () => {
  it("uses uuid ids", () => {
    const first = createNewTabInput();
    const second = createNewTabInput();

    expect(isNewTabId(first.id)).toBe(true);
    expect(isNewTabId(second.id)).toBe(true);
    expect(first.id).not.toBe(second.id);
  });
});

describe("createTabWorkspace", () => {
  it("dispatches reducer actions and notifies subscribers", () => {
    const workspace = createTabWorkspace();
    let notified = 0;
    workspace.subscribe(() => {
      notified += 1;
    });

    workspace.dispatch({
      type: "open",
      input: { id: "/home", title: "Home", kind: "route" },
    });

    expect(notified).toBe(1);
    expect(workspace.getState().activeTabId).toBe("/home");
  });
});
