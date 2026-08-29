import { Money } from "@eristack/money";
import type { FinancialLedger } from "./create-financial-ledger.js";

export type TrialBalanceAccount = {
  accountId: string;
  currency: string;
};

/** Snapshot closing balances for many account chains as Money (skips missing chains). */
export async function trialBalance(
  ledger: FinancialLedger,
  accounts: readonly TrialBalanceAccount[],
): Promise<Map<string, Money>> {
  const out = new Map<string, Money>();
  await Promise.all(
    accounts.map(async ({ accountId, currency }) => {
      const snap = await ledger.snapshot(accountId, currency);
      if (!snap) return;
      const key = `${accountId}:${currency}`;
      out.set(key, Money.of(snap.balance, currency));
    }),
  );
  return out;
}
