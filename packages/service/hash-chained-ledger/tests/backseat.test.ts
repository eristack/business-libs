import { describe, expect, it } from "vitest";
import { createBackseat, createMemoryBackseatStore } from "@eristack/backseat";
import { createBackseatLedgerStore } from "../src/backseat/ledger-store.js";
import { createHashChainedLedger } from "../src/core/create-ledger.js";

describe("backseat ledger store", () => {
  it("appends and lists by chain", async () => {
    const backseatStore = createMemoryBackseatStore();
    const ledgerStore = createBackseatLedgerStore({ store: backseatStore });
    const ledger = createHashChainedLedger({ store: ledgerStore });

    await ledger.append({
      chainId: "c1",
      openingBalance: "0",
      inAmount: "5",
      entryType: "receipt",
      entryTypeId: "r1",
    });

    const entries = await ledger.list("c1");
    expect(entries).toHaveLength(1);
    expect(entries[0]?.closingBalance).toBe("5");
  });

  it("registers routes on createBackseat", async () => {
    const api = createBackseat({
      store: createMemoryBackseatStore(),
      baseUrl: "/api",
    });
    const { registerHashChainedLedgerBackseat } = await import(
      "../src/backseat/register.js"
    );
    registerHashChainedLedgerBackseat(api);

    const res = await api.handle({
      method: "POST",
      path: "/api/ledger/chains/test/append",
      body: {
        openingBalance: "0",
        inAmount: "1",
        entryType: "receipt",
        entryTypeId: "x",
      },
    });
    expect(res.status).toBe(201);
  });
});
