import { describe, expect, it } from "vitest";
import {
  formatAddressOneLine,
  normalizeAddress,
  normalizeCountryCode,
  AddressParseError,
} from "../src/index.js";

describe("@eristack/address", () => {
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
