export type DrizzleDialect = "pgsql" | "mysql" | "sqlite";

import {
  integer,
  pgTable,
  text as pgText,
} from "drizzle-orm/pg-core";
import {
  int as mysqlInt,
  mysqlTable,
  text as mysqlText,
  varchar as mysqlVarchar,
} from "drizzle-orm/mysql-core";
import {
  int as sqliteInt,
  sqliteTable,
  text as sqliteText,
} from "drizzle-orm/sqlite-core";

export function createHashChainedLedgerTables(
  dialect: DrizzleDialect,
  prefix = "hcl",
) {
  switch (dialect) {
    case "pgsql":
      return createPgsql(prefix);
    case "mysql":
      return createMysql(prefix);
    case "sqlite":
      return createSqlite(prefix);
    default: {
      const _e: never = dialect;
      throw new Error(`Unsupported dialect: ${String(_e)}`);
    }
  }
}

export type HashChainedLedgerTables = ReturnType<
  typeof createHashChainedLedgerTables
>;

function createPgsql(prefix: string) {
  const entries = pgTable(`${prefix}_entries`, {
    id: pgText("id").primaryKey(),
    chainId: pgText("chain_id").notNull(),
    sequence: integer("sequence").notNull(),
    openingBalance: pgText("opening_balance").notNull(),
    inAmount: pgText("in_amount").notNull(),
    outAmount: pgText("out_amount").notNull(),
    adjustment: pgText("adjustment").notNull(),
    closingBalance: pgText("closing_balance").notNull(),
    entryType: pgText("entry_type").notNull(),
    entryTypeId: pgText("entry_type_id").notNull(),
    occurredAt: pgText("occurred_at").notNull(),
    prevHash: pgText("prev_hash"),
    entryHash: pgText("entry_hash").notNull(),
    metaJson: pgText("meta_json"),
  });
  const snapshots = pgTable(`${prefix}_snapshots`, {
    chainId: pgText("chain_id").primaryKey(),
    sequence: integer("sequence").notNull(),
    balance: pgText("balance").notNull(),
    entryHash: pgText("entry_hash").notNull(),
    updatedAt: pgText("updated_at").notNull(),
  });
  return { entries, snapshots };
}

function createMysql(prefix: string) {
  const entries = mysqlTable(`${prefix}_entries`, {
    id: mysqlVarchar("id", { length: 64 }).primaryKey(),
    chainId: mysqlVarchar("chain_id", { length: 191 }).notNull(),
    sequence: mysqlInt("sequence").notNull(),
    openingBalance: mysqlVarchar("opening_balance", { length: 64 }).notNull(),
    inAmount: mysqlVarchar("in_amount", { length: 64 }).notNull(),
    outAmount: mysqlVarchar("out_amount", { length: 64 }).notNull(),
    adjustment: mysqlVarchar("adjustment", { length: 64 }).notNull(),
    closingBalance: mysqlVarchar("closing_balance", { length: 64 }).notNull(),
    entryType: mysqlVarchar("entry_type", { length: 128 }).notNull(),
    entryTypeId: mysqlVarchar("entry_type_id", { length: 191 }).notNull(),
    occurredAt: mysqlVarchar("occurred_at", { length: 40 }).notNull(),
    prevHash: mysqlVarchar("prev_hash", { length: 64 }),
    entryHash: mysqlVarchar("entry_hash", { length: 64 }).notNull(),
    metaJson: mysqlText("meta_json"),
  });
  const snapshots = mysqlTable(`${prefix}_snapshots`, {
    chainId: mysqlVarchar("chain_id", { length: 191 }).primaryKey(),
    sequence: mysqlInt("sequence").notNull(),
    balance: mysqlVarchar("balance", { length: 64 }).notNull(),
    entryHash: mysqlVarchar("entry_hash", { length: 64 }).notNull(),
    updatedAt: mysqlVarchar("updated_at", { length: 40 }).notNull(),
  });
  return { entries, snapshots };
}

function createSqlite(prefix: string) {
  const entries = sqliteTable(`${prefix}_entries`, {
    id: sqliteText("id").primaryKey(),
    chainId: sqliteText("chain_id").notNull(),
    sequence: sqliteInt("sequence").notNull(),
    openingBalance: sqliteText("opening_balance").notNull(),
    inAmount: sqliteText("in_amount").notNull(),
    outAmount: sqliteText("out_amount").notNull(),
    adjustment: sqliteText("adjustment").notNull(),
    closingBalance: sqliteText("closing_balance").notNull(),
    entryType: sqliteText("entry_type").notNull(),
    entryTypeId: sqliteText("entry_type_id").notNull(),
    occurredAt: sqliteText("occurred_at").notNull(),
    prevHash: sqliteText("prev_hash"),
    entryHash: sqliteText("entry_hash").notNull(),
    metaJson: sqliteText("meta_json"),
  });
  const snapshots = sqliteTable(`${prefix}_snapshots`, {
    chainId: sqliteText("chain_id").primaryKey(),
    sequence: sqliteInt("sequence").notNull(),
    balance: sqliteText("balance").notNull(),
    entryHash: sqliteText("entry_hash").notNull(),
    updatedAt: sqliteText("updated_at").notNull(),
  });
  return { entries, snapshots };
}
