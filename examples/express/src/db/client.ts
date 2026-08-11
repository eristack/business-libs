import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "./schema.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.join(here, "../../drizzle");

/**
 * App-owned DB: open SQLite, apply Drizzle migrations, return injectable `db`.
 * @eristack/jwt-auth never opens connections or runs migrations.
 */
export function createAppDatabase(dbFile = process.env.SQLITE_PATH) {
  const file =
    dbFile ??
    path.join(process.cwd(), "data", "express-jwt-auth.sqlite");

  mkdirSync(path.dirname(file), { recursive: true });

  const sqlite = new Database(file);
  const db = drizzle(sqlite, { schema });

  migrate(db, { migrationsFolder });

  return {
    sqlite,
    db,
    refreshTokenTable: schema.jwtAuthRefreshTokens,
    credentialsTable: schema.jwtAuthCredentials,
    usersTable: schema.users,
    file,
  };
}
