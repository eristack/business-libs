import { ChainTamperedError } from "./errors.js";
import { hashLedgerEntry } from "./hash.js";
import type { ChainVerifyResult, LedgerEntry } from "./types.js";

function entryContext(entry: LedgerEntry, index: number): string {
  const hashPrefix = entry.entryHash.slice(0, 8);
  return `entry ${entry.id} @ index ${index} seq ${entry.sequence} hash ${hashPrefix}…`;
}

export async function verifyEntries(
  chainId: string,
  entries: LedgerEntry[],
): Promise<ChainVerifyResult> {
  let prevHash: string | null = null;
  for (let index = 0; index < entries.length; index++) {
    const entry = entries[index]!;
    const ctx = entryContext(entry, index);
    const warnings: string[] = [];
    if (entry.chainId !== chainId) {
      warnings.push(`${ctx}: chainId mismatch (${entry.chainId})`);
    }
    if (entry.prevHash !== prevHash) {
      warnings.push(
        `${ctx}: prevHash mismatch (expected ${prevHash ?? "null"}, got ${entry.prevHash})`,
      );
    }
    if (entry.sequence !== index + 1) {
      warnings.push(
        `${ctx}: sequence gap (expected ${index + 1}, got ${entry.sequence})`,
      );
    }
    const recomputed = await hashLedgerEntry({
      id: entry.id,
      chainId: entry.chainId,
      sequence: entry.sequence,
      openingBalance: entry.openingBalance,
      inAmount: entry.inAmount,
      outAmount: entry.outAmount,
      adjustment: entry.adjustment,
      closingBalance: entry.closingBalance,
      entryType: entry.entryType,
      entryTypeId: entry.entryTypeId,
      occurredAt: entry.occurredAt,
      prevHash: entry.prevHash,
      meta: entry.meta,
    });
    if (recomputed !== entry.entryHash) {
      warnings.push(`${ctx}: entryHash does not match payload`);
    }
    if (warnings.length > 0) {
      return {
        ok: false,
        tampered: true,
        sequence: entry.sequence,
        warnings,
        tipHash: entries.at(-1)?.entryHash ?? null,
      };
    }
    prevHash = entry.entryHash;
  }
  return {
    ok: true,
    entries: entries.length,
    tipHash: entries.at(-1)?.entryHash ?? null,
  };
}

export async function assertChainIntact(
  chainId: string,
  entries: LedgerEntry[],
): Promise<ChainVerifyResult> {
  const result = await verifyEntries(chainId, entries);
  if (!result.ok) {
    throw new ChainTamperedError(chainId, result.sequence, result.warnings);
  }
  return result;
}
