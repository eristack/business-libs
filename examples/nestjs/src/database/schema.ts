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

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  number: text("number").notNull(),
  status: text("status").notNull(),
  orderedAt: text("ordered_at").notNull(),
  total: text("total").notNull(),
});
