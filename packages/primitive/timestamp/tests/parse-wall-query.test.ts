import { describe, expect, it } from "vitest";
import { parseWallQueryValue } from "../src/express/parse-wall-query.js";

describe("parseWallQueryValue", () => {
  it("parses wall local strings with timezone", () => {
    const wall = parseWallQueryValue("2026-09-04", "Asia/Jakarta", "etd");
    expect(wall.local).toBe("2026-09-04");
    expect(wall.timezone).toBe("Asia/Jakarta");
  });
});
