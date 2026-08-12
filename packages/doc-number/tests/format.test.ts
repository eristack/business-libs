import { describe, expect, it } from "vitest";
import {
  formatDocumentNumber,
  InvalidPatternError,
  parseDocumentNumber,
  ParseMismatchError,
  parsePattern,
  previewDocumentNumber,
} from "../src/index.js";

describe("tokens + format", () => {
  it("parses tokens and pads SEQ", () => {
    const nodes = parsePattern("INV-{YYYY}{MM}-{SEQ:5}");
    expect(nodes.map((n) => n.kind)).toEqual([
      "literal",
      "YYYY",
      "MM",
      "literal",
      "SEQ",
    ]);
    expect(
      formatDocumentNumber({
        pattern: "INV-{YYYY}{MM}-{SEQ:5}",
        sequence: 42,
        at: new Date("2026-08-11T12:00:00.000Z"),
      }),
    ).toBe("INV-202608-00042");
  });

  it("defaults SEQ width to 1", () => {
    expect(
      formatDocumentNumber({
        pattern: "PO-{SEQ}",
        sequence: 7,
        at: new Date("2026-01-01T00:00:00.000Z"),
      }),
    ).toBe("PO-7");
  });

  it("supports YY/DD and preview alias", () => {
    const at = new Date("2026-08-11T00:00:00.000Z");
    expect(
      previewDocumentNumber({ pattern: "R-{YY}{MM}{DD}-{SEQ:3}", sequence: 9, at }),
    ).toBe("R-260811-009");
  });

  it("rejects missing SEQ and unknown tokens", () => {
    expect(() => parsePattern("INV-{YYYY}")).toThrow(InvalidPatternError);
    expect(() => parsePattern("INV-{BRANCH}-{SEQ}")).toThrow(InvalidPatternError);
    expect(() => parsePattern("INV-{SEQ}-{SEQ:2}")).toThrow(InvalidPatternError);
  });

  it("parses document numbers back", () => {
    const parsed = parseDocumentNumber("INV-{YYYY}-{SEQ:5}", "INV-2026-00042");
    expect(parsed.sequence).toBe(42);
    expect(parsed.parts).toEqual({ YYYY: "2026", SEQ: "00042" });
  });

  it("throws on parse mismatch", () => {
    expect(() => parseDocumentNumber("INV-{YYYY}-{SEQ:5}", "PO-2026-00001")).toThrow(
      ParseMismatchError,
    );
  });
});
