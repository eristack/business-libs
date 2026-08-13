import { describe, expect, it } from "vitest";
import { Money } from "@eristack/money";
import { createMemoryLedgerStore } from "@eristack/hash-chained-ledger";
import { createFinancialLedger } from "../src/index.js";

describe("financial-ledger", () => {
  it("posts money movements per account", async () => {
    const fin = createFinancialLedger({ store: createMemoryLedgerStore() });
    await fin.post({
      accountId: "1000",
      currency: "USD",
      openingBalance: Money.of("0", "USD"),
      inAmount: Money.of("100.00", "USD"),
      entryType: "journal",
      entryTypeId: "jv-1",
    });
    await fin.post({
      accountId: "1000",
      currency: "USD",
      outAmount: "25.50",
      entryType: "journal",
      entryTypeId: "jv-2",
    });
    const snap = await fin.snapshot("1000", "USD");
    expect(snap?.balance).toBe("74.5");
    expect((await fin.verify("1000", "USD")).ok).toBe(true);
  });
});
