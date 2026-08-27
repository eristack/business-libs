import {
  createHashChainedLedger,
  type AppendLedgerEntryInput,
  type ChainVerifyResult,
  type CreateHashChainedLedgerOptions,
  type HashChainedLedger,
  type LedgerEntry,
  type LedgerSnapshot,
} from "@eristack/hash-chained-ledger";
import { stockChainId } from "./location.js";

export type StockMovementInput = {
  locationId: string;
  lotId: string;
  /** Opaque owner / product / sku — stored only; not used for ownership rules. */
  ownerId?: string;
  openingBalance?: string;
  inAmount?: string;
  outAmount?: string;
  adjustment?: string;
  entryType: string;
  entryTypeId: string;
  occurredAt?: string | Date;
  id?: string;
  /** When set, a second append with the same key returns the existing entry (retry-safe). */
  idempotencyKey?: string;
  meta?: Record<string, unknown>;
};

export type StockMovement = {
  ledger: HashChainedLedger;
  append(input: StockMovementInput): Promise<LedgerEntry>;
  list(input: {
    locationId: string;
    lotId: string;
    ownerId?: string;
  }): Promise<LedgerEntry[]>;
  snapshot(input: {
    locationId: string;
    lotId: string;
    ownerId?: string;
  }): Promise<LedgerSnapshot | null>;
  verify(input: {
    locationId: string;
    lotId: string;
    ownerId?: string;
  }): Promise<ChainVerifyResult>;
  check(input: {
    locationId: string;
    lotId: string;
    ownerId?: string;
  }): Promise<ChainVerifyResult>;
};

export function createStockMovement(
  options: CreateHashChainedLedgerOptions,
): StockMovement {
  const ledger = createHashChainedLedger(options);

  function chainOf(input: {
    locationId: string;
    lotId: string;
    ownerId?: string;
  }) {
    return stockChainId(input);
  }

  return {
    ledger,
    async append(input) {
      const chainId = chainOf(input);
      if (input.idempotencyKey) {
        const existing = await ledger.list(chainId);
        const hit = existing.find(
          (entry) => entry.meta?.idempotencyKey === input.idempotencyKey,
        );
        if (hit) return hit;
      }
      const payload: AppendLedgerEntryInput = {
        chainId,
        openingBalance: input.openingBalance,
        inAmount: input.inAmount,
        outAmount: input.outAmount,
        adjustment: input.adjustment,
        entryType: input.entryType,
        entryTypeId: input.entryTypeId,
        occurredAt: input.occurredAt,
        id: input.id,
        meta: {
          locationId: input.locationId,
          lotId: input.lotId,
          ownerId: input.ownerId ?? null,
          ...(input.idempotencyKey
            ? { idempotencyKey: input.idempotencyKey }
            : {}),
          ...(input.meta ?? {}),
        },
      };
      return ledger.append(payload);
    },
    list(input) {
      return ledger.list(chainOf(input));
    },
    snapshot(input) {
      return ledger.snapshot(chainOf(input));
    },
    verify(input) {
      return ledger.verify(chainOf(input));
    },
    check(input) {
      return ledger.check(chainOf(input));
    },
  };
}
