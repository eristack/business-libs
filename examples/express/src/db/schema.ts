import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import {
  createCredentialsTable,
  createRefreshTokenTable,
} from "@eristack/jwt-auth/drizzle";

/**
 * App-owned users table.
 * jwt-auth credentials are a child of this table via `subject` = `users.id`.
 */
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  displayName: text("display_name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

/** Child of `users` — never replace the users table with this. */
export const jwtAuthCredentials = createCredentialsTable("sqlite");

export const jwtAuthRefreshTokens = createRefreshTokenTable("sqlite");

/** CRM customer — parent of orders. */
export const customers = sqliteTable("customers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  region: text("region").notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  sku: text("sku").notNull(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  /** Unit price in minor units (cents). Apps should treat money as integers/strings, not floats. */
  unitPriceMinor: integer("unit_price_minor").notNull(),
});

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  number: text("number").notNull(),
  customerId: text("customer_id")
    .notNull()
    .references(() => customers.id),
  status: text("status").notNull(),
  orderedAt: integer("ordered_at", { mode: "timestamp_ms" }).notNull(),
  notes: text("notes"),
  /** Optional assignee — relation back to app users. */
  assigneeUserId: text("assignee_user_id").references(() => users.id),
});

export const orderLines = sqliteTable("order_lines", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id),
  productId: text("product_id")
    .notNull()
    .references(() => products.id),
  qty: integer("qty").notNull(),
  /** Snapshot of unit price at order time (minor units). */
  unitPriceMinor: integer("unit_price_minor").notNull(),
});
