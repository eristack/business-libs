import { describe, expect, it } from "vitest";

import {
  DimensionParseError,
  dimensionVolume,
  formatDimension,
  normalizeDimension,
} from "../src/index.js";

describe("normalizeDimension", () => {
  it("canonicalizes positive decimal strings", () => {
    expect(
      normalizeDimension({
        length: " 2.5 ",
        width: "10",
        height: "4.0",
        unit: " cm ",
      }),
    ).toEqual({
      length: "2.5",
      width: "10",
      height: "4",
      unit: "cm",
    });
  });

  it("rejects non-positive sides", () => {
    expect(() =>
      normalizeDimension({ length: "0", width: "1", height: "1" }),
    ).toThrow(DimensionParseError);
  });
});

describe("dimensionVolume", () => {
  it("multiplies L×W×H", () => {
    expect(
      dimensionVolume({
        length: "2",
        width: "3",
        height: "4",
      }),
    ).toBe("24.000000");
  });

  it("respects scale", () => {
    expect(
      dimensionVolume(
        { length: "1.1", width: "1.1", height: "1.1" },
        { scale: 2 },
      ),
    ).toBe("1.33");
  });
});

describe("formatDimension", () => {
  it("includes unit when present", () => {
    expect(
      formatDimension({ length: "1", width: "2", height: "3", unit: "m" }),
    ).toBe("1 × 2 × 3 m");
  });
});
