import { describe, expect, it } from "vitest";
import { Money } from "../src/index.js";
import { readMoneyField, sendMoney } from "../src/express/index.js";

describe("@eristack/money/express", () => {
  it("readMoneyField parses body field and sendMoney serializes Money", () => {
    const body = { price: { currency: "USD", amount: "10.00" } };
    const price = readMoneyField(body, "price");

    expect(price.isEqualTo(Money.of("10", "USD"))).toBe(true);
    expect(sendMoney(price)).toEqual({ currency: "USD", amount: "10" });
  });
});
