import { describe, expect, it } from "vitest";

import {
  formatPersonDisplay,
  formatPersonSortable,
  normalizePerson,
  PersonParseError,
} from "../src/index.js";

describe("normalizePerson", () => {
  it("trims and requires given/family", () => {
    const p = normalizePerson({
      name: { given: " Ada ", family: " Lovelace " },
    });
    expect(p.name.given).toBe("Ada");
    expect(p.name.family).toBe("Lovelace");
  });

  it("requires genderOther for other", () => {
    expect(() =>
      normalizePerson({
        name: { given: "A", family: "B" },
        gender: "other",
      }),
    ).toThrow(PersonParseError);
  });
});

describe("format", () => {
  it("display order", () => {
    expect(
      formatPersonDisplay({
        name: { given: "Ada", family: "Lovelace", prefix: "Ms" },
      }),
    ).toBe("Ms Ada Lovelace");
  });

  it("sortable", () => {
    expect(
      formatPersonSortable({
        name: { given: "Ada", middle: "M", family: "Lovelace" },
      }),
    ).toBe("Lovelace, Ada M");
  });
});
