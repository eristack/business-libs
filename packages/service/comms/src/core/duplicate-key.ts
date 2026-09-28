export class CommsDuplicateIdempotencyKeyError extends Error {
  readonly code = "23505";

  constructor() {
    super("comms idempotency key already exists");
    this.name = "CommsDuplicateIdempotencyKeyError";
  }
}

export function isCommsUniqueViolation(err: unknown): boolean {
  if (err instanceof CommsDuplicateIdempotencyKeyError) return true;
  if (!err || typeof err !== "object") return false;
  const code = (err as { code?: string }).code;
  if (code === "23505" || code === "SQLITE_CONSTRAINT_UNIQUE") return true;
  const message = (err as { message?: string }).message ?? "";
  return /unique constraint|UNIQUE constraint failed/i.test(message);
}
