export class PaymentDuplicateIdempotencyKeyError extends Error {
  readonly code = "23505";

  constructor() {
    super("payment intent idempotency key already exists");
    this.name = "PaymentDuplicateIdempotencyKeyError";
  }
}

export function isPaymentUniqueViolation(err: unknown): boolean {
  if (err instanceof PaymentDuplicateIdempotencyKeyError) return true;
  if (!err || typeof err !== "object") return false;
  const code = (err as { code?: string }).code;
  if (code === "23505" || code === "SQLITE_CONSTRAINT_UNIQUE") return true;
  const message = (err as { message?: string }).message ?? "";
  return /unique constraint|UNIQUE constraint failed/i.test(message);
}
