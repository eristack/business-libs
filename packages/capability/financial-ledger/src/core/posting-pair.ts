import type { LedgerEntry } from "@eristack/hash-chained-ledger";
import type { FinancialPostInput, Moneyish } from "./create-financial-ledger.js";

export function buildBalancedPostingPair(input: {
  debitAccountId: string;
  creditAccountId: string;
  amount: Moneyish;
  currency: string;
  entryType: string;
  entryTypeId: string;
  linkId?: string;
  occurredAt?: string | Date;
  meta?: Record<string, unknown>;
}): { debit: FinancialPostInput; credit: FinancialPostInput } {
  const meta = {
    ...(input.linkId ? { linkId: input.linkId } : {}),
    ...(input.meta ?? {}),
  };
  const shared = {
    currency: input.currency,
    entryType: input.entryType,
    entryTypeId: input.entryTypeId,
    occurredAt: input.occurredAt,
    meta: Object.keys(meta).length ? meta : undefined,
  };
  return {
    debit: {
      accountId: input.debitAccountId,
      inAmount: input.amount,
      ...shared,
    },
    credit: {
      accountId: input.creditAccountId,
      outAmount: input.amount,
      ...shared,
    },
  };
}

export function buildReversalPost(
  original: LedgerEntry,
  input: {
    entryType: string;
    entryTypeId: string;
    occurredAt?: string | Date;
  },
): FinancialPostInput {
  const meta = (original.meta ?? {}) as Record<string, unknown>;
  const accountId = String(meta.accountId ?? "");
  const currency = String(meta.currency ?? "");
  if (!accountId || !currency) {
    throw new Error(
      "buildReversalPost requires original.meta.accountId and meta.currency",
    );
  }
  return {
    accountId,
    currency,
    inAmount: original.outAmount !== "0" ? original.outAmount : undefined,
    outAmount: original.inAmount !== "0" ? original.inAmount : undefined,
    adjustment:
      original.adjustment !== "0" && original.adjustment
        ? `-${original.adjustment}`
        : undefined,
    entryType: input.entryType,
    entryTypeId: input.entryTypeId,
    occurredAt: input.occurredAt,
    meta: {
      ...meta,
      reversesEntryId: original.id,
      reversesEntryTypeId: original.entryTypeId,
    },
  };
}
