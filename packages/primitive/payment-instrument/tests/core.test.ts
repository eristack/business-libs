import { describe, expect, it } from "vitest";
import {
  CardPan,
  PaymentInstrumentError,
  findPanLikeStringPaths,
  isRawPanString,
  toPersistable,
} from "../src/index.js";

describe("CardPan", () => {
  it("parses test PAN and redacts JSON", () => {
    const pan = CardPan.parse("4242 4242 4242 4242");
    expect(pan.last4).toBe("4242");
    expect(pan.brandHint()).toBe("visa");
    expect(() => pan.toJSON()).toThrow(PaymentInstrumentError);
  });
});

describe("toPersistable", () => {
  it("normalizes display + gateway", () => {
    const stored = toPersistable({
      display: {
        last4: "4242",
        brand: "visa",
        funding: "credit",
        expMonth: 12,
        expYear: 2030,
      },
      gateway: { gateway: "stripe", tokenId: "pm_123" },
    });
    expect(stored.gateway.tokenId).toBe("pm_123");
    expect(stored.display.last4).toBe("4242");
  });

  it("rejects PAN-shaped tokenId", () => {
    expect(() =>
      toPersistable({
        display: {
          last4: "4242",
          brand: "visa",
          funding: "debit",
          expMonth: 1,
          expYear: 2030,
        },
        gateway: {
          gateway: "stripe",
          tokenId: "4242424242424242",
        },
      }),
    ).toThrow(PaymentInstrumentError);
  });
});

describe("pan-detect", () => {
  it("detects raw pan strings", () => {
    expect(isRawPanString("4242424242424242")).toBe(true);
    expect(isRawPanString("pm_abc")).toBe(false);
  });

  it("walks objects", () => {
    expect(
      findPanLikeStringPaths({ card: "4242424242424242" }),
    ).toContain("body.card");
  });
});
