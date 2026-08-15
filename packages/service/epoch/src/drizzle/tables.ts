export type DrizzleDialect = "pgsql" | "mysql" | "sqlite";

import {
  pgTable,
  text as pgText,
  integer as pgInteger,
  timestamp as pgTimestamp,
} from "drizzle-orm/pg-core";
import {
  mysqlTable,
  varchar as mysqlVarchar,
  int as mysqlInt,
  datetime as mysqlDatetime,
} from "drizzle-orm/mysql-core";
import {
  sqliteTable,
  text as sqliteText,
  integer as sqliteInteger,
} from "drizzle-orm/sqlite-core";

/** Default table: `{prefix}_counters` with scope PK and monotonic value. */
export function createEpochTables(dialect: DrizzleDialect, prefix = "epoch") {
  switch (dialect) {
    case "pgsql":
      return createPgsqlEpochTables(prefix);
    case "mysql":
      return createMysqlEpochTables(prefix);
    case "sqlite":
      return createSqliteEpochTables(prefix);
    default: {
      const _e: never = dialect;
      throw new Error(`Unsupported dialect: ${String(_e)}`);
    }
  }
}

function createPgsqlEpochTables(prefix: string) {
  const counters = pgTable(`${prefix}_counters`, {
    scope: pgText("scope").primaryKey(),
    value: pgInteger("value").notNull().default(0),
    updatedAt: pgTimestamp("updated_at", { withTimezone: true, mode: "string" }),
  });
  return { counters };
}

function createMysqlEpochTables(prefix: string) {
  const counters = mysqlTable(`${prefix}_counters`, {
    scope: mysqlVarchar("scope", { length: 255 }).primaryKey(),
    value: mysqlInt("value").notNull().default(0),
    updatedAt: mysqlDatetime("updated_at", { mode: "string", fsp: 3 }),
  });
  return { counters };
}

function createSqliteEpochTables(prefix: string) {
  const counters = sqliteTable(`${prefix}_counters`, {
    scope: sqliteText("scope").primaryKey(),
    value: sqliteInteger("value").notNull().default(0),
    updatedAt: sqliteText("updated_at"),
  });
  return { counters };
}

export type EpochTables = ReturnType<typeof createEpochTables>;
