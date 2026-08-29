import { describe, expect, it } from "vitest";
import {
  assertAcyclicModifierOrder,
  ModifierOrderError,
  validateModifierStackOrder,
} from "../src/core/modifier-order.js";

describe("modifier-order", () => {
  it("detects cycles in profile rules", () => {
    expect(() =>
      assertAcyclicModifierOrder([
        { kind: "discount", after: "surcharge" },
        { kind: "surcharge", after: "discount" },
      ]),
    ).toThrow(ModifierOrderError);
  });

  it("validates stack order against rules", () => {
    expect(() =>
      validateModifierStackOrder(
        [{ kind: "discount" }, { kind: "surcharge" }],
        [{ kind: "surcharge", after: "discount" }],
      ),
    ).not.toThrow();
    expect(() =>
      validateModifierStackOrder(
        [{ kind: "surcharge" }, { kind: "discount" }],
        [{ kind: "surcharge", after: "discount" }],
      ),
    ).toThrow(ModifierOrderError);
  });
});
