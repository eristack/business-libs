import { describe, expect, it } from "vitest";
import {
  formatAddressLines,
  formatAddressOneLine,
  isSameCountry,
  normalizeAddress,
  normalizeCountryCode,
  AddressParseError,
} from "../src/index.js";

describe("@eristack/address", () => {
  it("supports custom separator in one-line format", () => {
    const line = formatAddressOneLine(
      { line1: "A", locality: "B", countryCode: "US" },
      { separator: " | " },
    );
    expect(line).toBe("A | B | US");
  });

  it("formatAddressLines omits blank optional fields", () => {
    const lines = formatAddressLines({
      line1: "1 Main",
      locality: "Austin",
      countryCode: "us",
    });
    expect(lines).toEqual(["1 Main", "Austin", "US"]);
  });

  it("isSameCountry ignores case on country code", () => {
    expect(
      isSameCountry(
        { line1: "a", locality: "b", countryCode: "id" },
        { line1: "c", locality: "d", countryCode: "ID" },
      ),
    ).toBe(true);
  });

  it("rejects empty line1 and locality", () => {
    expect(() =>
      normalizeAddress({ line1: "  ", locality: "Jakarta", countryCode: "ID" }),
    ).toThrow(/line1/i);
    expect(() =>
      normalizeAddress({ line1: "Jl. 1", locality: "", countryCode: "ID" }),
    ).toThrow(/locality/i);
  });

  it("normalizes country code to uppercase", () => {
    expect(normalizeCountryCode("id")).toBe("ID");
  });

  it("formats one line", () => {
    const formatted = formatAddressOneLine({
      line1: "Jl. Sudirman 1",
      locality: "Jakarta",
      countryCode: "ID",
    });
    expect(formatted).toContain("Jakarta");
    expect(formatted).toContain("ID");
  });

  it("rejects invalid country", () => {
    expect(() =>
      normalizeAddress({ line1: "x", locality: "y", countryCode: "IND" }),
    ).toThrow(AddressParseError);
  });
});
