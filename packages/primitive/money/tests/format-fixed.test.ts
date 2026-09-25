import { describe, expect, it } from "vitest";
import { Money } from "../src/index.js";
import { formatFixed, toDisplayString } from "../src/core/format/fixed-string.js";

describe("formatFixed / toDisplayString", () => {
  it("pads USD to two fraction digits without Number()", () => {
    const m = Money.of("2.5", "USD");
    expect(formatFixed(m)).toBe("2.50");
    expect(toDisplayString(m)).toBe("2.50");
  });

  it("keeps JPY at zero fraction digits", () => {
    const m = Money.of("100", "JPY");
    expect(formatFixed(m)).toBe("100");
  });

  it("honors minFractionDigits override", () => {
    const m = Money.of("1.2", "USD");
    expect(toDisplayString(m, { minFractionDigits: 4 })).toBe("1.2000");
  });
});
