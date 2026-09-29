export type EristackDrizzleDialect = "postgresql" | "sqlite";

export type DefineEristackDrizzleConfigOptions = {
  dialect: EristackDrizzleDialect;
  schema: string;
  out: string;
  migrationsFolder?: string;
  dbCredentialsEnv?: string;
};

/** Plain object for drizzle-kit defineConfig — app supplies env and schema paths. */
export function defineEristackDrizzleConfig(
  options: DefineEristackDrizzleConfigOptions,
) {
  const credsKey =
    options.dbCredentialsEnv ??
    (options.dialect === "postgresql" ? "DATABASE_URL" : "SQLITE_URL");

  return {
    dialect: options.dialect,
    schema: options.schema,
    out: options.out,
    dbCredentials: {
      // Read at call time so `drizzle.config.ts` picks up dotenv / CI env.
      url: process.env[credsKey] ?? "",
    },
    ...(options.migrationsFolder
      ? { migrations: { folder: options.migrationsFolder } }
      : {}),
  } as const;
}

export function eristackTestSqliteConfig(schemaPath: string, out = "./drizzle/sqlite") {
  return defineEristackDrizzleConfig({
    dialect: "sqlite",
    schema: schemaPath,
    out,
    dbCredentialsEnv: "SQLITE_URL",
  });
}

export function eristackProdPostgresConfig(
  schemaPath: string,
  out = "./drizzle/pg",
) {
  return defineEristackDrizzleConfig({
    dialect: "postgresql",
    schema: schemaPath,
    out,
    dbCredentialsEnv: "DATABASE_URL",
  });
}
