import { describe, expect, it } from "vitest";
import {
  convertUom,
  registerUomDefinitions,
  resetUomRegistry,
  uomQty,
  UomConversionError,
} from "../src/index.js";

describe("@eristack/uom", () => {
  it("converts mass units with string decimals", () => {
    const kg = uomQty("1.5", "kg");
    const g = convertUom(kg, "g");
    expect(g).toEqual({ amount: "1500", unit: "g" });
  });

  it("rejects cross-dimension conversion", () => {
    const liters = uomQty("2", "L");
    expect(() => convertUom(liters, "kg")).toThrow(UomConversionError);
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
