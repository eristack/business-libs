import {
  text as pgText,
  integer as pgInteger,
  timestamp as pgTimestamp,
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
import type { DrizzleDialect } from "./types.js";

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

/**
 * Injectable QUPS pricing columns for an app-owned detail table
 * (invoice lines, order lines, GR lines, …).
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
    currencyUnitPrice: pgText("currency_unit_price").notNull(),
    unitPrice: pgText("unit_price").notNull(),
    currencySubtotal: pgText("currency_subtotal").notNull(),
    subtotal: pgText("subtotal").notNull(),
    taxRatePercent: pgText("tax_rate_percent"),
    taxMode: pgText("tax_mode"),
    currencyTax: pgText("currency_tax"),
    taxAmount: pgText("tax_amount"),
    currencyNet: pgText("currency_net"),
    net: pgText("net"),
    currencyGross: pgText("currency_gross"),
    gross: pgText("gross"),
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
    currencyUnitPrice: mysqlVarchar("currency_unit_price", {
      length: 16,
    }).notNull(),
    unitPrice: mysqlVarchar("unit_price", { length: 64 }).notNull(),
    currencySubtotal: mysqlVarchar("currency_subtotal", {
      length: 16,
    }).notNull(),
    subtotal: mysqlVarchar("subtotal", { length: 64 }).notNull(),
    taxRatePercent: mysqlVarchar("tax_rate_percent", { length: 32 }),
    taxMode: mysqlVarchar("tax_mode", { length: 32 }),
    currencyTax: mysqlVarchar("currency_tax", { length: 16 }),
    taxAmount: mysqlVarchar("tax_amount", { length: 64 }),
    currencyNet: mysqlVarchar("currency_net", { length: 16 }),
    net: mysqlVarchar("net", { length: 64 }),
    currencyGross: mysqlVarchar("currency_gross", { length: 16 }),
    gross: mysqlVarchar("gross", { length: 64 }),
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
    currencyUnitPrice: sqliteText("currency_unit_price").notNull(),
    unitPrice: sqliteText("unit_price").notNull(),
    currencySubtotal: sqliteText("currency_subtotal").notNull(),
    subtotal: sqliteText("subtotal").notNull(),
    taxRatePercent: sqliteText("tax_rate_percent"),
    taxMode: sqliteText("tax_mode"),
    currencyTax: sqliteText("currency_tax"),
    taxAmount: sqliteText("tax_amount"),
    currencyNet: sqliteText("currency_net"),
    net: sqliteText("net"),
    currencyGross: sqliteText("currency_gross"),
    gross: sqliteText("gross"),
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
  "currency_unit_price",
  "unit_price",
  "currency_subtotal",
  "subtotal",
  "tax_rate_percent",
  "tax_mode",
  "currency_tax",
  "tax_amount",
  "currency_net",
  "net",
  "currency_gross",
  "gross",
] as const;
