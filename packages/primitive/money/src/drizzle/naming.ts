import type {
  MoneyAdapterOptions,
  MoneyColumnNaming,
  MoneyFieldMode,
  MoneyFieldOverride,
  MoneyPersistenceConfig,
  PartialMoneyColumnNaming,
  ResolvedColumnNames,
} from "./types.js";

export const DEFAULT_MONEY_COLUMN_NAMING: MoneyColumnNaming = {
  amountSuffix: "_amount",
  currencySuffix: "_currency",
  amountOnlySuffix: "_amount",
  sharedCurrencyColumn: "currency",
  sqlCase: "snake",
  propertyCase: "camel",
};

let globalNaming: PartialMoneyColumnNaming = {};

export function configureMoneyPersistence(config: MoneyPersistenceConfig): void {
  globalNaming = mergePartialNaming(globalNaming, config.naming);
}

/** Reset global naming — tests only. */
export function resetMoneyPersistenceConfig(): void {
  globalNaming = {};
}

export const moneyNamingPresets = {
  readable: {
    amountSuffix: "_amount",
    currencySuffix: "_currency",
  },
  compact: {
    amountSuffix: "__a",
    currencySuffix: "__c",
  },
  legacyQups: {
    fields: {
      unitPrice: { amount: "unit_price", currency: "currency_unit_price" },
      subtotal: { amount: "subtotal", currency: "currency_subtotal" },
      tax: { amount: "tax_amount", currency: "currency_tax" },
      net: { amount: "net", currency: "currency_net" },
      gross: { amount: "gross", currency: "currency_gross" },
    },
  },
} as const satisfies Record<string, PartialMoneyColumnNaming>;

function mergeFieldOverrides(
  base: Record<string, MoneyFieldOverride> | undefined,
  next: Record<string, MoneyFieldOverride> | undefined,
): Record<string, MoneyFieldOverride> | undefined {
  if (!base && !next) return undefined;
  const merged: Record<string, MoneyFieldOverride> = { ...(base ?? {}) };
  if (next) {
    for (const [key, value] of Object.entries(next)) {
      merged[key] = { ...merged[key], ...value };
    }
  }
  return merged;
}

export function mergePartialNaming(
  ...partials: (PartialMoneyColumnNaming | undefined)[]
): MoneyColumnNaming {
  const naming: MoneyColumnNaming = { ...DEFAULT_MONEY_COLUMN_NAMING };
  let fields: Record<string, MoneyFieldOverride> | undefined;

  for (const partial of partials) {
    if (!partial) continue;
    if (partial.amountSuffix !== undefined) {
      naming.amountSuffix = partial.amountSuffix;
    }
    if (partial.currencySuffix !== undefined) {
      naming.currencySuffix = partial.currencySuffix;
    }
    if (partial.amountOnlySuffix !== undefined) {
      naming.amountOnlySuffix = partial.amountOnlySuffix;
    }
    if (partial.sharedCurrencyColumn !== undefined) {
      naming.sharedCurrencyColumn = partial.sharedCurrencyColumn;
    }
    if (partial.sqlCase !== undefined) {
      naming.sqlCase = partial.sqlCase;
    }
    if (partial.propertyCase !== undefined) {
      naming.propertyCase = partial.propertyCase;
    }
    fields = mergeFieldOverrides(fields, partial.fields);
  }

  if (fields) {
    naming.fields = fields;
  }
  return naming;
}

export function mergeMoneyNaming(
  ...partials: (PartialMoneyColumnNaming | undefined)[]
): MoneyColumnNaming {
  return mergePartialNaming(...partials);
}

export function resolveNaming(options?: MoneyAdapterOptions): MoneyColumnNaming {
  return mergePartialNaming(globalNaming, options?.scope, options?.naming);
}

export function withScopeOptions<T extends MoneyAdapterOptions | undefined>(
  scope: PartialMoneyColumnNaming | undefined,
  options?: T,
): T {
  if (!scope) return (options ?? {}) as T;
  return {
    ...options,
    scope: mergePartialNaming(scope, options?.scope),
  } as T;
}

export function camelToSnake(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/-/g, "_")
    .toLowerCase();
}

export function sqlToProperty(
  sqlName: string,
  propertyCase: "camel" | "preserve",
): string {
  if (propertyCase === "preserve") return sqlName;
  return sqlName.replace(/_([a-z0-9])/g, (_, char: string) =>
    char.toUpperCase(),
  );
}

function logicalToSqlBase(
  logicalName: string,
  sqlCase: "snake" | "preserve",
): string {
  return sqlCase === "preserve" ? logicalName : camelToSnake(logicalName);
}

function fieldOverride(
  naming: MoneyColumnNaming,
  logicalName: string,
): MoneyFieldOverride | undefined {
  return naming.fields?.[logicalName];
}

export function resolveMoneyColumnNames(
  logicalName: string,
  options: {
    mode: MoneyFieldMode;
    naming?: PartialMoneyColumnNaming;
    scope?: PartialMoneyColumnNaming;
  },
): ResolvedColumnNames {
  const naming = mergePartialNaming(
    globalNaming,
    options.scope,
    options.naming,
  );
  const override = fieldOverride(naming, logicalName);
  const base = logicalToSqlBase(logicalName, naming.sqlCase);

  const explicitAmount =
    override && "amount" in override ? override.amount : undefined;
  const explicitCurrency =
    override && "currency" in override ? override.currency : undefined;
  const explicitAmountOnly =
    override && "amountOnly" in override ? override.amountOnly : undefined;

  const amountSuffix =
    options.mode === "amountOnly"
      ? naming.amountOnlySuffix
      : naming.amountSuffix;

  const amountSql =
    explicitAmount ?? explicitAmountOnly ?? `${base}${amountSuffix}`;

  const currencySql =
    options.mode === "paired"
      ? (explicitCurrency ?? `${base}${naming.currencySuffix}`)
      : undefined;

  return {
    logicalName,
    mode: options.mode,
    amountSql,
    currencySql,
    amountProperty: sqlToProperty(amountSql, naming.propertyCase),
    currencyProperty:
      currencySql != null
        ? sqlToProperty(currencySql, naming.propertyCase)
        : undefined,
  };
}

export function resolveSharedCurrencyColumnNames(
  logicalName = "currency",
  options?: MoneyAdapterOptions,
): { sql: string; property: string } {
  const naming = resolveNaming(options);
  const override = fieldOverride(naming, logicalName);
  const explicit =
    override && "amount" in override ? override.amount : undefined;
  const sql =
    explicit ??
    (logicalName === "currency"
      ? naming.sharedCurrencyColumn
      : logicalToSqlBase(logicalName, naming.sqlCase));
  return {
    sql,
    property: sqlToProperty(sql, naming.propertyCase),
  };
}

export function createMoneyNamingScope(config: MoneyPersistenceConfig) {
  const scope = config.naming;
  return {
    naming: scope,
    withScope<T extends MoneyAdapterOptions | undefined>(options?: T): T {
      return withScopeOptions(scope, options);
    },
  };
}

export type MoneyNamingScope = ReturnType<typeof createMoneyNamingScope>;

export function moneyGridFields(
  logicalName: string,
  options: {
    mode: MoneyFieldMode;
    naming?: PartialMoneyColumnNaming;
    scope?: PartialMoneyColumnNaming;
  },
): { amount: string; currency?: string } {
  const names = resolveMoneyColumnNames(logicalName, options);
  return {
    amount: names.amountSql,
    currency: names.currencySql,
  };
}
