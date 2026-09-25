import { Money } from "@eristack/money";

/** Chart-of-accounts classification for UI sign rules. */
export type AccountDisplayType =
  | "asset"
  | "liability"
  | "equity"
  | "income"
  | "expense";

const CREDIT_NORMAL: ReadonlySet<AccountDisplayType> = new Set([
  "liability",
  "equity",
  "income",
]);

/**
 * Map debit-positive ledger snapshot balances to signed UI amounts.
 * Credit-normal types (liability, equity, income) are negated; asset and expense stay as stored.
 */
export function displayBalance(
  raw: Money,
  accountType: AccountDisplayType,
): Money {
  if (CREDIT_NORMAL.has(accountType)) {
    return raw.negate();
  }
  return raw;
}

export type AccountChart =
  | Readonly<Record<string, AccountDisplayType>>
  | ReadonlyMap<string, AccountDisplayType>;

function chartType(chart: AccountChart, accountId: string): AccountDisplayType {
  if (chart instanceof Map) {
    const t = chart.get(accountId);
    if (!t) {
      throw new Error(`Account type missing for ${accountId}`);
    }
    return t;
  }
  const record = chart as Readonly<Record<string, AccountDisplayType>>;
  const t = record[accountId];
  if (!t) {
    throw new Error(`Account type missing for ${accountId}`);
  }
  return t;
}

/**
 * Apply {@link displayBalance} to each `accountId:currency` trial balance entry.
 * Keys must be `accountId:currency` (same as {@link trialBalance}).
 */
export function signedBalances(
  balances: ReadonlyMap<string, Money>,
  chart: AccountChart,
): Map<string, Money> {
  const out = new Map<string, Money>();
  for (const [key, raw] of balances) {
    const accountId = key.split(":")[0] ?? key;
    out.set(key, displayBalance(raw, chartType(chart, accountId)));
  }
  return out;
}
