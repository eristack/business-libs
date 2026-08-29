import { describe, expect, it } from "vitest";
import { DEFAULT_MULTITAB_SHORTCUTS } from "../src/core/shortcuts.js";

describe("DEFAULT_MULTITAB_SHORTCUTS", () => {
  it("exports stable headless shortcut bindings", () => {
    const actions = DEFAULT_MULTITAB_SHORTCUTS.map((b) => b.action);
    expect(actions).toContain("closeActiveTab");
    expect(actions).toContain("openNewTab");
    expect(new Set(actions).size).toBe(actions.length);
  });
});
