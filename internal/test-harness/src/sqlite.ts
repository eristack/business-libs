import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

export type TestSqliteDb = {
  sqlite: Database.Database;
  db: BetterSQLite3Database;
  close: () => void;
};

/** Returns false when better-sqlite3 native bindings are not built (CI without approve-builds). */
export function canUseBetterSqlite(): boolean {
  try {
    const db = new Database(":memory:");
    db.close();
    return true;
  } catch {
    return false;
  }
}

/** In-memory sqlite + drizzle. Caller owns schema setup via execSql. */
export function createTestSqliteDb(
  file: string = ":memory:",
): TestSqliteDb {
  const sqlite = new Database(file);
  sqlite.pragma("foreign_keys = ON");
  const db = drizzle(sqlite);
  return {
    sqlite,
    db,
    close: () => sqlite.close(),
  };
}

export function execSql(sqlite: Database.Database, statements: string[]) {
  for (const statement of statements) {
    sqlite.exec(statement);
  }
}
