import { describe, expect, it } from "vitest";
import {
  UnlocodeError,
  formatUnlocodeDisplay,
  isSampleUnlocode,
  normalizeUnlocode,
  parseUnlocode,
} from "../src/index.js";

describe("normalizeUnlocode", () => {
  it("accepts compact and spaced forms", () => {
    expect(normalizeUnlocode("idjkt")).toBe("IDJKT");
    expect(normalizeUnlocode("ID JKT")).toBe("IDJKT");
    expect(normalizeUnlocode("usnyc")).toBe("USNYC");
  });

  it("rejects bad country", () => {
    expect(() => normalizeUnlocode("QQABC")).toThrow(UnlocodeError);
  });

  it("rejects wrong length", () => {
    expect(() => normalizeUnlocode("IDJK")).toThrow(UnlocodeError);
  });
});

describe("parse and format", () => {
  it("parses country and location from compact code", () => {
    expect(parseUnlocode("SGSIN")).toEqual({
      country: "SG",
      location: "SIN",
      code: "SGSIN",
    });
  });

  it("formats display", () => {
    expect(formatUnlocodeDisplay("IDJKT")).toBe("ID JKT");
  });
});

describe("sample set", () => {
  it("flags known demo ports", () => {
    expect(isSampleUnlocode("IDJKT")).toBe(true);
    expect(isSampleUnlocode("IDXXX")).toBe(false);
  });
});
