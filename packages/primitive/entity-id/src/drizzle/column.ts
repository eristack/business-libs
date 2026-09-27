import { uuid } from "drizzle-orm/pg-core";
import { char as mysqlChar } from "drizzle-orm/mysql-core";
import { text } from "drizzle-orm/sqlite-core";

import { generateEntityId } from "../core/entity-id.js";
import type { DrizzleDialect, EntityIdColumnOptions } from "./types.js";

function pgsqlEntityIdColumn(sqlName: string) {
  return uuid(sqlName).$defaultFn(() => generateEntityId());
}

function mysqlEntityIdColumn(sqlName: string) {
  return mysqlChar(sqlName, { length: 36 }).$defaultFn(() => generateEntityId());
}

function sqliteEntityIdColumn(sqlName: string) {
  return text(sqlName).$defaultFn(() => generateEntityId());
}

export function entityIdColumn(
  dialect: "pgsql",
  name: string,
  options?: EntityIdColumnOptions,
): ReturnType<typeof pgsqlEntityIdColumn>;
export function entityIdColumn(
  dialect: "mysql",
  name: string,
  options?: EntityIdColumnOptions,
): ReturnType<typeof mysqlEntityIdColumn>;
export function entityIdColumn(
  dialect: "sqlite",
  name: string,
  options?: EntityIdColumnOptions,
): ReturnType<typeof sqliteEntityIdColumn>;
export function entityIdColumn(
  dialect: DrizzleDialect,
  name: string,
  options?: EntityIdColumnOptions,
): ReturnType<typeof pgsqlEntityIdColumn> | ReturnType<typeof mysqlEntityIdColumn> | ReturnType<typeof sqliteEntityIdColumn> {
  const sqlName = options?.sqlName ?? name;

  switch (dialect) {
    case "pgsql":
      return pgsqlEntityIdColumn(sqlName);
    case "mysql":
      return mysqlEntityIdColumn(sqlName);
    case "sqlite":
      return sqliteEntityIdColumn(sqlName);
    default: {
      const _exhaustive: never = dialect;
      throw new Error(`Unsupported dialect: ${String(_exhaustive)}`);
    }
  }
}

/** @deprecated Prefer `entityIdColumn` — pgsql-only alias kept for early docs drafts. */
export function entityIdPgColumn(name: string, options?: EntityIdColumnOptions) {
  return entityIdColumn("pgsql", name, options);
}
