import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "./schema.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.join(here, "../../drizzle");

export type AppDatabase = {
  sqlite: Database.Database;
  db: BetterSQLite3Database<typeof schema>;
  table: typeof schema.jwtAuthRefreshTokens;
  credentialsTable: typeof schema.jwtAuthCredentials;
  usersTable: typeof schema.users;
  file: string;
};

/**
 * App-owned DB: open SQLite, apply Drizzle migrations, return injectable `db`.
 * Nest injects this into JwtAuthModule.registerAsync — jwt-auth never migrates.
 */
export function createAppDatabase(dbFile = process.env.SQLITE_PATH): AppDatabase {
  const file =
    dbFile ??
    path.join(process.cwd(), "data", "nestjs-jwt-auth.sqlite");

  mkdirSync(path.dirname(file), { recursive: true });

  const sqlite = new Database(file);
  const db = drizzle(sqlite, { schema });
  migrate(db, { migrationsFolder });

  return {
    sqlite,
    db,
    table: schema.jwtAuthRefreshTokens,
    credentialsTable: schema.jwtAuthCredentials,
    usersTable: schema.users,
    file,
  };
}
