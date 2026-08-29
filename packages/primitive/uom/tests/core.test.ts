import { describe, expect, it } from "vitest";
import {
  convertUom,
  registerUomDefinitions,
  resetUomRegistry,
  uomQty,
  UomConversionError,
} from "../src/index.js";

describe("@eristack/uom", () => {
  it("converts zero quantity", () => {
    expect(convertUom(uomQty("0", "kg"), "g")).toEqual({ amount: "0", unit: "g" });
  });

  it("converts mass units with string decimals", () => {
    const kg = uomQty("1.5", "kg");
    const g = convertUom(kg, "g");
    expect(g).toEqual({ amount: "1500", unit: "g" });
  });

  it("rejects cross-dimension conversion", () => {
    const liters = uomQty("2", "L");
    expect(() => convertUom(liters, "kg")).toThrow(UomConversionError);
  });

  it("rejects negative and non-numeric amounts", () => {
    expect(() => uomQty("-1", "kg")).toThrow(/negative/i);
    expect(() => uomQty("abc", "kg")).toThrow(UomConversionError);
    expect(() => uomQty("", "kg")).toThrow(UomConversionError);
  });

  it("normalizes whitespace and preserves precision", () => {
    expect(uomQty("  2.500  ", "kg").amount).toBe("2.5");
  });

  it("allows custom units via registerUomDefinitions", () => {
    resetUomRegistry();
    registerUomDefinitions([
      { code: "box", dimension: "count", toBaseFactor: "12", label: "Box of 12" },
    ]);
    const dozen = uomQty("2", "box");
    const pcs = convertUom(dozen, "pcs");
    expect(pcs.amount).toBe("24");
    resetUomRegistry();
  });
});
