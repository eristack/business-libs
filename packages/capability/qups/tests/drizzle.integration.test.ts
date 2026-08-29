import { describe, expect, it, afterEach } from "vitest";
import { Money } from "@eristack/money";
import { createTestSqliteDb, execSql, canUseBetterSqlite } from "@internal/test-harness";
import {
  createDrizzlePricingProfileStore,
  createQupsProfileTables,
} from "../src/drizzle/index.js";
import { PricingLine, createMemoryPricingLineStore, createQups, fieldsForTruth } from "../src/index.js";

const QUPS_PROFILE_DDL = [
  `CREATE TABLE qups_pricing_profiles (
    id TEXT PRIMARY KEY,
    entity_key TEXT NOT NULL,
    default_truth TEXT NOT NULL,
    default_currency_code TEXT NOT NULL,
    default_tax_rate_percent TEXT,
    default_tax_mode TEXT,
    active INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`,
  `CREATE TABLE qups_pricing_fields (
    id TEXT PRIMARY KEY,
    profile_id TEXT NOT NULL,
    key TEXT NOT NULL,
    label TEXT,
    kind TEXT NOT NULL,
    role TEXT NOT NULL,
    enabled INTEGER NOT NULL,
    required INTEGER,
    position INTEGER NOT NULL
  )`,
  `CREATE TABLE qups_pricing_profile_modifier_kinds (
    profile_id TEXT NOT NULL,
    kind TEXT NOT NULL,
    PRIMARY KEY (profile_id, kind)
  )`,
];

describe.skipIf(!canUseBetterSqlite())("qups drizzle profile store integration", () => {
  let dbHandle: ReturnType<typeof createTestSqliteDb>;

  afterEach(() => {
    dbHandle?.close();
  });

  it("round-trips profile and applies default tax on saved lines", async () => {
    dbHandle = createTestSqliteDb();
    execSql(dbHandle.sqlite, QUPS_PROFILE_DDL);

    const tables = createQupsProfileTables("sqlite");
    const profiles = createDrizzlePricingProfileStore({
      dialect: "sqlite",
      db: dbHandle.db,
      tables,
    });

    let n = 0;
    const qups = createQups({
      profiles,
      lines: createMemoryPricingLineStore(),
      idFactory: () => `id_${++n}`,
      clock: () => new Date("2026-01-01T00:00:00.000Z"),
    });

    const profile = await qups.registerProfile({
      entityKey: "invoice_line",
      defaultCurrencyCode: "USD",
      defaultTruth: "unitPrice+subtotal",
      defaultTaxRatePercent: "10",
      allowedModifierKinds: ["discount"],
      fields: fieldsForTruth("unitPrice+subtotal"),
    });

    const loaded = await qups.getProfileById(profile.id);
    expect(loaded?.defaultTaxRatePercent).toBe("10");
    expect(loaded?.allowedModifierKinds).toEqual(["discount"]);

    const line = PricingLine.of({
      qups: {
        truth: "unitPrice+subtotal",
        unitPrice: Money.of("5", "USD"),
        subtotal: Money.of("20", "USD"),
      },
      modifiers: [{ kind: "discount", type: "percent", percent: "10" }],
      tax: { ratePercent: loaded!.defaultTaxRatePercent! },
    });

    const record = await qups.saveLine({
      ownerKey: "inv_1",
      profileId: profile.id,
      line,
      position: 0,
    });

    expect(record.taxRatePercent).toBe("10");
    expect(Number(record.totalAmount)).toBeGreaterThan(0);
  });
});
