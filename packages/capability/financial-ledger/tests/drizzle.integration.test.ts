import { describe, expect, it, afterEach } from "vitest";
import { Money } from "@eristack/money";
import { setupHclSqlite, type HclHarness } from "@eristack/hash-chained-ledger/testing";
import { createFinancialLedger } from "../src/index.js";

import { canUseBetterSqlite } from "@internal/test-harness";

describe.skipIf(!canUseBetterSqlite())("financial-ledger drizzle integration", () => {
  let harness: HclHarness;

  afterEach(() => {
    harness?.close();
  });

  it("posts multi-currency entries and verifies chains", async () => {
    harness = setupHclSqlite("fin");
    const fin = createFinancialLedger({ store: harness.store });

    await fin.post({
      accountId: "1000",
      currency: "USD",
      openingBalance: Money.of("0", "USD"),
      inAmount: Money.of("100.00", "USD"),
      entryType: "journal",
      entryTypeId: "jv-usd-1",
    });
    await fin.post({
      accountId: "1000",
      currency: "USD",
      outAmount: "25.50",
      entryType: "journal",
      entryTypeId: "jv-usd-2",
    });

    await fin.post({
      accountId: "2000",
      currency: "EUR",
      openingBalance: Money.of("0", "EUR"),
      inAmount: Money.of("50.00", "EUR"),
      entryType: "journal",
      entryTypeId: "jv-eur-1",
    });

    const usdSnap = await fin.snapshot("1000", "USD");
    expect(usdSnap?.balance).toBe("74.5");
    const eurSnap = await fin.snapshot("2000", "EUR");
    expect(eurSnap?.balance).toBe("50");

    expect((await fin.verify("1000", "USD")).ok).toBe(true);
    expect((await fin.verify("2000", "EUR")).ok).toBe(true);
  });
});
