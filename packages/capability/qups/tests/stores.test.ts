import { describe, expect, it } from "vitest";
import { pgTable, text } from "drizzle-orm/pg-core";
import { Money } from "@eristack/money";
import {
  PricingLine,
  createMemoryPricingLineStore,
  createMemoryPricingProfileStore,
  createQups,
  editableFieldKeys,
  fieldsForTruth,
  moneyColumnPair,
  qupsRolesFor,
} from "../src/index.js";
import {
  createQupsLineSideTables,
  createQupsProfileTables,
  qupsLineColumns,
} from "../src/drizzle/index.js";

describe("core layer field catalog", () => {
  it("marks quantity derived when truth is unitPrice+subtotal", () => {
    expect(qupsRolesFor("unitPrice+subtotal")).toEqual({
      quantity: "derived",
      unit_price: "source",
      subtotal: "source",
    });
    const fields = fieldsForTruth("unitPrice+subtotal", {
      extras: [{ key: "sku", label: "SKU", kind: "text" }],
    });
    expect(editableFieldKeys(fields)).toEqual([
      "unit_price",
      "subtotal",
      "modifiers",
      "tax",
      "sku",
    ]);
    expect(moneyColumnPair("unit_price")).toEqual({
      amount: "unit_price",
      currency: "currency_unit_price",
    });
  });
});

describe("createQups profiles + columnar lines", () => {
  it("registers fields as rows and saves money columns + field values", async () => {
    let n = 0;
    const qups = createQups({
      profiles: createMemoryPricingProfileStore(),
      lines: createMemoryPricingLineStore(),
      idFactory: () => `id_${++n}`,
      clock: () => new Date("2026-01-01T00:00:00.000Z"),
    });

    const profile = await qups.registerProfile({
      entityKey: "invoice_line",
      defaultCurrencyCode: "USD",
      defaultTruth: "unitPrice+subtotal",
      defaultTaxRatePercent: "11",
      fields: [
        ...fieldsForTruth("unitPrice+subtotal"),
        {
          key: "sku",
          label: "SKU",
          kind: "text",
          role: "independent",
          enabled: true,
          position: 99,
        },
      ],
    });

    const line = PricingLine.of({
      qups: {
        truth: "unitPrice+subtotal",
        unitPrice: Money.of("3", "USD"),
        subtotal: Money.of("10", "USD"),
      },
      modifiers: [{ kind: "discount", type: "percent", percent: "10" }],
      tax: { ratePercent: "11" },
    });

    const record = await qups.saveLine({
      ownerKey: "inv_1",
      profileId: profile.id,
      line,
      fieldValues: [{ fieldKey: "sku", value: "WIDGET-1" }],
      rowExtras: { itemId: "item_9" },
      position: 0,
    });

    expect(record.currencyUnitPrice).toBe("USD");
    expect(record.rowExtras).toEqual({ itemId: "item_9" });
    expect(qups.lineFields(record).sku).toEqual({ value: "WIDGET-1" });
  });
});

describe("injectable drizzle columns", () => {
  it("spreads qups columns into an app detail table shape", () => {
    const invoiceLines = pgTable("invoice_lines", {
      id: text("id").primaryKey(),
      invoiceId: text("invoice_id").notNull(),
      itemId: text("item_id").notNull(),
      ...qupsLineColumns("pgsql"),
    });

    expect(invoiceLines.itemId).toBeTruthy();
    expect(invoiceLines.quantity).toBeTruthy();
    expect(invoiceLines.currencyUnitPrice).toBeTruthy();
    expect(invoiceLines.unitPrice).toBeTruthy();
    expect(invoiceLines.currencySubtotal).toBeTruthy();
    expect(invoiceLines.subtotal).toBeTruthy();
  });

  it("builds optional profile + side tables without a lines table", () => {
    for (const dialect of ["pgsql", "mysql", "sqlite"] as const) {
      const profiles = createQupsProfileTables(dialect);
      const side = createQupsLineSideTables(dialect);
      expect(profiles.profiles).toBeTruthy();
      expect(profiles.fields).toBeTruthy();
      expect(side.modifiers).toBeTruthy();
      expect(side.fieldValues).toBeTruthy();
      expect(
        "lines" in (profiles as object) || "lines" in (side as object),
      ).toBe(false);
    }
  });
});
