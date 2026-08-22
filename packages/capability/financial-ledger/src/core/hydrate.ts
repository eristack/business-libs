import { Money } from "@eristack/money";
import type { LedgerEntry, LedgerSnapshot } from "@eristack/hash-chained-ledger";

/** Parse a hashed ledger decimal string into Money (same currency as the chain). */
export function moneyFromLedgerAmount(amount: string, currency: string): Money {
  return Money.of(amount, currency);
}

function optionalLedgerMoney(
  amount: string | undefined,
  currency: string,
): Money | undefined {
  if (amount == null || amount === "" || amount === "0") return undefined;
  return Money.of(amount, currency);
}

export type HydratedLedgerEntry = {
  /** Original entry (hashed decimal strings unchanged). */
  entry: LedgerEntry;
  openingBalance: Money;
  closingBalance: Money;
  inAmount?: Money;
  outAmount?: Money;
  adjustment?: Money;
};

/** Hydrate ledger entry balances for UI/reporting — does not mutate stored payloads. */
export function hydrateLedgerEntry(
  entry: LedgerEntry,
  currency: string,
): HydratedLedgerEntry {
  return {
    entry,
    openingBalance: Money.of(entry.openingBalance, currency),
    closingBalance: Money.of(entry.closingBalance, currency),
    inAmount: optionalLedgerMoney(entry.inAmount, currency),
    outAmount: optionalLedgerMoney(entry.outAmount, currency),
    adjustment: optionalLedgerMoney(entry.adjustment, currency),
  };
}

export type HydratedLedgerSnapshot = {
  snapshot: LedgerSnapshot;
  balance: Money;
};

/** Hydrate a chain tip snapshot balance. */
export function hydrateLedgerSnapshot(
  snapshot: LedgerSnapshot,
  currency: string,
): HydratedLedgerSnapshot {
  return {
    snapshot,
    balance: Money.of(snapshot.balance, currency),
  };
}
