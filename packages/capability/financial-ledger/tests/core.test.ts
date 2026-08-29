import { describe, expect, it } from "vitest";
import { Money } from "@eristack/money";
import { createMemoryLedgerStore } from "@eristack/hash-chained-ledger";
import { createFinancialLedger } from "../src/index.js";
import {
  hydrateLedgerEntry,
  hydrateLedgerSnapshot,
} from "../src/core/hydrate.js";

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

  it("trialBalance maps account snapshots to Money", async () => {
    const { trialBalance } = await import("../src/core/trial-balance.js");
    const fin = createFinancialLedger({ store: createMemoryLedgerStore() });
    await fin.post({
      accountId: "1000",
      currency: "USD",
      openingBalance: "0",
      inAmount: "100",
      entryType: "journal",
      entryTypeId: "jv-1",
    });
    await fin.post({
      accountId: "2000",
      currency: "USD",
      openingBalance: "0",
      inAmount: "50",
      entryType: "journal",
      entryTypeId: "jv-2",
    });
    const balances = await trialBalance(fin, [
      { accountId: "1000", currency: "USD" },
      { accountId: "2000", currency: "USD" },
      { accountId: "9999", currency: "USD" },
    ]);
    expect(balances.get("1000:USD")?.toJSON().amount).toBe("100");
    expect(balances.get("2000:USD")?.toJSON().amount).toBe("50");
    expect(balances.has("9999:USD")).toBe(false);
  });

  it("hydrates ledger strings to Money on read", async () => {
    const fin = createFinancialLedger({ store: createMemoryLedgerStore() });
    await fin.post({
      accountId: "1000",
      currency: "USD",
      openingBalance: "0",
      inAmount: "100",
      entryType: "journal",
      entryTypeId: "jv-1",
    });
    const [entry] = await fin.list("1000", "USD");
    const hydrated = hydrateLedgerEntry(entry, "USD");
    expect(hydrated.closingBalance.toJSON()).toEqual({
      currency: "USD",
      amount: "100",
    });

    const snap = await fin.snapshot("1000", "USD");
    expect(snap).toBeTruthy();
    const { balance } = hydrateLedgerSnapshot(snap!, "USD");
    expect(balance.toJSON().amount).toBe("100");
  });

  it("buildBalancedPostingPair creates debit and credit legs", async () => {
    const { buildBalancedPostingPair } = await import("../src/core/posting-pair.js");
    const pair = buildBalancedPostingPair({
      debitAccountId: "1000",
      creditAccountId: "2000",
      amount: "50.00",
      currency: "USD",
      entryType: "journal",
      entryTypeId: "jv-pair",
      linkId: "pair-1",
    });
    expect(pair.debit.inAmount).toBe("50.00");
    expect(pair.credit.outAmount).toBe("50.00");
    expect(pair.debit.meta?.linkId).toBe("pair-1");
  });
});
