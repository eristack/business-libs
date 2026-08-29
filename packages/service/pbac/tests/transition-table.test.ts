import { describe, expect, it } from "vitest";
import {
  assertValidTransitionTable,
  validateTransitionTable,
} from "../src/index.js";

describe("validateTransitionTable", () => {
  it("accepts a valid table", () => {
    expect(
      validateTransitionTable({
        draft: ["submit"],
        submitted: ["approve", "reject"],
      }),
    ).toEqual([]);
    expect(() =>
      assertValidTransitionTable({
        draft: ["submit"],
        approved: ["post"],
      }),
    ).not.toThrow();
  });

  it("flags empty actions and duplicates", () => {
    const issues = validateTransitionTable({
      "": ["submit"],
      draft: [],
      open: ["close", "close"],
    });
    expect(issues).toContainEqual({ kind: "empty-status" });
    expect(issues).toContainEqual({ kind: "empty-actions", status: "draft" });
    expect(issues).toContainEqual({
      kind: "duplicate-action",
      status: "open",
      action: "close",
    });
  });
});
