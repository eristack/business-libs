import type { LedgerEntry } from "./types.js";

/** Stable JSON for hashing — sorted object keys, no entryHash. */
export function canonicalLedgerPayload(
  entry: Omit<LedgerEntry, "entryHash"> & { entryHash?: string },
): string {
  const body = {
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
    meta: entry.meta ?? null,
  };
  return stableStringify(body);
}

function stableStringify(value: unknown): string {
  return JSON.stringify(sortValue(value));
}

function sortValue(value: unknown): unknown {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(sortValue);
  const obj = value as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(obj).sort()) {
    out[key] = sortValue(obj[key]);
  }
  return out;
}

export async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function hashLedgerEntry(
  entry: Omit<LedgerEntry, "entryHash">,
): Promise<string> {
  return sha256Hex(canonicalLedgerPayload(entry));
}
