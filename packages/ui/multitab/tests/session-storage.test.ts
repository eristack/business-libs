import { describe, expect, it, beforeEach } from "vitest";
import {
  initialMultitabState,
  loadMultitabFromSessionStorage,
  openTab,
  saveMultitabToSessionStorage,
} from "../src/index.js";

function mockSessionStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
    clear: () => map.clear(),
  };
}

describe("sessionStorage persistence", () => {
  beforeEach(() => {
    (globalThis as { sessionStorage?: ReturnType<typeof mockSessionStorage> }).sessionStorage =
      mockSessionStorage();
  });

  it("round-trips tab strip state", () => {
    const state = openTab(initialMultitabState, {
      id: "/invoices/1",
      kind: "route",
      title: "Invoice",
    });
    saveMultitabToSessionStorage(state, "test.multitab");
    const loaded = loadMultitabFromSessionStorage("test.multitab");
    expect(loaded?.tabs).toHaveLength(1);
    expect(loaded?.tabs[0]?.title).toBe("Invoice");
  });
});
