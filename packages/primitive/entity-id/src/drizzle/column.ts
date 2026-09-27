import { uuid } from "drizzle-orm/pg-core";
import { char as mysqlChar } from "drizzle-orm/mysql-core";
import { text } from "drizzle-orm/sqlite-core";

import { generateEntityId } from "../core/entity-id.js";
import type { DrizzleDialect, EntityIdColumnOptions } from "./types.js";

export function entityIdColumn(
  dialect: DrizzleDialect,
  name: string,
  options?: EntityIdColumnOptions,
) {
  const sqlName = options?.sqlName ?? name;

  switch (dialect) {
    case "pgsql":
      return uuid(sqlName).$defaultFn(() => generateEntityId());
    case "mysql":
      return mysqlChar(sqlName, { length: 36 }).$defaultFn(() => generateEntityId());
    case "sqlite":
      return text(sqlName).$defaultFn(() => generateEntityId());
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
