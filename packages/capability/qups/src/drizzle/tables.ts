import {
  pgTable,
  text as pgText,
  timestamp as pgTimestamp,
  boolean as pgBoolean,
  integer as pgInteger,
  primaryKey as pgPrimaryKey,
} from "drizzle-orm/pg-core";
import {
  mysqlTable,
  varchar as mysqlVarchar,
  datetime as mysqlDatetime,
  boolean as mysqlBoolean,
  int as mysqlInt,
  primaryKey as mysqlPrimaryKey,
} from "drizzle-orm/mysql-core";
import {
  sqliteTable,
  text as sqliteText,
  integer as sqliteInteger,
  primaryKey as sqlitePrimaryKey,
} from "drizzle-orm/sqlite-core";
import type { DrizzleDialect } from "./types.js";

/**
 * Optional **catalog** tables (profiles / field defs).
 * Detail **lines are not owned here** — inject `qupsLineColumns` into your
 * invoice/order/GR line table instead.
 */
export function createQupsProfileTables(
  dialect: DrizzleDialect,
  prefix = "qups",
) {
  switch (dialect) {
    case "pgsql":
      return createPgsqlProfileTables(prefix);
    case "mysql":
      return createMysqlProfileTables(prefix);
    case "sqlite":
      return createSqliteProfileTables(prefix);
    default: {
      const _e: never = dialect;
      throw new Error(`Unsupported dialect: ${String(_e)}`);
    }
  }
}

/**
 * Optional side tables for stacked modifiers / dynamic field values,
 * keyed by your app line id (`line_id`).
 */
export function createQupsLineSideTables(
  dialect: DrizzleDialect,
  prefix = "qups",
) {
  switch (dialect) {
    case "pgsql":
      return createPgsqlSideTables(prefix);
    case "mysql":
      return createMysqlSideTables(prefix);
    case "sqlite":
      return createSqliteSideTables(prefix);
    default: {
      const _e: never = dialect;
      throw new Error(`Unsupported dialect: ${String(_e)}`);
    }
  }
}

/** @deprecated Use createQupsProfileTables + createQupsLineSideTables + qupsLineColumns */
export function createQupsTables(dialect: DrizzleDialect, prefix = "qups") {
  return {
    ...createQupsProfileTables(dialect, prefix),
    ...createQupsLineSideTables(dialect, prefix),
  };
}

function createPgsqlProfileTables(prefix: string) {
  const profiles = pgTable(`${prefix}_pricing_profiles`, {
    id: pgText("id").primaryKey(),
    entityKey: pgText("entity_key").notNull(),
    defaultTruth: pgText("default_truth").notNull(),
    defaultCurrencyCode: pgText("default_currency_code").notNull(),
    defaultTaxRatePercent: pgText("default_tax_rate_percent"),
    defaultTaxMode: pgText("default_tax_mode"),
    active: pgBoolean("active").notNull(),
    createdAt: pgTimestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
    updatedAt: pgTimestamp("updated_at", { withTimezone: true, mode: "date" }).notNull(),
  });

  const fields = pgTable(`${prefix}_pricing_fields`, {
    id: pgText("id").primaryKey(),
    profileId: pgText("profile_id").notNull(),
    key: pgText("key").notNull(),
    label: pgText("label"),
    kind: pgText("kind").notNull(),
    role: pgText("role").notNull(),
    enabled: pgBoolean("enabled").notNull(),
    required: pgBoolean("required"),
    position: pgInteger("position").notNull(),
  });

  const profileModifierKinds = pgTable(
    `${prefix}_pricing_profile_modifier_kinds`,
    {
      profileId: pgText("profile_id").notNull(),
      kind: pgText("kind").notNull(),
    },
    (t) => [pgPrimaryKey({ columns: [t.profileId, t.kind] })],
  );

  return { profiles, fields, profileModifierKinds };
}

function createMysqlProfileTables(prefix: string) {
  const profiles = mysqlTable(`${prefix}_pricing_profiles`, {
    id: mysqlVarchar("id", { length: 64 }).primaryKey(),
    entityKey: mysqlVarchar("entity_key", { length: 255 }).notNull(),
    defaultTruth: mysqlVarchar("default_truth", { length: 64 }).notNull(),
    defaultCurrencyCode: mysqlVarchar("default_currency_code", {
      length: 16,
    }).notNull(),
    defaultTaxRatePercent: mysqlVarchar("default_tax_rate_percent", {
      length: 32,
    }),
    defaultTaxMode: mysqlVarchar("default_tax_mode", { length: 32 }),
    active: mysqlBoolean("active").notNull(),
    createdAt: mysqlDatetime("created_at", { mode: "date" }).notNull(),
    updatedAt: mysqlDatetime("updated_at", { mode: "date" }).notNull(),
  });

  const fields = mysqlTable(`${prefix}_pricing_fields`, {
    id: mysqlVarchar("id", { length: 64 }).primaryKey(),
    profileId: mysqlVarchar("profile_id", { length: 64 }).notNull(),
    key: mysqlVarchar("key", { length: 128 }).notNull(),
    label: mysqlVarchar("label", { length: 255 }),
    kind: mysqlVarchar("kind", { length: 32 }).notNull(),
    role: mysqlVarchar("role", { length: 32 }).notNull(),
    enabled: mysqlBoolean("enabled").notNull(),
    required: mysqlBoolean("required"),
    position: mysqlInt("position").notNull(),
  });

  const profileModifierKinds = mysqlTable(
    `${prefix}_pricing_profile_modifier_kinds`,
    {
      profileId: mysqlVarchar("profile_id", { length: 64 }).notNull(),
      kind: mysqlVarchar("kind", { length: 32 }).notNull(),
    },
    (t) => [mysqlPrimaryKey({ columns: [t.profileId, t.kind] })],
  );

  return { profiles, fields, profileModifierKinds };
}

function createSqliteProfileTables(prefix: string) {
  const profiles = sqliteTable(`${prefix}_pricing_profiles`, {
    id: sqliteText("id").primaryKey(),
    entityKey: sqliteText("entity_key").notNull(),
    defaultTruth: sqliteText("default_truth").notNull(),
    defaultCurrencyCode: sqliteText("default_currency_code").notNull(),
    defaultTaxRatePercent: sqliteText("default_tax_rate_percent"),
    defaultTaxMode: sqliteText("default_tax_mode"),
    active: sqliteInteger("active", { mode: "boolean" }).notNull(),
    createdAt: sqliteInteger("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: sqliteInteger("updated_at", { mode: "timestamp_ms" }).notNull(),
  });

  const fields = sqliteTable(`${prefix}_pricing_fields`, {
    id: sqliteText("id").primaryKey(),
    profileId: sqliteText("profile_id").notNull(),
    key: sqliteText("key").notNull(),
    label: sqliteText("label"),
    kind: sqliteText("kind").notNull(),
    role: sqliteText("role").notNull(),
    enabled: sqliteInteger("enabled", { mode: "boolean" }).notNull(),
    required: sqliteInteger("required", { mode: "boolean" }),
    position: sqliteInteger("position").notNull(),
  });

  const profileModifierKinds = sqliteTable(
    `${prefix}_pricing_profile_modifier_kinds`,
    {
      profileId: sqliteText("profile_id").notNull(),
      kind: sqliteText("kind").notNull(),
    },
    (t) => [sqlitePrimaryKey({ columns: [t.profileId, t.kind] })],
  );

  return { profiles, fields, profileModifierKinds };
}

function createPgsqlSideTables(prefix: string) {
  const modifiers = pgTable(`${prefix}_pricing_line_modifiers`, {
    id: pgText("id").primaryKey(),
    lineId: pgText("line_id").notNull(),
    position: pgInteger("position").notNull(),
    kind: pgText("kind").notNull(),
    type: pgText("type").notNull(),
    percent: pgText("percent"),
    amount: pgText("amount"),
    currency: pgText("currency"),
  });

  const fieldValues = pgTable(
    `${prefix}_pricing_line_field_values`,
    {
      lineId: pgText("line_id").notNull(),
      fieldKey: pgText("field_key").notNull(),
      value: pgText("value").notNull(),
      currency: pgText("currency"),
    },
    (t) => [pgPrimaryKey({ columns: [t.lineId, t.fieldKey] })],
  );

  return { modifiers, fieldValues };
}

function createMysqlSideTables(prefix: string) {
  const modifiers = mysqlTable(`${prefix}_pricing_line_modifiers`, {
    id: mysqlVarchar("id", { length: 64 }).primaryKey(),
    lineId: mysqlVarchar("line_id", { length: 64 }).notNull(),
    position: mysqlInt("position").notNull(),
    kind: mysqlVarchar("kind", { length: 32 }).notNull(),
    type: mysqlVarchar("type", { length: 32 }).notNull(),
    percent: mysqlVarchar("percent", { length: 32 }),
    amount: mysqlVarchar("amount", { length: 64 }),
    currency: mysqlVarchar("currency", { length: 16 }),
  });

  const fieldValues = mysqlTable(
    `${prefix}_pricing_line_field_values`,
    {
      lineId: mysqlVarchar("line_id", { length: 64 }).notNull(),
      fieldKey: mysqlVarchar("field_key", { length: 128 }).notNull(),
      value: mysqlVarchar("value", { length: 512 }).notNull(),
      currency: mysqlVarchar("currency", { length: 16 }),
    },
    (t) => [mysqlPrimaryKey({ columns: [t.lineId, t.fieldKey] })],
  );

  return { modifiers, fieldValues };
}

function createSqliteSideTables(prefix: string) {
  const modifiers = sqliteTable(`${prefix}_pricing_line_modifiers`, {
    id: sqliteText("id").primaryKey(),
    lineId: sqliteText("line_id").notNull(),
    position: sqliteInteger("position").notNull(),
    kind: sqliteText("kind").notNull(),
    type: sqliteText("type").notNull(),
    percent: sqliteText("percent"),
    amount: sqliteText("amount"),
    currency: sqliteText("currency"),
  });

  const fieldValues = sqliteTable(
    `${prefix}_pricing_line_field_values`,
    {
      lineId: sqliteText("line_id").notNull(),
      fieldKey: sqliteText("field_key").notNull(),
      value: sqliteText("value").notNull(),
      currency: sqliteText("currency"),
    },
    (t) => [sqlitePrimaryKey({ columns: [t.lineId, t.fieldKey] })],
  );

  return { modifiers, fieldValues };
}

export type QupsProfileTables = ReturnType<typeof createQupsProfileTables>;
export type QupsLineSideTables = ReturnType<typeof createQupsLineSideTables>;
export type QupsTables = QupsProfileTables & QupsLineSideTables;
