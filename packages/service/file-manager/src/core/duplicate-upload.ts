export class FileDuplicateClientUploadIdError extends Error {
  readonly code = "23505";

  constructor() {
    super("clientUploadId already exists for namespace");
    this.name = "FileDuplicateClientUploadIdError";
  }
}

export function isFileUniqueViolation(err: unknown): boolean {
  if (err instanceof FileDuplicateClientUploadIdError) return true;
  if (!err || typeof err !== "object") return false;
  const code = (err as { code?: string }).code;
  if (code === "23505" || code === "SQLITE_CONSTRAINT_UNIQUE") return true;
  const message = (err as { message?: string }).message ?? "";
  return /unique constraint|UNIQUE constraint failed/i.test(message);
}
