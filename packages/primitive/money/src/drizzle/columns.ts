import { numeric, varchar as pgVarchar } from "drizzle-orm/pg-core";
import {
  decimal as mysqlDecimal,
  varchar as mysqlVarchar,
} from "drizzle-orm/mysql-core";
import { text as sqliteText } from "drizzle-orm/sqlite-core";
import type { MoneyAdapterOptions, DrizzleDialect } from "./types.js";
import {
  resolveMoneyColumnNames,
  resolveSharedCurrencyColumnNames,
} from "./naming.js";

const CURRENCY_LENGTH = 16;

function amountColumn(dialect: DrizzleDialect, sqlName: string) {
  switch (dialect) {
    case "pgsql":
      return numeric(sqlName, { mode: "string" });
    case "mysql":
      return mysqlDecimal(sqlName, {
        precision: 28,
        scale: 8,
        mode: "string",
      });
    case "sqlite":
      return sqliteText(sqlName);
    default: {
      const _e: never = dialect;
      throw new Error(`Unsupported dialect: ${String(_e)}`);
    }
  }
}

function currencyColumn(dialect: DrizzleDialect, sqlName: string) {
  switch (dialect) {
    case "pgsql":
      return pgVarchar(sqlName, { length: CURRENCY_LENGTH });
    case "mysql":
      return mysqlVarchar(sqlName, { length: CURRENCY_LENGTH });
    case "sqlite":
      return sqliteText(sqlName);
    default: {
      const _e: never = dialect;
      throw new Error(`Unsupported dialect: ${String(_e)}`);
    }
  }
}

export function moneyColumns(
  dialect: DrizzleDialect,
  logicalName: string,
  options?: MoneyAdapterOptions,
): Record<string, unknown> {
  const names = resolveMoneyColumnNames(logicalName, {
    mode: "paired",
    naming: options?.naming,
    scope: options?.scope,
  });
  if (!names.currencyProperty || !names.currencySql) {
    throw new Error("Paired money column requires currency names");
  }
  return {
    [names.amountProperty]: amountColumn(dialect, names.amountSql),
    [names.currencyProperty]: currencyColumn(dialect, names.currencySql),
  };
}

export function moneyAmountColumn(
  dialect: DrizzleDialect,
  logicalName: string,
  options?: MoneyAdapterOptions,
) {
  const names = resolveMoneyColumnNames(logicalName, {
    mode: "amountOnly",
    naming: options?.naming,
    scope: options?.scope,
  });
  return {
    [names.amountProperty]: amountColumn(dialect, names.amountSql),
  };
}

export function moneyCurrencyColumn(
  dialect: DrizzleDialect,
  logicalName = "currency",
  options?: MoneyAdapterOptions,
) {
  const names = resolveSharedCurrencyColumnNames(logicalName, options);
  return {
    [names.property]: currencyColumn(dialect, names.sql),
  };
}
