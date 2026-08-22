export type DrizzleDialect = "pgsql" | "mysql" | "sqlite";

export type MoneyFieldMode = "paired" | "amountOnly";

export type MoneyFieldOverride =
  | { amount?: string; currency?: string; amountOnly?: string }
  | { amountSuffix?: string; currencySuffix?: string };

export type MoneyColumnNaming = {
  amountSuffix: string;
  currencySuffix: string;
  amountOnlySuffix: string;
  sharedCurrencyColumn: string;
  sqlCase: "snake" | "preserve";
  propertyCase: "camel" | "preserve";
  fields?: Record<string, MoneyFieldOverride>;
};

export type PartialMoneyColumnNaming = {
  amountSuffix?: string;
  currencySuffix?: string;
  amountOnlySuffix?: string;
  sharedCurrencyColumn?: string;
  sqlCase?: "snake" | "preserve";
  propertyCase?: "camel" | "preserve";
  fields?: Record<string, MoneyFieldOverride>;
};

export type MoneyPersistenceConfig = {
  naming?: PartialMoneyColumnNaming;
};

export type MoneyAdapterOptions = MoneyPersistenceConfig & {
  /** Scoped naming from `createMoneyNamingScope`. */
  scope?: PartialMoneyColumnNaming;
};

export type ResolvedColumnNames = {
  logicalName: string;
  mode: MoneyFieldMode;
  amountSql: string;
  currencySql?: string;
  amountProperty: string;
  currencyProperty?: string;
};

export type MoneyGridFields = {
  amount: string;
  currency?: string;
};
