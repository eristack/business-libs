import { mkdirSync } from "node:fs";
import path from "node:path";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { resolveAppDbDialect, type AppDbDialect } from "./dialect.js";
import { redactDatabaseLocation } from "./redact.js";

export type DrizzleAppDatabase<TSchema extends Record<string, unknown>> =
  | BetterSQLite3Database<TSchema>
  | NodePgDatabase<TSchema>;

export type OpenDrizzlePoolOptions = {
  max?: number;
  idleTimeoutMs?: number;
  connectionTimeoutMs?: number;
};

export type OpenDrizzleMigrations =
  | string
  | {
      sqlite: string;
      pgsql: string;
    };

export type OpenDrizzleOptions<TSchema extends Record<string, unknown>> = {
  schema: TSchema;
  dialect?: AppDbDialect;
  sqlitePath?: string;
  databaseUrl?: string;
  migrationsFolder?: OpenDrizzleMigrations;
  /** When true (default), run drizzle migrator for the resolved dialect folder. */
  migrate?: boolean;
  pool?: OpenDrizzlePoolOptions;
  onPoolError?: (error: Error) => void;
};

export type OpenDrizzleResult<TSchema extends Record<string, unknown>> = {
  db: DrizzleAppDatabase<TSchema>;
  dialect: AppDbDialect;
  /** File path or redacted Postgres URL — safe for health checks. */
  location: string;
  close: () => Promise<void>;
};

const DEFAULT_POOL = {
  max: 5,
  idleTimeoutMs: 30_000,
  connectionTimeoutMs: 10_000,
} as const;

function resolveMigrationsFolder(
  dialect: AppDbDialect,
  migrationsFolder: OpenDrizzleMigrations | undefined,
): string | undefined {
  if (!migrationsFolder) {
    return undefined;
  }
  if (typeof migrationsFolder === "string") {
    return migrationsFolder;
  }
  return dialect === "pgsql" ? migrationsFolder.pgsql : migrationsFolder.sqlite;
}

function defaultSqlitePath(): string {
  const fromEnv = process.env.SQLITE_PATH?.trim();
  if (fromEnv) {
    return fromEnv;
  }
  return path.join(process.cwd(), "data", "app.sqlite");
}

async function openSqlite<TSchema extends Record<string, unknown>>(
  options: OpenDrizzleOptions<TSchema>,
  dialect: AppDbDialect,
): Promise<OpenDrizzleResult<TSchema>> {
  const file = options.sqlitePath?.trim() || defaultSqlitePath();
  mkdirSync(path.dirname(file), { recursive: true });

  const { default: Database } = await import("better-sqlite3");
  const { drizzle } = await import("drizzle-orm/better-sqlite3");
  const sqlite = new Database(file);
  sqlite.pragma("foreign_keys = ON");

  const db = drizzle(sqlite, { schema: options.schema });

  const folder = resolveMigrationsFolder(dialect, options.migrationsFolder);
  if (options.migrate !== false && folder) {
    const { migrate } = await import("drizzle-orm/better-sqlite3/migrator");
    migrate(db, { migrationsFolder: folder });
  }

  return {
    db,
    dialect,
    location: file,
    close: async () => {
      sqlite.close();
    },
  };
}

async function openPostgres<TSchema extends Record<string, unknown>>(
  options: OpenDrizzleOptions<TSchema>,
  dialect: AppDbDialect,
): Promise<OpenDrizzleResult<TSchema>> {
  const url = (options.databaseUrl ?? process.env.DATABASE_URL ?? "").trim();
  if (!url) {
    throw new Error("openDrizzle(pgsql): DATABASE_URL is required");
  }

  const poolOpts = { ...DEFAULT_POOL, ...options.pool };
  const { Pool } = await import("pg");
  const { drizzle } = await import("drizzle-orm/node-postgres");

  const pool = new Pool({
    connectionString: url,
    max: poolOpts.max,
    idleTimeoutMillis: poolOpts.idleTimeoutMs,
    connectionTimeoutMillis: poolOpts.connectionTimeoutMs,
  });

  if (options.onPoolError) {
    pool.on("error", options.onPoolError);
  }

  const db = drizzle(pool, { schema: options.schema });

  const folder = resolveMigrationsFolder(dialect, options.migrationsFolder);
  if (options.migrate !== false && folder) {
    const { migrate } = await import("drizzle-orm/node-postgres/migrator");
    await migrate(db, { migrationsFolder: folder });
  }

  return {
    db,
    dialect,
    location: redactDatabaseLocation(url),
    close: async () => {
      await pool.end();
    },
  };
}

/**
 * Open one Drizzle handle for the app. Eristack table packages never call this —
 * the app composes schema, runs migrations, and injects `db` into services.
 */
export async function openDrizzle<TSchema extends Record<string, unknown>>(
  options: OpenDrizzleOptions<TSchema>,
): Promise<OpenDrizzleResult<TSchema>> {
  const dialect =
    options.dialect ??
    resolveAppDbDialect({
      databaseUrlEnv: options.databaseUrl,
    });

  if (dialect === "pgsql") {
    return openPostgres(options, dialect);
  }
  return openSqlite(options, dialect);
}
