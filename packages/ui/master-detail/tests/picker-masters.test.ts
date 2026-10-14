import { describe, expect, it } from "vitest";
import { pickerMasters } from "../src/picker-masters.js";

describe("pickerMasters", () => {
  it("keeps active rows and the current selection when deactivated", () => {
    const rows = [
      { id: "a", deactivatedAt: null },
      { id: "b", deactivatedAt: "2026-01-01" },
      { id: "c", deactivatedAt: "2026-02-01" },
    ];
    expect(pickerMasters(rows, "b").map((r) => r.id)).toEqual(["a", "b"]);
    expect(pickerMasters(rows).map((r) => r.id)).toEqual(["a"]);
  });
});
