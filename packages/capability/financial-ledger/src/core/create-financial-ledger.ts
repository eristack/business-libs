import { Money } from "@eristack/money";
import {
  createHashChainedLedger,
  type ChainVerifyResult,
  type CreateHashChainedLedgerOptions,
  type HashChainedLedger,
  type LedgerEntry,
  type LedgerSnapshot,
} from "@eristack/hash-chained-ledger";

export type Moneyish = Money | string;

function toAmount(value: Moneyish | undefined, currency: string): string | undefined {
  if (value == null) return undefined;
  if (typeof value === "string") return Money.of(value, currency).toJSON().amount;
  if (String(value.currency) !== currency) {
    throw new Error(
      `Currency mismatch: expected ${currency}, got ${value.currency}`,
    );
  }
  return value.toJSON().amount;
}

export function financialChainId(accountId: string, currency: string): string {
  return `fin:${accountId}:${currency}`;
}

export type FinancialPostInput = {
  accountId: string;
  currency: string;
  /** Opening only when opening a new chain. */
  openingBalance?: Moneyish;
  /** Debit-like increase (in). */
  inAmount?: Moneyish;
  /** Credit-like decrease (out) — sign convention is app-defined; amounts are positive magnitudes. */
  outAmount?: Moneyish;
  adjustment?: Moneyish;
  entryType: string;
  entryTypeId: string;
  occurredAt?: string | Date;
  id?: string;
  meta?: Record<string, unknown>;
};

export type FinancialLedger = {
  ledger: HashChainedLedger;
  post(input: FinancialPostInput): Promise<LedgerEntry>;
  list(accountId: string, currency: string): Promise<LedgerEntry[]>;
  snapshot(
    accountId: string,
    currency: string,
  ): Promise<LedgerSnapshot | null>;
  verify(accountId: string, currency: string): Promise<ChainVerifyResult>;
  check(accountId: string, currency: string): Promise<ChainVerifyResult>;
};

export function createFinancialLedger(
  options: CreateHashChainedLedgerOptions,
): FinancialLedger {
  const ledger = createHashChainedLedger(options);

  return {
    ledger,
    async post(input) {
      const chainId = financialChainId(input.accountId, input.currency);
      return ledger.append({
        chainId,
        openingBalance: toAmount(input.openingBalance, input.currency),
        inAmount: toAmount(input.inAmount, input.currency),
        outAmount: toAmount(input.outAmount, input.currency),
        adjustment: toAmount(input.adjustment, input.currency),
        entryType: input.entryType,
        entryTypeId: input.entryTypeId,
        occurredAt: input.occurredAt,
        id: input.id,
        meta: {
          accountId: input.accountId,
          currency: input.currency,
          ...(input.meta ?? {}),
        },
      });
    },
    list(accountId, currency) {
      return ledger.list(financialChainId(accountId, currency));
    },
    snapshot(accountId, currency) {
      return ledger.snapshot(financialChainId(accountId, currency));
    },
    verify(accountId, currency) {
      return ledger.verify(financialChainId(accountId, currency));
    },
    check(accountId, currency) {
      return ledger.check(financialChainId(accountId, currency));
    },
  };
}
