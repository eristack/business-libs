import { describe, expect, it } from "vitest";
import { createHashChainedLedger } from "../src/core/create-ledger.js";
import { createMemoryLedgerStore } from "../src/core/memory-store.js";
import { exportChainAuditJson } from "../src/core/export-audit.js";

describe("exportChainAuditJson", () => {
  it("exports entries and verify flag", async () => {
    const ledger = createHashChainedLedger({ store: createMemoryLedgerStore() });
    await ledger.append({
      chainId: "loc:a",
      openingBalance: "0",
      inAmount: "5",
      entryType: "receipt",
      entryTypeId: "r1",
    });

    const exported = await exportChainAuditJson(ledger, "loc:a");
    expect(exported.entryCount).toBe(1);
    expect(exported.verifyOk).toBe(true);
    expect(exported.entries[0]?.closingBalance).toBe("5");
  });
});
