import { describe, expect, it } from "vitest";
import { persistablePaymentInstrumentSchema } from "../src/zod/index.js";

describe("persistablePaymentInstrumentSchema", () => {
  it("accepts token + display", () => {
    const v = persistablePaymentInstrumentSchema.parse({
      display: {
        last4: "4242",
        brand: "visa",
        funding: "credit",
        expMonth: 12,
        expYear: 2030,
      },
      gateway: { gateway: "xendit", tokenId: "tok_abc" },
    });
    expect(v.gateway.gateway).toBe("xendit");
  });

  it("rejects pan tokenId", () => {
    expect(
      persistablePaymentInstrumentSchema.safeParse({
        display: {
          last4: "4242",
          brand: "visa",
          funding: "credit",
          expMonth: 12,
          expYear: 2030,
        },
        gateway: { gateway: "x", tokenId: "4242424242424242" },
      }).success,
    ).toBe(false);
  });
});
