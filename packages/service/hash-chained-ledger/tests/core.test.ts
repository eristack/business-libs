import { describe, expect, it } from "vitest";
import {
  ChainTamperedError,
  createHashChainedLedger,
  createMemoryLedgerStore,
} from "../src/index.js";

describe("hash-chained-ledger", () => {
  it("appends with balance equation and chain hashes", async () => {
    const ledger = createHashChainedLedger({
      store: createMemoryLedgerStore(),
    });

    const a = await ledger.append({
      chainId: "sku:WH1",
      openingBalance: "10",
      inAmount: "5",
      entryType: "receipt",
      entryTypeId: "gr-1",
    });
    expect(a.closingBalance).toBe("15");
    expect(a.sequence).toBe(1);
    expect(a.prevHash).toBeNull();

    const b = await ledger.append({
      chainId: "sku:WH1",
      outAmount: "3",
      entryType: "issue",
      entryTypeId: "gi-1",
    });
    expect(b.openingBalance).toBe("15");
    expect(b.closingBalance).toBe("12");
    expect(b.prevHash).toBe(a.entryHash);

    const snap = await ledger.snapshot("sku:WH1");
    expect(snap?.balance).toBe("12");

    const verified = await ledger.verify("sku:WH1");
    expect(verified.ok).toBe(true);
  });

  it("detects tampering", async () => {
    const store = createMemoryLedgerStore();
    const ledger = createHashChainedLedger({ store });
    await ledger.append({
      chainId: "c1",
      openingBalance: "0",
      inAmount: "10",
      entryType: "open",
      entryTypeId: "1",
    });
    await ledger.append({
      chainId: "c1",
      inAmount: "1",
      entryType: "adj",
      entryTypeId: "2",
    });

    const entries = await store.listByChain("c1");
    entries[0]!.closingBalance = "999";

    const check = await ledger.check("c1");
    expect(check.ok).toBe(false);
    if (!check.ok) {
      expect(check.warnings.some((w) => w.includes("entryHash"))).toBe(true);
    }

    await expect(ledger.verify("c1")).rejects.toBeInstanceOf(ChainTamperedError);
  });
});
