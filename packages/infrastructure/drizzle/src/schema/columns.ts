import { entityIdColumn } from "@eristack/entity-id/drizzle";
import {
  boolean as pgBoolean,
  jsonb as pgJsonb,
  text as pgText,
} from "drizzle-orm/pg-core";
import {
  integer as sqliteInteger,
  text as sqliteText,
} from "drizzle-orm/sqlite-core";
import type { AppDbDialect } from "../dialect.js";

export { entityIdColumn };

export function dialectText(dialect: AppDbDialect, sqlName: string) {
  switch (dialect) {
    case "pgsql":
      return pgText(sqlName);
    case "sqlite":
      return sqliteText(sqlName);
    default: {
      const _e: never = dialect;
      throw new Error(`Unsupported dialect: ${String(_e)}`);
    }
  }
}

/** Boolean flag — Postgres `boolean`, SQLite integer 0/1. */
export function dialectFlag(dialect: AppDbDialect, sqlName: string) {
  switch (dialect) {
    case "pgsql":
      return pgBoolean(sqlName);
    case "sqlite":
      return sqliteInteger(sqlName, { mode: "boolean" });
    default: {
      const _e: never = dialect;
      throw new Error(`Unsupported dialect: ${String(_e)}`);
    }
  }
}

/** JSON document column — Postgres `jsonb`, SQLite text (app serializes). */
export function dialectJson<T>(dialect: AppDbDialect, sqlName: string) {
  switch (dialect) {
    case "pgsql":
      return pgJsonb(sqlName).$type<T>();
    case "sqlite":
      return sqliteText(sqlName).$type<T>();
    default: {
      const _e: never = dialect;
      throw new Error(`Unsupported dialect: ${String(_e)}`);
    }
  }
}

/** String array persisted as JSON — enabled tax codes, print field lists. */
export function dialectStringList(dialect: AppDbDialect, sqlName: string) {
  return dialectJson<string[]>(dialect, sqlName);
}

/** String-keyed JSON map — nullable print masks, small metadata blobs. */
export function dialectJsonMap(dialect: AppDbDialect, sqlName: string) {
  return dialectJson<Record<string, unknown>>(dialect, sqlName);
}

/** @eristack/timestamp wire JSON stored in a dialect-safe JSON column. */
export function dialectTimestampJson(dialect: AppDbDialect, sqlName: string) {
  return dialectJson<Record<string, unknown>>(dialect, sqlName);
}
