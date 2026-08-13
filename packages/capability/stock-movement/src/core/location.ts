import { sha256Hex } from "@eristack/hash-chained-ledger";

/** One dimension of a stock location (warehouse, bin, machine, …). */
export type LocationPart = {
  key: string;
  value: string;
};

/**
 * Build a stable locationId from dynamic parts.
 * Apps append parts freely — e.g. warehouseId + zoneId + machineId.
 */
export async function locationIdFromParts(
  parts: readonly LocationPart[],
): Promise<string> {
  const normalized = [...parts]
    .map((p) => ({
      key: p.key.trim(),
      value: p.value.trim(),
    }))
    .filter((p) => p.key.length > 0)
    .sort((a, b) => a.key.localeCompare(b.key));

  if (normalized.length === 0) {
    throw new Error("locationIdFromParts requires at least one part");
  }

  const canonical = JSON.stringify(normalized);
  const digest = await sha256Hex(canonical);
  return `loc_${digest.slice(0, 32)}`;
}

export function stockChainId(input: {
  locationId: string;
  lotId: string;
  /** Optional owner / sku / product — opaque field, not validated. */
  ownerId?: string;
}): string {
  const owner = input.ownerId?.trim() || "_";
  return `stock:${input.locationId}:${input.lotId}:${owner}`;
}
