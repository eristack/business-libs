import { describe, expect, it } from "vitest";
import {
  CountryCodeError,
  alpha2ToAlpha3,
  alpha3ToAlpha2,
  compareAlpha2,
  isAssignedAlpha2,
  listAssignedAlpha2,
  normalizeAlpha2,
  normalizeSubdivisionCode,
} from "../src/index.js";

describe("normalizeAlpha2", () => {
  it("uppercases assigned codes", () => {
    expect(normalizeAlpha2(" id ")).toBe("ID");
    expect(normalizeAlpha2("us")).toBe("US");
  });

  it("rejects wrong length", () => {
    expect(() => normalizeAlpha2("USA")).toThrow(CountryCodeError);
    expect(() => normalizeAlpha2("1")).toThrow(CountryCodeError);
  });

  it("rejects unassigned alpha-2", () => {
    expect(() => normalizeAlpha2("QQ")).toThrow(CountryCodeError);
  });
});

describe("isAssignedAlpha2", () => {
  it("returns true for ID and false for QQ", () => {
    expect(isAssignedAlpha2("id")).toBe(true);
    expect(isAssignedAlpha2("QQ")).toBe(false);
  });
});

describe("alpha-3", () => {
  it("converts both directions", () => {
    expect(alpha3ToAlpha2("IDN")).toBe("ID");
    expect(alpha2ToAlpha3("ID")).toBe("IDN");
    expect(alpha3ToAlpha2("usa")).toBe("US");
  });
});

describe("subdivision", () => {
  it("normalizes matching prefix", () => {
    expect(normalizeSubdivisionCode("US", "ca")).toBe("US-CA");
    expect(normalizeSubdivisionCode("id", "JK")).toBe("ID-JK");
  });

  it("rejects country mismatch", () => {
    expect(() => normalizeSubdivisionCode("ID", "US-CA")).toThrow(CountryCodeError);
  });
});

describe("list and compare", () => {
  it("lists assigned codes including XK", () => {
    expect(listAssignedAlpha2()).toContain("XK");
    expect(listAssignedAlpha2()).toContain("ID");
  });

  it("compares lexicographically", () => {
    expect(compareAlpha2("US", "ID")).toBeGreaterThan(0);
  });
});
