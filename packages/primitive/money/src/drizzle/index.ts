import {
  bindMoneyNamingScope,
  moneyCurrencyField,
  moneyField,
} from "./field.js";
import {
  configureMoneyPersistence,
  createMoneyNamingScope,
  moneyGridFields,
  moneyNamingPresets,
  mergeMoneyNaming,
  resetMoneyPersistenceConfig,
  resolveMoneyColumnNames,
  resolveSharedCurrencyColumnNames,
} from "./naming.js";
import {
  moneyAmountColumn,
  moneyColumns,
  moneyCurrencyColumn,
} from "./columns.js";
import {
  packCurrencyCode,
  packMoney,
  packMoneyAmount,
  unpackCurrencyCode,
  unpackMoney,
  unpackMoneyAmount,
} from "./pack.js";

export type {
  DrizzleDialect,
  MoneyAdapterOptions,
  MoneyColumnNaming,
  MoneyFieldMode,
  MoneyGridFields,
  MoneyPersistenceConfig,
  PartialMoneyColumnNaming,
  ResolvedColumnNames,
} from "./types.js";
export type { MoneyFieldBinding, MoneyCurrencyFieldBinding } from "./field.js";
export type { PackMoneyOptions } from "./pack.js";
export type { MoneyNamingScope } from "./naming.js";

export {
  configureMoneyPersistence,
  resetMoneyPersistenceConfig,
  createMoneyNamingScope,
  moneyNamingPresets,
  mergeMoneyNaming,
  moneyGridFields,
  resolveMoneyColumnNames,
  resolveSharedCurrencyColumnNames,
  moneyColumns,
  moneyAmountColumn,
  moneyCurrencyColumn,
  packMoney,
  unpackMoney,
  packMoneyAmount,
  unpackMoneyAmount,
  packCurrencyCode,
  unpackCurrencyCode,
  moneyField,
  moneyCurrencyField,
  bindMoneyNamingScope,
};

/** Scoped naming with column/field helpers pre-bound. */
export function createMoneyNamingScopeWithAdapters(
  config: Parameters<typeof createMoneyNamingScope>[0],
) {
  const scope = createMoneyNamingScope(config);
  return {
    ...scope,
    ...bindMoneyNamingScope(scope),
  };
}

export { createMoneyNamingScopeWithAdapters as createMoneyNamingScopeBound };
