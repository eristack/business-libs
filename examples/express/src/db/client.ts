import path from "node:path";
import { fileURLToPath } from "node:url";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { openDrizzle } from "@eristack/drizzle";
import * as schema from "./schema.js";

export type AppDb = BetterSQLite3Database<typeof schema>;

const here = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.join(here, "../../drizzle");

/**
 * App-owned DB via @eristack/drizzle openDrizzle — packages never open connections here.
 */
export async function bootAppDatabase(sqlitePath = process.env.SQLITE_PATH) {
  const file =
    sqlitePath?.trim() ||
    path.join(process.cwd(), "data", "express-jwt-auth.sqlite");

  const opened = await openDrizzle({
    schema,
    dialect: "sqlite",
    sqlitePath: file,
    migrationsFolder,
  });

  return {
    db: opened.db as AppDb,
    dialect: opened.dialect,
    location: opened.location,
    close: opened.close,
    refreshTokenTable: schema.jwtAuthRefreshTokens,
    credentialsTable: schema.jwtAuthCredentials,
    usersTable: schema.users,
  };
}
