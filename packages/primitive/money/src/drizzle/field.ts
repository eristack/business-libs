import type { Money } from "../core/amount/money.js";
import {
  moneyAmountColumn,
  moneyColumns,
  moneyCurrencyColumn,
} from "./columns.js";
import type {
  DrizzleDialect,
  MoneyAdapterOptions,
  MoneyFieldMode,
  MoneyGridFields,
  ResolvedColumnNames,
} from "./types.js";
import {
  moneyGridFields,
  resolveMoneyColumnNames,
  type MoneyNamingScope,
} from "./naming.js";
import {
  packMoney,
  packMoneyAmount,
  unpackMoney,
  unpackMoneyAmount,
  packCurrencyCode,
  unpackCurrencyCode,
  type PackMoneyOptions,
} from "./pack.js";

export type MoneyFieldOptions = MoneyAdapterOptions & {
  mode?: MoneyFieldMode;
  /** Row currency property for amount-only unpack. Default: shared `currency`. */
  currencyProperty?: string;
  scopeBinding?: MoneyNamingScope;
};

function scopedOptions(options?: MoneyFieldOptions): MoneyAdapterOptions {
  if (options?.scopeBinding) {
    return options.scopeBinding.withScope(options);
  }
  return options ?? {};
}

export type MoneyFieldBinding = {
  logicalName: string;
  mode: MoneyFieldMode;
  names: ResolvedColumnNames;
  columns: Record<string, unknown>;
  gridFields: MoneyGridFields;
  pack(
    money: Money,
    options?: PackMoneyOptions,
  ): Record<string, string>;
  unpack(
    row: Record<string, unknown>,
    options?: PackMoneyOptions & { currency?: string },
  ): Money | null;
};

export type MoneyCurrencyFieldBinding = {
  logicalName: string;
  columns: Record<string, unknown>;
  pack(code: string): Record<string, string>;
  unpack(row: Record<string, unknown>): string | null;
};

export function moneyField(
  dialect: DrizzleDialect,
  logicalName: string,
  options?: MoneyFieldOptions,
): MoneyFieldBinding {
  const opts = scopedOptions(options);
  const mode = options?.mode ?? "paired";
  const names = resolveMoneyColumnNames(logicalName, {
    mode,
    naming: opts.naming,
    scope: opts.scope,
  });
  const columns =
    mode === "paired"
      ? moneyColumns(dialect, logicalName, opts)
      : moneyAmountColumn(dialect, logicalName, opts);
  const gridFields = moneyGridFields(logicalName, {
    mode,
    naming: opts.naming,
    scope: opts.scope,
  });
  const currencyProperty =
    options?.currencyProperty ??
    (mode === "amountOnly" ? "currency" : undefined);

  return {
    logicalName,
    mode,
    names,
    columns,
    gridFields,
    pack(money, packOptions) {
      const merged = { ...opts, ...packOptions };
      if (mode === "paired") {
        return packMoney(logicalName, money, merged);
      }
      return packMoneyAmount(logicalName, money, merged);
    },
    unpack(row, unpackOptions) {
      const merged = { ...opts, ...unpackOptions };
      if (mode === "paired") {
        return unpackMoney(logicalName, row, merged);
      }
      return unpackMoneyAmount(logicalName, row, {
        ...merged,
        currencyProperty,
        currency: unpackOptions?.currency ?? unpackOptions?.expectCurrency,
      });
    },
  };
}

export function moneyCurrencyField(
  dialect: DrizzleDialect,
  logicalName = "currency",
  options?: MoneyFieldOptions,
): MoneyCurrencyFieldBinding {
  const opts = scopedOptions(options);
  return {
    logicalName,
    columns: moneyCurrencyColumn(dialect, logicalName, opts),
    pack(code) {
      return packCurrencyCode(code, { ...opts, logicalName });
    },
    unpack(row) {
      return unpackCurrencyCode(row, { ...opts, logicalName });
    },
  };
}

export function bindMoneyNamingScope(scope: MoneyNamingScope) {
  return {
    moneyField(
      dialect: DrizzleDialect,
      logicalName: string,
      options?: Omit<MoneyFieldOptions, "scopeBinding">,
    ) {
      return moneyField(dialect, logicalName, {
        ...options,
        scopeBinding: scope,
      });
    },
    moneyCurrencyField(
      dialect: DrizzleDialect,
      logicalName?: string,
      options?: Omit<MoneyFieldOptions, "scopeBinding">,
    ) {
      return moneyCurrencyField(dialect, logicalName, {
        ...options,
        scopeBinding: scope,
      });
    },
    moneyColumns(
      dialect: DrizzleDialect,
      logicalName: string,
      options?: MoneyAdapterOptions,
    ) {
      return moneyColumns(dialect, logicalName, scope.withScope(options));
    },
    moneyAmountColumn(
      dialect: DrizzleDialect,
      logicalName: string,
      options?: MoneyAdapterOptions,
    ) {
      return moneyAmountColumn(dialect, logicalName, scope.withScope(options));
    },
    moneyCurrencyColumn(
      dialect: DrizzleDialect,
      logicalName?: string,
      options?: MoneyAdapterOptions,
    ) {
      return moneyCurrencyColumn(
        dialect,
        logicalName ?? "currency",
        scope.withScope(options),
      );
    },
  };
}
