import { describe, expect, it } from "vitest";
import { Money } from "../src/index.js";
import { formatMoney } from "../src/core/format/format.js";

describe("Money.format", () => {
  it("formats with Intl by default", () => {
    const m = Money.of("1234.5", "USD");
    expect(m.format("en-US")).toMatch(/\$1,234\.50/);
  });

  it("uses app formatter hook when provided", () => {
    const m = Money.of("99", "USD");
    expect(
      m.format({
        locale: "en-US",
        formatter: (amount) => `CUSTOM ${amount.amountString()} ${amount.currency.currencyCode}`,
      }),
    ).toBe("CUSTOM 99 USD");
  });

  it("formatMoney respects formatter in options object", () => {
    const m = Money.of("10", "EUR");
    expect(
      formatMoney(m, {
        locale: "de-DE",
        formatter: (_, locale) => `hook:${locale}`,
      }),
    ).toBe("hook:de-DE");
  });
});
