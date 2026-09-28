/** Detect Postgres/SQLite unique violations from Drizzle drivers. */
export function isLedgerUniqueViolation(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const code = (err as { code?: string }).code;
  if (code === "23505" || code === "SQLITE_CONSTRAINT_UNIQUE") return true;
  const message = (err as { message?: string }).message ?? "";
  return /unique constraint|UNIQUE constraint failed/i.test(message);
}
