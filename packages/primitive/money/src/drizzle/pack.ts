import { Money } from "../core/amount/money.js";
import { CurrencyMismatchError, ParseError } from "../core/errors/index.js";
import type { MoneyAdapterOptions } from "./types.js";
import {
  resolveMoneyColumnNames,
  resolveSharedCurrencyColumnNames,
} from "./naming.js";

export type PackMoneyOptions = MoneyAdapterOptions & {
  expect?: string;
  expectCurrency?: string;
};

function readRowValue(row: Record<string, unknown>, key: string): unknown {
  return row[key];
}

function assertExpectCurrency(money: Money, expect?: string) {
  const code = expect?.trim();
  if (!code) return;
  if (money.currency.currencyCode !== code) {
    throw new CurrencyMismatchError(code, money.currency.currencyCode);
  }
}

function assertPairedNullability(
  amount: unknown,
  currency: unknown,
  path: string,
) {
  const amountNull = amount == null;
  const currencyNull = currency == null;
  if (amountNull !== currencyNull) {
    throw new ParseError(
      `${path}: amount and currency must both be null or both be set`,
    );
  }
}

export function packMoney(
  logicalName: string,
  money: Money,
  options?: PackMoneyOptions,
) {
  const names = resolveMoneyColumnNames(logicalName, {
    mode: "paired",
    naming: options?.naming,
    scope: options?.scope,
  });
  assertExpectCurrency(money, options?.expect ?? options?.expectCurrency);
  if (!names.currencyProperty) {
    throw new Error("Paired money pack requires currency property");
  }
  const json = money.toJSON();
  return {
    [names.amountProperty]: json.amount,
    [names.currencyProperty]: json.currency,
  };
}

export function unpackMoney(
  logicalName: string,
  row: Record<string, unknown>,
  options?: MoneyAdapterOptions,
): Money | null {
  const names = resolveMoneyColumnNames(logicalName, {
    mode: "paired",
    naming: options?.naming,
    scope: options?.scope,
  });
  if (!names.currencyProperty) {
    throw new Error("Paired money unpack requires currency property");
  }
  const amount = readRowValue(row, names.amountProperty);
  const currency = readRowValue(row, names.currencyProperty);
  assertPairedNullability(amount, currency, logicalName);
  if (amount == null || currency == null) return null;
  return Money.of(String(amount), String(currency));
}

export function packMoneyAmount(
  logicalName: string,
  money: Money,
  options?: PackMoneyOptions,
) {
  const names = resolveMoneyColumnNames(logicalName, {
    mode: "amountOnly",
    naming: options?.naming,
    scope: options?.scope,
  });
  assertExpectCurrency(money, options?.expect ?? options?.expectCurrency);
  return {
    [names.amountProperty]: money.toJSON().amount,
  };
}

export function unpackMoneyAmount(
  logicalName: string,
  row: Record<string, unknown>,
  options?: PackMoneyOptions & {
    currencyProperty?: string;
    currency?: string;
  },
): Money | null {
  const names = resolveMoneyColumnNames(logicalName, {
    mode: "amountOnly",
    naming: options?.naming,
    scope: options?.scope,
  });
  const amount = readRowValue(row, names.amountProperty);
  if (amount == null) return null;

  const currencyProperty =
    options?.currencyProperty ??
    resolveSharedCurrencyColumnNames("currency", options).property;
  const currencyCode =
    options?.currency ??
    options?.expect ??
    options?.expectCurrency ??
    (() => {
      const fromRow = readRowValue(row, currencyProperty);
      return fromRow == null ? undefined : String(fromRow);
    })();

  if (!currencyCode) {
    throw new ParseError(
      `${logicalName}: currency is required to unpack amount-only money`,
    );
  }

  return Money.of(String(amount), currencyCode);
}

export function packCurrencyCode(
  code: string,
  options?: MoneyAdapterOptions & { logicalName?: string },
) {
  const names = resolveSharedCurrencyColumnNames(
    options?.logicalName ?? "currency",
    options,
  );
  return { [names.property]: code };
}

export function unpackCurrencyCode(
  row: Record<string, unknown>,
  options?: MoneyAdapterOptions & { logicalName?: string },
): string | null {
  const names = resolveSharedCurrencyColumnNames(
    options?.logicalName ?? "currency",
    options,
  );
  const value = readRowValue(row, names.property);
  return value == null ? null : String(value);
}
