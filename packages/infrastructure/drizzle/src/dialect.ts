export type AppDbDialect = "sqlite" | "pgsql";

export type ResolveAppDbDialectInput = {
  dialectEnv?: string;
  databaseUrlEnv?: string;
};

/**
 * Resolve sqlite vs pgsql from env. `APP_DB_DIALECT` wins; else `DATABASE_URL`
 * with a postgres scheme selects pgsql; default sqlite for local dev.
 */
export function resolveAppDbDialect(input: ResolveAppDbDialectInput = {}): AppDbDialect {
  const dialectRaw = (input.dialectEnv ?? process.env.APP_DB_DIALECT ?? "").trim().toLowerCase();
  if (dialectRaw === "sqlite" || dialectRaw === "pgsql") {
    return dialectRaw;
  }
  if (dialectRaw) {
    throw new Error(`Unknown APP_DB_DIALECT "${dialectRaw}" — use sqlite or pgsql`);
  }

  const url = (input.databaseUrlEnv ?? process.env.DATABASE_URL ?? "").trim();
  if (/^postgres(ql)?:\/\//i.test(url)) {
    return "pgsql";
  }

  return "sqlite";
}
