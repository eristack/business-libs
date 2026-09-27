import { describe, expect, it, afterEach } from "vitest";
import {
  createHashChainedLedger,
  createMemoryLedgerStore,
} from "../src/index.js";
import { setupHclSqlite } from "../src/testing/index.js";
import { canUseBetterSqlite } from "@internal/test-harness";

describe.skipIf(!canUseBetterSqlite())("hash parity memory vs sqlite", () => {
  it("produces identical entry hashes for the same append sequence", async () => {
    const memory = createHashChainedLedger({ store: createMemoryLedgerStore() });
    const sqlite = setupHclSqlite("parity");

    const occurredAt = "2026-01-01T00:00:00.000Z";
    const inputs = [
      {
        id: "01900000-0000-7000-8000-000000000001",
        chainId: "parity:chain",
        openingBalance: "0",
        inAmount: "100",
        entryType: "open",
        entryTypeId: "e1",
        occurredAt,
      },
      {
        id: "01900000-0000-7000-8000-000000000002",
        chainId: "parity:chain",
        outAmount: "25",
        entryType: "issue",
        entryTypeId: "e2",
        occurredAt,
      },
      {
        id: "01900000-0000-7000-8000-000000000003",
        chainId: "parity:chain",
        adjustment: "5",
        entryType: "adj",
        entryTypeId: "e3",
        occurredAt,
      },
    ] as const;

    for (const input of inputs) {
      await memory.append(input);
      await sqlite.ledger.append(input);
    }

    const memTip = await memory.tip("parity:chain");
    const sqlTip = await sqlite.ledger.tip("parity:chain");
    expect(memTip?.entryHash).toBe(sqlTip?.entryHash);
    expect(memTip?.closingBalance).toBe("80");
    expect((await memory.verify("parity:chain")).ok).toBe(true);
    expect((await sqlite.ledger.verify("parity:chain")).ok).toBe(true);
  });
});
