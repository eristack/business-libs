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

    tamperHclEntryHash(sqlite, "tamper", 1);

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
});
