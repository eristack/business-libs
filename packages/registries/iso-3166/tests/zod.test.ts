import { describe, expect, it } from "vitest";
import { countryAlpha2Schema, countryAlpha3Schema } from "../src/zod/index.js";

describe("countryAlpha2Schema", () => {
  it("parses assigned code", () => {
    expect(countryAlpha2Schema.parse(" id ")).toBe("ID");
  });

  it("fails on QQ", () => {
    expect(countryAlpha2Schema.safeParse("QQ").success).toBe(false);
  });
});

describe("countryAlpha3Schema", () => {
  it("returns alpha-2", () => {
    expect(countryAlpha3Schema.parse("idn")).toBe("ID");
  });
});
