export class IdempotencyConflictError extends Error {
  readonly code = "IDEMPOTENCY_CONFLICT" as const;

  constructor(readonly key: string) {
    super(`Idempotency key already in progress: ${key}`);
    this.name = "IdempotencyConflictError";
  }
}
