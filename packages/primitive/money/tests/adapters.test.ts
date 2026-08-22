import { describe, expect, it, beforeEach } from "vitest";
import { Money, Rounding } from "../src/index.js";
import {
  configureMoneyPersistence,
  moneyField,
  moneyNamingPresets,
  packMoney,
  resetMoneyPersistenceConfig,
  resolveMoneyColumnNames,
  unpackMoney,
} from "../src/drizzle/index.js";
import {
  parseMoneyJSON,
  RestMoneyFieldError,
  serializeMoney,
} from "../src/rest/index.js";
import {
  createMoneySchema,
  moneyJSONSchema,
  moneySchemaDefault,
} from "../src/zod/index.js";
import { reviveMoney } from "../src/client/index.js";
import { moneyFormValue, submitMoneyFormValue } from "../src/react/index.js";

describe("@eristack/money/rest", () => {
  it("parses valid MoneyJSON", () => {
    const money = parseMoneyJSON({ currency: "USD", amount: "19.99" });
    expect(money.isEqualTo(Money.of("19.99", "USD"))).toBe(true);
  });

  it("rejects JSON number amounts", () => {
    expect(() => parseMoneyJSON({ currency: "USD", amount: 19.99 })).toThrow(
      RestMoneyFieldError,
    );
  });

  it("serializes money", () => {
    expect(serializeMoney(Money.of("10", "USD"))).toEqual({
      currency: "USD",
      amount: "10",
    });
  });
});

describe("@eristack/money/drizzle naming", () => {
  beforeEach(() => {
    resetMoneyPersistenceConfig();
  });

  it("defaults to readable suffixes", () => {
    const names = resolveMoneyColumnNames("subtotal", { mode: "paired" });
    expect(names.amountSql).toBe("subtotal_amount");
    expect(names.currencySql).toBe("subtotal_currency");
    expect(names.amountProperty).toBe("subtotalAmount");
    expect(names.currencyProperty).toBe("subtotalCurrency");
  });

  it("merges global config incrementally", () => {
    configureMoneyPersistence({
      naming: moneyNamingPresets.compact,
    });
    expect(
      resolveMoneyColumnNames("subtotal", { mode: "paired" }).amountSql,
    ).toBe("subtotal__a");

    expect(
      resolveMoneyColumnNames("total", {
        mode: "paired",
        naming: moneyNamingPresets.readable,
      }).amountSql,
    ).toBe("total_amount");
  });

  it("supports legacy field overrides", () => {
    const names = resolveMoneyColumnNames("subtotal", {
      mode: "paired",
      naming: moneyNamingPresets.legacyQups,
    });
    expect(names.amountSql).toBe("subtotal");
    expect(names.currencySql).toBe("currency_subtotal");
  });
});

describe("@eristack/money/drizzle pack/unpack", () => {
  beforeEach(() => {
    resetMoneyPersistenceConfig();
  });

  it("round-trips paired money", () => {
    const total = Money.of("19.99", "USD").with(Rounding.currencyDefault());
    const row = packMoney("amount", total);
    expect(row).toEqual({
      amountAmount: "19.99",
      amountCurrency: "USD",
    });
    const restored = unpackMoney("amount", row);
    expect(restored?.isEqualTo(total)).toBe(true);
  });

  it("moneyField binding keeps pack/unpack aligned", () => {
    const subtotal = moneyField("pgsql", "subtotal", { mode: "amountOnly" });
    const value = Money.of("50", "USD");
    const row = {
      currency: "USD",
      ...subtotal.pack(value, { expectCurrency: "USD" }),
    };
    expect(subtotal.unpack(row)?.isEqualTo(value)).toBe(true);
    expect(subtotal.gridFields.amount).toBe("subtotal_amount");
  });
});

describe("@eristack/money/zod", () => {
  it("accepts wire JSON", () => {
    expect(moneyJSONSchema.parse({ currency: "USD", amount: "1" })).toEqual({
      currency: "USD",
      amount: "1",
    });
  });

  it("rejects numeric amount", () => {
    expect(() =>
      moneyJSONSchema.parse({ currency: "USD", amount: 1 }),
    ).toThrow();
  });

  it("parses to Money", () => {
    const money = moneySchemaDefault.parse({ currency: "USD", amount: "2.5" });
    expect(money.isEqualTo(Money.of("2.5", "USD"))).toBe(true);
  });

  it("enforces fixed currency", () => {
    const usdOnly = createMoneySchema({ currency: "USD" });
    expect(() =>
      usdOnly.parse({ currency: "EUR", amount: "1" }),
    ).toThrow();
  });
});

describe("@eristack/money/client + react", () => {
  it("revives client JSON", () => {
    const money = reviveMoney({ currency: "USD", amount: "3" });
    expect(money.isEqualTo(Money.of("3", "USD"))).toBe(true);
  });

  it("form helpers round-trip strings", () => {
    const original = Money.of("12.34", "USD");
    const form = moneyFormValue(original);
    const submitted = submitMoneyFormValue(form);
    expect(submitted.isEqualTo(Money.of("12.34", "USD"))).toBe(true);
  });
});
