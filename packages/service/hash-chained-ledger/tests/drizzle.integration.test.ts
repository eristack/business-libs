import { describe, expect, it, afterEach } from "vitest";
import {
  ChainTamperedError,
  HashChainedLedgerError,
} from "../src/index.js";
import {
  setupHclSqlite,
  tamperHclEntryHash,
  type HclHarness,
} from "@eristack/hash-chained-ledger/testing";

import { canUseBetterSqlite } from "@internal/test-harness";

describe.skipIf(!canUseBetterSqlite())("hash-chained-ledger drizzle integration", () => {
  let harness: HclHarness;

  afterEach(() => {
    harness?.close();
  });

  it("appends, snapshots, and verifies via Drizzle store", async () => {
    harness = setupHclSqlite();
    const { ledger } = harness;

    await ledger.append({
      chainId: "sku:WH1",
      openingBalance: "10",
      inAmount: "5",
      entryType: "receipt",
      entryTypeId: "gr-1",
    });
    await ledger.append({
      chainId: "sku:WH1",
      outAmount: "3",
      entryType: "issue",
      entryTypeId: "gi-1",
    });

    const snap = await ledger.snapshot("sku:WH1");
    expect(snap?.balance).toBe("12");

    const verified = await ledger.verify("sku:WH1");
    expect(verified.ok).toBe(true);
    expect(verified.entries).toBe(2);
  });

  it("rejects tampered entry hash in SQL", async () => {
    harness = setupHclSqlite();
    const { ledger, sqlite } = harness;

    await ledger.append({
      chainId: "tamper",
      openingBalance: "0",
      inAmount: "10",
      entryType: "open",
      entryTypeId: "1",
    });
    await ledger.append({
      chainId: "tamper",
      inAmount: "1",
      entryType: "adj",
      entryTypeId: "2",
    });

    tamperHclEntryHash(sqlite, "tamper", 1, harness.tablePrefix);

    const check = await ledger.check("tamper");
    expect(check.ok).toBe(false);
    await expect(ledger.verify("tamper")).rejects.toBeInstanceOf(
      ChainTamperedError,
    );
  });

  it("requires openingBalance on first append", async () => {
    harness = setupHclSqlite();
    const { ledger } = harness;

    await expect(
      ledger.append({
        chainId: "new-chain",
        inAmount: "1",
        entryType: "receipt",
        entryTypeId: "x",
      }),
    ).rejects.toBeInstanceOf(HashChainedLedgerError);
  });

  it("rejects wrong openingBalance when chain exists", async () => {
    harness = setupHclSqlite();
    const { ledger } = harness;

    await ledger.append({
      chainId: "c",
      openingBalance: "0",
      inAmount: "5",
      entryType: "open",
      entryTypeId: "1",
    });

    await expect(
      ledger.append({
        chainId: "c",
        openingBalance: "99",
        inAmount: "1",
        entryType: "bad",
        entryTypeId: "2",
      }),
    ).rejects.toThrow(/openingBalance must equal tip/);
  });

  it("verifies empty chain as intact", async () => {
    harness = setupHclSqlite();
    const { ledger } = harness;

    const verified = await ledger.verify("missing-chain");
    expect(verified.ok).toBe(true);
    expect(verified.entries).toBe(0);
    expect(verified.tipHash).toBeNull();
  });

  it("keeps chain intact after many sequential appends (depth smoke)", async () => {
    harness = setupHclSqlite();
    const { ledger } = harness;

    await ledger.append({
      chainId: "depth",
      openingBalance: "0",
      inAmount: "1",
      entryType: "open",
      entryTypeId: "0",
    });

    for (let i = 1; i <= 24; i++) {
      await ledger.append({
        chainId: "depth",
        inAmount: "1",
        entryType: "receipt",
        entryTypeId: String(i),
      });
    }

    const snap = await ledger.snapshot("depth");
    expect(snap?.balance).toBe("25");

    const verified = await ledger.verify("depth");
    expect(verified.ok).toBe(true);
    expect(verified.entries).toBe(25);
  });

  it("concurrent appends on one chain stay verifiable (sequence UNIQUE + retry)", async () => {
    harness = setupHclSqlite();
    const { ledger } = harness;

    await ledger.append({
      chainId: "race",
      openingBalance: "0",
      inAmount: "0",
      entryType: "open",
      entryTypeId: "open",
    });

    const results = await Promise.all(
      Array.from({ length: 12 }, (_, i) =>
        ledger.append({
          chainId: "race",
          inAmount: "1",
          entryType: "receipt",
          entryTypeId: `parallel-${i}`,
        }),
      ),
    );

    expect(new Set(results.map((e) => e.sequence)).size).toBe(12);
    const verified = await ledger.verify("race");
    expect(verified.ok).toBe(true);
    expect(verified.entries).toBe(13);
  });
});
