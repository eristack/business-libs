export type DrizzleDialect = "pgsql" | "mysql" | "sqlite";

export type EntityIdColumnOptions = {
  /** SQL column name override (defaults to `name`). */
  sqlName?: string;
};
