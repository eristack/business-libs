import type { LedgerEntry } from "@eristack/hash-chained-ledger";
import type { StockMovement } from "./create-stock-movement.js";

export type StockLocationRef = {
  locationId: string;
  lotId: string;
  ownerId?: string;
};

export async function appendStockTransfer(
  stock: StockMovement,
  input: {
    qty: string;
    from: StockLocationRef;
    to: StockLocationRef;
    entryType: string;
    entryTypeId: string;
    transferId?: string;
    occurredAt?: string | Date;
  },
): Promise<{ out: LedgerEntry; in: LedgerEntry }> {
  const transferId = input.transferId;
  const out = await stock.append({
    ...input.from,
    outAmount: input.qty,
    entryType: input.entryType,
    entryTypeId: `${input.entryTypeId}:out`,
    idempotencyKey: transferId ? `${transferId}:out` : undefined,
    occurredAt: input.occurredAt,
    meta: { transferId, direction: "out" },
  });
  const destOpen = (await stock.snapshot(input.to)) == null;
  const inn = await stock.append({
    ...input.to,
    ...(destOpen ? { openingBalance: "0" } : {}),
    inAmount: input.qty,
    entryType: input.entryType,
    entryTypeId: `${input.entryTypeId}:in`,
    idempotencyKey: transferId ? `${transferId}:in` : undefined,
    occurredAt: input.occurredAt,
    meta: { transferId, direction: "in" },
  });
  return { out, in: inn };
}

export async function snapshotLotBalance(
  stock: StockMovement,
  input: StockLocationRef,
): Promise<string | null> {
  const snap = await stock.snapshot(input);
  return snap?.balance ?? null;
}

/** Snapshot balances for explicit lots at one location (apps supply lotIds). */
export async function snapshotLotsAtLocation(
  stock: StockMovement,
  input: {
    locationId: string;
    lotIds: readonly string[];
    ownerId?: string;
  },
): Promise<Array<{ lotId: string; balance: string | null }>> {
  return Promise.all(
    input.lotIds.map(async (lotId) => ({
      lotId,
      balance: await snapshotLotBalance(stock, {
        locationId: input.locationId,
        lotId,
        ownerId: input.ownerId,
      }),
    })),
  );
}
