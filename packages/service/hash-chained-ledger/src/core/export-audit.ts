import type { ChainId, HashChainedLedger, LedgerEntry, LedgerSnapshot } from "./types.js";

export type ChainAuditEntry = Pick<
  LedgerEntry,
  | "sequence"
  | "entryHash"
  | "closingBalance"
  | "entryType"
  | "entryTypeId"
  | "occurredAt"
> & {
  openingBalance: string;
  inAmount: string;
  outAmount: string;
  adjustment: string;
};

export type ChainAuditExport = {
  chainId: ChainId;
  exportedAt: string;
  entryCount: number;
  verifyOk: boolean;
  entries: ChainAuditEntry[];
  snapshot: LedgerSnapshot | null;
};

function toAuditEntry(entry: LedgerEntry): ChainAuditEntry {
  return {
    sequence: entry.sequence,
    entryHash: entry.entryHash,
    openingBalance: entry.openingBalance,
    inAmount: entry.inAmount,
    outAmount: entry.outAmount,
    adjustment: entry.adjustment,
    closingBalance: entry.closingBalance,
    entryType: entry.entryType,
    entryTypeId: entry.entryTypeId,
    occurredAt: entry.occurredAt,
  };
}

/** JSON-serializable chain export for external audit packages (H4). */
export async function exportChainAuditJson(
  ledger: HashChainedLedger,
  chainId: ChainId,
): Promise<ChainAuditExport> {
  const [entries, snapshot, check] = await Promise.all([
    ledger.list(chainId),
    ledger.snapshot(chainId),
    ledger.check(chainId),
  ]);

  return {
    chainId,
    exportedAt: new Date().toISOString(),
    entryCount: entries.length,
    verifyOk: check.ok,
    entries: entries.map(toAuditEntry),
    snapshot,
  };
}
