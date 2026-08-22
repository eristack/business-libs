import {
  text as pgText,
  integer as pgInteger,
  timestamp as pgTimestamp,
  varchar as pgVarchar,
} from "drizzle-orm/pg-core";
import {
  varchar as mysqlVarchar,
  int as mysqlInt,
  datetime as mysqlDatetime,
} from "drizzle-orm/mysql-core";
import {
  text as sqliteText,
  integer as sqliteInteger,
} from "drizzle-orm/sqlite-core";
import {
  moneyAmountColumn,
} from "@eristack/money/drizzle";
import type { DrizzleDialect } from "./types.js";

const CURRENCY_LENGTH = 16;

export type QupsLineColumnOptions = {
  /**
   * Optional `profile_id` column on the detail row.
   * @default true
   */
  includeProfileId?: boolean;
  /**
   * Optional `position` column (line order).
   * @default false — apps usually already have `line_no` / similar
   */
  includePosition?: boolean;
  /**
   * Optional `created_at` / `updated_at`.
   * @default false — apps usually already have timestamps
   */
  includeTimestamps?: boolean;
};

function sharedCurrencyColumns(dialect: DrizzleDialect) {
  switch (dialect) {
    case "pgsql":
      return {
        currency: pgVarchar("currency", { length: CURRENCY_LENGTH }).notNull(),
      };
    case "mysql":
      return {
        currency: mysqlVarchar("currency", { length: CURRENCY_LENGTH }).notNull(),
      };
    case "sqlite":
      return {
        currency: sqliteText("currency").notNull(),
      };
    default: {
      const _e: never = dialect;
      throw new Error(`Unsupported dialect: ${String(_e)}`);
    }
  }
}

function qupsMoneyAmountColumns(dialect: DrizzleDialect) {
  return {
    ...moneyAmountColumn(dialect, "unitPrice"),
    ...moneyAmountColumn(dialect, "subtotal"),
    ...moneyAmountColumn(dialect, "tax"),
    ...moneyAmountColumn(dialect, "net"),
    ...moneyAmountColumn(dialect, "gross"),
  };
}

/**
 * Injectable QUPS pricing columns for an app-owned detail table
 * (invoice lines, order lines, GR lines, …).
 *
 * One shared `currency` column plus numeric `*_amount` columns via
 * `@eristack/money/drizzle` defaults (`unit_price_amount`, …).
 *
 * Spread into your table next to `itemId` and other domain columns:
 *
 * ```ts
 * pgTable("invoice_lines", {
 *   id: text("id").primaryKey(),
 *   invoiceId: text("invoice_id").notNull(),
 *   itemId: text("item_id").notNull(),
 *   ...qupsLineColumns("pgsql"),
 * });
 * ```
 *
 * Does **not** include `id` or parent/owner keys — those stay app-owned.
 */
export function qupsLineColumns(
  dialect: "pgsql",
  options?: QupsLineColumnOptions,
): ReturnType<typeof pgsqlQupsLineColumns>;
export function qupsLineColumns(
  dialect: "mysql",
  options?: QupsLineColumnOptions,
): ReturnType<typeof mysqlQupsLineColumns>;
export function qupsLineColumns(
  dialect: "sqlite",
  options?: QupsLineColumnOptions,
): ReturnType<typeof sqliteQupsLineColumns>;
export function qupsLineColumns(
  dialect: DrizzleDialect,
  options: QupsLineColumnOptions = {},
) {
  switch (dialect) {
    case "pgsql":
      return pgsqlQupsLineColumns(options);
    case "mysql":
      return mysqlQupsLineColumns(options);
    case "sqlite":
      return sqliteQupsLineColumns(options);
    default: {
      const _e: never = dialect;
      throw new Error(`Unsupported dialect: ${String(_e)}`);
    }
  }
}

function pgsqlQupsLineColumns(options: QupsLineColumnOptions) {
  const includeProfileId = options.includeProfileId !== false;
  const includePosition = options.includePosition === true;
  const includeTimestamps = options.includeTimestamps === true;

  return {
    ...(includeProfileId
      ? { profileId: pgText("profile_id") }
      : {}),
    truth: pgText("truth").notNull(),
    quantity: pgText("quantity").notNull(),
    quantityRatioNumerator: pgText("quantity_ratio_numerator"),
    quantityRatioDenominator: pgText("quantity_ratio_denominator"),
    ...sharedCurrencyColumns("pgsql"),
    ...qupsMoneyAmountColumns("pgsql"),
    taxRatePercent: pgText("tax_rate_percent"),
    taxMode: pgText("tax_mode"),
    ...(includePosition ? { position: pgInteger("position") } : {}),
    ...(includeTimestamps
      ? {
          createdAt: pgTimestamp("created_at", {
            withTimezone: true,
            mode: "date",
          }).notNull(),
          updatedAt: pgTimestamp("updated_at", {
            withTimezone: true,
            mode: "date",
          }).notNull(),
        }
      : {}),
  };
}

function mysqlQupsLineColumns(options: QupsLineColumnOptions) {
  const includeProfileId = options.includeProfileId !== false;
  const includePosition = options.includePosition === true;
  const includeTimestamps = options.includeTimestamps === true;

  return {
    ...(includeProfileId
      ? { profileId: mysqlVarchar("profile_id", { length: 64 }) }
      : {}),
    truth: mysqlVarchar("truth", { length: 64 }).notNull(),
    quantity: mysqlVarchar("quantity", { length: 64 }).notNull(),
    quantityRatioNumerator: mysqlVarchar("quantity_ratio_numerator", {
      length: 64,
    }),
    quantityRatioDenominator: mysqlVarchar("quantity_ratio_denominator", {
      length: 64,
    }),
    ...sharedCurrencyColumns("mysql"),
    ...qupsMoneyAmountColumns("mysql"),
    taxRatePercent: mysqlVarchar("tax_rate_percent", { length: 32 }),
    taxMode: mysqlVarchar("tax_mode", { length: 32 }),
    ...(includePosition ? { position: mysqlInt("position") } : {}),
    ...(includeTimestamps
      ? {
          createdAt: mysqlDatetime("created_at", { mode: "date" }).notNull(),
          updatedAt: mysqlDatetime("updated_at", { mode: "date" }).notNull(),
        }
      : {}),
  };
}

function sqliteQupsLineColumns(options: QupsLineColumnOptions) {
  const includeProfileId = options.includeProfileId !== false;
  const includePosition = options.includePosition === true;
  const includeTimestamps = options.includeTimestamps === true;

  return {
    ...(includeProfileId
      ? { profileId: sqliteText("profile_id") }
      : {}),
    truth: sqliteText("truth").notNull(),
    quantity: sqliteText("quantity").notNull(),
    quantityRatioNumerator: sqliteText("quantity_ratio_numerator"),
    quantityRatioDenominator: sqliteText("quantity_ratio_denominator"),
    ...sharedCurrencyColumns("sqlite"),
    ...qupsMoneyAmountColumns("sqlite"),
    taxRatePercent: sqliteText("tax_rate_percent"),
    taxMode: sqliteText("tax_mode"),
    ...(includePosition ? { position: sqliteInteger("position") } : {}),
    ...(includeTimestamps
      ? {
          createdAt: sqliteInteger("created_at", {
            mode: "timestamp_ms",
          }).notNull(),
          updatedAt: sqliteInteger("updated_at", {
            mode: "timestamp_ms",
          }).notNull(),
        }
      : {}),
  };
}

/** Canonical SQL names for injectable QUPS columns (docs / migrations). */
export const QUPS_LINE_SQL_COLUMNS = [
  "profile_id",
  "truth",
  "quantity",
  "quantity_ratio_numerator",
  "quantity_ratio_denominator",
  "currency",
  "unit_price_amount",
  "subtotal_amount",
  "tax_rate_percent",
  "tax_mode",
  "tax_amount",
  "net_amount",
  "gross_amount",
] as const;
