import { describe, expect, it } from "vitest";
import { Money } from "@eristack/money";
import {
  createRoundingPolicyRegistry,
  RoundingPolicyNotFoundError,
} from "../src/index.js";

describe("rounding-policy", () => {
  it("uses explicit policy scale", () => {
    const reg = createRoundingPolicyRegistry([
      { id: "ledger", scale: 2, mode: "HALF_EVEN" },
    ]);
    const op = reg.roundingFor({ policyId: "ledger", currency: "USD" });
    const rounded = Money.of("10.015", "USD").with(op);
    expect(rounded.amountString()).toBe("10.02");
  });

  it("applies currency override", () => {
    const reg = createRoundingPolicyRegistry([
      {
        id: "cash",
        scale: 2,
        currencyOverrides: { JPY: { scale: 0, mode: "DOWN" } },
      },
    ]);
    const jpy = reg.roundingFor({ policyId: "cash", currency: "JPY" });
    expect(Money.of("100.9", "JPY").with(jpy).amountString()).toBe("100");
  });

  it("throws when policy missing", () => {
    const reg = createRoundingPolicyRegistry();
    expect(() => reg.roundingFor({ policyId: "nope" })).toThrow(
      RoundingPolicyNotFoundError,
    );
  });
});
