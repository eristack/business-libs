import {
  assertBalanceEquation,
  computeClosing,
  zeroAmount,
} from "./balance.js";
import { HashChainedLedgerError } from "./errors.js";
import { hashLedgerEntry } from "./hash.js";
import type {
  AppendLedgerEntryInput,
  CreateHashChainedLedgerOptions,
  HashChainedLedger,
  LedgerEntry,
} from "./types.js";
import { assertChainIntact, verifyEntries } from "./verify.js";

function defaultId(): string {
  return crypto.randomUUID();
}

export function createHashChainedLedger(
  options: CreateHashChainedLedgerOptions,
): HashChainedLedger {
  const store = options.store;
  const idFactory = options.idFactory ?? defaultId;
  const now = options.now ?? (() => new Date());

  return {
    async append(input: AppendLedgerEntryInput): Promise<LedgerEntry> {
      const tip = await store.getTip(input.chainId);
      const inAmount = input.inAmount ?? zeroAmount();
      const outAmount = input.outAmount ?? zeroAmount();
      const adjustment = input.adjustment ?? zeroAmount();

      let openingBalance: string;
      let sequence: number;
      let prevHash: string | null;

      if (!tip) {
        if (input.openingBalance == null) {
          throw new HashChainedLedgerError(
            `openingBalance is required to open chain "${input.chainId}"`,
          );
        }
        openingBalance = input.openingBalance;
        sequence = 1;
        prevHash = null;
      } else {
        openingBalance = tip.closingBalance;
        sequence = tip.sequence + 1;
        prevHash = tip.entryHash;
        if (
          input.openingBalance != null &&
          input.openingBalance !== openingBalance
        ) {
          throw new HashChainedLedgerError(
            `openingBalance must equal tip closing (${openingBalance}); got ${input.openingBalance}`,
          );
        }
      }

      const closingBalance = computeClosing({
        openingBalance,
        inAmount,
        outAmount,
        adjustment,
      });

      const occurredAt =
        input.occurredAt instanceof Date
          ? input.occurredAt.toISOString()
          : (input.occurredAt ?? now().toISOString());

      const unsigned: Omit<LedgerEntry, "entryHash"> = {
        id: input.id ?? idFactory(),
        chainId: input.chainId,
        sequence,
        openingBalance,
        inAmount,
        outAmount,
        adjustment,
        closingBalance,
        entryType: input.entryType,
        entryTypeId: input.entryTypeId,
        occurredAt,
        prevHash,
        meta: input.meta,
      };

      assertBalanceEquation(unsigned);
      const entryHash = await hashLedgerEntry(unsigned);
      const entry: LedgerEntry = { ...unsigned, entryHash };

      await store.append(entry);
      await store.upsertSnapshot({
        chainId: entry.chainId,
        sequence: entry.sequence,
        balance: entry.closingBalance,
        entryHash: entry.entryHash,
        updatedAt: entry.occurredAt,
      });
      return entry;
    },

    list(chainId) {
      return store.listByChain(chainId);
    },

    tip(chainId) {
      return store.getTip(chainId);
    },

    snapshot(chainId) {
      return store.getSnapshot(chainId);
    },

    async verify(chainId) {
      const entries = await store.listByChain(chainId);
      return assertChainIntact(chainId, entries);
    },

    async check(chainId) {
      const entries = await store.listByChain(chainId);
      return verifyEntries(chainId, entries);
    },
  };
}
